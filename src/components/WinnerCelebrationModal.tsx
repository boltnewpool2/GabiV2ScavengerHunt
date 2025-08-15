import React, { useEffect, useState } from 'react';
import { Trophy, Star, Sparkles, X, Gift } from 'lucide-react';

interface Guide {
  name: string;
  supervisor: string;
  department: string;
}

interface WinnerCelebrationModalProps {
  isOpen: boolean;
  winner: Guide | null;
  onClose: () => void;
}

const WinnerCelebrationModal: React.FC<WinnerCelebrationModalProps> = ({
  isOpen,
  winner,
  onClose
}) => {
  const [showContent, setShowContent] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    rotation: number;
    size: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    if (isOpen && winner) {
      // Create confetti particles
      const particles = Array.from({ length: 80 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#f093fb', '#f5f7fa'][Math.floor(Math.random() * 8)],
        rotation: Math.random() * 360,
        size: Math.random() * 8 + 4,
        delay: Math.random() * 2,
      }));
      
      setConfettiParticles(particles);
      
      // Show content after a brief delay
      setTimeout(() => setShowContent(true), 300);
      
      // Auto close after 8 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 8000);
      
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
      setConfettiParticles([]);
    }
  }, [isOpen, winner]);

  const handleClose = () => {
    setShowContent(false);
    setTimeout(() => {
      onClose();
      setConfettiParticles([]);
    }, 300);
  };

  const departmentColors = {
    'International Messaging': 'from-blue-500 to-purple-600',
    'APAC': 'from-green-500 to-teal-600',
    'India Messaging': 'from-orange-500 to-red-600'
  };

  if (!isOpen || !winner) return null;

  const bgGradient = departmentColors[winner.department as keyof typeof departmentColors] || 'from-gray-500 to-gray-600';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {confettiParticles.map((particle) => (
          <div
            key={particle.id}
            className="absolute animate-bounce"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: particle.color,
              width: particle.size,
              height: particle.size,
              transform: `rotate(${particle.rotation}deg)`,
              borderRadius: Math.random() > 0.5 ? '50%' : '0%',
              animationDelay: `${particle.delay}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Modal */}
      <div className={`bg-gradient-to-br ${bgGradient} rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-500 ${
        showContent ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
      }`}>
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          {/* Celebration Header */}
          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Trophy className="w-16 h-16 text-yellow-300 animate-bounce" />
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-6 h-6 text-yellow-200 animate-spin" />
                </div>
                <div className="absolute -bottom-2 -left-2">
                  <Star className="w-6 h-6 text-yellow-200 animate-pulse" />
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 animate-pulse">
              🎉 CONGRATULATIONS! 🎉
            </h2>
            <p className="text-white/90 text-lg">We have a winner!</p>
          </div>

          {/* Winner Details */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <div className="text-2xl font-bold text-white mb-3 animate-pulse">
              {winner.name}
            </div>
            <div className="space-y-2 text-white/90">
              <div className="flex items-center justify-center">
                <span className="text-sm">Supervisor: {winner.supervisor}</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-sm">Department: {winner.department}</span>
              </div>
            </div>
          </div>

          {/* Prize Information */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <Gift className="w-6 h-6 text-white mr-2" />
              <span className="text-white font-semibold">Prize Won</span>
            </div>
            <div className="text-3xl font-bold text-white">₹5,000</div>
          </div>

          {/* Celebration Message */}
          <div className="text-white/90 text-sm">
            <p className="mb-2">🎊 Amazing! You're one of our lucky winners! 🎊</p>
            <p>Your prize will be processed soon!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinnerCelebrationModal;