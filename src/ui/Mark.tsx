import { forwardRef, useEffect, useRef, useState, type ComponentProps, type ComponentRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { duree } from '../theme/tokens';
import { useReducedMotion } from '../theme/useReducedMotion';
import { useTheme } from '../theme/useTheme';

/**
 * `Animated.createAnimatedComponent` sets `collapsable={false}` on whatever it
 * wraps, to stop the view being flattened away. That is meaningful to the
 * native view tree and meaningless to an SVG element: react-native-svg's web
 * build spreads unknown props straight onto the DOM node, so `<rect>` gets a
 * `collapsable="false"` attribute and React warns on every render.
 *
 * Dropping the prop at the seam is narrower than the alternatives — rebuilding
 * the mark out of Animated.Views would mean re-deriving geometry the mockup
 * already states exactly, and silencing the warning would hide the next one.
 */
function sansCollapsable<C extends typeof Rect | typeof Path>(Composant: C) {
  type Props = ComponentProps<C> & { collapsable?: boolean };
  const Propre = forwardRef<ComponentRef<C>, Props>(function Propre({ collapsable, ...reste }, ref) {
    void collapsable;
    const Rendu = Composant as React.ComponentType<Record<string, unknown>>;
    return <Rendu ref={ref} {...reste} />;
  });
  return Propre;
}

const ARect = Animated.createAnimatedComponent(sansCollapsable(Rect));
const APath = Animated.createAnimatedComponent(sansCollapsable(Path));

// The mockup's viewBox and geometry, unchanged.
const BOITE = { w: 40, h: 34 };
const AVANT = { y: 2, h: 7, w: 40 };
const APRES = { y: 25, h: 7, w: 17 };
const PENTE = 'M0,9 L40,9 L17,25 L0,25 Z';
const OPACITE_PENTE = 0.22;

/** The mockup's easing on every mark keyframe: cubic-bezier(.32,.72,0,1). */
const COURBE = Easing.bezier(0.32, 0.72, 0, 1);

export interface MarkProps {
  /** 40x34 by default; the compact header draws it at 29x25. */
  largeur?: number;
  /** Screen-reader name. Passed in: `src/ui` performs no i18n lookup. */
  label: string;
}

/**
 * The brand mark, which replays the app's gesture: a belief that retracts.
 *
 * The long bar is the rating before, the short one the rating after; the wedge
 * between them is the distance. The animation shoots the lower bar out to full
 * width and pulls it back to 17 units — the retraction is the point.
 *
 * Under reduced motion it renders the finished state directly. That is the rule
 * in CLAUDE.md 4.4: the non-animated state is the final visible state, never an
 * empty one. A logo that vanishes when someone turns motion off is a bug.
 */
export function Mark({ largeur = BOITE.w, label }: MarkProps) {
  const { c } = useTheme();
  const motionReduite = useReducedMotion();

  // Initialised to the final state, so the very first frame is already correct
  // if the animation never runs.
  //
  // Lazy `useState` rather than `useRef().current`: the three values are created
  // once and never replaced, and reading `.current` during render is exactly
  // what `react-hooks/refs` forbids. `useState` gives the same stable instance
  // without the render-phase ref read.
  const [avant] = useState(() => new Animated.Value(AVANT.w));
  const [apres] = useState(() => new Animated.Value(APRES.w));
  const [pente] = useState(() => new Animated.Value(OPACITE_PENTE));

  /** Whether an animation has run, so the effect knows if there is state to undo. */
  const aAnime = useRef(false);

  useEffect(() => {
    if (motionReduite) {
      // Already at the final state unless an animation actually ran, so there is
      // nothing to snap back to on a normal mount. Writing the values anyway
      // would schedule a pointless animated update on every mount — visible in
      // tests as an act() warning, and in the app as wasted work on a logo.
      if (!aAnime.current) return;
      aAnime.current = false;
      // Motion switched off mid-animation: jump to the end rather than freeze.
      avant.setValue(AVANT.w);
      apres.setValue(APRES.w);
      pente.setValue(OPACITE_PENTE);
      return;
    }

    aAnime.current = true;
    avant.setValue(0);
    apres.setValue(0);
    pente.setValue(0);

    const animation = Animated.parallel([
      Animated.timing(avant, {
        toValue: AVANT.w,
        duration: duree.long,
        easing: COURBE,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.delay(180),
        // 0 -> full width -> hold -> back to 17. The retraction, in three moves.
        Animated.timing(apres, {
          toValue: BOITE.w,
          duration: duree.marque * 0.3,
          easing: COURBE,
          useNativeDriver: false,
        }),
        Animated.delay(duree.marque * 0.28),
        Animated.timing(apres, {
          toValue: APRES.w,
          duration: duree.marque * 0.42,
          easing: COURBE,
          useNativeDriver: false,
        }),
      ]),
      Animated.sequence([
        Animated.delay(1150),
        Animated.timing(pente, {
          toValue: OPACITE_PENTE,
          duration: duree.court,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    ]);

    animation.start();
    return () => animation.stop();
  }, [motionReduite, avant, apres, pente]);

  const hauteur = (largeur * BOITE.h) / BOITE.w;

  return (
    <Svg
      width={largeur}
      height={hauteur}
      viewBox={`0 0 ${BOITE.w} ${BOITE.h}`}
      accessibilityRole="image"
      accessibilityLabel={label}
    >
      <ARect x={0} y={AVANT.y} width={avant} height={AVANT.h} rx={3.5} fill={c.tension} />
      <APath d={PENTE} fill={c.tension} opacity={pente} />
      <ARect x={0} y={APRES.y} width={apres} height={APRES.h} rx={3.5} fill={c.apaise} />
    </Svg>
  );
}
