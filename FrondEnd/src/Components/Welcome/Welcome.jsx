import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';



import './Welcome.css';

const ParticleNetwork = () => {
  const points = useRef();
  const particleCount = 250;
  
  useEffect(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Array(particleCount).fill().map(() => ({
      x: (Math.random() - 0.5) * 0.003,
      y: (Math.random() - 0.5) * 0.003,
      z: (Math.random() - 0.5) * 0.003
    }));

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }

    points.current.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );

    points.current.userData = { velocities };
  }, []);

  useFrame(() => {
    const positions = points.current.geometry.attributes.position.array;
    const velocities = points.current.userData.velocities;

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] += velocities[i].x;
      positions[i * 3 + 1] += velocities[i].y;
      positions[i * 3 + 2] += velocities[i].z;

      if (Math.abs(positions[i * 3]) > 7) velocities[i].x *= -1;
      if (Math.abs(positions[i * 3 + 1]) > 7) velocities[i].y *= -1;
      if (Math.abs(positions[i * 3 + 2]) > 7) velocities[i].z *= -1;
    }

    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry />
      <pointsMaterial 
        size={0.05} 
        color="#8ab4f8" 
        transparent 
        opacity={0.4}
        sizeAttenuation={true}
      />
    </points>
  );
};

const Welcome = () => {
    const navigate = useNavigate();
  
    const handleComplete = () => {
      navigate('/home');
    };
  

  return (
    <div className="welcome-container">
      <div className="background-animation">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <ambientLight intensity={0.1} />
          <pointLight position={[10, 10, 10]} intensity={0.3} />
          <ParticleNetwork />
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.3}
            maxPolarAngle={Math.PI}
            minPolarAngle={0}
          />
        </Canvas>
      </div>

    

      <main className="main-content">
        <motion.div 
          className="text-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>Welcome to TravelVerse</h1>
          <p className="secondary-text">Your Journey Begins Here</p>
        </motion.div>

        <motion.div
          className="cta-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <motion.button
            className="cta-button"
            onClick={handleComplete}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Your Journey
          </motion.button>
        </motion.div>
      </main>

      
    </div>
  );
};

export default Welcome; 