import { mountAsyncSection } from '../../../utils/mount-sync-section';
import closeIcon from '../../../assets/icons/close.svg';
import { createElement, createImageWithFallback, formatRelativeTime } from '../../../utils/helpers';
import { createStatsBadges } from '../../library-page/stats-badges';
import { showDialog } from '../dialog-backdrop';
import { api } from '../../../api/endpoints';
import { createSkeleton } from '../../skeleton';
import type { GameDetails } from '../../../api/types';
import { closeDialog, openDialog } from '../../../router/dialog-router';
import { showSnackbar } from '../../snackbar';
import { getActiveSession } from '../../../api/login-session';
import { createCommentsSection } from './comments-section';

export function openGameDetailDialog(gameId: string | undefined): void {
  const panel = createContent(gameId, () => {
    closeDialog();
  });

  showDialog(panel, { ariaLabel: 'Game details' });
}

function createGameLoader(slug: string): () => Promise<GameDetails> {
  let promise: Promise<GameDetails> | undefined;

  async function fetchGame(): Promise<GameDetails> {
    try {
      const session = getActiveSession();
      return await api.getGame(slug, session?.email);
    } catch (error) {
      promise = undefined;
      throw error;
    }
  }

  return () => {
    promise ??= fetchGame();
    return promise;
  };
}

function createContent(gameId: string | undefined, onClose: () => void): HTMLElement {
  const slug = gameId ?? '';
  const gamePromise = createGameLoader(slug);

  const body = createElement('div', {
    className: 'game-detail-dialog__body',
    children: [createDetails(gamePromise, slug), createCommentsSection(slug)],
  });

  return createElement('div', {
    className: 'game-detail-dialog',
    children: [createHero(gamePromise), body, createCloseButton(onClose)],
  });
}

function createHero(gamePromise: () => Promise<GameDetails>): HTMLElement {
  const container = createElement('div', { className: 'game-detail-dialog__hero' });

  void mountAsyncSection(container, {
    // load: () => new Promise(() => {}),
    // load: () => Promise.reject(new Error('Error')),
    load: gamePromise,
    render: (game) => {
      const img = createImageWithFallback({
        src: game.heroImage,
        alt: game.name,
        className: 'game-detail-dialog__hero-image',
        loading: 'eager',
      });
      return [img];
    },
    skeleton: () => [
      createSkeleton({
        width: '100%',
        className: 'game-detail-dialog__hero-image',
      }),
    ],
  });

  return container;
}

function createDetails(gamePromise: () => Promise<GameDetails>, slug: string): HTMLElement {
  const container = createElement('div', { className: 'game-detail-dialog__details' });

  void mountAsyncSection(container, {
    // load: () => new Promise(() => {}),
    load: gamePromise,
    // load: () => Promise.reject(new Error('Error')),
    render: (game) => [
      createTitleRow(game),
      createElement('p', {
        className: 'game-detail-dialog__description',
        textContent: game.fullDescription,
      }),
      createInfoWidgets(game),
      createActions(game, slug),
      createRecordsSection(game),
    ],
    skeleton: createDetailsSkeleton,
  });

  return container;
}

///////////////////////////
// synchronous elements
///////////////////////////

function createCloseButton(onClose: () => void): HTMLButtonElement {
  const button = createElement('button', {
    className: 'game-detail-dialog__close',
    attributes: { type: 'button', 'aria-label': 'Close dialog' },
    children: [createElement('img', { attributes: { src: closeIcon, alt: '' } })],
  });

  button.addEventListener('click', onClose);
  return button;
}

function createTitleRow(game: GameDetails): HTMLElement {
  return createElement('div', {
    className: 'game-detail-dialog__title-row',
    children: [
      createElement('h2', { className: 'game-detail-dialog__title', textContent: game.name }),
      createStatsBadges(game.rating, game.likesCount),
    ],
  });
}

function createInfoWidgets(game: GameDetails): HTMLElement {
  const { genre, players, duration, price } = game.specs;
  const widgets = [
    { label: 'Genre', value: genre },
    { label: 'Players', value: players },
    { label: 'Duration', value: duration },
    { label: 'Price', value: price },
  ].map((item) => createInfoWidget(item));

  return createElement('div', { className: 'game-detail-dialog__widgets', children: widgets });
}

function createInfoWidget(widget: { label: string; value: string }): HTMLElement {
  return createElement('div', {
    className: 'game-detail-dialog__widget',
    children: [
      createElement('span', {
        className: 'game-detail-dialog__widget-label',
        textContent: widget.label,
      }),
      createElement('span', {
        className: 'game-detail-dialog__widget-value',
        textContent: widget.value,
      }),
    ],
  });
}

function createActions(game: GameDetails, slug: string): HTMLElement {
  let isFavorite = game.isLikedByCurrentUser;
  let isPending = false;

  const labelSpan = createElement('span', {
    textContent: isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
  });
  const buttonIcon = createElement('span', {
    className: `game-detail-dialog__favorite-icon${isFavorite ? ' game-detail-dialog__favorite-icon--active' : ''}`,
  });
  const addToFavoritesButton = createElement('button', {
    className: 'game-detail-dialog__favorite-button',
    attributes: { type: 'button' },
    children: [buttonIcon, labelSpan],
  });

  addToFavoritesButton.addEventListener('click', () => {
    void handleFavoriteClick();
  });

  async function handleFavoriteClick(): Promise<void> {
    if (isPending) return;

    const session = getActiveSession();

    if (!session) {
      openDialog({ auth: 'login' });
      showSnackbar({ variant: 'warning', message: 'Log in to add games to favorites' });
      return;
    }

    isPending = true;
    addToFavoritesButton.disabled = true;
    addToFavoritesButton.classList.add('game-detail-dialog__favorite-button--pending');

    try {
      const result = await api.toggleFavorite(slug, session.email);
      isFavorite = result.isFavorited;
      buttonIcon.classList.toggle('game-detail-dialog__favorite-icon--active', isFavorite);
      labelSpan.textContent = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
    } catch {
      showSnackbar({ variant: 'error', message: 'Could not update favorites. Try again.' });
    } finally {
      isPending = false;
      addToFavoritesButton.disabled = false;
      addToFavoritesButton.classList.remove('game-detail-dialog__favorite-button--pending');
    }
  }

  return createElement('div', {
    className: 'game-detail-dialog__actions',
    children: [
      createElement('button', {
        className: 'game-detail-dialog__play-button',
        textContent: 'Play Now',
        attributes: { type: 'button' },
      }),
      addToFavoritesButton,
    ],
  });
}

function createRecordsSection(game: GameDetails): HTMLElement {
  const records = game.topRecords.map((record) => createRecordRow(record));

  return createElement('section', {
    className: 'game-detail-dialog__records',
    children: [
      createElement('h3', {
        className: 'game-detail-dialog__section-title',
        children: [
          createElement('span', { attributes: { 'aria-hidden': 'true' }, textContent: '🏆' }),
          createElement('span', { textContent: 'Top Records' }),
        ],
      }),
      createElement('ul', { className: 'game-detail-dialog__record-list', children: records }),
    ],
  });
}

function createRecordRow(record: GameDetails['topRecords'][number]): HTMLElement {
  const player = createRecordPlayer(record);
  const result = createRecordResult(record);

  return createElement('li', {
    className: 'game-detail-dialog__record',
    children: [player, result],
  });
}

function createRecordPlayer(record: GameDetails['topRecords'][number]): HTMLElement {
  const medal = createElement('span', {
    attributes: { 'aria-hidden': 'true' },
    textContent:
      record.position === 1
        ? '🥇'
        : record.position === 2
          ? '🥈'
          : record.position === 3
            ? '🥉'
            : String(record.position),
  });
  const name = createElement('span', { textContent: record.playerName });

  return createElement('span', {
    className: 'game-detail-dialog__record-player',
    children: [medal, name],
  });
}

function createRecordResult(record: GameDetails['topRecords'][number]): HTMLElement {
  const score = createElement('span', {
    className: 'game-detail-dialog__record-score',
    textContent: String(record.score),
  });
  const time = createElement('span', {
    className: 'game-detail-dialog__record-time',
    textContent: formatRelativeTime(record.achievedAt),
  });

  return createElement('span', {
    className: 'game-detail-dialog__record-result',
    children: [score, time],
  });
}

/////////////////////////////////
// Skeletons
/////////////////////////////////
function createDetailsSkeleton(): HTMLElement[] {
  return [
    createSkeleton({
      width: '100%',
      height: '44px',
      className: 'game-detail-dialog__title-row',
    }),
    createSkeleton({
      width: '100%',
      height: '100px',
      className: 'game-detail-dialog__description',
    }),
    createSkeleton({
      width: '100%',
      height: '58px',
      className: 'game-detail-dialog__widgets',
    }),
    createSkeleton({
      width: '100%',
      height: '48px',
      className: 'game-detail-dialog__actions',
    }),
    createSkeleton({
      width: '100%',
      height: '200px',
      className: 'game-detail-dialog__records',
    }),
  ];
}
