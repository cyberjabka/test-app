import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FilterTabs } from '../components/FilterTabs';
import { MatchCard } from '../components/MatchCard';
import { UpdatedAgo } from '../components/UpdatedAgo';
import { MATCHES_URL } from '../config';
import { useFavorites } from '../hooks/useFavorites';
import { FilterType, Match, MatchesResponse } from '../types/match';

export function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [round, setRound] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const { isFavorite, toggle } = useFavorites();

  const loadMatches = useCallback(async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const response = await fetch(MATCHES_URL);
      if (!response.ok) {
        throw new Error(`Ошибка сети: статус ${response.status}`);
      }
      const data: MatchesResponse = await response.json();
      setMatches(data.matches || []);
      setRound(data.round ?? null);
      setLastUpdated(new Date());
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Не удалось загрузить данные матчей'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  // Фильтрация матчей:
  // - 'all': все матчи тура
  // - 'finished': завершённые (status === 'finished')
  // - 'upcoming': запланированные, текущие (live) и перенесённые (postponed)
  const filteredMatches = useMemo(() => {
    if (activeFilter === 'finished') {
      return matches.filter((m) => m.status === 'finished');
    }
    if (activeFilter === 'upcoming') {
      return matches.filter((m) => m.status !== 'finished');
    }
    return matches;
  }, [matches, activeFilter]);

  // Количество для вкладок фильтра
  const filterCounts = useMemo(() => {
    const finished = matches.filter((m) => m.status === 'finished').length;
    const upcoming = matches.length - finished;
    return {
      all: matches.length,
      upcoming,
      finished,
    };
  }, [matches]);

  const getEmptyMessage = () => {
    if (activeFilter === 'finished') {
      return 'Нет завершённых матчей';
    }
    if (activeFilter === 'upcoming') {
      return 'Нет предстоящих матчей';
    }
    return 'Матчи не найдены';
  };

  return (
    <View style={styles.container}>
      {/* Шапка */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Матчи тура</Text>
          {round !== null && <Text style={styles.subtitle}>Тур {round}</Text>}
        </View>

        <View style={styles.headerRight}>
          {lastUpdated && <UpdatedAgo since={lastUpdated} />}
          <Pressable
            style={({ pressed }) => [
              styles.refreshHeaderButton,
              pressed && styles.refreshHeaderButtonPressed,
            ]}
            onPress={() => loadMatches(false)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Обновить данные"
          >
            <Text style={styles.refreshHeaderText}>↻ Обновить</Text>
          </Pressable>
        </View>
      </View>

      {/* Состояние первичной загрузки */}
      {isLoading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.stateText}>Загрузка матчей...</Text>
        </View>
      )}

      {/* Состояние ошибки */}
      {!isLoading && errorMessage && (
        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>Произошла ошибка</Text>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.retryButtonPressed,
            ]}
            onPress={() => loadMatches(false)}
          >
            <Text style={styles.retryButtonText}>Повторить</Text>
          </Pressable>
        </View>
      )}

      {/* Список с фильтром */}
      {!isLoading && !errorMessage && (
        <>
          <FilterTabs
            activeFilter={activeFilter}
            onChangeFilter={setActiveFilter}
            counts={filterCounts}
          />

          <FlatList
            data={filteredMatches}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MatchCard
                match={item}
                isFavorite={isFavorite(item.id)}
                onToggleFavorite={toggle}
              />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => loadMatches(true)}
                colors={['#2563eb']}
                tintColor="#2563eb"
              />
            }
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Text style={styles.stateText}>{getEmptyMessage()}</Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 8,
    paddingBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
    fontWeight: '500',
  },
  headerRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
  },
  refreshHeaderButton: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  refreshHeaderButtonPressed: {
    backgroundColor: '#d1d5db',
  },
  refreshHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  listContent: {
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  stateText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6b7280',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 6,
  },
  errorMessage: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonPressed: {
    backgroundColor: '#1d4ed8',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
