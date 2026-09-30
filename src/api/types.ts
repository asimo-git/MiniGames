// ---------- Responses ----------
export interface DataResponse<T> {
  data: T;
}
export interface ListResponse<T, M = Record<string, unknown>> {
  data: T[];
  meta: M;
}

// ---------- Catalog ----------
export interface Category {
  slug: string;
  label: string;
  isDefault: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  gamesPlayed: number;
  totalScore: number;
  streakDays: number;
  favoriteGameSlug: string;
  favoriteGameName: string;
}

// ---------- Games ----------
export const GAMES_SORTS = ['rating-desc', 'rating-asc', 'name-asc', 'name-desc'] as const;
export type GamesSort = (typeof GAMES_SORTS)[number];

export interface GamesListParameters {
  featured?: boolean;
  page?: number;
  limit?: number; // 1–100
  category?: string; // all | puzzle | card | match | farm | strategy | arcade
  sort?: GamesSort;
}

export const FREE_PRICE_LABEL = 'Free';

export interface GameSummary {
  slug: string;
  name: string;
  category: string;
  price: string; // "Free" | "$1.99"
  shortDescription: string;
  rating: number;
  likesCount: number;
  cardImage: string;
}

export interface GamesListMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  appliedFilter: Record<string, unknown>;
}

export interface GameDetails {
  slug: string;
  name: string;
  heroImage: string;
  rating: number;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  fullDescription: string;
  specs: { genre: string; players: string; duration: string; price: string };
  topRecords: Array<{
    position: number;
    playerName: string;
    score: number;
    achievedAt: string;
  }>;
}

export interface FavoriteResult {
  gameSlug: string;
  isFavorited: boolean;
  likesCount: number;
}

// ---------- Comments ----------
export type CommentsSort = 'newest' | 'oldest';

export interface CommentsParameters {
  limit?: number;
  sort?: CommentsSort;
  userEmail?: string;
}

export interface GameComment {
  commentId: string;
  authorName: string;
  text: string;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
}

export interface CommentsMeta {
  totalComments: number;
  returnedCount: number;
  sort: string;
}

export interface CreateCommentDto {
  userEmail: string;
  authorName: string; // 2–30 s
  text: string; // 1–500 s
}

export interface CommentLikeResult {
  isLikedByCurrentUser: boolean;
  likesCount: number;
}
