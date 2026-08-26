/**
 * What `RichText` draws.
 *
 * The grammar is tested in the `node` project; this covers rendering, and in
 * particular the three ways `{crise}` can resolve. Health rule 3 makes the
 * crisis notice non-negotiable, so "it renders something legible" is an
 * assertion about safety, not about layout.
 */

import { render, screen } from '@testing-library/react-native';

import { RichText } from '../../src/ui/RichText';
import { ThemeProvider } from '../../src/theme/ThemeProvider';
import { couleurs } from '../../src/theme/tokens';
import { fr } from '../../src/i18n/fr';

const wrap = (n: React.ReactNode) => <ThemeProvider>{n}</ThemeProvider>;

/**
 * The concatenated visible text of a rendered tree.
 *
 * Walks the whole JSON tree rather than reading `props.children` off each Text:
 * the marks nest, so most strings sit several elements deep and a shallow read
 * silently returns "".
 */
function texteVisible(): string {
  const morceaux: string[] = [];
  const visiter = (n: unknown): void => {
    if (typeof n === 'string') {
      morceaux.push(n);
      return;
    }
    if (Array.isArray(n)) {
      n.forEach(visiter);
      return;
    }
    if (n && typeof n === 'object' && 'children' in n) {
      visiter((n as { children: unknown }).children);
    }
  };
  visiter(screen.toJSON());
  return morceaux.join('');
}

describe('RichText', () => {
  describe('plain content', () => {
    it('renders an unmarked string unchanged', () => {
      render(wrap(<RichText>bonjour</RichText>));
      expect(screen.getByText('bonjour')).toBeTruthy();
    });
  });

  describe('the crisis mark', () => {
    const AVEC_NUMERO = { libelle: '3114 — gratuit, 24 h/24', tel: '3114' };
    const SANS_NUMERO = { libelle: "une ligne d'écoute près de chez vous", tel: null };

    it('renders the resolved label, never a number of its own', () => {
      render(wrap(<RichText crise={AVEC_NUMERO}>{'En cas de détresse : {crise}'}</RichText>));
      expect(screen.getByText('3114 — gratuit, 24 h/24')).toBeTruthy();
      // The mark itself never reaches the screen.
      expect(texteVisible()).not.toContain('{crise}');
    });

    it('is a link when the resource names a line', () => {
      render(wrap(<RichText crise={AVEC_NUMERO}>{'{crise}'}</RichText>));
      expect(screen.getByRole('link')).toBeTruthy();
    });

    it('is plain text when it does not — a link that dials nothing is worse', () => {
      // This is every region today, and the generic fallback forever. A tap that
      // fails is a worse outcome in a crisis than a sentence that never invited
      // one.
      render(wrap(<RichText crise={SANS_NUMERO}>{'{crise}'}</RichText>));
      expect(screen.queryByRole('link')).toBeNull();
      expect(screen.getByText("une ligne d'écoute près de chez vous")).toBeTruthy();
    });

    it('dials through the override rather than the platform, when given one', () => {
      const appels: string[] = [];
      render(
        wrap(
          <RichText crise={AVEC_NUMERO} onCrise={(t) => appels.push(t)}>
            {'{crise}'}
          </RichText>
        )
      );
      screen.getByRole('link').props.onPress();
      expect(appels).toEqual(['3114']);
    });

    it('degrades visibly when no resource is supplied', () => {
      // Not silently: the notice health rule 3 protects must never render as an
      // empty gap that nobody notices.
      render(wrap(<RichText>{'{crise}'}</RichText>));
      expect(screen.getByText('{crise}')).toBeTruthy();
    });
  });

  describe('the real strings from the packs', () => {
    it('renders ui.safety with the resource in place of the mark', () => {
      render(
        wrap(
          <RichText variante="legende" crise={{ libelle: 'ligne locale', tel: null }}>
            {fr.ui.safety}
          </RichText>
        )
      );
      const vu = texteVisible();
      expect(vu).toContain("Cette app n'est pas un soin");
      expect(vu).toContain('ligne locale');
      expect(vu).not.toContain('{crise}');
    });

    it('renders ui.s6C, which nests the resource inside an emphasis', () => {
      render(wrap(<RichText crise={{ libelle: 'ligne locale', tel: null }}>{fr.ui.s6C}</RichText>));
      const vu = texteVisible();
      expect(vu).toContain('En cas de détresse');
      expect(vu).toContain('ligne locale');
      expect(vu).not.toContain('**');
    });

    it('renders ui.vide across its line break', () => {
      render(wrap(<RichText>{fr.ui.vide}</RichText>));
      const vu = texteVisible();
      expect(vu).toContain('Aucune fiche pour l’instant.'.replace('’', "'"));
      expect(vu).toContain('La prochaine fois');
    });
  });

  describe('the crisis resource is legible (CLAUDE.md §4.2)', () => {
    it('is painted in the safety accent, which the contrast test holds at AA', () => {
      render(wrap(<RichText crise={{ libelle: 'ligne locale', tel: null }}>{'{crise}'}</RichText>));
      const noeud = screen.getByText('ligne locale');
      const style = Array.isArray(noeud.props.style)
        ? Object.assign({}, ...noeud.props.style.filter(Boolean))
        : noeud.props.style;
      expect(style.color).toBe(couleurs.light.gardeTexte);
    });
  });
});
