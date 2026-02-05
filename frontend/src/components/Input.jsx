import React from 'react';
import { motion } from 'framer-motion';

const Input = ({
  label,
  error,
  icon: Icon,
  type = 'text',
  className = '',
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 capitalize">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon size={20} />
          </div>
        )}
        <input
          type={type}
          className={`w-full ${Icon ? 'pl-10' : 'px-4'} py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20 dark:bg-gray-700 dark:text-white transition-all duration-200 ${
            error ? 'border-red-500 focus:border-red-500' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 text-sm mt-1 font-medium"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default Input;
