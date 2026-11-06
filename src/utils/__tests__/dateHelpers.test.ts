import { describe, it, expect } from 'vitest';
import { getTodayDateString, isTaskOverdue } from '../dateHelpers';

describe('dateHelpers', () => {
  describe('getTodayDateString', () => {
    it('formats given date correctly to YYYY-MM-DD in local time', () => {
      const mockDate = new Date(2026, 10, 6); // Note: month is 0-indexed, so 10 = November
      expect(getTodayDateString(mockDate)).toBe('2026-11-06');
    });

    it('pads single-digit month and day with zeros', () => {
      const mockDate = new Date(2026, 0, 5); // 2026-01-05
      expect(getTodayDateString(mockDate)).toBe('2026-01-05');
    });

    it('returns current date format YYYY-MM-DD when no argument is passed', () => {
      const today = getTodayDateString();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('gracefully handles invalid date object by falling back to current date', () => {
      const invalidDate = new Date('invalid date');
      const result = getTodayDateString(invalidDate);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('isTaskOverdue', () => {
    const referenceDate = new Date(2026, 10, 6); // 2026-11-06

    it('returns false if dueDate is undefined, empty, or whitespace', () => {
      expect(isTaskOverdue(undefined, 'col-todo', referenceDate)).toBe(false);
      expect(isTaskOverdue('', 'col-todo', referenceDate)).toBe(false);
      expect(isTaskOverdue('   ', 'col-todo', referenceDate)).toBe(false);
    });

    it('returns false if columnId is a done column variant regardless of case', () => {
      expect(isTaskOverdue('2026-11-01', 'col-done', referenceDate)).toBe(false);
      expect(isTaskOverdue('2026-11-01', 'done', referenceDate)).toBe(false);
      expect(isTaskOverdue('2026-11-01', 'DONE', referenceDate)).toBe(false);
      expect(isTaskOverdue('2026-11-01', 'completed', referenceDate)).toBe(false);
      expect(isTaskOverdue('2026-11-01', 'col-completed', referenceDate)).toBe(false);
    });

    it('returns false if dueDate does not match YYYY-MM-DD regex', () => {
      expect(isTaskOverdue('06-11-2026', 'col-todo', referenceDate)).toBe(false);
      expect(isTaskOverdue('2026/11/05', 'col-todo', referenceDate)).toBe(false);
      expect(isTaskOverdue('invalid-date', 'col-todo', referenceDate)).toBe(false);
      expect(isTaskOverdue('2026-1-5', 'col-todo', referenceDate)).toBe(false);
    });

    it('returns true if dueDate is before today in non-done column', () => {
      expect(isTaskOverdue('2026-11-05', 'col-todo', referenceDate)).toBe(true);
      expect(isTaskOverdue('2026-10-31', 'col-in-progress', referenceDate)).toBe(true);
      expect(isTaskOverdue('2025-12-31', undefined, referenceDate)).toBe(true);
    });

    it('handles leading and trailing whitespace around valid dueDate', () => {
      expect(isTaskOverdue('  2026-11-05  ', 'col-todo', referenceDate)).toBe(true);
    });

    it('returns false if dueDate is today', () => {
      expect(isTaskOverdue('2026-11-06', 'col-todo', referenceDate)).toBe(false);
    });

    it('returns false if dueDate is in the future', () => {
      expect(isTaskOverdue('2026-11-07', 'col-todo', referenceDate)).toBe(false);
      expect(isTaskOverdue('2027-01-01', 'col-todo', referenceDate)).toBe(false);
    });
  });
});

