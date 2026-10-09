import { beforeEach, describe, expect, it, vi } from 'vitest';

type Direction = 1 | -1;
type Options = {
  load: () => Promise<unknown>;
  skeleton: () => Node[];
  render: (games: unknown[]) => Node[];
};

const mocks = vi.hoisted(() => ({
  getFeaturedGames: vi.fn(),
  mountAsyncSection: vi.fn<(container: HTMLElement, options: Options) => void>(),
  moveSlide: vi.fn<(direction: Direction) => void>(),
  reset: vi.fn(),
  attach: vi.fn(),
  enableSwipe: vi.fn<(element: HTMLElement, onSwipe: (direction: Direction) => void) => void>(),
  createAutoplay: vi.fn<(onTick: () => void) => { reset: () => void; attach: () => void }>(),
  createCarouselSlider: vi.fn(),
  createSkeleton: vi.fn(),
  createEmptyState: vi.fn(),
}));

vi.mock('../../../src/api/endpoints', () => ({
  api: { getFeaturedGames: mocks.getFeaturedGames },
}));
vi.mock('../../../src/utils/mount-sync-section', () => ({
  mountAsyncSection: mocks.mountAsyncSection,
}));
vi.mock('../../../src/utils/enable-swipe', () => ({ enableSwipe: mocks.enableSwipe }));
vi.mock('../../../src/utils/autoplay', () => ({ createAutoplay: mocks.createAutoplay }));
vi.mock('../../../src/components/home-page/carousel-slider', () => ({
  createCarouselSlider: mocks.createCarouselSlider,
}));
vi.mock('../../../src/components/subtitle', () => ({
  createSubtitle: (text: string) => {
    const element = document.createElement('div');
    element.textContent = text;
    return element;
  },
}));
vi.mock('../../../src/components/skeleton', () => ({ createSkeleton: mocks.createSkeleton }));
vi.mock('../../../src/components/empty-state', () => ({
  createEmptyState: mocks.createEmptyState,
}));

import { createCarouselSection } from '../../../src/components/home-page/carousel-section';

describe('createCarouselSection', () => {
  const sliderElement = document.createElement('div');

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createAutoplay.mockImplementation(() => ({ reset: mocks.reset, attach: mocks.attach }));
    mocks.createCarouselSlider.mockImplementation(() => ({
      element: sliderElement,
      moveSlide: mocks.moveSlide,
    }));
    mocks.createSkeleton.mockImplementation(() => document.createElement('div'));
    mocks.createEmptyState.mockImplementation(() => document.createElement('p'));
  });

  function build() {
    const section = createCarouselSection();
    const [viewport, options] = mocks.mountAsyncSection.mock.calls[0];

    return { section, viewport, options };
  }

  it('builds the section and mounts the async viewport with skeleton', () => {
    mocks.getFeaturedGames.mockResolvedValue([]);
    const { section, viewport, options } = build();

    expect(section.tagName).toBe('SECTION');
    expect(section.querySelector('.carousel__header')?.textContent).toBe('New Games');
    expect(section.lastElementChild).toBe(viewport);
    expect(viewport.className).toBe('carousel__viewport');

    void options.load();
    expect(mocks.getFeaturedGames).toHaveBeenCalledOnce();

    expect(options.skeleton()).toHaveLength(1);
    expect(mocks.createSkeleton).toHaveBeenCalledWith({ width: '100%' });
  });

  it('renders an empty state when there are no games', () => {
    const { options } = build();

    const nodes = options.render([]);

    expect(mocks.createEmptyState).toHaveBeenCalledWith('No new games found');
    expect(nodes).toHaveLength(1);
    expect(mocks.createCarouselSlider).not.toHaveBeenCalled();
  });

  it('renders the slider, reveals navigation and wires buttons, swipe and autoplay', () => {
    const games = [{ slug: 'a' }, { slug: 'b' }];
    const { section, viewport, options } = build();

    const nodes = options.render(games);

    expect(nodes).toEqual([sliderElement]);
    expect(mocks.createCarouselSlider).toHaveBeenCalledWith(games, viewport);
    expect(mocks.attach).toHaveBeenCalledOnce();
    expect(mocks.enableSwipe).toHaveBeenCalledWith(viewport, expect.any(Function));

    const nav = section.querySelector<HTMLElement>('.carousel__nav');
    expect(nav?.hidden).toBe(false);

    const prev = nav?.querySelector<HTMLButtonElement>('.carousel__nav-button--prev');
    const next = nav?.querySelector<HTMLButtonElement>('.carousel__nav-button--next');
    expect(prev?.getAttribute('aria-label')).toBe('Previous games');
    expect(next?.getAttribute('aria-label')).toBe('Next games');

    next?.click();
    expect(mocks.moveSlide).toHaveBeenLastCalledWith(1);
    prev?.click();
    expect(mocks.moveSlide).toHaveBeenLastCalledWith(-1);
    expect(mocks.reset).toHaveBeenCalledTimes(2);

    const onSwipe = mocks.enableSwipe.mock.calls[0][1];
    onSwipe(-1);
    expect(mocks.moveSlide).toHaveBeenLastCalledWith(-1);
    expect(mocks.reset).toHaveBeenCalledTimes(3);

    mocks.createAutoplay.mock.calls[0][0]();
    expect(mocks.moveSlide).toHaveBeenLastCalledWith(1);
    expect(mocks.reset).toHaveBeenCalledTimes(3);
  });
});
