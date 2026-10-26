import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FilterType } from '../types/match';

type Props = {
  activeFilter: FilterType;
  onChangeFilter: (filter: FilterType) => void;
  counts?: {
    all: number;
    upcoming: number;
    finished: number;
  };
};

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'upcoming', label: 'Предстоящие' },
  { key: 'finished', label: 'Завершённые' },
];

export function FilterTabs({ activeFilter, onChangeFilter, counts }: Props) {
  return (
    <View style={styles.container}>
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter.key;
        const count = counts ? counts[filter.key] : null;

        return (
          <Pressable
            key={filter.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChangeFilter(filter.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {filter.label}
              {count !== null && count !== undefined ? ` (${count})` : ''}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  tabTextActive: {
    color: '#111827',
  },
});
