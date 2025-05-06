import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

const FareItem = ({ label, amount, tooltip, details, className = '' }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className={`flex flex-col py-0.5 group ${className}`}
    whileHover={{ scale: 1.01 }}
    transition={{ type: "spring", stiffness: 200 }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-gray-800 font-mono text-sm">{label}</span>
        <div className="group relative inline-block">
          <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 transition-colors cursor-help" />
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-sm rounded-lg py-2 px-3 
            absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-[200px] pointer-events-none backdrop-blur-sm
            before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 
            before:border-4 before:border-transparent before:border-t-black/80">
            {tooltip}
          </div>
        </div>
      </div>
      <span className="font-mono text-sm text-gray-800">₹{amount.toFixed(2)}</span>
    </div>
    {details && (
      <span className="text-[10px] text-gray-500 font-mono mt-0.5">{details}</span>
    )}
  </motion.div>
);

FareItem.propTypes = {
  label: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  tooltip: PropTypes.string.isRequired,
  details: PropTypes.string,
  className: PropTypes.string
};

export const FareBreakdown = ({ fares, date = new Date(), service = 'auto' }) => {
  const totalFare = fares.reduce((sum, fare) => sum + fare.amount, 0);
  const currentDate = date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  
  const receiptNumber = React.useMemo(() => 
    Math.random().toString(36).substring(2, 8).toUpperCase(), 
    []
  );

  const getServiceTitle = () => {
    switch (service) {
      case 'taxi':
        return 'Taxi Fare';
      case 'bus':
        return 'Bus Fare';
      default:
        return 'Auto Fare';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-[320px] mx-auto filter drop-shadow"
    >
      {/* Top torn edge */}
      <div 
        className="h-3 bg-white"
        style={{
          '--mask': 'conic-gradient(from 135deg at top,#0000,#000 1deg 89deg,#0000 90deg) 50%/20px 100%',
          WebkitMask: 'var(--mask)',
          mask: 'var(--mask)'
        }}
      />

      <motion.div 
        className="bg-white"
        initial={{ scale: 0.98 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 150 }}
      >
        <div className="p-2 space-y-1">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center "
          >
            <div className="flex justify-between items-center text-[10px] text-gray-500 px-1 ">
              <span>{currentDate}</span>
              <span>#{receiptNumber}</span>
            </div>
            <motion.h1 
              className="text-lg font-bold uppercase tracking-wide text-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {getServiceTitle()}
            </motion.h1>
          </motion.div>

          <AnimatePresence>
            <motion.div className="space-y-0.5">
              {fares.map((fare, index) => (
                <motion.div
                  key={fare.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <FareItem {...fare} />
                  {index < fares.length - 1 && (
                    <div className="border-b border-dotted border-gray-200" />
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          <motion.div 
            className="pt-4 mt-2 border-t border-dashed border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-gray-800">Total Fare</span>
              <span className="font-bold text-base text-gray-800">
                ₹{totalFare.toFixed(2)}
              </span>
            </div>
          </motion.div>

          <div className="text-center pt-4 space-y-1">
            <p className="text-[10px] text-gray-500">
              Use{' '}
              <a 
                href="https://sitinshade.com" 
                target="_blank" 
                rel="noopener"
                className="text-gray-600 hover:text-gray-800 underline decoration-dotted decoration-gray-400 decoration-1 underline-offset-2 transition-colors"
              >
                SitInShade.com
              </a>
              {' '}to avoid sunlight while travelling !
            </p>
          </div>
        </div>
      </motion.div>

      {/* Bottom torn edge */}
      <div 
        className="h-3 bg-white"
        style={{
          '--mask': 'conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) 50%/20px 100%',
          WebkitMask: 'var(--mask)',
          mask: 'var(--mask)'
        }}
      />
    </motion.div>
  );
};

FareBreakdown.propTypes = {
  fares: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    tooltip: PropTypes.string.isRequired,
    details: PropTypes.string
  })).isRequired,
  date: PropTypes.instanceOf(Date),
  service: PropTypes.oneOf(['auto', 'taxi', 'bus'])
};

export default FareBreakdown;