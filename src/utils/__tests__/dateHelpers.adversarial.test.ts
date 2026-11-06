// @vitest-environment happy-dom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect } from 'vitest';
import { isTaskOverdue } from '../dateHelpers';
import { TaskCard } from '../../components/board/TaskCard';
import type { Task } from '../../types/kanban';

// @ts-expect-error React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('dateHelpers - Adversarial & Extreme Boundary Tests (Anti-Cheating QA)', () => {
  const referenceDate = new Date(2026, 10, 6, 12, 0, 0); // 2026-11-06 12:00:00

  // =========================================================================
  // 1. Column ID Traps (Substring False Positives)
  // =========================================================================
  describe('Column ID Substring Traps', () => {
    it('does NOT treat "abandoned" column as Done (contains "done" inside "aban-done-d")', () => {
      // "abandoned" is a column for abandoned/stuck tasks, definitely NOT completed!
      const result = isTaskOverdue('2026-11-01', 'abandoned', referenceDate);
      expect(result).toBe(true);
    });

    it('does NOT treat "col-abandoned" column as Done', () => {
      const result = isTaskOverdue('2026-11-01', 'col-abandoned', referenceDate);
      expect(result).toBe(true);
    });

    it('does NOT treat "undone" column as Done ("un-done" means NOT completed)', () => {
      const result = isTaskOverdue('2026-11-01', 'undone', referenceDate);
      expect(result).toBe(true);
    });

    it('does NOT treat "col-undone" column as Done', () => {
      const result = isTaskOverdue('2026-11-01', 'col-undone', referenceDate);
      expect(result).toBe(true);
    });

    it('does NOT treat "not-done-yet" column as Done', () => {
      const result = isTaskOverdue('2026-11-01', 'not-done-yet', referenceDate);
      expect(result).toBe(true);
    });

    it('does NOT treat "not-done" or "not_done" column as Done', () => {
      expect(isTaskOverdue('2026-11-01', 'not-done', referenceDate)).toBe(true);
      expect(isTaskOverdue('2026-11-01', 'not_done', referenceDate)).toBe(true);
    });

    it('does NOT treat "condone" or "redone-needed" as Done', () => {
      expect(isTaskOverdue('2026-11-01', 'condone', referenceDate)).toBe(true);
      expect(isTaskOverdue('2026-11-01', 'redone-needed', referenceDate)).toBe(true);
    });

    it('correctly identifies legitimate Done column variants', () => {
      expect(isTaskOverdue('2026-11-01', 'col-done', referenceDate)).toBe(false);
      expect(isTaskOverdue('2026-11-01', 'done', referenceDate)).toBe(false);
      expect(isTaskOverdue('2026-11-01', 'DONE', referenceDate)).toBe(false);
      expect(isTaskOverdue('2026-11-01', 'Done', referenceDate)).toBe(false);
      expect(isTaskOverdue('2026-11-01', 'col_done', referenceDate)).toBe(false);
    });
  });

  // =========================================================================
  // 2. Impossible Calendar Dates (Semantic Date Validation)
  // =========================================================================
  describe('Impossible Calendar Dates', () => {
    it('rejects February 30th ("2026-02-30") as invalid date and returns false', () => {
      // 2026-02-30 matches \d{4}-\d{2}-\d{2} but does not exist on the calendar!
      const result = isTaskOverdue('2026-02-30', 'col-todo', referenceDate);
      expect(result).toBe(false);
    });

    it('rejects month 13 ("2026-13-01") as invalid date and returns false', () => {
      const result = isTaskOverdue('2026-13-01', 'col-todo', referenceDate);
      expect(result).toBe(false);
    });

    it('rejects day 32 ("2026-01-32") as invalid date and returns false', () => {
      const result = isTaskOverdue('2026-01-32', 'col-todo', referenceDate);
      expect(result).toBe(false);
    });

    it('rejects month 00 or day 00 ("2026-00-10", "2026-05-00") as invalid date', () => {
      expect(isTaskOverdue('2026-00-10', 'col-todo', referenceDate)).toBe(false);
      expect(isTaskOverdue('2026-05-00', 'col-todo', referenceDate)).toBe(false);
    });

    it('rejects April 31st ("2026-04-31") because April has only 30 days', () => {
      const result = isTaskOverdue('2026-04-31', 'col-todo', referenceDate);
      expect(result).toBe(false);
    });

    it('rejects February 29th on non-leap year ("2025-02-29")', () => {
      const result = isTaskOverdue('2025-02-29', 'col-todo', referenceDate);
      expect(result).toBe(false);
    });

    it('accepts February 29th on leap year ("2024-02-29") as a valid past date', () => {
      const result = isTaskOverdue('2024-02-29', 'col-todo', referenceDate);
      expect(result).toBe(true);
    });
  });

  // =========================================================================
  // 3. ISO Datetime & Formatting Quirks
  // =========================================================================
  describe('ISO 8601 Datetime and Formatting Quirks', () => {
    it('handles ISO datetime string ("2026-11-01T15:30:00.000Z") in the past as overdue', () => {
      // In real applications, dueDate might be persisted in ISO 8601 format
      const result = isTaskOverdue('2026-11-01T15:30:00.000Z', 'col-todo', referenceDate);
      expect(result).toBe(true);
    });

    it('handles ISO datetime string ("2026-11-15T09:00:00.000Z") in the future as not overdue', () => {
      const result = isTaskOverdue('2026-11-15T09:00:00.000Z', 'col-todo', referenceDate);
      expect(result).toBe(false);
    });

    it('handles whitespace with tabs and newlines ("  2026-11-01  \\n\\t")', () => {
      const result = isTaskOverdue('  2026-11-01  \n\t', 'col-todo', referenceDate);
      expect(result).toBe(true);
    });

    it('rejects internal whitespace within date string ("2026 - 11 - 01")', () => {
      const result = isTaskOverdue('2026 - 11 - 01', 'col-todo', referenceDate);
      expect(result).toBe(false);
    });

    it('rejects letters inside numeric fields ("2026-1a-01")', () => {
      const result = isTaskOverdue('2026-1a-01', 'col-todo', referenceDate);
      expect(result).toBe(false);
    });
  });

  // =========================================================================
  // 4. Midnight Boundary Transitions
  // =========================================================================
  describe('Midnight Boundary Transitions', () => {
    it('is NOT overdue at 23:59:59.999 on the due date itself', () => {
      const lateTonight = new Date(2026, 10, 6, 23, 59, 59, 999);
      expect(isTaskOverdue('2026-11-06', 'col-todo', lateTonight)).toBe(false);
    });

    it('BECOMES overdue at 00:00:01 of the following day', () => {
      const justPastMidnight = new Date(2026, 10, 7, 0, 0, 1, 0);
      expect(isTaskOverdue('2026-11-06', 'col-todo', justPastMidnight)).toBe(true);
    });

    it('handles leap year day boundary (reference date 2024-03-01, dueDate 2024-02-29)', () => {
      const marchFirst = new Date(2024, 2, 1, 0, 0, 0);
      expect(isTaskOverdue('2024-02-29', 'col-todo', marchFirst)).toBe(true);
    });

    it('handles year change boundary (reference date 2027-01-01, dueDate 2026-12-31)', () => {
      const newYearDay = new Date(2027, 0, 1, 0, 0, 0);
      expect(isTaskOverdue('2026-12-31', 'col-todo', newYearDay)).toBe(true);
    });
  });

  // =========================================================================
  // 5. Extreme Inputs & Defensive Safety
  // =========================================================================
  describe('Defensive Safety and Malicious/Extreme Inputs', () => {
    it('handles 10,000 character string without crashing or freezing (ReDoS safety)', () => {
      const hugeString = '2026-11-01' + 'a'.repeat(10000);
      const startTime = performance.now();
      const result = isTaskOverdue(hugeString, 'col-todo', referenceDate);
      const duration = performance.now() - startTime;

      expect(result).toBe(false);
      expect(duration).toBeLessThan(100); // Must not hang
    });

    it('gracefully handles prototype pollution keys', () => {
      expect(isTaskOverdue('__proto__', 'col-todo', referenceDate)).toBe(false);
      expect(isTaskOverdue('constructor', 'col-todo', referenceDate)).toBe(false);
      expect(isTaskOverdue('2026-11-01', '__proto__', referenceDate)).toBe(true);
    });

    it('gracefully handles XSS payload in dueDate', () => {
      expect(isTaskOverdue('<script>alert("hack")</script>', 'col-todo', referenceDate)).toBe(false);
    });
  });

  // =========================================================================
  // 6. TaskCard Component Integration with Column ID Edge Cases
  // =========================================================================
  describe('TaskCard Component Integration (Adversarial columnIds)', () => {
    it('renders "Quá hạn" badge when task is in "abandoned" column with past dueDate', async () => {
      const task: Task = {
        id: 'task-abandoned-1',
        columnId: 'abandoned',
        title: 'Abandoned Task',
        description: '',
        priority: 'high',
        dueDate: '2020-01-01',
        colorTag: 'rose',
        createdAt: '2020-01-01T00:00:00.000Z',
      };

      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);

      await act(async () => {
        root.render(React.createElement(TaskCard, { task }));
      });

      expect(container.textContent).toContain('Quá hạn');

      await act(async () => {
        root.unmount();
      });
      container.remove();
    });

    it('renders "Quá hạn" badge when task is in "not-done-yet" column with past dueDate', async () => {
      const task: Task = {
        id: 'task-not-done-1',
        columnId: 'not-done-yet',
        title: 'Not Done Yet Task',
        description: '',
        priority: 'medium',
        dueDate: '2020-01-01',
        colorTag: 'sky',
        createdAt: '2020-01-01T00:00:00.000Z',
      };

      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);

      await act(async () => {
        root.render(React.createElement(TaskCard, { task }));
      });

      expect(container.textContent).toContain('Quá hạn');

      await act(async () => {
        root.unmount();
      });
      container.remove();
    });

    it('does NOT render "Quá hạn" badge when dueDate is an impossible date like "2026-02-30"', async () => {
      const task: Task = {
        id: 'task-invalid-date-1',
        columnId: 'col-todo',
        title: 'Invalid Date Task',
        description: '',
        priority: 'low',
        dueDate: '2026-02-30',
        colorTag: 'amber',
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);

      await act(async () => {
        root.render(React.createElement(TaskCard, { task }));
      });

      expect(container.textContent).not.toContain('Quá hạn');

      await act(async () => {
        root.unmount();
      });
      container.remove();
    });
  });
});
