import { Fragment } from 'react';
import { Linking, Text as RNText, type StyleProp, type TextStyle } from 'react-native';

import { analyserMarques, type Noeud } from '../i18n/marques';
import { famille } from '../theme/police';
import { useTheme } from '../theme/useTheme';
import { ROLES, Text, type Ton, type Variante } from './Text';

/**
 * Renders the five-mark convention (CLAUDE.md §5).
 *
 * Presentational only, per CLAUDE.md §4.5: it looks nothing up. The crisis
 * resource arrives already resolved, as a label and an optional number, because
 * resolving it needs a region and a language and neither belongs in `src/ui/`.
 * That is also what keeps this testable without a device locale.
 */
export interface RichTextProps {
  /** The marked-up string. One key from a pack, never assembled from several. */
  children: string;
  /** The typographic role of the surrounding block. Inline marks build on it. */
  variante?: Variante;
  ton?: Ton;
  /**
   * The resolved crisis resource, for the `{crise}` mark.
   *
   * Optional so that a string with no `{crise}` needs no ceremony — but a string
   * that *does* carry the mark and gets nothing here renders the mark's literal
   * text, which is visible and reportable rather than silent.
   */
  crise?: { libelle: string; tel: string | null };
  /** Overrides dialling, for tests and for hosts where `tel:` is meaningless. */
  onCrise?: (tel: string) => void;
  style?: StyleProp<TextStyle>;
}

export function RichText({
  children,
  variante = 'corps',
  ton,
  crise,
  onCrise,
  style,
}: RichTextProps) {
  const { c } = useTheme();
  const role = ROLES[variante];

  const composer = (noeuds: Noeud[], cle: string) =>
    noeuds.map((n, i) => <Fragment key={`${cle}.${i}`}>{rendre(n, `${cle}.${i}`)}</Fragment>);

  function rendre(n: Noeud, cle: string): React.ReactNode {
    switch (n.type) {
      case 'texte':
        return n.texte;

      // A literal newline inside a Text wraps without a nested element. Using a
      // View here would break the surrounding text flow.
      case 'saut':
        return '\n';

      // The mockup's <strong>. Reaches for the weight of the *surrounding* face:
      // `famille` falls back to that face's 400 when it has no bold, which makes
      // an unavailable weight a visible near-miss rather than a font switch.
      case 'gras':
        return <RNText style={{ fontFamily: famille(role, 600) }}>{composer(n.enfants, cle)}</RNText>;

      // The mockup's <em>, which is not italics: font-style stays normal and the
      // face becomes the serif. A quoted voice, not emphasis.
      case 'cit':
        return <RNText style={{ fontFamily: famille('titre', 400) }}>{composer(n.enfants, cle)}</RNText>;

      case 'num':
        return (
          <RNText style={{ fontFamily: famille('mono', 400), fontVariant: ['tabular-nums'] }}>
            {composer(n.enfants, cle)}
          </RNText>
        );

      case 'crise':
        return rendreCrise();
    }
  }

  function rendreCrise(): React.ReactNode {
    // No resource passed: render the mark literally. Health rule 3 says the
    // crisis notice never disappears, so the failure mode has to be visible.
    if (!crise) return '{crise}';

    // A resource with no number — the generic fallback, and every region until
    // one is populated. Plain text, not a link: a link that dials nothing is
    // worse than a sentence, because it invites a tap that fails in a crisis.
    if (!crise.tel) {
      return <RNText style={{ color: c.gardeTexte }}>{crise.libelle}</RNText>;
    }

    const tel = crise.tel;
    return (
      <RNText
        accessibilityRole="link"
        onPress={() => (onCrise ? onCrise(tel) : Linking.openURL(`tel:${tel}`))}
        style={{ color: c.gardeTexte, fontFamily: famille(role, 600) }}
      >
        {crise.libelle}
      </RNText>
    );
  }

  return (
    <Text variante={variante} ton={ton} style={style}>
      {composer(analyserMarques(children), 'r')}
    </Text>
  );
}
