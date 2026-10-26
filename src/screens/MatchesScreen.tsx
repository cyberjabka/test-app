import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MatchCard } from '../components/MatchCard';
import { UpdatedAgo } from '../components/UpdatedAgo';
import { MATCHES_URL } from '../config';
import { useFavorites } from '../hooks/useFavorites';
import { Match, MatchesResponse } from '../types/match';

export function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [round, setRound] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { isFavorite, toggle } = useFavorites();

  const loadMatches = useCallback(async () => {
    setIsLoading(true);
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
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  return (
    <View style={styles.container}>
      {/* Шапка */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Матчи тура</Text>
          {round !== null && (
            <Text style={styles.subtitle}>Тур {round}</Text>
          )}
        </View>

        {lastUpdated && (
          <View style={styles.metaContainer}>
            <UpdatedAgo since={lastUpdated} />
          </View>
        )}
      </View>

      {/* Состояние загрузки */}
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
            onPress={loadMatches}
          >
            <Text style={styles.retryButtonText}>Повторить</Text>
          </Pressable>
        </View>
      )}

      {/* Список матчей */}
      {!isLoading && !errorMessage && (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MatchCard
              match={item}
              isFavorite={isFavorite(item.id)}
              onToggleFavorite={toggle}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.stateText}>Матчи не найдены</Text>
            </View>
          }
        />
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
    paddingBottom: 16,
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
  metaContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingTop: 6,
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
