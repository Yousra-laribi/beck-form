import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Whether the system asks for reduced motion.
 *
 * Starts `true`, not `false`. `isReduceMotionEnabled()` is async, so the first
 * render happens before the answer arrives — and CLAUDE.md 4.4 says the
 * non-animated state must always be the final visible state. Starting at `true`
 * means the worst case is an animation that does not play; starting at `false`
 * means someone who asked for no motion gets a flash of it on every mount.
 */
export function useReducedMotion(): boolean {
  const [reduit, setReduit] = useState(true);

  useEffect(() => {
    let vivant = true;
    AccessibilityInfo.isReduceMotionEnabled().then((valeur) => {
      if (vivant) setReduit(valeur);
    });
    const abonnement = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduit);
    return () => {
      vivant = false;
      abonnement.remove();
    };
  }, []);

  return reduit;
}
