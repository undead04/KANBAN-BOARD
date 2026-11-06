// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect } from 'vitest';
import { TaskCard } from '../TaskCard';
import type { Task } from '../../../types/kanban';

// @ts-expect-error React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('TaskCard Component - Overdue Warning', () => {
  const baseTask: Task = {
    id: 'task-test-1',
    columnId: 'col-todo',
    title: 'Test Overdue Task',
    description: 'This is a test description',
    priority: 'medium',
    dueDate: '2020-01-01', // definitely in the past
    colorTag: 'sky',
    createdAt: '2020-01-01T00:00:00.000Z',
  };

  it('renders overdue badge and red footer date when task is overdue', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<TaskCard task={baseTask} />);
    });

    expect(container.textContent).toContain('Quá hạn');
    const dueDateEl = Array.from(container.querySelectorAll('span')).find((el) =>
      el.textContent?.includes('2020-01-01')
    );
    expect(dueDateEl?.className).toContain('text-rose-600');
    expect(dueDateEl?.className).toContain('font-semibold');

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('does NOT render overdue badge if task is in Done column', async () => {
    const doneTask: Task = {
      ...baseTask,
      columnId: 'col-done',
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<TaskCard task={doneTask} />);
    });

    expect(container.textContent).not.toContain('Quá hạn');
    const dueDateEl = Array.from(container.querySelectorAll('span')).find((el) =>
      el.textContent?.includes('2020-01-01')
    );
    expect(dueDateEl?.className).not.toContain('text-rose-600');
    expect(dueDateEl?.className).toContain('text-slate-500');

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('does NOT render overdue badge if dueDate is far in the future', async () => {
    const futureTask: Task = {
      ...baseTask,
      dueDate: '2099-12-31',
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<TaskCard task={futureTask} />);
    });

    expect(container.textContent).not.toContain('Quá hạn');
    const dueDateEl = Array.from(container.querySelectorAll('span')).find((el) =>
      el.textContent?.includes('2099-12-31')
    );
    expect(dueDateEl?.className).not.toContain('text-rose-600');
    expect(dueDateEl?.className).toContain('text-slate-500');

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('renders overdue badge in isOverlay preview mode', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<TaskCard task={baseTask} isOverlay={true} />);
    });

    expect(container.textContent).toContain('Quá hạn');
    const dueDateEl = Array.from(container.querySelectorAll('span')).find((el) =>
      el.textContent?.includes('2020-01-01')
    );
    expect(dueDateEl?.className).toContain('text-rose-600');
    expect(dueDateEl?.className).toContain('font-semibold');

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
