import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ArrowLeft, Compass, Search, Mic } from 'lucide-react';
import { ParallaxProvider } from 'react-scroll-parallax';
import * as THREE from 'three';
import BIRDS from 'vanta/dist/vanta.birds.min';
import axios from 'axios';

const Destinations = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchResults, setSearchResults] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState(location.state?.searchQuery || '');
    const [isListening, setIsListening] = useState(false);
    const [images, setImages] = useState({});
    const vantaRef = useRef(null);
    const vantaEffect = useRef(null);
    const recognitionRef = useRef(null);

    const UNSPLASH_ACCESS_KEY = '';

    useEffect(() => {
        if (location.state?.searchQuery) {
            fetchResults(location.state.searchQuery);
        }
    }, [location.state?.searchQuery]);

    useEffect(() => {
        try {
            if (vantaRef.current && !vantaEffect.current) {
                vantaEffect.current = BIRDS({
                    el: vantaRef.current,
                    THREE,
                    mouseControls: true,
                    touchControls: true,
                    gyroControls: false,
                    minHeight: 600.0,
                    minWidth: 200.0,
                    scale: 1.0,
                    scaleMobile: 1.0,
                    backgroundColor: 0x0,
                    color1: 0x111111,
                    color2: 0x222222,
                    birdSize: 1.2,
                    wingSpan: 25.0,
                    speedLimit: 4.0,
                    separation: 25.0,
                    alignment: 15.0,
                    cohesion: 15.0,
                    quantity: 2.0,
                    backgroundAlpha: 0.3,
                });
            }
        } catch (err) {
            console.error('Vanta.js initialization failed:', err);
        }

        return () => {
            if (vantaEffect.current) {
                vantaEffect.current.destroy();
                vantaEffect.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map((result) => result[0].transcript)
                    .join('');
                setSearchQuery(transcript);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
                setError('Voice search failed. Please try again or type your query.');
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const fetchResults = async (query) => {
        try {
            setLoading(true);
            setError(null);

            if (!query.trim()) {
                setSearchResults({});
                setLoading(false);
                return;
            }

            const response = await axios.get('http://localhost:8000/api/search/', {
                params: { query },
            });

            const { results } = response.data;
            setSearchResults(results);

            // Pre-fetch images for all results
            Object.keys(results).forEach(fetchImage);
        } catch (err) {
            console.error('Search API error:', err.message);
            setError('Failed to fetch destinations. Is the server running?');
        } finally {
            setLoading(false);
        }
    };

    const fetchImage = async (place) => {
        const normalizedPlace = place.trim().toLowerCase();
        if (images[normalizedPlace] !== undefined) return;

        try {
            const response = await axios.get('https://api.unsplash.com/search/photos', {
                params: {
                    query: place,
                    per_page: 1,
                    orientation: 'landscape',
                },
                headers: {
                    Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
                },
            });

            const imageUrl = response.data.results[0]?.urls?.regular || '';
            setImages((prev) => ({ ...prev, [normalizedPlace]: imageUrl }));
        } catch (err) {
            console.error('Failed to fetch image:', err.message);
            setImages((prev) => ({ ...prev, [normalizedPlace]: '' }));
        }
    };

    const handleVoiceSearch = () => {
        if (!recognitionRef.current) {
            setError('Voice search is not supported in this browser.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            fetchResults(searchQuery.trim());
        } else {
            setSearchResults({});
            setError('Please enter a search query.');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                when: 'beforeChildren',
                staggerChildren: 0.15,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0, scale: 0.95 },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: { duration: 0.6, ease: 'easeOut' },
        },
    };

    const cardHoverVariants = {
        rest: {
            scale: 1,
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.5)',
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 20,
            },
        },
        hover: {
            scale: 1.03,
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 255, 255, 0.15)',
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 20,
            },
        },
    };

    const Card = ({ place, details }) => {
        const normalizedPlace = place.trim().toLowerCase();
        const [isImageLoading, setIsImageLoading] = useState(true);

        useEffect(() => {
            setIsImageLoading(images[normalizedPlace] === undefined || images[normalizedPlace] === '');
        }, [images[normalizedPlace]]);

        const getMapUrl = (place, providedUrl) => {
            if (providedUrl && providedUrl.startsWith('http')) {
                return providedUrl;
            }
            const query = encodeURIComponent(place);
            return `https://www.google.com/maps/search/?api=1&query=${query}`;
        };

        const mapUrl = getMapUrl(place, details[2]);

        return (
            <motion.div
                className="bg-gradient-to-br from-gray-900/30 to-gray-800/30 backdrop-blur-2xl rounded-2xl overflow-hidden border border-gray-700/20 shadow-2xl transform-gpu cursor-pointer transition-all duration-300"
                whileHover="hover"
                initial="rest"
                animate="rest"
                variants={cardHoverVariants}
            >
                <div className="p-6">
                    <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                        {isImageLoading ? (
                            <div className="w-full h-full bg-gray-900/50 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400 text-sm">Loading...</span>
                            </div>
                        ) : images[normalizedPlace] && images[normalizedPlace] !== '' ? (
                            <>
                                <img
                                    src={images[normalizedPlace]}
                                    alt={`View of ${place}`}
                                    className="w-full h-full object-cover"
                                    onLoad={() => setIsImageLoading(false)}
                                    onError={() => setIsImageLoading(false)}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                            </>
                        ) : (
                            <div className="w-full h-full bg-gray-900/50 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400 text-sm">No image available</span>
                            </div>
                        )}
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-gray-100 tracking-wide">{place}</h3>
                    <p className="text-gray-300 mb-5 text-base leading-relaxed line-clamp-3">{details[1]}</p>
                    <div className="flex items-center gap-2 text-gray-400 mb-4">
                        <Calendar size={18} />
                        <span className="text-sm">Best time to visit:</span>
                        <span className="text-gray-200 font-medium">{details[0]}</span>
                    </div>
                    {details[2] !== undefined && (
                        <a
                            href={mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-gray-100 px-5 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <MapPin size={18} />
                            View on Map
                        </a>
                    )}
                </div>
            </motion.div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-gray-900 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center text-gray-200"
                >
                    <motion.div
                        className="relative w-16 h-16 mx-auto mb-6"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    >
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-500 to-gray-700 shadow-lg"></div>
                        <div className="absolute inset-2 rounded-full bg-black"></div>
                    </motion.div>
                    <p className="text-xl font-medium tracking-wide">Exploring...</p>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-gray-900 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center text-gray-200"
                >
                    <motion.div
                        animate={{ rotateY: [0, 10, -10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="text-red-500 text-6xl mb-4"
                    >
                        <Compass className="mx-auto h-16 w-16" />
                    </motion.div>
                    <p className="text-gray-400 text-xl mb-8 tracking-wide">{error}</p>
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/home')}
                        className="bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-gray-200 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                        <ArrowLeft size={20} />
                        Back to Home
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    if (!Object.keys(searchResults).length && !loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-gray-900 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center text-gray-200"
                >
                    <motion.div
                        animate={{ rotateY: [0, 10, -10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="text-gray-500 text-6xl mb-4"
                    >
                        <Compass className="mx-auto h-16 w-16" />
                    </motion.div>
                    <p className="text-gray-400 text-xl mb-8 tracking-wide">
                        {searchQuery ? `No results found for "${searchQuery}".` : 'Please enter a search query.'}
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/home')}
                        className="bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-gray-200 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                        <ArrowLeft size={20} />
                        Try Another Search
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <ParallaxProvider>
            <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-gray-900 text-gray-200 font-sans overflow-hidden relative">
                <div
                    ref={vantaRef}
                    className="absolute top-0 left-0 w-full h-[600px] z-0"
                    style={{ background: 'linear-gradient(to bottom, #000000, #1a1a1a)' }}
                >
                    <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-black/90 to-transparent z-10"></div>
                </div>

                <nav className="fixed top-0 w-full backdrop-blur-2xl z-50 py-4 border-b border-gray-900/30 shadow-sm">
                    <div className="container mx-auto px-6 flex justify-between items-center">
                        <motion.h1
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl font-bold text-gray-100 tracking-tight"
                        >
                            TravelVerse
                        </motion.h1>
                        <motion.button
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/home')}
                            className="flex items-center gap-2 text-gray-400 hover:text-gray-100 transition-colors duration-300"
                        >
                            <ArrowLeft size={20} />
                            Back to Home
                        </motion.button>
                    </div>
                </nav>

                <div className="container mx-auto px-6 pt-28 relative z-20">
                    <motion.form
                        onSubmit={handleSearch}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto"
                    >
                        <div className="flex-1 bg-gradient-to-br from-gray-900/20 to-gray-800/20 backdrop-blur-2xl rounded-2xl p-5 border border-gray-700/30 shadow-2xl flex items-center gap-3 transition-all duration-300 focus-within:ring-2 focus-within:ring-gray-500/50">
                            <Search size={20} className="text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search destinations..."
                                className="bg-transparent border-none outline-none flex-1 text-gray-200 placeholder-gray-600 text-lg tracking-wide"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Search destinations"
                            />
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleVoiceSearch}
                                className={`p-2 rounded-full transition-colors duration-300 ${
                                    isListening ? 'bg-gray-700 text-gray-200' : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                                }`}
                                aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
                                disabled={loading}
                            >
                                <Mic size={20} />
                            </motion.button>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)' }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-gray-200 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                            disabled={loading || isListening}
                        >
                            Search
                        </motion.button>
                    </motion.form>
                </div>

                <div className="container mx-auto px-6 py-20 relative z-20">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.h2
                            className="text-5xl md:text-6xl font-bold text-center mb-16 text-gray-100 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-400"
                            variants={itemVariants}
                        >
                            Discover Your Next Adventure
                        </motion.h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {Object.entries(searchResults).map(([place, details]) => (
                                <Card
                                    key={place}
                                    place={place}
                                    details={details}
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </ParallaxProvider>
    );
};

export default Destinations;
