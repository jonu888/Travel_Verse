import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { authService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from "react-toastify";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await authService.login({
        username: credentials.username,
        password: credentials.password,
      });

      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        toast.success("Login successful! Redirecting to home...");
        setTimeout(() => {
          navigate("/home");
        }, 2000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      const serverError = error.response?.data?.error || error.response?.data?.message;
      setError(serverError || 'Login failed. Please try again.');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "url('./bg.jpg') no-repeat center center fixed",
        backgroundSize: 'cover',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm bg-white/10 backdrop-blur-lg border border-transparent rounded-lg p-8"
        style={{
          borderImage: 'linear-gradient(145deg, #ff00ff, #00ffff) 1',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2 className="text-2xl font-semibold text-white mb-2 text-center">Sign In</h2>
        <p className="text-gray-300 text-sm mb-6 text-center">Lets start the journey</p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg mb-4 text-center text-sm"
            role="alert"
          >
            <span>{error}</span>
          </motion.div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Email or Phone"
              className="w-full pl-10 pr-4 py-2 bg-transparent text-white placeholder-gray-400 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full pl-10 pr-12 py-2 bg-transparent text-white placeholder-gray-400 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-400 hover:text-gray-300"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="text-right mt-2">
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Forgot Password
          </button>
        </div>

        <motion.button
          type="button"
          onClick={handleSubmit}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 mt-6 text-white rounded-lg font-medium transition-colors"
          style={{
            background: 'linear-gradient(145deg, #6b48ff, #a855f7)',
          }}
        >
          Sign In
        </motion.button>

        <div className="text-center my-4 text-gray-400">or</div>

        

        <div className="text-center mt-4">
          <p className="text-gray-400 text-sm">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Register Now
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;