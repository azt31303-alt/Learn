
import React from 'react';

interface WelcomeProps {
  onStart: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onStart }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md mx-4 text-center transform transition-all opacity-0 animate-fade-in-scale">
        <style>
          {`
            @keyframes fade-in-scale {
              from {
                transform: scale(0.95);
                opacity: 0;
              }
              to {
                transform: scale(1);
                opacity: 1;
              }
            }
            .animate-fade-in-scale {
              animation: fade-in-scale 0.3s ease-out forwards;
            }
          `}
        </style>
        <h2 className="text-3xl sm:text-4xl font-bold text-teal-600 dark:text-teal-400 mb-4">
          স্বাগতম!
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-8 text-base sm:text-lg leading-relaxed">
          এই অ্যাপটি তোমাদের জন্য তৈরি করা হয়েছে। এটি শিক্ষায় ও পড়ায় একটি গুরুত্বপূর্ণ সহায়িকা হবে।
          <br/><br/>
          'শুরু করুন' বোতামে চাপ দিয়ে তোমার শেখার জগত খুলে ফেলো!
        </p>
        <button
          onClick={onStart}
          className="bg-teal-500 text-white font-bold text-lg sm:text-xl px-8 py-3 rounded-full shadow-lg hover:bg-teal-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-300 dark:focus:ring-teal-700"
        >
          শুরু করুন
        </button>
      </div>
    </div>
  );
};

export default Welcome;
