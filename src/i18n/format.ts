/**
 * Formatting dates for display.
 *
 * Dates are stored as ISO 8601 and formatted here (CLAUDE.md §5). A formatted
 * date is never stored: it would freeze both a language and a timezone into a
 * record that outlives them, and a record written in French is still readable in
 * an English interface precisely because only the ISO string was kept.
 *
 * ---------------------------------------------------------------------------
 * The timezone hazard, and why parsing is done by hand
 * ---------------------------------------------------------------------------
 *
 * `new Date('2026-08-25')` is parsed as **midnight UTC**, not local midnight.
 * In any timezone behind UTC that is 2026-08-24 locally, so a record written on
 * the 25th displays as the 24th. The mockup dodges this by appending
 * `"T12:00:00"` before parsing — correct, but a trick that has to be remembered
 * at every call site.
 *
 * Here a date-only string is instead split and rebuilt through the local-time
 * constructor, which cannot drift whatever the device timezone. A full instant
 * (one carrying a time and an offset) is unambiguous already and is parsed
 * normally.
 *
 * This matters more than it looks: the date on a record is the evidence of when
 * someone wrote it, and the whole point of the append-only rule is that this
 * date can be trusted (ADR 0001).
 */

import type { Langue } from './types';

/** The locale each language formats against. Matches the mockup. */
const LOCALES: Record<Langue, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
};

/** `YYYY-MM-DD`, with nothing after it. */
const DATE_SEULE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parse a stored ISO 8601 value into a `Date`.
 *
 * A date-only value is anchored at local noon: far enough from both midnights
 * that no daylight-saving shift can move it to an adjacent day.
 *
 * @throws if the value is not ISO 8601. Deliberately loud — a date that silently
 * became `Invalid Date` would render as "Invalid Date" on a card, which reads as
 * a corrupt record rather than as a bug.
 */
export function analyser(iso: string): Date {
  const seule = DATE_SEULE.exec(iso);
  const d = seule
    ? new Date(Number(seule[1]), Number(seule[2]) - 1, Number(seule[3]), 12, 0, 0, 0)
    : new Date(iso);

  if (Number.isNaN(d.getTime())) {
    // No record content in the message — health rule 6. The value here is a
    // date, not something someone wrote, so quoting it is safe and useful.
    throw new RangeError(`not an ISO 8601 date: ${JSON.stringify(iso)}`);
  }
  return d;
}

/**
 * The card date: day and abbreviated month, as in the mockup.
 *
 * Deliberately without a year. The journal is read as a recent stream, and the
 * year is noise on all but the oldest cards — `dateLongue` carries it where it
 * matters.
 */
export function dateCourte(iso: string, langue: Langue): string {
  return new Intl.DateTimeFormat(LOCALES[langue], {
    day: 'numeric',
    month: 'short',
  }).format(analyser(iso));
}

/** The full date, for a record's own header and for re-rating rows. */
export function dateLongue(iso: string, langue: Langue): string {
  return new Intl.DateTimeFormat(LOCALES[langue], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(analyser(iso));
}

/**
 * Today, as the date-only ISO string a record is stamped with.
 *
 * Built from local components rather than `toISOString()`, which converts to UTC
 * and would stamp the wrong day for anyone east of UTC late in the evening.
 */
export function aujourdhuiIso(maintenant: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${maintenant.getFullYear()}-${p(maintenant.getMonth() + 1)}-${p(maintenant.getDate())}`;
}
