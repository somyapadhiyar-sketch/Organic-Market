import React from 'react';
import { motion } from 'framer-motion';

const colorThemes = {
  green: {
    bg: 'bg-green-500',
    light1: 'fill-green-300',
    light2: 'fill-green-400',
    dark1: 'fill-green-600',
    dark2: 'fill-green-700',
    darkest: 'fill-green-800',
    text: 'text-green-50'
  },
  blue: {
    bg: 'bg-blue-500',
    light1: 'fill-blue-300',
    light2: 'fill-blue-400',
    dark1: 'fill-blue-600',
    dark2: 'fill-blue-700',
    darkest: 'fill-blue-800',
    text: 'text-blue-50'
  },
  orange: {
    bg: 'bg-orange-500',
    light1: 'fill-orange-300',
    light2: 'fill-orange-400',
    dark1: 'fill-orange-600',
    dark2: 'fill-orange-700',
    darkest: 'fill-orange-800',
    text: 'text-orange-50'
  },
  purple: {
    bg: 'bg-purple-500',
    light1: 'fill-purple-300',
    light2: 'fill-purple-400',
    dark1: 'fill-purple-600',
    dark2: 'fill-purple-700',
    darkest: 'fill-purple-800',
    text: 'text-purple-50'
  },
  yellow: {
    bg: 'bg-yellow-500',
    light1: 'fill-yellow-300',
    light2: 'fill-yellow-400',
    dark1: 'fill-yellow-600',
    dark2: 'fill-yellow-700',
    darkest: 'fill-yellow-800',
    text: 'text-yellow-50'
  }
};

export default function WaveBanner({ 
  theme = 'green', 
  title = 'Fresh Deals Every Day!', 
  subtitle = 'Get up to 50% off on organic fruits and vegetables.',
  className = '',
  bottomColorClass = 'fill-white'
}) {
  const colors = colorThemes[theme] || colorThemes.green;

  return (
    <div className={`relative w-full max-w-full m-0 p-0 h-[350px] sm:h-[400px] ${colors.bg} overflow-hidden flex items-center justify-center ${className}`}>
      
      {/* Animated Wave Backgrounds */}
      <div className="absolute inset-0 w-full h-full overflow-hidden leading-[0] pointer-events-none">
        
        {/* Top Wave */}
        <svg 
          className="absolute -top-10 left-0 w-[200%] h-[160%] animate-wave opacity-60" 
          style={{ animationDuration: '20s', willChange: 'transform' }}
          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none"
        >
          <path d="M0,0 V70 Q150,110 300,70 T600,70 Q750,110 900,70 T1200,70 V0 H0 Z" className={colors.light1}></path>
          <path d="M0,0 V45 Q150,20 300,45 T600,45 Q750,20 900,45 T1200,45 V0 H0 Z" className={colors.light2}></path>
        </svg>

        {/* Bottom Wave 1 */}
        <svg 
          className="absolute -bottom-10 left-0 w-[200%] h-[200%] animate-wave rotate-180 opacity-80" 
          style={{ animationDuration: '15s', animationDirection: 'reverse', willChange: 'transform' }}
          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none"
        >
          <path d="M0,0 V55 Q150,85 300,55 T600,55 Q750,85 900,55 T1200,55 V0 H0 Z" className={colors.dark1}></path>
          <path d="M0,0 V75 Q150,40 300,75 T600,75 Q750,40 900,75 T1200,75 V0 H0 Z" className={colors.dark2}></path>
        </svg>

        {/* Bottom Wave 2 */}
        <svg 
          className="absolute -bottom-5 left-0 w-[200%] h-[120%] animate-wave rotate-180" 
          style={{ animationDuration: '10s', willChange: 'transform' }}
          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none"
        >
          <path d="M0,0 V65 Q150,115 300,65 T600,65 Q750,115 900,65 T1200,65 V0 H0 Z" className={colors.darkest}></path>
        </svg>
      </div>

      {/* OUTSIDE BOTTOM WAVE CUTOUT (Makes the bottom edge of the box wavy) */}
      <div className="absolute bottom-0 left-0 w-full h-[50px] sm:h-[70px] md:h-[90px] z-20 pointer-events-none rotate-180">
        <svg 
          className={`absolute top-0 left-0 w-[200%] h-full animate-wave ${bottomColorClass}`} 
          style={{ animationDuration: '10s', willChange: 'transform' }}
          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none"
        >
          <path d="M0,0 V40 Q150,10 300,40 T600,40 Q750,10 900,40 T1200,40 V0 H0 Z"></path>
        </svg>
      </div>

      {/* Banner Text */}
      <div className="relative z-30 text-center text-white p-6">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
        >
          {title}
        </motion.h2>
        <p className={`text-lg md:text-xl font-bold drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] ${colors.text}`}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}