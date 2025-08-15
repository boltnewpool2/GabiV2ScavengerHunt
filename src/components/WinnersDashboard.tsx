import React, { useState, useEffect } from 'react';
import { Trophy, Trash2, Calendar, User, Building, DollarSign, Settings, Eye, EyeOff } from 'lucide-react';
import { supabase, Winner } from '../lib/supabase';
import PasswordModal from './PasswordModal';

const WinnersDashboard: React.FC = () => {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; winner: Winner | null }>({
    isOpen: false,
    winner: null
  });
  const [showPasswordSettings, setShowPasswordSettings] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      const { data, error } = await supabase
        .from('winners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWinners(data || []);
    } catch (error) {
      console.error('Error fetching winners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWinner = async () => {
    if (!deleteModal.winner) return;

    try {
      const { error } = await supabase
        .from('winners')
        .delete()
        .eq('id', deleteModal.winner.id);

      if (error) throw error;
      
      setWinners(prev => prev.filter(w => w.id !== deleteModal.winner!.id));
    } catch (error) {
      console.error('Error deleting winner:', error);
    }
  };

  const openDeleteModal = (winner: Winner) => {
    setDeleteModal({ isOpen: true, winner });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, winner: null });
  };

  const updatePassword = () => {
    if (newPassword.trim()) {
      localStorage.setItem('admin_password', newPassword.trim());
      setNewPassword('');
      setShowPasswordSettings(false);
      alert('Password updated successfully!');
    }
  };

  const getCurrentPassword = () => {
    return localStorage.getItem('admin_password') || 'admin123';
  };

  const departmentColors = {
    'International Messaging': 'bg-blue-100 text-blue-800 border-blue-200',
    'APAC': 'bg-green-100 text-green-800 border-green-200',
    'India Messaging': 'bg-orange-100 text-orange-800 border-orange-200'
  };

  const departmentStats = winners.reduce((acc, winner) => {
    acc[winner.department] = (acc[winner.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalPrizePool = winners.reduce((sum, winner) => sum + winner.prize_amount, 0);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">Loading winners...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">Winners Dashboard</h2>
        </div>
        <button
          onClick={() => setShowPasswordSettings(!showPasswordSettings)}
          className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4 mr-1" />
          Password Settings
        </button>
      </div>

      {/* Password Settings */}
      {showPasswordSettings && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-semibold text-gray-800 mb-3">Admin Password Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password:
              </label>
              <div className="flex items-center">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={getCurrentPassword()}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="ml-2 p-2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password:
              </label>
              <div className="flex space-x-2">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <button
                  onClick={updatePassword}
                  disabled={!newPassword.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <div className="text-2xl font-bold">{winners.length}</div>
          <div className="text-sm opacity-90">Total Winners</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <div className="text-2xl font-bold">₹{totalPrizePool.toLocaleString()}</div>
          <div className="text-sm opacity-90">Prize Pool</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
          <div className="text-2xl font-bold">{Object.keys(departmentStats).length}</div>
          <div className="text-sm opacity-90">Departments</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
          <div className="text-2xl font-bold">₹5,000</div>
          <div className="text-sm opacity-90">Per Winner</div>
        </div>
      </div>

      {/* Department Statistics */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Winners by Department</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(departmentStats).map(([dept, count]) => (
            <div key={dept} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">{dept}</span>
              <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm font-semibold">
                {count} winner{count !== 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Winners List */}
      {winners.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">No winners yet</h3>
          <p className="text-gray-400">Winners will appear here once the raffle draws begin!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">All Winners</h3>
          {winners.map((winner) => (
            <div
              key={winner.id}
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-semibold text-gray-800 text-lg">{winner.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    departmentColors[winner.department as keyof typeof departmentColors] || 'bg-gray-100 text-gray-800 border-gray-200'
                  }`}>
                    {winner.department}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    Supervisor: {winner.supervisor}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Prize: ₹{winner.prize_amount.toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(winner.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
              <button
                onClick={() => openDeleteModal(winner)}
                className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete winner"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <PasswordModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteWinner}
        winnerName={deleteModal.winner?.name || ''}
      />
    </div>
  );
};

export default WinnersDashboard;