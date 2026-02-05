import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', text = 'Carregando...' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-4"
    >
      <div className={`${sizes[size]} relative`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className={`${sizes[size]} border-4 border-transparent border-t-blue-600 border-r-blue-600 rounded-full`}
        />
      </div>
      {text && <p className="text-gray-600 dark:text-gray-400 font-medium">{text}</p>}
    </motion.div>
  );
};

export default LoadingSpinner;
