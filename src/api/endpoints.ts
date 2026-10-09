import { makeRequest } from './client';
import {
  GAMES_SORTS,
  type Category,
  type CommentLikeResult,
  type CommentsMeta,
  type CommentsParameters,
  type CreateCommentDto,
  type DataResponse,
  type FavoriteResult,
  type GameComment,
  type GameDetails,
  type GamesListMeta,
  type GamesListParameters,
  type GameSummary,
  type LeaderboardEntry,
  type ListResponse,
  type GamesSort,
} from './types';

const cache: { categories: Promise<Category[]> | undefined } = { categories: undefined };

async function loadCategories(): Promise<Category[]> {
  try {
    const response = await makeRequest<ListResponse<Category>>('/api/categories');
    return response.data;
  } catch (error) {
    cache.categories = undefined;
    throw error;
  }
}

export const api = {
  /////// Catalog ////////////////
  ///////////////////////////////
  getCategories: () => {
    cache.categories ??= loadCategories(); // запрос уйдёт только если в кэше пусто
    return cache.categories;
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

  getGames: async (
    parameters: GamesListParameters = {},
    signal?: AbortSignal,
  ): Promise<ListResponse<GameSummary, GamesListMeta>> => {
    const categories = await api.getCategories();

    return makeRequest<ListResponse<GameSummary, GamesListMeta>>('/api/games', {
      query: {
        ...parameters,
        category: categories.some((category) => category.slug === parameters.category)
          ? parameters.category
          : categories.find((category) => category.isDefault)?.slug,
        sort: (GAMES_SORTS as readonly string[]).includes(parameters.sort ?? '')
          ? (parameters.sort as GamesSort)
          : 'rating-desc',
      },
      signal,
    });
  },

  // for the dialog box
  getGame: async (slug: string, userEmail?: string, signal?: AbortSignal) => {
    const response = await makeRequest<DataResponse<GameDetails>>(
      `/api/games/${encodeURIComponent(slug)}`,
      {
        query: { userEmail },
        signal,
      },
    );
    return response.data;
  },

  toggleFavorite: async (slug: string, userEmail: string, signal?: AbortSignal) => {
    const response = await makeRequest<DataResponse<FavoriteResult>>(
      `/api/games/${encodeURIComponent(slug)}/favorite`,
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
    makeRequest<ListResponse<GameComment, CommentsMeta>>(
      `/api/games/${encodeURIComponent(slug)}/comments`,
      {
        query: { ...parameters },
        signal,
      },
    ),

  createComment: async (slug: string, dto: CreateCommentDto, signal?: AbortSignal) => {
    const response = await makeRequest<DataResponse<GameComment>>(
      `/api/games/${encodeURIComponent(slug)}/comments`,
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
      `/api/comments/${encodeURIComponent(commentId)}/like`,
      {
        method: 'POST',
        body: { userEmail },
        signal,
      },
    );
    return response.data;
  },
};
