/**
 * Dates are stored as ISO and formatted for display, never the reverse.
 *
 * The assertions that matter here are the timezone ones. They are written so
 * they would fail on the naive implementation (`new Date(iso)` on a date-only
 * string) regardless of the machine's timezone — otherwise the suite would be
 * green in Paris and the bug would ship to anyone west of it.
 */

import { analyser, aujourdhuiIso, dateCourte, dateLongue } from '../../src/i18n/format';
import { LANGUES } from '../../src/i18n/types';

describe('date formatting', () => {
  describe('parsing a date-only value', () => {
    it('lands on the stored day, not the day before', () => {
      // The naive `new Date('2026-08-25')` is midnight UTC; anywhere behind UTC
      // that is the 24th locally. Asserting the local components makes this
      // independent of where the suite runs.
      const d = analyser('2026-08-25');
      expect(d.getFullYear()).toBe(2026);
      expect(d.getMonth()).toBe(7); // August, zero-based
      expect(d.getDate()).toBe(25);
    });

    it('anchors at midday, far from both midnights', () => {
      // A daylight-saving transition moves the clock by an hour. Anchoring at
      // noon means no transition can push the value onto an adjacent day.
      expect(analyser('2026-08-25').getHours()).toBe(12);
    });

    it.each([
      '2026-01-01',
      '2026-12-31',
      '2026-03-29', // the European DST spring-forward Sunday
      '2026-10-25', // the European DST fall-back Sunday
    ])('holds for %s', (iso) => {
      const d = analyser(iso);
      const [y, m, j] = iso.split('-').map(Number);
      expect([d.getFullYear(), d.getMonth() + 1, d.getDate()]).toEqual([y, m, j]);
    });
  });

  describe('parsing a full instant', () => {
    it('is left to the platform, being unambiguous already', () => {
      expect(analyser('2026-08-25T09:30:00Z').getTime()).toBe(Date.parse('2026-08-25T09:30:00Z'));
    });
  });

  describe('rejecting what is not a date', () => {
    // An invalid date must not reach a card as the string "Invalid Date": that
    // reads as a corrupt record rather than as a bug.
    it.each(['', 'hier', '25/08/2026', '2026-13-01T00:00:00Z'])('throws on %p', (mauvais) => {
      expect(() => analyser(mauvais)).toThrow(RangeError);
    });
  });

  describe('display', () => {
    it('formats the card date per language', () => {
      expect(dateCourte('2026-08-25', 'fr')).toMatch(/25/);
      expect(dateCourte('2026-08-25', 'en')).toMatch(/25/);
    });

    it('gives each language its own wording', () => {
      // Not asserting exact strings: ICU wording shifts between Node releases,
      // and pinning it would make the suite fail on an upgrade that broke
      // nothing. That the two differ is the property worth holding.
      expect(dateCourte('2026-08-25', 'fr')).not.toBe(dateCourte('2026-08-25', 'en'));
    });

    it('includes the year only in the long form', () => {
      for (const langue of LANGUES) {
        expect(dateLongue('2026-08-25', langue)).toMatch(/2026/);
        expect(dateCourte('2026-08-25', langue)).not.toMatch(/2026/);
      }
    });

    it('never returns an empty string', () => {
      for (const langue of LANGUES) {
        expect(dateCourte('2026-08-25', langue).trim()).not.toBe('');
        expect(dateLongue('2026-08-25', langue).trim()).not.toBe('');
      }
    });
  });

  describe('stamping today', () => {
    it('uses local components, not UTC', () => {
      // 2026-08-25 at 23:30 local. `toISOString()` would roll this to the 26th
      // for anyone east of UTC, stamping a record with tomorrow's date.
      const tard = new Date(2026, 7, 25, 23, 30);
      expect(aujourdhuiIso(tard)).toBe('2026-08-25');
    });

    it('pads single digits', () => {
      expect(aujourdhuiIso(new Date(2026, 0, 5, 10))).toBe('2026-01-05');
    });

    it('round-trips through the parser', () => {
      const iso = aujourdhuiIso(new Date(2026, 4, 9, 8));
      expect(analyser(iso).getDate()).toBe(9);
    });
  });
});
