import React, { useState, useEffect } from 'react';
import { Trophy, Settings, Play, RotateCcw, Sparkles, Database } from 'lucide-react';
import FloatingOrbs from './components/FloatingOrbs';
import Confetti from './components/Confetti';
import RaffleWheel from './components/RaffleWheel';
import WinnersDashboard from './components/WinnersDashboard';
import WinnerCelebrationModal from './components/WinnerCelebrationModal';
import { supabase, Winner } from './lib/supabase';
import guidesData from './data/guides.json';

interface Guide {
  name: string;
  supervisor: string;
  department: string;
}

function App() {
  const [guides] = useState<Guide[]>(guidesData);
  const [dbWinners, setDbWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [winnersPerDepartment, setWinnersPerDepartment] = useState({
    'International Messaging': 2,
    'APAC': 2,
    'India Messaging': 2
  });
  const [isDrawing, setIsDrawing] = useState({
    'International Messaging': false,
    'APAC': false,
    'India Messaging': false
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [currentWinners, setCurrentWinners] = useState<{[key: string]: Guide[]}>({
    'International Messaging': [],
    'APAC': [],
    'India Messaging': []
  });
  const [celebrationModal, setCelebrationModal] = useState<{
    isOpen: boolean;
    winner: Guide | null;
  }>({
    isOpen: false,
    winner: null
  });

  const departments = ['International Messaging', 'APAC', 'India Messaging'];
  const TOTAL_PRIZE_POOL = 30000;
  const PRIZE_PER_WINNER = 5000;
  const MAX_TOTAL_WINNERS = 6;

  useEffect(() => {
    fetchWinnersFromDatabase();
  }, []);

  const fetchWinnersFromDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from('winners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDbWinners(data || []);
    } catch (error) {
      console.error('Error fetching winners from database:', error);
    } finally {
      setLoading(false);
    }
  };
  const getGuidesByDepartment = (department: string) => {
    return guides.filter(guide => guide.department === department);
  };

  const getDepartmentWinnerCount = (department: string) => {
    return dbWinners.filter(winner => winner.department === department).length;
  };

  const getTotalWinnersCount = () => {
    return dbWinners.length;
  };

  const getRemainingPrizePool = () => {
    const totalWinners = getTotalWinnersCount();
    return TOTAL_PRIZE_POOL - (totalWinners * PRIZE_PER_WINNER);
  };

  const canDrawFromDepartment = (department: string) => {
    const departmentCount = getDepartmentWinnerCount(department);
    const totalCount = getTotalWinnersCount();
    return departmentCount < 2 && totalCount < MAX_TOTAL_WINNERS;
  };

  const getRemainingDrawsForDepartment = (department: string) => {
    return Math.max(0, 2 - getDepartmentWinnerCount(department));
  };
  const handleWinnerSelected = (department: string, winner: Guide) => {
    // Show celebration modal first
    setCelebrationModal({
      isOpen: true,
      winner: winner
    });
    
    setCurrentWinners(prev => ({
      ...prev,
      [department]: [...prev[department], winner]
    }));
    
    // Save winner to database
    saveWinnerToDatabase(winner);
    
    setShowConfetti(true);
    
    // Always stop drawing after selecting a winner
    setIsDrawing(prev => ({ ...prev, [department]: false }));
  };

  const closeCelebrationModal = () => {
    setCelebrationModal({
      isOpen: false,
      winner: null
    });
  };

  const saveWinnerToDatabase = async (winner: Guide) => {
    try {
      const { error } = await supabase
        .from('winners')
        .insert([
          {
            name: winner.name,
            supervisor: winner.supervisor,
            department: winner.department,
            prize_amount: PRIZE_PER_WINNER
          }
        ]);
        .select();

      if (error) {
        console.error('Error saving winner to database:', error);
      } else if (data) {
        // Refresh the database winners list
        await fetchWinnersFromDatabase();
      }
    } catch (error) {
      console.error('Error saving winner:', error);
    }
  };

  const startDraw = (department: string) => {
    if (!canDrawFromDepartment(department)) return;
    
    const availableGuides = getGuidesByDepartment(department).filter(
      guide => !dbWinners.some(w => w.name === guide.name)
    );
    
    if (availableGuides.length === 0) return;
    
    setIsDrawing(prev => ({ ...prev, [department]: true }));
  };

  const drawAllWinners = async (department: string) => {
    const maxWinners = 2; // Fixed to 2 per department
    const currentCount = getDepartmentWinnerCount(department);
    const totalWinners = getTotalWinnersCount();
    
    if (currentCount >= maxWinners || totalWinners >= MAX_TOTAL_WINNERS) return;
    
    const remainingDraws = Math.min(maxWinners - currentCount, MAX_TOTAL_WINNERS - totalWinners);
    
    for (let i = 0; i < remainingDraws; i++) {
      const availableGuides = getGuidesByDepartment(department).filter(
        guide => !dbWinners.some(w => w.name === guide.name)
      );
      
      if (availableGuides.length === 0) break;
      
      setIsDrawing(prev => ({ ...prev, [department]: true }));
      
      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 7500)); // Increased wait time
      
      setIsDrawing(prev => ({ ...prev, [department]: false }));
      
      // Wait before next draw
      if (i < remainingDraws - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Longer pause between draws
      }
      
      // Refresh winners count for next iteration
      await fetchWinnersFromDatabase();
    }
  };

  const resetAll = () => {
    setCurrentWinners({
      'International Messaging': [],
      'APAC': [],
      'India Messaging': []
    });
    setIsDrawing({
      'International Messaging': false,
      'APAC': false,
      'India Messaging': false
    });
  };


  const totalWinners = getTotalWinnersCount();
  const remainingPrizePool = getRemainingPrizePool();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading raffle system...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      <FloatingOrbs />
      <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/public/GABI v2 Scavenger Hunt (1).gif" 
              alt="GABI V2 Logo" 
              className="w-48 h-32 object-cover rounded-2xl shadow-2xl border-4 border-white/20"
            />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 animate-pulse">
            GABI V2 Scavenger Hunt
          </h1>
          <p className="text-xl text-white/80 mb-6">
            🎉 Raffle Draw Contest 🎉
          </p>
          <div className="flex items-center justify-center space-x-8 text-white/90">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300">{totalWinners}</div>
              <div className="text-sm">Total Winners</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-300">₹{remainingPrizePool.toLocaleString()}</div>
              <div className="text-sm">Remaining Prize Pool</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-300">{guides.length}</div>
              <div className="text-sm">Total Guides</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-300">₹{PRIZE_PER_WINNER.toLocaleString()}</div>
              <div className="text-sm">Per Winner</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setShowDashboard(!showDashboard)}
            className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 backdrop-blur-sm flex items-center"
          >
            <Database className="w-4 h-4 mr-2" />
            {showDashboard ? 'Hide Dashboard' : 'Show Dashboard'}
          </button>
          <button
            onClick={resetAll}
            className="bg-red-500/80 hover:bg-red-500 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 backdrop-blur-sm flex items-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All
          </button>
        </div>


        {/* Winners Dashboard */}
        {showDashboard && (
          <div className="mb-8">
            <WinnersDashboard />
          </div>
        )}

        {/* Raffle Wheels */}
        {!showDashboard && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {departments.map(department => (
              <div key={department} className="space-y-4">
                <RaffleWheel
                  department={department}
                  guides={getGuidesByDepartment(department)}
                  winnersCount={2}
                  onWinnerSelected={(winner) => handleWinnerSelected(department, winner)}
                  isDrawing={isDrawing[department as keyof typeof isDrawing]}
                />
                
                {/* Department Stats */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="text-white/80 text-sm">
                    Winners: {getDepartmentWinnerCount(department)}/2
                  </div>
                  <div className="text-white/60 text-xs">
                    Remaining: {getRemainingDrawsForDepartment(department)}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => startDraw(department)}
                    disabled={isDrawing[department as keyof typeof isDrawing] || !canDrawFromDepartment(department)}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Draw One
                  </button>
                  
                  <button
                    onClick={() => drawAllWinners(department)}
                    disabled={isDrawing[department as keyof typeof isDrawing] || !canDrawFromDepartment(department) || getRemainingDrawsForDepartment(department) <= 1}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Draw All
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contest Status */}
        {!showDashboard && totalWinners >= MAX_TOTAL_WINNERS && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 mb-8 text-center">
            <Trophy className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">🎉 Contest Complete! 🎉</h3>
            <p className="text-white/90">All 6 winners have been selected!</p>
            <p className="text-white/80 text-sm mt-2">Total prizes distributed: ₹{(totalWinners * PRIZE_PER_WINNER).toLocaleString()}</p>
          </div>
        )}
        {/* Footer */
        {!showDashboard && totalWinners < MAX_TOTAL_WINNERS && (
          <div className="text-center text-white/60">
            <p className="mb-2">🎊 Good luck to all participants! 🎊</p>
            <p className="text-sm">Each winner receives ₹{PRIZE_PER_WINNER.toLocaleString()} prize money</p>
            <p className="text-xs mt-1">Remaining draws: {MAX_TOTAL_WINNERS - totalWinners}</p>
          </div>
        )}
      </div>

      {/* Winner Celebration Modal */}
      <WinnerCelebrationModal
        isOpen={celebrationModal.isOpen}
        winner={celebrationModal.winner}
        onClose={closeCelebrationModal}
      />
    </div>
  );
}

export default App;