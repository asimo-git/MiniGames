import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GAMES_SORTS } from '../../src/api/types';

const { makeRequest } = vi.hoisted(() => ({ makeRequest: vi.fn() }));

vi.mock('../../src/api/client', () => ({ makeRequest }));

const CATEGORIES = [
  { slug: 'puzzle', isDefault: false },
  { slug: 'arcade', isDefault: true },
];

async function loadApi() {
  vi.resetModules();
  return (await import('../../src/api/endpoints')).api;
}

function mockServer(categories: unknown[] = CATEGORIES): void {
  makeRequest.mockImplementation(async (path: string) =>
    path === '/api/categories' ? { data: categories } : { data: [], meta: {} },
  );
}

describe('api', () => {
  beforeEach(() => {
    makeRequest.mockReset();
  });

  describe('getCategories', () => {
    it('loads categories once and caches the promise', async () => {
      mockServer();
      const api = await loadApi();

      const first = await api.getCategories();
      const second = await api.getCategories();

      expect(first).toEqual(CATEGORIES);
      expect(second).toEqual(CATEGORIES);
      expect(makeRequest).toHaveBeenCalledTimes(1);
      expect(makeRequest).toHaveBeenCalledWith('/api/categories');
    });
  });

  describe('catalog and games lists', () => {
    it('getLeaderboard returns data and passes the signal', async () => {
      makeRequest.mockResolvedValue({ data: [{ name: 'Ann' }] });
      const api = await loadApi();
      const { signal } = new AbortController();

      await expect(api.getLeaderboard(signal)).resolves.toEqual([{ name: 'Ann' }]);
      expect(makeRequest).toHaveBeenCalledWith('/api/leaderboard', { signal });
    });

    it('getFeaturedGames requests featured games', async () => {
      makeRequest.mockResolvedValue({ data: [{ slug: 'tetris' }] });
      const api = await loadApi();

      await expect(api.getFeaturedGames()).resolves.toEqual([{ slug: 'tetris' }]);
      expect(makeRequest).toHaveBeenCalledWith('/api/games', {
        query: { featured: true },
        signal: undefined,
      });
    });
  });

  describe('getGames', () => {
    it('keeps a valid category and sort and forwards other params', async () => {
      mockServer();
      const api = await loadApi();

      await api.getGames({ category: 'puzzle', sort: GAMES_SORTS[0], page: 2 } as never);

      expect(makeRequest).toHaveBeenLastCalledWith('/api/games', {
        query: { category: 'puzzle', sort: GAMES_SORTS[0], page: 2 },
        signal: undefined,
      });
    });

    it('falls back to the default category and default sort for invalid values', async () => {
      mockServer();
      const api = await loadApi();

      await api.getGames({ category: 'unknown', sort: 'bogus' } as never);

      expect(makeRequest).toHaveBeenLastCalledWith('/api/games', {
        query: { category: 'arcade', sort: 'rating-desc' },
        signal: undefined,
      });
    });
  });

  describe('single game', () => {
    it('getGame encodes the slug and passes userEmail', async () => {
      makeRequest.mockResolvedValue({ data: { slug: 'a b' } });
      const api = await loadApi();

      await expect(api.getGame('a b/c', 'a@b.c')).resolves.toEqual({ slug: 'a b' });
      expect(makeRequest).toHaveBeenCalledWith('/api/games/a%20b%2Fc', {
        query: { userEmail: 'a@b.c' },
        signal: undefined,
      });
    });

    it('toggleFavorite posts the user email', async () => {
      makeRequest.mockResolvedValue({ data: { isFavorite: true } });
      const api = await loadApi();

      await expect(api.toggleFavorite('tetris', 'a@b.c')).resolves.toEqual({ isFavorite: true });
      expect(makeRequest).toHaveBeenCalledWith('/api/games/tetris/favorite', {
        method: 'POST',
        body: { userEmail: 'a@b.c' },
        signal: undefined,
      });
    });
  });

  describe('comments', () => {
    it('getComments returns the full response without unwrapping', async () => {
      const response = { data: [], meta: { totalComments: 0 } };
      makeRequest.mockResolvedValue(response);
      const api = await loadApi();

      await expect(api.getComments('tetris', { limit: 3 } as never)).resolves.toBe(response);
      expect(makeRequest).toHaveBeenCalledWith('/api/games/tetris/comments', {
        query: { limit: 3 },
        signal: undefined,
      });
    });

    it('createComment posts the dto and returns the created comment', async () => {
      const dto = { userEmail: 'a@b.c', authorName: 'Ann', text: 'Hi' };
      makeRequest.mockResolvedValue({ data: { commentId: 'c1' } });
      const api = await loadApi();

      await expect(api.createComment('tetris', dto)).resolves.toEqual({ commentId: 'c1' });
      expect(makeRequest).toHaveBeenCalledWith('/api/games/tetris/comments', {
        method: 'POST',
        body: dto,
        signal: undefined,
      });
    });

    it('toggleCommentLike encodes the id and posts the user email', async () => {
      makeRequest.mockResolvedValue({ data: { likesCount: 3, isLikedByCurrentUser: true } });
      const api = await loadApi();

      await expect(api.toggleCommentLike('id/1', 'a@b.c')).resolves.toEqual({
        likesCount: 3,
        isLikedByCurrentUser: true,
      });
      expect(makeRequest).toHaveBeenCalledWith('/api/comments/id%2F1/like', {
        method: 'POST',
        body: { userEmail: 'a@b.c' },
        signal: undefined,
      });
    });
  });
});
