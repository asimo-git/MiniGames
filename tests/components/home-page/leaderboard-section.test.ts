import { beforeEach, describe, expect, it, vi } from 'vitest';

type Options = {
  load: () => Promise<unknown>;
  skeleton: () => Node[];
  render: (players: unknown[]) => Node[];
};

const mocks = vi.hoisted(() => ({
  getLeaderboard: vi.fn(),
  mountAsyncSection: vi.fn<(container: HTMLElement, options: Options) => void>(),
  createSkeleton: vi.fn(),
  createEmptyState: vi.fn(),
}));

vi.mock('../../../src/api/endpoints', () => ({ api: { getLeaderboard: mocks.getLeaderboard } }));
vi.mock('../../../src/utils/mount-sync-section', () => ({
  mountAsyncSection: mocks.mountAsyncSection,
}));
vi.mock('../../../src/components/skeleton', () => ({ createSkeleton: mocks.createSkeleton }));
vi.mock('../../../src/components/empty-state', () => ({
  createEmptyState: mocks.createEmptyState,
}));
vi.mock('../../../src/components/subtitle', () => ({
  createSubtitle: (text: string) => {
    const element = document.createElement('div');
    element.textContent = text;
    return element;
  },
}));

vi.mock('../../../src/utils/helpers', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/utils/helpers')>()),
  getAvatarLetters: (name: string) => name.slice(0, 2).toUpperCase(),
}));

import { createLeaderboardSection } from '../../../src/components/home-page/leaderboard-section';

const players = [
  {
    rank: 1,
    playerName: 'Ann',
    gamesPlayed: 10,
    totalScore: 12_345,
    streakDays: 5,
    favoriteGameName: 'Tetris',
  },
  {
    rank: 2,
    playerName: 'Bob',
    gamesPlayed: 7,
    totalScore: 900,
    streakDays: 1,
    favoriteGameName: 'Snake',
  },
];

function build() {
  const section = createLeaderboardSection();
  const [container, options] = mocks.mountAsyncSection.mock.calls[0];

  return { section, container, options };
}

describe('createLeaderboardSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createSkeleton.mockImplementation(() => document.createElement('div'));
    mocks.createEmptyState.mockImplementation(() => document.createElement('p'));
  });

  it('builds both subtitles and mounts the table container with load and skeleton', () => {
    mocks.getLeaderboard.mockResolvedValue([]);
    const { section, container, options } = build();

    expect(section.className).toBe('top-players');
    expect(section.querySelector('.top-players__subtitle-full')?.textContent).toBe(
      'Top Players This Week',
    );
    expect(section.querySelector('.top-players__subtitle-short')?.textContent).toBe('Top Players');
    expect(section.lastElementChild).toBe(container);

    void options.load();
    expect(mocks.getLeaderboard).toHaveBeenCalledOnce();

    expect(options.skeleton()).toHaveLength(1);
    expect(mocks.createSkeleton).toHaveBeenCalledWith({});
  });

  it('renders an empty state when there are no players', () => {
    const { options } = build();

    const nodes = options.render([]);

    expect(mocks.createEmptyState).toHaveBeenCalledWith('No Top Players found');
    expect(nodes).toHaveLength(1);
  });

  it('renders a row per player with formatted cells and marks only rank 1', () => {
    const { options } = build();
    const [table] = options.render(players) as HTMLElement[];

    const rows = [...table.querySelectorAll('tbody tr')];
    expect(rows).toHaveLength(2);

    const [first, second] = rows;
    const text = (row: Element, selector: string) => row.querySelector(selector)?.textContent;

    expect(text(first, '[data-column="rank"]')).toBe('#1');
    expect(first.querySelector('.top-players__cell--rank-top')).not.toBeNull();
    expect(second.querySelector('.top-players__cell--rank-top')).toBeNull();

    expect(text(first, '.top-players__name')).toBe('Ann');
    expect(text(first, '.top-players__avatar')).toBe('AN');
    expect(first.querySelector('.top-players__avatar')?.getAttribute('data-rank')).toBe('1');
    expect(text(first, '[data-column="games"]')).toBe('10');
    expect(text(first, '.top-players__score--short')).toBe('12.3K');
    expect(text(first, '.top-players__score--full')).toBe('12,345');
    expect(text(first, '.top-players__streak--full')).toBe('🔥 5 days');
    expect(text(first, '.top-players__streak--short')).toBe('🔥 5d');
    expect(text(first, '.top-players__badge')).toBe('Tetris');

    expect(text(second, '.top-players__score--short')).toBe('0.9K');
  });
});
