/**
 * Resolving the crisis resource from a region.
 *
 * Crisis resources depend on **region, not language** (CLAUDE.md §5). An English
 * speaker in Paris needs 3114; a French speaker in Montreal does not. That is
 * why no number appears in a language pack, and why the packs reach the resource
 * through the `{crise}` mark instead of spelling one out.
 *
 * A resource therefore carries its own localisation: the region decides *which*
 * line, the language decides how it is *worded*. Both live in `content/crisis/`,
 * together, so that adding a country is one file and touches no code.
 *
 * ---------------------------------------------------------------------------
 * What is deliberately not here yet
 * ---------------------------------------------------------------------------
 *
 * **No populated region.** `content/crisis/FR.json` is B4's to write, and this
 * batch does not guess at it: a phone number in a health app is exactly the kind
 * of value that must be sourced rather than remembered. Until it lands, every
 * region resolves to the generic fallback, which names no number at all.
 *
 * That is the honest failure mode. A fallback that quietly pointed at another
 * country's line would look correct on screen and be useless — or dangerous —
 * to the person dialling it.
 *
 * This module is pure: it takes a region code and returns a resource. Reading
 * the device region through `expo-localization` is a separate, thin layer, so
 * that this logic stays testable in the `node` Jest project without pulling in
 * a native module.
 */

import defaut from '../../content/crisis/default.json';
import type { Langue } from '../i18n/types';

/**
 * A crisis resource for one region.
 *
 * `tel` is nullable and that nullability is load-bearing: the generic entry has
 * no number, and a resource with no number must render as plain text rather
 * than as a link that dials nothing.
 */
export interface RessourceCrise {
  /** Region code, or `default` for the generic entry. */
  region: string;
  /** The number to dial, or `null` when no specific line is known. */
  tel: string | null;
  /** How the resource is worded, per interface language. */
  libelle: Record<Langue, string>;
}

/**
 * The generic entry. Loaded from `content/`, not written here, so that the
 * wording goes through the same review as any other displayed string.
 */
export const CRISE_DEFAUT: RessourceCrise = {
  region: defaut.region,
  tel: defaut.tel,
  libelle: defaut.libelle,
};

/**
 * The populated regions.
 *
 * Empty until B4. Kept as an explicit, empty registry rather than being left
 * out: an empty map that the resolver reads is a structure waiting for content,
 * whereas no map at all is a resolver that would have to be rewritten.
 */
const REGISTRE: Record<string, RessourceCrise> = {};

/**
 * The resource for a region, falling back to the generic entry.
 *
 * Falls back on three distinct cases, all of them real: no region reported by
 * the device, a region the registry does not cover, and a region whose entry
 * exists but names no line.
 */
export function ressourceCrise(region: string | null | undefined): RessourceCrise {
  if (!region) return CRISE_DEFAUT;
  return REGISTRE[region.toUpperCase()] ?? CRISE_DEFAUT;
}

/** Whether a resolved resource names a dialable line. */
export function estDialable(r: RessourceCrise): r is RessourceCrise & { tel: string } {
  return typeof r.tel === 'string' && r.tel.length > 0;
}

/** How the resource reads in a given interface language. */
export function libelleCrise(r: RessourceCrise, langue: Langue): string {
  return r.libelle[langue];
}
