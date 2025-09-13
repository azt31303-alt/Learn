
import React from 'react';
import { Category } from '../types';

interface HeaderProps {
  activeCategory: Category;
  setCategory: (category: Category) => void;
}

const Header: React.FC<HeaderProps> = ({ activeCategory, setCategory }) => {
  const categories = Object.values(Category);

  return (
    <nav className="flex flex-wrap justify-center gap-2">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => setCategory(category)}
          className={`px-3 py-2 text-sm sm:text-base font-semibold rounded-md transition-colors duration-200 ${
            activeCategory === category
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-teal-100 dark:hover:bg-slate-600'
          }`}
        >
          {category}
        </button>
      ))}
    </nav>
  );
};

export default Header;
