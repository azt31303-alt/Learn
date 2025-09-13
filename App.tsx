
import React, { useState, useMemo } from 'react';
import { Category, LearningItem } from './types';
import { banglaVowels, banglaConsonants, englishAlphabet, banglaNumbers, englishNumbers } from './constants/data';
import Header from './components/Header';
import CardGrid from './components/CardGrid';
import Welcome from './components/Welcome';

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>(Category.BANGLA_VOWELS);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);

  const handleStart = () => {
    setShowWelcome(false);
  };

  const learningData = useMemo((): LearningItem[] => {
    switch (activeCategory) {
      case Category.BANGLA_VOWELS:
        return banglaVowels;
      case Category.BANGLA_CONSONANTS:
        return banglaConsonants;
      case Category.ENGLISH_ALPHABET:
        return englishAlphabet;
      case Category.BANGLA_NUMBERS:
        return banglaNumbers;
      case Category.ENGLISH_NUMBERS:
        return englishNumbers;
      default:
        return [];
    }
  }, [activeCategory]);

  return (
    <div className="min-h-screen font-sans">
      {showWelcome && <Welcome onStart={handleStart} />}
      
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-teal-600 dark:text-teal-400 mb-3 sm:mb-0">
              Bangla Pathshala (বাংলা পাঠশালা)
            </h1>
            <Header activeCategory={activeCategory} setCategory={setActiveCategory} />
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 md:p-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-slate-700 dark:text-slate-300">{activeCategory}</h2>
        <CardGrid items={learningData} category={activeCategory} />
      </main>

      <footer className="text-center py-6 mt-8 border-t border-slate-200 dark:border-slate-800">
        <p className="text-slate-500 dark:text-slate-400">
          Made with ❤️ for learning.
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
          Version 1.0
        </p>
      </footer>
    </div>
  );
};

export default App;
