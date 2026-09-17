import { createElement, getAvatarLetters } from '../../utils/helpers';
import leaderboardData from '../../data/leaderboard.json';
import { createSubtitle } from '../subtitle';

interface TopPlayer {
  rank: number;
  playerName: string;
  gamesPlayed: number;
  totalScore: number;
  streakDays: number;
  favoriteGameSlug: string;
  favoriteGameName: string;
}

type ColumnId = 'rank' | 'player' | 'games' | 'score' | 'streak' | 'favorite';

const TOP_PLAYERS: TopPlayer[] = leaderboardData.data;

const HEADER_COLUMNS: { id: ColumnId; label: string; shortLabel?: string }[] = [
  { id: 'rank', label: 'Rank' },
  { id: 'player', label: 'Player' },
  { id: 'games', label: 'Games Played', shortLabel: 'Games' },
  { id: 'score', label: 'Total Score', shortLabel: 'Score' },
  { id: 'streak', label: 'Streak' },
  { id: 'favorite', label: 'Favorite Game' },
];

export function createLeaderboardSection(): HTMLElement {
  return createElement('section', {
    className: 'top-players',
    children: [createSubtitle('Top Players This Week'), createTable()],
  });
}

function createTable(): HTMLElement {
  return createElement('table', {
    className: 'top-players__table',
    children: [createTableHead(), createTableBody()],
  });
}

function createTableHead(): HTMLElement {
  return createElement('thead', {
    children: [
      createElement('tr', {
        className: 'top-players__row top-players__row--header',
        children: HEADER_COLUMNS.map(({ id, label, shortLabel }) =>
          createElement('th', {
            className: [
              'top-players__cell',
              'top-players__cell--head',
              id === 'rank' ? 'top-players__cell--rank' : '',
            ]
              .filter(Boolean)
              .join(' '),
            attributes: { scope: 'col', 'data-column': id },
            children: createHeaderLabel(label, shortLabel),
          }),
        ),
      }),
    ],
  });
}

function createHeaderLabel(label: string, shortLabel?: string): HTMLElement[] {
  if (!shortLabel) {
    return [createElement('span', { className: 'top-players__cell-label', textContent: label })];
  }

  return [
    createElement('span', {
      className: 'top-players__cell-label top-players__cell-label--full',
      textContent: label,
    }),
    createElement('span', {
      className: 'top-players__cell-label top-players__cell-label--short',
      textContent: shortLabel,
    }),
  ];
}

function createTableBody(): HTMLElement {
  return createElement('tbody', {
    className: 'top-players__tbody',
    children: TOP_PLAYERS.map((player) => createTableRow(player)),
  });
}

function createTableRow(player: TopPlayer): HTMLElement {
  return createElement('tr', {
    className: 'top-players__row',
    children: [
      createRankCell(player),
      createPlayerCell(player),
      createGamesCell(player),
      createScoreCell(player),
      createStreakCell(player),
      createFavoriteGameCell(player),
    ],
  });
}

function createRankCell(player: TopPlayer): HTMLElement {
  return createElement('td', {
    className: [
      'top-players__cell',
      'top-players__cell--rank',
      player.rank === 1 ? 'top-players__cell--rank-top' : '',
    ]
      .filter(Boolean)
      .join(' '),
    textContent: `#${player.rank}`,
    attributes: { 'data-column': 'rank' },
  });
}

function createPlayerCell(player: TopPlayer): HTMLElement {
  return createElement('td', {
    className: 'top-players__cell top-players__cell--player',
    attributes: { 'data-column': 'player' },
    children: [
      createAvatar(player),
      createElement('span', {
        className: 'top-players__name',
        textContent: player.playerName,
      }),
    ],
  });
}

function createAvatar(player: TopPlayer): HTMLElement {
  return createElement('div', {
    className: 'top-players__avatar',
    textContent: getAvatarLetters(player.playerName),
    attributes: {
      'data-rank': String(player.rank),
    },
  });
}

function createGamesCell(player: TopPlayer): HTMLElement {
  return createElement('td', {
    className: 'top-players__cell top-players__cell--games',
    textContent: String(player.gamesPlayed),
    attributes: { 'data-column': 'games' },
  });
}

function createScoreCell(player: TopPlayer): HTMLElement {
  return createElement('td', {
    className: 'top-players__cell top-players__cell--score',
    attributes: { 'data-column': 'score' },
    children: [
      createElement('span', {
        className: 'top-players__score top-players__score--short',
        textContent: `${(player.totalScore / 1000).toFixed(1)}K`,
      }),
      createElement('span', {
        className: 'top-players__score top-players__score--full',
        textContent: player.totalScore.toLocaleString('en-US'),
      }),
    ],
  });
}

function createStreakCell(player: TopPlayer): HTMLElement {
  return createElement('td', {
    className: 'top-players__cell top-players__cell--streak',
    attributes: { 'data-column': 'streak' },
    children: [
      createElement('span', {
        className: 'top-players__streak top-players__streak--full',
        textContent: `🔥 ${player.streakDays} days`,
      }),
      createElement('span', {
        className: 'top-players__streak top-players__streak--short',
        textContent: `🔥 ${player.streakDays}d`,
      }),
    ],
  });
}

function createFavoriteGameCell(player: TopPlayer): HTMLElement {
  return createElement('td', {
    className: 'top-players__cell top-players__cell--favorite',
    attributes: { 'data-column': 'favorite' },
    children: [
      createElement('span', {
        className: 'top-players__badge',
        textContent: player.favoriteGameName,
      }),
    ],
  });
}
