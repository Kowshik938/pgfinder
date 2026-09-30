import React, { createContext, useContext, useState } from 'react';
import { PGItem } from '../components/PGCard.tsx';

export interface FilterState {
  city: string;
  genderType: string; // 'ALL' | 'BOYS' | 'GIRLS' | 'COED'
  minRent: number;
  maxRent: number;
  roomType: string; // 'ALL' | 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FOUR_SHARING'
  foodFilter: string; // 'ALL' | 'INCLUDED' | 'NOT_INCLUDED'
  verifiedOnly: boolean;
  selectedAmenities: string[];
  search: string;
  sortBy: string; // 'rating_desc' | 'price_asc' | 'price_desc' | 'newest'
}

interface FilterContextType {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  toggleAmenityFilter: (amenityName: string) => void;
  resetFilters: () => void;
  activeFilterCount: number;
  // Compare Feature
  compareList: PGItem[];
  addToCompare: (pg: PGItem) => void;
  removeFromCompare: (pgId: number) => void;
  clearCompare: () => void;
  isComparing: (pgId: number) => boolean;
}

const defaultFilters: FilterState = {
  city: 'All',
  genderType: 'ALL',
  minRent: 5000,
  maxRent: 30000,
  roomType: 'ALL',
  foodFilter: 'ALL',
  verifiedOnly: false,
  selectedAmenities: [],
  search: '',
  sortBy: 'rating_desc',
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [compareList, setCompareList] = useState<PGItem[]>([]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleAmenityFilter = (amenityName: string) => {
    setFilters((prev) => {
      const exists = prev.selectedAmenities.includes(amenityName);
      return {
        ...prev,
        selectedAmenities: exists
          ? prev.selectedAmenities.filter((a) => a !== amenityName)
          : [...prev.selectedAmenities, amenityName],
      };
    });
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  // Calculate number of active non-default filters
  const activeFilterCount = [
    filters.city !== 'All',
    filters.genderType !== 'ALL',
    filters.roomType !== 'ALL',
    filters.foodFilter !== 'ALL',
    filters.verifiedOnly === true,
    filters.maxRent < 30000,
    filters.minRent > 5000,
    filters.selectedAmenities.length > 0,
    filters.search.trim().length > 0,
    filters.sortBy !== 'rating_desc',
  ].filter(Boolean).length;

  // Comparison Handlers (max 3 items)
  const addToCompare = (pg: PGItem) => {
    setCompareList((prev) => {
      if (prev.some((p) => p.id === pg.id)) return prev;
      if (prev.length >= 3) {
        return [...prev.slice(1), pg]; // replace oldest
      }
      return [...prev, pg];
    });
  };

  const removeFromCompare = (pgId: number) => {
    setCompareList((prev) => prev.filter((p) => p.id !== pgId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isComparing = (pgId: number) => {
    return compareList.some((p) => p.id === pgId);
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        setFilters,
        updateFilter,
        toggleAmenityFilter,
        resetFilters,
        activeFilterCount,
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isComparing,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
