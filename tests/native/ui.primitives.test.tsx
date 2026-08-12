import { render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { ICONE_IDS } from '../../src/icons/registry';
import { ThemeProvider } from '../../src/theme/ThemeProvider';
import { couleurs, leading, type, type Scheme } from '../../src/theme/tokens';
import { Button, Card, Chip, Icon, Text, Track } from '../../src/ui';

const wrap = (node: ReactNode, scheme: Scheme = 'light') => (
  <ThemeProvider scheme={scheme}>{node}</ThemeProvider>
);

/** React Native flattens style arrays only at render; do it by hand for assertions. */
function styleOf(element: { props: { style?: unknown } }): Record<string, unknown> {
  const flatten = (s: unknown): Record<string, unknown> =>
    Array.isArray(s)
      ? s.reduce<Record<string, unknown>>((acc, part) => ({ ...acc, ...flatten(part) }), {})
      : ((s ?? {}) as Record<string, unknown>);
  return flatten(element.props.style);
}

describe('useTheme', () => {
  it('refuses to render outside a provider rather than guessing light', () => {
    // A silent fallback would render a plausible screen that ignores dark mode.
    const quiet = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Text>orphan</Text>)).toThrow(/ThemeProvider/);
    quiet.mockRestore();
  });
});

describe('Text', () => {
  it('takes its colour from the theme, per scheme', () => {
    render(wrap(<Text>ancre</Text>, 'light'));
    expect(styleOf(screen.getByText('ancre')).color).toBe(couleurs.light.encre2);

    screen.unmount();
    render(wrap(<Text>ancre</Text>, 'dark'));
    expect(styleOf(screen.getByText('ancre')).color).toBe(couleurs.dark.encre2);
  });

  it('resolves line height from the multiplier scale, not by hand', () => {
    render(wrap(<Text variante="corps">mesure</Text>));
    const style = styleOf(screen.getByText('mesure'));
    expect(style.fontSize).toBe(type.corps);
    expect(style.lineHeight).toBeCloseTo(type.corps * leading.lecture, 5);
  });

  it('converts em tracking to the px React Native expects', () => {
    render(wrap(<Text variante="etiquette">CONSTAT</Text>));
    const style = styleOf(screen.getByText('CONSTAT'));
    // 0.12em at 10px is 1.2px, not 0.12.
    expect(style.letterSpacing).toBeCloseTo(1.2, 5);
  });

  it('honours a text-role override', () => {
    render(wrap(<Text ton="gardeTexte">3114</Text>));
    expect(styleOf(screen.getByText('3114')).color).toBe(couleurs.light.gardeTexte);
  });
});

describe('Button', () => {
  it('meets the 50px floor for a primary action and 44px otherwise', () => {
    render(
      wrap(
        <>
          <Button titre="Continuer" />
          <Button titre="Retour" variante="discret" />
        </>
      )
    );
    expect(styleOf(screen.getByRole('button', { name: 'Continuer' })).minHeight).toBe(50);
    expect(styleOf(screen.getByRole('button', { name: 'Retour' })).minHeight).toBe(44);
  });

  it('reports its disabled state to assistive technology', () => {
    render(wrap(<Button titre="Continuer" disabled />));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeDisabled();
  });
});

describe('Chip', () => {
  it('carries a 44px target without changing a rendered pixel', () => {
    render(wrap(<Chip titre="Anxiété" />));
    const chip = screen.getByRole('checkbox', { name: 'Anxiété' });
    const { top, bottom } = chip.props.hitSlop as { top: number; bottom: number };
    const style = styleOf(chip);
    const hauteurVisible = type.corps + (style.paddingVertical as number) * 2;
    expect(hauteurVisible + top + bottom).toBeGreaterThanOrEqual(44);
  });

  it('announces selection rather than relying on colour alone', () => {
    render(
      wrap(
        <>
          <Chip titre="Colère" actif />
          <Chip titre="Tristesse" />
        </>
      )
    );
    expect(screen.getByRole('checkbox', { name: 'Colère' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Tristesse' })).not.toBeChecked();
  });
});

describe('Track', () => {
  it('clamps a rating outside 0-10 instead of overflowing the bar', () => {
    render(
      wrap(
        <>
          <Track valeur={99} ton="tension" label="haut" />
          <Track valeur={-4} ton="apaise" label="bas" />
        </>
      )
    );
    expect(screen.getByLabelText('haut').props.accessibilityValue.now).toBe(10);
    expect(screen.getByLabelText('bas').props.accessibilityValue.now).toBe(0);
  });

  it('exposes the rating as a value, not only as a width', () => {
    render(wrap(<Track valeur={8} ton="tension" label="avant" />));
    expect(screen.getByLabelText('avant').props.accessibilityValue).toEqual({
      min: 0,
      max: 10,
      now: 8,
    });
  });
});

describe('Card', () => {
  it('is a plain View when it has no press handler', () => {
    render(wrap(<Card><Text>statique</Text></Card>));
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('is a labelled button when it does', () => {
    render(
      wrap(
        <Card onPress={() => {}} accessibilityLabel="Fiche du 12 août">
          <Text>cliquable</Text>
        </Card>
      )
    );
    expect(screen.getByRole('button', { name: 'Fiche du 12 août' })).toBeTruthy();
  });
});

describe('Icon', () => {
  it('renders every id in the registry', () => {
    for (const nom of ICONE_IDS) {
      const { unmount } = render(wrap(<Icon nom={nom} label={nom} />));
      expect(screen.getByLabelText(nom)).toBeTruthy();
      unmount();
    }
  });

  it('holds exactly 22 icons', () => {
    // The count the mockup and the brief both state.
    expect(ICONE_IDS).toHaveLength(22);
  });

  it('is hidden from assistive tech when it carries no label', () => {
    const { toJSON } = render(wrap(<Icon nom="check" />));
    expect(JSON.stringify(toJSON())).toContain('"aria-hidden":true');
  });
});
