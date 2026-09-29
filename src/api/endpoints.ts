import { makeRequest } from './client';
import type {
  Category,
  CommentLikeResult,
  CommentsMeta,
  CommentsParameters,
  CreateCommentDto,
  DataResponse,
  FavoriteResult,
  GameComment,
  GameDetails,
  GamesListMeta,
  GamesListParameters,
  GameSummary,
  LeaderboardEntry,
  ListResponse,
} from './types';

const enc = encodeURIComponent;

export const api = {
  /////// Catalog ////////////////
  ///////////////////////////////
  getCategories: async (signal?: AbortSignal) => {
    const response = await makeRequest<ListResponse<Category>>('/api/categories', { signal });
    return response.data;
  },

  getLeaderboard: async (signal?: AbortSignal) => {
    const response = await makeRequest<ListResponse<LeaderboardEntry>>('/api/leaderboard', {
      signal,
    });
    return response.data;
  },

  //////////// Games ////////////
  ///////////////////////////////
  getFeaturedGames: async (signal?: AbortSignal) => {
    const response = await makeRequest<ListResponse<GameSummary>>('/api/games', {
      query: { featured: true },
      signal,
    });
    return response.data;
  },

  getGames: (parameters: GamesListParameters = {}, signal?: AbortSignal) =>
    makeRequest<ListResponse<GameSummary, GamesListMeta>>('/api/games', {
      query: { ...parameters },
      signal,
    }),

  getGame: async (slug: string, userEmail?: string, signal?: AbortSignal) => {
    const response = await makeRequest<DataResponse<GameDetails>>(`/api/games/${enc(slug)}`, {
      query: { userEmail },
      signal,
    });
    return response.data;
  },

  toggleFavorite: async (slug: string, userEmail: string, signal?: AbortSignal) => {
    const response = await makeRequest<DataResponse<FavoriteResult>>(
      `/api/games/${enc(slug)}/favorite`,
      {
        method: 'POST',
        body: { userEmail },
        signal,
      },
    );
    return response.data;
  },

  //////////// Comments //////////
  ///////////////////////////////
  getComments: (slug: string, parameters: CommentsParameters = {}, signal?: AbortSignal) =>
    makeRequest<ListResponse<GameComment, CommentsMeta>>(`/api/games/${enc(slug)}/comments`, {
      query: { ...parameters },
      signal,
    }),

  createComment: async (slug: string, dto: CreateCommentDto, signal?: AbortSignal) => {
    const response = await makeRequest<DataResponse<GameComment>>(
      `/api/games/${enc(slug)}/comments`,
      {
        method: 'POST',
        body: dto,
        signal,
      },
    );
    return response.data;
  },

  toggleCommentLike: async (commentId: string, userEmail: string, signal?: AbortSignal) => {
    const response = await makeRequest<DataResponse<CommentLikeResult>>(
      `/api/comments/${enc(commentId)}/like`,
      {
        method: 'POST',
        body: { userEmail },
        signal,
      },
    );
    return response.data;
  },
};
