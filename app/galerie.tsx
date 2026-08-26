import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ICONE_IDS } from '../src/icons/registry';
import { PACKS } from '../src/i18n';
import { libelleCrise, ressourceCrise } from '../src/region/crisis';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { radius, space, type Scheme } from '../src/theme/tokens';
import { useTheme } from '../src/theme/useTheme';
import { Button, Card, Chip, Footer, Icon, Mark, RichText, Text, Track } from '../src/ui';

/**
 * Development gallery — every primitive, all 22 icons, both themes, both
 * languages, on one screen.
 *
 * It exists because nothing else in this phase renders the design system: the
 * journal arrives in B6, and until then the tokens are only ever checked by a
 * contrast test, which says nothing about whether the thing looks right.
 *
 * Not reachable in a production build. It is a route rather than a Storybook
 * because a second toolchain would be a second way to render components, and
 * this one renders them exactly the way the app does.
 */

/**
 * Gallery-only sample copy.
 *
 * This is NOT the language pack — that is extracted whole in B3 and lives in
 * `src/i18n/`, under the parity test. These few strings exist so both languages
 * can be seen against the type scale at once; they are fixtures, and B3 must
 * not grow out of them.
 */
const EXEMPLES = {
  fr: {
    marque: 'Fiche de pensée',
    sous: 'Restructuration cognitive',
    hero: 'Une pensée, regardée de près',
    invite: 'Qu’est-ce qui vous a traversé l’esprit ?',
    corps:
      'Notez la situation telle qu’une caméra l’aurait filmée, sans interprétation ni jugement.',
    extrait: 'Je n’y arriverai jamais, tout le monde va s’en rendre compte.',
    // Deliberately no crisis number here — it comes through `{crise}` below.
    // A number written into a fixture is the same CLAUDE.md §5 failure as one
    // written into a pack: it was France-only in French and vague in English,
    // which is the region-versus-language confusion the resolver exists to end.
    legende: 'Une légende, pour voir le palier `petit` sur deux lignes de texte.',
    etiquette: 'Constat',
    bouton: 'Continuer',
    discret: 'Revenir en arrière',
    puces: ['Anxiété', 'Tristesse', 'Colère'],
  },
  en: {
    marque: 'Thought record',
    sous: 'Cognitive restructuring',
    hero: 'One thought, looked at closely',
    invite: 'What went through your mind?',
    corps: 'Write the situation as a camera would have filmed it, with no reading and no verdict.',
    extrait: 'I will never manage this, and everyone is going to notice.',
    legende: 'A caption, to see the `petit` step run over two lines of text.',
    etiquette: 'Observation',
    bouton: 'Continue',
    discret: 'Go back',
    puces: ['Anxiety', 'Sadness', 'Anger'],
  },
} as const;

type Langue = keyof typeof EXEMPLES;
const LANGUES: Langue[] = ['fr', 'en'];

function Separateur() {
  const { c } = useTheme();
  return <View style={[styles.separateur, { backgroundColor: c.ligne }]} />;
}

function Titre({ children }: { children: string }) {
  return (
    <Text variante="etiquette" style={styles.sectionTitre}>
      {children}
    </Text>
  );
}

/** Everything the gallery shows, rendered inside whichever theme wraps it. */
function Panneau({ langue }: { langue: Langue }) {
  const { c, scheme } = useTheme();
  const t = EXEMPLES[langue];
  const [chipActif, setChipActif] = useState(0);

  // The real pack and the real resolver — the gallery is a review surface, so
  // the marked-up strings below must be the ones that ship, not fixtures.
  const pack = PACKS[langue];
  const ressource = ressourceCrise(null);
  const crise = { libelle: libelleCrise(ressource, langue), tel: ressource.tel };

  return (
    <View style={[styles.panneau, { backgroundColor: c.papier }]}>
      <View style={styles.entete}>
        <Mark largeur={40} label={t.marque} />
        <View style={styles.enteteTexte}>
          <Text variante="marque">{t.marque}</Text>
          <Text variante="etiquette" style={styles.sous}>
            {t.sous}
          </Text>
        </View>
      </View>

      <Titre>{`${scheme} · ${langue}`}</Titre>

      <Titre>Type</Titre>
      <Text variante="hero">{t.hero}</Text>
      <Text variante="invite" style={styles.bloc}>
        {t.invite}
      </Text>
      <Text variante="titre" style={styles.bloc}>
        {t.hero}
      </Text>
      <Text variante="corps" style={styles.bloc}>
        {t.corps}
      </Text>
      <Text variante="legende" style={styles.bloc}>
        {t.legende}
      </Text>
      <Text variante="chiffre" style={styles.bloc}>
        8 → 3
      </Text>

      <Separateur />
      <Titre>RichText — les cinq marques</Titre>
      {/*
        The real strings from the packs, not fixtures: this is the surface the
        owner reviews, so it has to show what actually ships. The crisis
        resource is resolved through `src/region/crisis.ts`, which today means
        the generic fallback — no number, and plain text rather than a link.
      */}
      <RichText variante="corps" crise={crise} style={styles.bloc}>
        {pack.ui.s2Intro}
      </RichText>
      <RichText variante="legende" crise={crise} style={styles.bloc}>
        {pack.ui.safety}
      </RichText>
      <RichText variante="corps" crise={crise} style={styles.bloc}>
        {pack.ui.vide}
      </RichText>
      {/* The densest string in either pack: a quoted voice, a break, a number. */}
      {pack.tour[2] ? (
        <RichText variante="corps" crise={crise} style={styles.bloc}>
          {pack.tour[2].ex}
        </RichText>
      ) : null}

      <Separateur />
      <Titre>Tons de texte</Titre>
      {(['encre', 'encre2', 'encre3', 'tensionTexte', 'apaiseTexte', 'gardeTexte'] as const).map(
        (ton) => (
          <Text key={ton} variante="corps" ton={ton}>
            {ton}
          </Text>
        )
      )}

      <Separateur />
      <Titre>Carte</Titre>
      <Card>
        <Text variante="etiquette">12 août</Text>
        <Text variante="extrait" style={styles.bloc}>
          {t.extrait}
        </Text>
        <View style={styles.delta}>
          <Track valeur={8} ton="tension" label="avant" />
          <Text variante="etiquette">→</Text>
          <Track valeur={3} ton="apaise" label="après" />
        </View>
      </Card>
      <Card fond="aide" style={styles.bloc}>
        <View style={styles.ligneIcone}>
          <Icon nom="alert" taille={16} ton="garde" />
          <Text variante="legende" style={styles.flex}>
            {t.legende}
          </Text>
        </View>
      </Card>

      <Separateur />
      <Titre>Puces</Titre>
      <View style={styles.puces}>
        {t.puces.map((puce, i) => (
          <Chip key={puce} titre={puce} actif={i === chipActif} onPress={() => setChipActif(i)} />
        ))}
      </View>

      <Separateur />
      <Titre>Boutons</Titre>
      <Button titre={t.bouton} />
      <Button titre={t.discret} variante="discret" />
      <Button titre={t.bouton} disabled style={styles.bloc} />

      <Separateur />
      <Titre>{`Icônes (${ICONE_IDS.length})`}</Titre>
      <View style={styles.icones}>
        {ICONE_IDS.map((nom) => (
          <View key={nom} style={[styles.caseIcone, { borderColor: c.ligne }]}>
            <Icon nom={nom} />
            <Text variante="etiquette" style={styles.nomIcone} numberOfLines={1}>
              {nom}
            </Text>
          </View>
        ))}
      </View>

      <Separateur />
      <Titre>Accents graphiques</Titre>
      <View style={styles.pastilles}>
        {(['tension', 'apaise', 'garde', 'ligne', 'rail'] as const).map((role) => (
          <View key={role} style={styles.pastilleCase}>
            <View style={[styles.pastille, { backgroundColor: c[role] }]} />
            <Text variante="etiquette">{role}</Text>
          </View>
        ))}
      </View>

      <Footer>
        <Button titre={t.bouton} />
      </Footer>
    </View>
  );
}

export default function GalerieRoute() {
  // Never shipped. A production build renders nothing here.
  if (!__DEV__) return null;

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {(['light', 'dark'] as Scheme[]).map((scheme) =>
        LANGUES.map((langue) => (
          <ThemeProvider key={`${scheme}-${langue}`} scheme={scheme}>
            <Panneau langue={langue} />
          </ThemeProvider>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexDirection: 'row', flexWrap: 'wrap' },
  // Four panels: light/dark x fr/en. Half-width each, so a phone shows two
  // side by side and the four states sit on one screen.
  panneau: { width: '50%', padding: space.s12, paddingBottom: space.s28 },
  entete: { flexDirection: 'row', alignItems: 'center', gap: space.s12 },
  enteteTexte: { flexShrink: 1 },
  sous: { marginTop: space.s4 },
  sectionTitre: { marginTop: space.s18, marginBottom: space.s6 },
  bloc: { marginTop: space.s8 },
  separateur: { height: 1, marginTop: space.s18 },
  delta: { flexDirection: 'row', alignItems: 'center', gap: space.s8, marginTop: space.s12 },
  ligneIcone: { flexDirection: 'row', gap: space.s10, alignItems: 'flex-start' },
  flex: { flex: 1 },
  puces: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s8 },
  icones: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s6 },
  caseIcone: {
    width: 62,
    alignItems: 'center',
    gap: space.s4,
    paddingVertical: space.s8,
    borderWidth: 1,
    borderRadius: radius.moyen,
  },
  nomIcone: { maxWidth: 58 },
  pastilles: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s10 },
  pastilleCase: { alignItems: 'center', gap: space.s4 },
  pastille: { width: 28, height: 28, borderRadius: radius.petit },
});
