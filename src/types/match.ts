export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | string;

export interface Team {
  id: string;
  name: string;
  city: string;
}

export interface MatchScore {
  home: number;
  away: number;
}

export interface Match {
  id: string;
  startsAt: string | null;
  status: MatchStatus;
  minute?: number;
  home: Team;
  away: Team;
  score: MatchScore | null;
}

export interface MatchesResponse {
  round: number;
  matches: Match[];
}

export type FilterType = 'all' | 'upcoming' | 'finished';
