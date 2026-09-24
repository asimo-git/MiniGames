type PauseReason = 'focus' | 'press' | 'offscreen' | 'hidden';
const DEFAULT_INTERVAL_MS = 4000;

export interface Autoplay {
  reset: () => void;
  attach: (target: HTMLElement) => void;
}

export function createAutoplay(
  onTick: () => void,
  intervalMs: number = DEFAULT_INTERVAL_MS,
): Autoplay {
  if (globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return { reset: () => {}, attach: () => {} };
  }

  const paused: Record<PauseReason, boolean> = {
    focus: false,
    press: false,
    offscreen: true,
    hidden: document.hidden,
  };

  let remainingMs = intervalMs;
  let startedAt = 0;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const isPaused = (): boolean => Object.values(paused).some(Boolean);

  const schedule = (): void => {
    if (timeoutId !== undefined || isPaused()) return;

    startedAt = performance.now();
    timeoutId = globalThis.setTimeout(() => {
      timeoutId = undefined;
      remainingMs = intervalMs;
      onTick();
      schedule();
    }, remainingMs);
  };

  const freeze = (): void => {
    if (timeoutId === undefined) return;

    clearTimeout(timeoutId);
    timeoutId = undefined;
    remainingMs = Math.max(0, remainingMs - (performance.now() - startedAt));
  };

  const reset = (): void => {
    clearTimeout(timeoutId);
    timeoutId = undefined;
    remainingMs = intervalMs;
    schedule();
  };

  const setPaused = (reason: PauseReason, isActive: boolean): void => {
    paused[reason] = isActive;

    if (isPaused()) {
      freeze();
    } else {
      schedule();
    }
  };

  const attach = (target: HTMLElement): void => {
    const activePointers = new Set<number>();

    target.addEventListener('pointerdown', (event) => {
      activePointers.add(event.pointerId);
      setPaused('press', true);
    });

    const release = (event: PointerEvent): void => {
      activePointers.delete(event.pointerId);
      if (activePointers.size === 0) setPaused('press', false);
    };

    document.addEventListener('pointerup', release);
    document.addEventListener('pointercancel', release);

    target.addEventListener('focusin', (event) => {
      setPaused('focus', (event.target as HTMLElement).matches(':focus-visible'));
    });

    target.addEventListener('focusout', () => {
      setPaused('focus', false);
    });

    new IntersectionObserver(([entry]) => {
      setPaused('offscreen', !entry?.isIntersecting);
    }).observe(target);

    document.addEventListener('visibilitychange', () => {
      setPaused('hidden', document.hidden);
    });
  };

  return { reset, attach };
}
