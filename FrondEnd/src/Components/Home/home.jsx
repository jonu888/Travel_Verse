import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Users, ArrowRight, ChevronDown, LogOut, User, Heart, Gift, Bell, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showHome, setShowHome] = useState(true);
  const [showFare, setShowFare] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [username, setUsername] = useState('Traveler');
  const [showDestinations, setShowDestinations] = useState(false);
  const [showPlanning, setShowPlanning] = useState(false);
  const footerRef = useRef(null); // Create a reference for the footer

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
      setUsername(localStorage.getItem('username') || 'Traveler');
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setShowDropdown(false);
    toast.success("Logout successful!");

    // Redirect to the login page
    setTimeout(() => {
      navigate("/login");
    }, 1000); 
  };

  if (!showHome) {
    return null;
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/destinations', { state: { searchQuery: searchQuery.trim() } });
    }
  };

  const handleDestinationsClick = () => {
    setShowHome(false);
    setShowDestinations(true);
    navigate('/destinations', { state: { searchQuery: 'New' } });
  };

  const handlePlanningClick = () => {
    setShowHome(false);
    setShowPlanning(true);
    navigate('/planning');
  };

  const handleFareComplete = () => {
    setShowHome(false);
    setShowFare(true);
    navigate('/fare');
  };

  const handleAboutClick = () => {
    footerRef.current?.scrollIntoView({ behavior: 'smooth' }); // Scroll to the footer
  };

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.6,
        ease: 'easeInOut',
      },
    }),
    hover: {
      scale: 1.03,
      boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.4)',
      transition: { duration: 0.4, ease: 'easeInOut' },
    },
  };

  // Section animation for vertical scrolling effect
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        when: 'beforeChildren',
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full backdrop-blur-md z-50">
        <div className="container mx-auto px-4 flex justify-between items-center h-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold"
          >
            TravelVerse
          </motion.div>
          <div className="flex items-center gap-8">
            {['Destinations', 'Fare', 'Planning', 'About'].map((item, index) => (
              <motion.button
                key={item}
                onClick={
                  item === 'About'
                    ? handleAboutClick // Use the new handler for "About"
                    : item === 'Destinations'
                    ? handleDestinationsClick
                    : item === 'Fare'
                    ? handleFareComplete
                    : item === 'Planning'
                    ? handlePlanningClick
                    : null
                }
                className="text-sm uppercase tracking-wider hover:text-gray-300 transition-colors"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {item}
              </motion.button>
            ))}
            {!isAuthenticated ? (
              <div className="relative">
                <motion.button
                  className="flex items-center gap-2 text-sm uppercase"
                  onClick={() => navigate('/login')}
                  onMouseEnter={() => setTimeout(() => setShowDropdown(true), 100)}
                  onMouseLeave={() => setTimeout(() => setShowDropdown(false), 5000)}
                  whileHover={{ scale: 1.05 }}
                >
                  <User size={16} />
                  Login
                  <ChevronDown size={14} />
                </motion.button>
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-black/90 rounded-lg shadow-xl p-4 border border-gray-900"
                    >
                      <p className="text-gray-400 text-xs mb-2">New to TravelVerse?</p>
                      <motion.button
                        onClick={() => navigate('/signup')}
                        className="text-white text-sm hover:underline"
                        whileHover={{ x: 5 }}
                      >
                        Create Account
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="relative">
                <motion.button
                  className="flex items-center gap-2 text-sm uppercase"
                  onClick={() => setShowDropdown(!showDropdown)}
                  whileHover={{ scale: 1.05 }}
                >
                  <User size={16} />
                  {username}
                  <ChevronDown size={14} />
                </motion.button>
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-black/90 rounded-lg shadow-xl py-2 border border-gray-900"
                    >
                      <button
                        onClick={() => navigate('/profile')}
                        className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-900 w-full"
                      >
                        <User size={14} className="mr-2" />
                        Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-900 w-full border-t border-gray-800"
                      >
                        <LogOut size={14} className="mr-2" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative h-screen overflow-hidden"
        style={{
          backgroundImage: `url('/Flow.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80 z-10" />
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight"
          >
            Journey Through Kerala
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 max-w-2xl mt-4"
          >
            Embark on an unforgettable adventure in God’s Own Country, where nature and culture intertwine.
          </motion.p>
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="flex flex-col md:flex-row gap-4 mt-8"
          >
            <div className="relative flex-1 bg-black/50 rounded-lg p-4 border border-gray-800">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search destinations, experiences..."
                className="bg-transparent border-none outline-none w-full pl-10 text-white placeholder-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
            <button
              type="submit"
              className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Explore Now
            </button>
          </motion.form>
        </div>
      </section>

      {/* Travel Guidelines Section */}
      <motion.section
        className="py-20 bg-black"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center mb-12"
          >
            Explore Kerala
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                
                description: 'Lush green tea plantations stretch below a misty, rugged mountain peak under a cloudy sky, creating a serene and scenic landscape..',
                image: './c1.jpg',
                place: 'Munnar',
              },
              {

                description: 'Golden sunset paints the sky as waves gently kiss the shore, while people enjoy the serene evening along the beach.',
                image: './c2.jpg',
                place: 'Varkala',

              },
              {
                
                description: 'Majestic waterfall cascading through lush green forests under a dramatic sky, sunlight piercing clouds, creating a magical, serene natural wonder.',
                image: './c9.jpg',
                place: 'Athirappilly',
                
              },
              {
                
                description: 'Waves kiss the shore as the iconic red lighthouse stands tall amidst swaying palms at Kovalam Beach, Keralas coastal gem',
                image: './c11.jpg',
                place: 'Kovalam',
              },
              {
                
                description: 'Golden sunset over Kerala backwaters, a traditional boat glides peacefully, framed by palm silhouettes and shimmering reflections on serene waters.',
                image: './c5.jpg',
                place: 'Alleppey',
               
              },
              {
                
                description: 'Sunrise bathes the valley in golden light as vibrant wildflowers bloom across the rolling hills, painting nature’s canvas with color',
                image: './c10.jpg',
                place: 'Wayanad',
                
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="relative bg-black/90 rounded-xl p-2 shadow-lg border border-gray-800/50 backdrop-blur-sm overflow-hidden flex flex-col"
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                custom={index}
                viewport={{ once: true }}
              >
                {/* Subtle Background Gradient for Depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl" />
                
                {/* Card Content */}
                <div className="relative z-10 flex flex-col h-50">
                  
                  
                  {/* Image */}
                  <div className="relative mb-4 ">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-96 object-cover rounded-lg border border-gray-700/50"
                    />
                    
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed flex-grow">{item.description}</p>
                  
                  {/* Subtle Divider */}
                  <div className="mt-4 border-t border-gray-700/50" />
                  
                  {/* Call to Action (Professional Touch) */}
                  <div className="mt-4">
                    <button className="text-gray-300 text-sm font-medium hover:text-white transition-colors flex items-center gap-2">
                      <MapPin size={16} />
                      {item.place}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer ref={footerRef} className="bg-black py-20 border-t border-gray-900">
        <div className="container mx-auto px-4">
          {/* Large Heading */}
          <div className="text-center mb-16">
            <h1 className="text-8xl md:text-10xl font-extrabold text-white tracking-tight">
              let's Travel
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mt-4">
              Ready to Roam somewhere <span className="text-white">Find the Destination</span>
            </p>
            <button className="mt-6 px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition">
              Let's GO →
            </button>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-400 px-20 py-10">
            {/* Pages Section */}
            <div className="text-left">
              <h3 className="text-sm uppercase font-bold mb-4 ">Pages</h3>
              <ul>
                {['Work', 'About', 'Blog', 'Contact', '404'].map((page, index) => (
                  <li key={index} className="mb-2">
                    <a
                      href={`#${page.toLowerCase()}`}
                      className="hover:text-white transition-colors"
                    >
                      {page}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Socials Section */}
            <div className="text-left md:text-center">
              <h3 className="text-sm uppercase font-semibold mb-4">Socials</h3>
              <ul>
                {['Twitter (X)', 'Instagram', 'Dribbble', 'LinkedIn'].map((social, index) => (
                  <li key={index} className="mb-2">
                    <a
                      href={`#${social.toLowerCase().replace(/\s+/g, '-')}`}
                      className="hover:text-white transition-colors"
                    >
                      {social}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;