import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  variant = 'white',
  hover = true,
  className = '',
  ...props
}) => {
  const variants = {
    white: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    gradient: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 border border-blue-200 dark:border-gray-700',
    ghost: 'bg-transparent border border-gray-300 dark:border-gray-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -5, boxShadow: '0 20px 25px -5 rgba(0, 0, 0, 0.1)' } : {}}
      className={`rounded-2xl shadow-sm transition-all duration-300 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
