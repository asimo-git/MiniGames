import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAutoplay } from '../../src/utils/autoplay';

type ObserverCallback = (
  entries: Array<Partial<IntersectionObserverEntry>>,
  observer: IntersectionObserver,
) => void;

let observers: Array<{ callback: ObserverCallback; observe: ReturnType<typeof vi.fn> }> = [];
let matchMediaMatches = false;
let documentHidden = false;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date', 'performance'] });
  observers = [];
  matchMediaMatches = false;
  documentHidden = false;

  globalThis.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: matchMediaMatches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));

  globalThis.IntersectionObserver = class {
    callback: ObserverCallback;
    observe = vi.fn();
    constructor(cb: ObserverCallback) {
      this.callback = cb;
      observers.push(this);
    }
  } as unknown as typeof IntersectionObserver;

  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => documentHidden,
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  delete (document as unknown as { hidden?: boolean }).hidden;
});

const pointer = (type: string, pointerId = 1): Event => {
  const e = new Event(type);
  Object.defineProperty(e, 'pointerId', { value: pointerId });
  return e;
};

const setIntersecting = (value: boolean, index = 0): void => {
  const obs = observers[index];
  if (!obs) throw new Error('No IntersectionObserver');
  obs.callback([{ isIntersecting: value }], obs as unknown as IntersectionObserver);
};

function visibleAutoplay(interval = 1000) {
  const onTick = vi.fn();
  const autoplay = createAutoplay(onTick, interval);
  const target = document.createElement('div');
  autoplay.attach(target);
  setIntersecting(true);
  return { onTick, autoplay, target };
}

describe('createAutoplay - reduced motion', () => {
  it('returns no-op controls when reduced motion is preferred', () => {
    matchMediaMatches = true;
    const onTick = vi.fn();
    const autoplay = createAutoplay(onTick, 1000);
    const target = document.createElement('div');

    expect(() => autoplay.attach(target)).not.toThrow();
    expect(() => autoplay.reset()).not.toThrow();
    expect(observers).toHaveLength(0);

    vi.advanceTimersByTime(60_000);
    expect(onTick).not.toHaveBeenCalled();
  });
});

describe('createAutoplay - visibility gating', () => {
  it('does not tick before attach()', () => {
    const onTick = vi.fn();
    createAutoplay(onTick, 1000);
    vi.advanceTimersByTime(10_000);
    expect(onTick).not.toHaveBeenCalled();
  });

  it('does not tick while offscreen, ticks once visible with default interval', () => {
    const onTick = vi.fn();
    const autoplay = createAutoplay(onTick);
    const target = document.createElement('div');
    autoplay.attach(target);

    vi.advanceTimersByTime(10_000);
    expect(onTick).not.toHaveBeenCalled();
    expect(observers[0]?.observe).toHaveBeenCalledWith(target);

    setIntersecting(true);
    vi.advanceTimersByTime(3999);
    expect(onTick).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onTick).toHaveBeenCalledTimes(1);
  });

  it('reschedules after each tick and pauses/resumes on intersection changes', () => {
    const { onTick } = visibleAutoplay(1000);

    vi.advanceTimersByTime(3000);
    expect(onTick).toHaveBeenCalledTimes(3);

    setIntersecting(false);
    vi.advanceTimersByTime(10_000);
    expect(onTick).toHaveBeenCalledTimes(3);

    setIntersecting(true);
    vi.advanceTimersByTime(1000);
    expect(onTick).toHaveBeenCalledTimes(4);
  });
});

describe('createAutoplay - pointer press pausing', () => {
  it('freezes remaining time, tracks multiple pointers, and handles cancel', () => {
    const { onTick, target } = visibleAutoplay(1000);

    vi.advanceTimersByTime(600);
    target.dispatchEvent(pointer('pointerdown', 1));
    target.dispatchEvent(pointer('pointerdown', 2));
    document.dispatchEvent(pointer('pointerup', 1));

    vi.advanceTimersByTime(5000);
    expect(onTick).not.toHaveBeenCalled();

    document.dispatchEvent(pointer('pointercancel', 2));
    vi.advanceTimersByTime(399);
    expect(onTick).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onTick).toHaveBeenCalledTimes(1);
  });
});

describe('createAutoplay - focus pausing', () => {
  it('pauses on focus-visible, resumes on blur, ignores mouse focus', () => {
    const { onTick, target } = visibleAutoplay(1000);

    vi.spyOn(target, 'matches').mockReturnValue(false);
    target.dispatchEvent(new Event('focusin'));
    vi.advanceTimersByTime(1000);
    expect(onTick).toHaveBeenCalledTimes(1);

    vi.spyOn(target, 'matches').mockReturnValue(true);
    target.dispatchEvent(new Event('focusin'));
    vi.advanceTimersByTime(5000);
    expect(onTick).toHaveBeenCalledTimes(1);

    target.dispatchEvent(new Event('focusout'));
    vi.advanceTimersByTime(1000);
    expect(onTick).toHaveBeenCalledTimes(2);
  });
});

describe('createAutoplay - document visibility', () => {
  it('pauses when hidden and resumes when visible', () => {
    const { onTick } = visibleAutoplay(1000);

    documentHidden = true;
    document.dispatchEvent(new Event('visibilitychange'));
    vi.advanceTimersByTime(10_000);
    expect(onTick).not.toHaveBeenCalled();

    documentHidden = false;
    document.dispatchEvent(new Event('visibilitychange'));
    vi.advanceTimersByTime(1000);
    expect(onTick).toHaveBeenCalledTimes(1);
  });
});

describe('createAutoplay - reset()', () => {
  it('restarts interval, discards progress, and does not start while paused', () => {
    const { onTick, autoplay } = visibleAutoplay(1000);

    vi.advanceTimersByTime(900);
    autoplay.reset();
    vi.advanceTimersByTime(900);
    expect(onTick).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(onTick).toHaveBeenCalledTimes(1);

    const onTick2 = vi.fn();
    const a2 = createAutoplay(onTick2, 1000);
    a2.attach(document.createElement('div'));
    a2.reset();
    vi.advanceTimersByTime(10_000);
    expect(onTick2).not.toHaveBeenCalled();
  });
});
