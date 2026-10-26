import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Match } from '../types/match';
import { FavoriteButton } from './FavoriteButton';

type Props = {
  match: Match;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
};

function formatMatchDate(startsAt: string | null): string {
  if (!startsAt) {
    return 'Дата уточняется';
  }

  const date = new Date(startsAt);
  if (isNaN(date.getTime())) {
    return 'Дата уточняется';
  }

  const datePart = date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
  const timePart = date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${datePart}, ${timePart}`;
}

function getStatusDetails(match: Match): { label: string; badgeStyle: object; textStyle: object } {
  switch (match.status) {
    case 'finished':
      return {
        label: 'Завершён',
        badgeStyle: styles.badgeFinished,
        textStyle: styles.badgeFinishedText,
      };
    case 'live':
      return {
        label: match.minute ? `LIVE ${match.minute}'` : 'LIVE',
        badgeStyle: styles.badgeLive,
        textStyle: styles.badgeLiveText,
      };
    case 'scheduled':
      return {
        label: 'Запланирован',
        badgeStyle: styles.badgeScheduled,
        textStyle: styles.badgeScheduledText,
      };
    case 'postponed':
      return {
        label: 'Перенесён',
        badgeStyle: styles.badgePostponed,
        textStyle: styles.badgePostponedText,
      };
    default:
      return {
        label: match.status,
        badgeStyle: styles.badgeDefault,
        textStyle: styles.badgeDefaultText,
      };
  }
}

export function MatchCard({ match, isFavorite, onToggleFavorite }: Props) {
  const statusDetails = getStatusDetails(match);
  const formattedDate = formatMatchDate(match.startsAt);
  const hasScore = match.score !== null && match.score !== undefined;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, statusDetails.badgeStyle]}>
          <Text style={[styles.badgeText, statusDetails.textStyle]}>
            {statusDetails.label}
          </Text>
        </View>

        <Text style={styles.dateText}>{formattedDate}</Text>

        <FavoriteButton
          active={isFavorite}
          onPress={() => onToggleFavorite(match.id)}
        />
      </View>

      <View style={styles.teamsContainer}>
        {/* Хозяева */}
        <View style={[styles.teamColumn, styles.homeColumn]}>
          <Text style={styles.teamName} numberOfLines={1}>
            {match.home.name}
          </Text>
          <Text style={styles.cityName} numberOfLines={1}>
            {match.home.city}
          </Text>
        </View>

        {/* Счёт / разделитель */}
        <View style={styles.scoreContainer}>
          {hasScore ? (
            <Text style={styles.scoreText}>
              {match.score?.home} : {match.score?.away}
            </Text>
          ) : (
            <Text style={styles.noScoreText}>vs</Text>
          )}
        </View>

        {/* Гости */}
        <View style={[styles.teamColumn, styles.awayColumn]}>
          <Text style={styles.teamName} numberOfLines={1}>
            {match.away.name}
          </Text>
          <Text style={styles.cityName} numberOfLines={1}>
            {match.away.city}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeFinished: {
    backgroundColor: '#f3f4f6',
  },
  badgeFinishedText: {
    color: '#4b5563',
  },
  badgeLive: {
    backgroundColor: '#fee2e2',
  },
  badgeLiveText: {
    color: '#dc2626',
  },
  badgeScheduled: {
    backgroundColor: '#eff6ff',
  },
  badgeScheduledText: {
    color: '#2563eb',
  },
  badgePostponed: {
    backgroundColor: '#fef3c7',
  },
  badgePostponedText: {
    color: '#d97706',
  },
  badgeDefault: {
    backgroundColor: '#f3f4f6',
  },
  badgeDefaultText: {
    color: '#6b7280',
  },
  dateText: {
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamColumn: {
    flex: 1,
  },
  homeColumn: {
    alignItems: 'flex-start',
  },
  awayColumn: {
    alignItems: 'flex-end',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  cityName: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  scoreContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  scoreText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 1,
  },
  noScoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
});
