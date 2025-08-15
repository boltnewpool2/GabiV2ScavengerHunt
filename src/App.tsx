import React, { useState, useEffect } from 'react';
import { Trophy, Settings, Play, RotateCcw, Sparkles, Database } from 'lucide-react';
import FloatingOrbs from './components/FloatingOrbs';
import Confetti from './components/Confetti';
import RaffleWheel from './components/RaffleWheel';
import WinnersDashboard from './components/WinnersDashboard';
import { supabase } from './lib/supabase';
import guidesData from './data/guides.json';

interface Guide {
  name: string;
  supervisor: string;
  department: string;
}

function App() {
  const [guides] = useState<Guide[]>(guidesData);
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

  const departments = ['International Messaging', 'APAC', 'India Messaging'];

  const getGuidesByDepartment = (department: string) => {
    return guides.filter(guide => guide.department === department);
  };

  const handleWinnerSelected = (department: string, winner: Guide) => {
    // Save winner to database
    saveWinnerToDatabase(winner);
    
    setCurrentWinners(prev => ({
      ...prev,
      [department]: [...prev[department], winner]
    }));
    
    setShowConfetti(true);
    
    // Stop drawing for this department if we have enough winners
    if (currentWinners[department].length + 1 >= winnersPerDepartment[department as keyof typeof winnersPerDepartment]) {
      setIsDrawing(prev => ({ ...prev, [department]: false }));
    }
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
            prize_amount: 5000
          }
        ]);

      if (error) {
        console.error('Error saving winner to database:', error);
      }
    } catch (error) {
      console.error('Error saving winner:', error);
    }
  };

  const startDraw = (department: string) => {
    const availableGuides = getGuidesByDepartment(department).filter(
      guide => !currentWinners[department].some(w => w.name === guide.name)
    );
    
    if (availableGuides.length === 0) return;
    
    setIsDrawing(prev => ({ ...prev, [department]: true }));
  };

  const drawAllWinners = async (department: string) => {
    const maxWinners = winnersPerDepartment[department as keyof typeof winnersPerDepartment];
    const currentCount = currentWinners[department].length;
    
    if (currentCount >= maxWinners) return;
    
    for (let i = currentCount; i < maxWinners; i++) {
      const availableGuides = getGuidesByDepartment(department).filter(
        guide => !currentWinners[department].some(w => w.name === guide.name)
      );
      
      if (availableGuides.length === 0) break;
      
      setIsDrawing(prev => ({ ...prev, [department]: true }));
      
      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      setIsDrawing(prev => ({ ...prev, [department]: false }));
      
      // Wait before next draw
      if (i < maxWinners - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
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

  const updateWinnersCount = (department: string, count: number) => {
    setWinnersPerDepartment(prev => ({
      ...prev,
      [department]: Math.max(1, Math.min(count, getGuidesByDepartment(department).length))
    }));
  };

  const totalWinners = Object.values(currentWinners).flat().length;
  const totalPrizePool = totalWinners * 5000;

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
              <div className="text-2xl font-bold text-green-300">₹{totalPrizePool.toLocaleString()}</div>
              <div className="text-sm">Prize Pool</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-300">{guides.length}</div>
              <div className="text-sm">Total Guides</div>
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
            onClick={() => setShowSettings(!showSettings)}
            className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 backdrop-blur-sm flex items-center"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
          <button
            onClick={resetAll}
            className="bg-red-500/80 hover:bg-red-500 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 backdrop-blur-sm flex items-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Winners Per Department
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {departments.map(dept => (
                <div key={dept} className="text-center">
                  <label className="block text-white/80 text-sm mb-2">{dept}</label>
                  <input
                    type="number"
                    min="1"
                    max={getGuidesByDepartment(dept).length}
                    value={winnersPerDepartment[dept as keyof typeof winnersPerDepartment]}
                    onChange={(e) => updateWinnersCount(dept, parseInt(e.target.value))}
                    className="w-20 px-3 py-2 bg-white/20 text-white rounded-lg text-center backdrop-blur-sm border border-white/30 focus:border-white/50 focus:outline-none"
                  />
                  <div className="text-white/60 text-xs mt-1">
                    Max: {getGuidesByDepartment(dept).length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                  winnersCount={winnersPerDepartment[department as keyof typeof winnersPerDepartment]}
                  onWinnerSelected={(winner) => handleWinnerSelected(department, winner)}
                  isDrawing={isDrawing[department as keyof typeof isDrawing]}
                />
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => startDraw(department)}
                    disabled={isDrawing[department as keyof typeof isDrawing] || 
                             currentWinners[department].length >= winnersPerDepartment[department as keyof typeof winnersPerDepartment]}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Draw One
                  </button>
                  
                  <button
                    onClick={() => drawAllWinners(department)}
                    disabled={isDrawing[department as keyof typeof isDrawing] || 
                             currentWinners[department].length >= winnersPerDepartment[department as keyof typeof winnersPerDepartment]}
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

        {/* Footer */
        !showDashboard && (
          <div className="text-center text-white/60">
            <p className="mb-2">🎊 Good luck to all participants! 🎊</p>
            <p className="text-sm">Each winner receives ₹5,000 prize money</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;