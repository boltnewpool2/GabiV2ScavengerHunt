import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, Users } from 'lucide-react';
import { supabase, Winner } from '../lib/supabase';

interface Guide {
  name: string;
  supervisor: string;
  department: string;
}

interface RaffleWheelProps {
  department: string;
  guides: Guide[];
  winnersCount: number;
  onWinnerSelected: (winner: Guide) => void;
  isDrawing: boolean;
}

const RaffleWheel: React.FC<RaffleWheelProps> = ({
  department,
  guides,
  winnersCount,
  onWinnerSelected,
  isDrawing
}) => {
  const [currentName, setCurrentName] = useState('');
  const [dbWinners, setDbWinners] = useState<Winner[]>([]);
  const [availableGuides, setAvailableGuides] = useState<Guide[]>([]);

  useEffect(() => {
    fetchDepartmentWinners();
  }, [department]);

  const fetchDepartmentWinners = async () => {
    try {
      const { data, error } = await supabase
        .from('winners')
        .select('*')
        .eq('department', department)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDbWinners(data || []);
    } catch (error) {
      console.error('Error fetching department winners:', error);
    }
  };
  useEffect(() => {
    setAvailableGuides(guides.filter(guide => !dbWinners.some(w => w.name === guide.name)));
  }, [guides, dbWinners]);

  useEffect(() => {
    if (isDrawing && availableGuides.length > 0) {
      let interval: NodeJS.Timeout;
      let duration = 0;
      const maxDuration = 6000; // Increased duration to 6 seconds
      let currentSpeed = 50;

      const animate = () => {
        interval = setInterval(() => {
          const randomGuide = availableGuides[Math.floor(Math.random() * availableGuides.length)];
          setCurrentName(randomGuide.name);
          duration += currentSpeed;

          if (duration >= maxDuration) {
            clearInterval(interval);
            // Select final winner after animation stops
            const finalWinner = availableGuides[Math.floor(Math.random() * availableGuides.length)];
            setCurrentName(finalWinner.name);
            
            // Delay before calling onWinnerSelected to show the final name
            setTimeout(() => {
              onWinnerSelected(finalWinner);
              // Refresh winners after selection
              setTimeout(() => {
                fetchDepartmentWinners();
              }, 1000);
            }, 1000);
          } else {
            // Gradually slow down the animation
            const progress = duration / maxDuration;
            currentSpeed = Math.max(100, 400 - (progress * 300)); // Slower animation
          }
        }, currentSpeed);
      };

      animate();

      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [isDrawing, availableGuides, onWinnerSelected, department]);

  const departmentColors = {
    'International Messaging': 'from-blue-500 to-purple-600',
    'APAC': 'from-green-500 to-teal-600',
    'India Messaging': 'from-orange-500 to-red-600'
  };

  const bgGradient = departmentColors[department as keyof typeof departmentColors] || 'from-gray-500 to-gray-600';

  return (
    <div className={`bg-gradient-to-br ${bgGradient} rounded-2xl p-6 shadow-2xl transform transition-all duration-300 hover:scale-105`}>
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-2">
          <Trophy className="w-6 h-6 text-yellow-300 mr-2" />
          <h3 className="text-xl font-bold text-white">{department}</h3>
        </div>
        <div className="flex items-center justify-center text-white/80">
          <Users className="w-4 h-4 mr-1" />
          <span className="text-sm">{availableGuides.length} guides available</span>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
        <div className="text-center">
          <div className="bg-white/20 rounded-lg p-4 mb-4 min-h-[60px] flex items-center justify-center">
            {isDrawing ? (
              <div className="flex items-center">
                <Sparkles className="w-5 h-5 text-yellow-300 mr-2 animate-spin" />
                <span className="text-white font-bold text-lg animate-pulse">
                  {currentName || 'Drawing...'}
                </span>
                <Sparkles className="w-5 h-5 text-yellow-300 ml-2 animate-spin" />
              </div>
            ) : (
              <span className="text-white/60">Ready to draw winners!</span>
            )}
          </div>
        </div>
      </div>

      {dbWinners.length > 0 && (
        <div className="mb-4">
          <h4 className="text-white font-semibold mb-2 flex items-center">
            <Trophy className="w-4 h-4 mr-1 text-yellow-300" />
            Winners ({dbWinners.length}/{winnersCount}):
          </h4>
          <div className="space-y-2">
            {dbWinners.map((winner, index) => (
              <div key={index} className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-white font-medium">{winner.name}</div>
                <div className="text-white/70 text-sm">Supervisor: {winner.supervisor}</div>
                <div className="text-yellow-300 text-sm font-semibold">Prize: ₹{winner.prize_amount.toLocaleString()}</div>
                <div className="text-white/60 text-xs">
                  {new Date(winner.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {dbWinners.length > 0 && dbWinners.length < winnersCount && (
        <div className="text-center text-white/80 text-sm mb-4">
          {winnersCount - dbWinners.length} more winner(s) to be drawn
        </div>
      )}
    </div>
  );
};

export default RaffleWheel;