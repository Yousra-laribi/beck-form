import { act, render, screen, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { ThemeProvider } from '../../src/theme/ThemeProvider';
import { Mark } from '../../src/ui';

/**
 * CLAUDE.md 4.4: the non-animated state must always be the final visible state.
 *
 * A mark that animates from width 0 and never runs its animation is an invisible
 * logo. This asserts the finished geometry renders when motion is off — the
 * mockup's `.mark`, with the long bar at 40 units and the retracted bar at 17.
 */

const AVANT = 40;
const APRES = 17;

function reduceMotion(actif: boolean) {
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(actif);
  jest
    .spyOn(AccessibilityInfo, 'addEventListener')
    .mockReturnValue({ remove: () => {} } as ReturnType<typeof AccessibilityInfo.addEventListener>);
}

/** Widths of the two <Rect>s, in document order: the before bar, then the after bar. */
function largeursRect(tree: unknown): number[] {
  const found: number[] = [];
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (node === null || typeof node !== 'object') return;
    const n = node as { type?: string; props?: Record<string, unknown>; children?: unknown };
    if (n.type === 'RNSVGRect' && typeof n.props?.width === 'number') {
      found.push(n.props.width as number);
    }
    walk(n.children);
  };
  walk(tree);
  return found;
}

afterEach(() => jest.restoreAllMocks());

describe('Mark under reduced motion', () => {
  it('renders the finished mark, not an empty one', async () => {
    reduceMotion(true);
    const { toJSON } = render(
      <ThemeProvider scheme="light">
        <Mark label="Fiche de pensée" />
      </ThemeProvider>
    );

    await waitFor(() => expect(largeursRect(toJSON())).toEqual([AVANT, APRES]));
  });

  it('keeps the slope wedge visible rather than fading it in', async () => {
    reduceMotion(true);
    const { toJSON } = render(
      <ThemeProvider scheme="light">
        <Mark label="Fiche de pensée" />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(JSON.stringify(toJSON())).toContain('0.22');
    });
  });

  it('stays reachable by name', async () => {
    reduceMotion(true);
    render(
      <ThemeProvider scheme="light">
        <Mark label="Fiche de pensée" />
      </ThemeProvider>
    );
    await waitFor(() => expect(screen.getByLabelText('Fiche de pensée')).toBeTruthy());
  });
});

describe('Mark with motion allowed', () => {
  it('still ends on the finished geometry', async () => {
    jest.useFakeTimers();
    reduceMotion(false);
    const { toJSON } = render(
      <ThemeProvider scheme="light">
        <Mark label="Fiche de pensée" />
      </ThemeProvider>
    );

    // `useReducedMotion` resolves asynchronously, so the effect that starts the
    // animation runs after mount. That flush has to happen inside act(), or
    // React reports the animated update as unwrapped — 40 lines of stack on an
    // otherwise green run. Driving the animation itself is left to waitFor,
    // which advances the fake timers frame by frame; a single
    // advanceTimersByTime does not, because Animated reschedules each frame
    // from within the previous one.
    await act(async () => {
      await Promise.resolve();
    });

    // The full sequence is ~1.6s of animated time; waitFor's default budget is
    // 1s, which lands mid-retraction.
    await waitFor(() => expect(largeursRect(toJSON())).toEqual([AVANT, APRES]), { timeout: 5000 });
    jest.useRealTimers();
  });
});
