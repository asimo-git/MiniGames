import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import type { Direction } from '../../src/components/home-page/carousel-slider';
import { enableSwipe } from '../../src/utils/enable-swipe';

type PointerKind = 'touch' | 'mouse';

function fire(
  element: HTMLElement,
  type: 'pointerdown' | 'pointerup' | 'pointercancel',
  x = 0,
  y = 0,
  pointerType: PointerKind = 'touch',
): void {
  const event = new MouseEvent(type, { clientX: x, clientY: y });
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  element.dispatchEvent(event);
}

describe('enableSwipe', () => {
  let element: HTMLElement;
  let onSwipe: Mock<(direction: Direction) => void>;

  beforeEach(() => {
    element = document.createElement('div');
    onSwipe = vi.fn<(direction: Direction) => void>();
  });

  it('ignores mouse pointer and pointerup without tracking', () => {
    enableSwipe(element, onSwipe);

    fire(element, 'pointerdown', 0, 0, 'mouse');
    fire(element, 'pointerup', 200, 0, 'mouse');

    expect(onSwipe).not.toHaveBeenCalled();
  });

  it('ignores movement below the threshold', () => {
    enableSwipe(element, onSwipe);

    fire(element, 'pointerdown', 0, 0);
    fire(element, 'pointerup', 39, 0);

    expect(onSwipe).not.toHaveBeenCalled();
  });

  it('ignores mostly vertical movement', () => {
    enableSwipe(element, onSwipe);

    fire(element, 'pointerdown', 0, 0);
    fire(element, 'pointerup', 50, 100);

    expect(onSwipe).not.toHaveBeenCalled();
  });

  it('stops tracking after pointercancel', () => {
    enableSwipe(element, onSwipe);

    fire(element, 'pointerdown', 0, 0);
    fire(element, 'pointercancel');
    fire(element, 'pointerup', 100, 0);

    expect(onSwipe).not.toHaveBeenCalled();
  });
});
