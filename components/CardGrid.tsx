
import React from 'react';
import { LearningItem, Category } from '../types';
import Card from './Card';

interface CardGridProps {
  items: LearningItem[];
  category: Category;
}

const CardGrid: React.FC<CardGridProps> = ({ items, category }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {items.map((item, index) => (
        <Card key={`${item.character}-${index}`} item={item} category={category} />
      ))}
    </div>
  );
};

export default CardGrid;
