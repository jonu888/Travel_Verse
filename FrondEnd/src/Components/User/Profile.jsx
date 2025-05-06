import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { userProfileService } from '../../services/api';
import { User, MapPin, DollarSign, Globe2, FileText } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState({
    description: '',
    preferred_country: '',
    location: '',
    budjet: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userProfileService.getProfile();
      setProfile(response);
      setLoading(false);
    } catch (error) {
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await userProfileService.updateProfile(profile);
      setSuccess('Profile updated successfully!');
      if (response.search_results) {
        console.log('Search results:', response.search_results);
      }
    } catch (error) {
      setError('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex justify-center items-center">
        <div className="w-12 h-12 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-[#1a1a1a] shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
              <User className="mr-3 h-6 w-6 text-blue-500" />
              User Profile
            </h3>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg"
                role="alert"
              >
                <span className="block text-sm">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg"
                role="alert"
              >
                <span className="block text-sm">{success}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  <FileText className="mr-2 h-4 w-4 text-gray-400" />
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-4 py-3 bg-[#2a2a2a] text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  value={profile.description}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                />
              </div>

    
             

              

              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Update Profile
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile; 