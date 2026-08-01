import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import type { TranslationKey } from '../../translations';
import LiquidGlassButton from '../LiquidGlass/LiquidGlassButton';
import './CategoryFilterBar.css';

export interface CategoryOption {
  id: string;
  translationKey: TranslationKey;
  searchKeyword: string;
}

export const CATEGORIES: CategoryOption[] = [
  { id: 'all', translationKey: 'catAll', searchKeyword: '' },
  { id: 'action', translationKey: 'catAction', searchKeyword: 'Action' },
  { id: 'scifi', translationKey: 'catSciFi', searchKeyword: 'Space' },
  { id: 'kdrama', translationKey: 'catKdrama', searchKeyword: 'Korean' },
  { id: 'fantasy', translationKey: 'catFantasy', searchKeyword: 'Magic' },
  { id: 'horror', translationKey: 'catHorror', searchKeyword: 'Horror' },
  { id: 'animation', translationKey: 'catAnimation', searchKeyword: 'Anime' },
  { id: 'classics', translationKey: 'catClassics', searchKeyword: 'Godfather' },
];

interface CategoryFilterBarProps {
  activeCategory: string;
  onSelectCategory: (category: CategoryOption) => void;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  const { t } = useLanguage();

  return (
    <div className="category-filter-wrapper">
      <div className="category-filter-scroll">
        {CATEGORIES.map((cat) => (
          <LiquidGlassButton
            key={cat.id}
            isActive={activeCategory === cat.id}
            onClick={() => onSelectCategory(cat)}
          >
            {t(cat.translationKey)}
          </LiquidGlassButton>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilterBar;
