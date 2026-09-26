import type { Direction } from '../components/home-page/carousel-slider';

const DEFAULT_THRESHOLD_PX = 40;

export function enableSwipe(
  element: HTMLElement,
  onSwipe: (direction: Direction) => void,
  thresholdPx = DEFAULT_THRESHOLD_PX,
): void {
  let startX = 0;
  let startY = 0;
  let isTracking = false;

  element.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') return;

    isTracking = true;
    startX = event.clientX;
    startY = event.clientY;
  });

  element.addEventListener('pointerup', (event) => {
    if (!isTracking) return;
    isTracking = false;

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    if (Math.abs(deltaX) < thresholdPx || Math.abs(deltaX) < Math.abs(deltaY)) return;

    onSwipe(deltaX < 0 ? 1 : -1);
  });

  element.addEventListener('pointercancel', () => {
    isTracking = false;
  });
}
