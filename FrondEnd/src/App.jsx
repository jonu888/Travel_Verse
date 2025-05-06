import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS
import Welcome from './Components/Welcome/Welcome';
import Home from './Components/Home/home';
import Fare from './Components/Fare/base';
import APITest from './Components/APITest';
import Login from './Components/User/Login';
import Profile from './Components/User/Profile';
import Destinations from './Components/Destinations/destinations';
import Register from './Components/User/Register';
import { LogOut } from 'lucide-react';

import './App.css';



import TripList from './Components/Planning/TripList';

import PlanTrip  from './Components/Planning/PlanTrip';

import Editplan from './Components/Planning/Editplan';

import ForgotPasswordForm from './Components/User/ForgotPasswordForm';
import OtpVerificationForm from './Components/User/OtpVerificationForm';
import ResetPasswordForm from './Components/User/ResetPasswordForm';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showHome, setShowHome] = useState(false);
  const [showFare, setShowFare] = useState(false);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    setShowHome(true);
  };

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark" // Use the "colored" theme for a vibrant look
      />
      <Routes>
        <Route path="/" element={<Welcome onComplete={handleWelcomeComplete} />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/fare" element={<Fare />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/Planning" element={<TripList />} />
        <Route path="/plan-trip" element={<PlanTrip />} />
        <Route path='/edit-trip/:id' element={<Editplan />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/otp-verify" element={<OtpVerificationForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
      </Routes>
    </Router>
  );
}

export default App;