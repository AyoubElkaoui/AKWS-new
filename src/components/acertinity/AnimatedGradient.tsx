import React from 'react';

const AnimatedGradient = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 animate-gradient-x"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-pink-900 via-red-900 to-yellow-900 animate-gradient-y opacity-50"></div>
    </div>
  );
};

export default AnimatedGradient;