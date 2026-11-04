// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';
import { useKanbanStore } from './store/kanbanStore';

// @ts-expect-error React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('App & Board UI Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    useKanbanStore.getState().resetToInitialData();
  });

  it('renders App without throwing an error and displays all default columns', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<App />);
    });

    // Header & Brand
    expect(container.innerHTML).toContain('Kanban Flow');
    // Default columns
    expect(container.innerHTML).toContain('Backlog');
    expect(container.innerHTML).toContain('To Do');
    expect(container.innerHTML).toContain('In Progress');
    expect(container.innerHTML).toContain('Done');
    // Search input
    expect(container.querySelector('input[placeholder*="Tìm theo tiêu đề"]')).not.toBeNull();

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('safely rehydrates from legacy localStorage (without filter properties) without blank screen crash', async () => {
    // Simulate localStorage from Milestone 5 (only columns and tasks saved)
    const legacyState = {
      state: {
        columns: [
          { id: 'col-1', title: 'Legacy Column', order: 0 }
        ],
        tasks: [
          {
            id: 'legacy-task-1',
            columnId: 'col-1',
            title: 'Legacy Task Title',
            description: 'Legacy task description',
            priority: 'high',
            colorTag: 'rose',
            createdAt: '2026-01-01T00:00:00.000Z',
          }
        ]
      },
      version: 0
    };
    localStorage.setItem('kanban-board-storage', JSON.stringify(legacyState));

    // Rehydrate
    await act(async () => {
      useKanbanStore.persist.rehydrate();
    });

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<App />);
    });

    expect(container.innerHTML).toContain('Legacy Column');
    expect(container.innerHTML).toContain('Legacy Task Title');

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('handles searching and filtering smoothly in UI', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<App />);
    });

    // Type into search input
    const searchInput = container.querySelector('input[placeholder*="Tìm theo tiêu đề"]') as HTMLInputElement;
    expect(searchInput).not.toBeNull();

    await act(async () => {
      useKanbanStore.getState().setSearchQuery('@dnd-kit');
    });

    expect(container.innerHTML).toContain('Nghiên cứu kiến trúc @dnd-kit');
    // Task 2 should be filtered out
    expect(container.innerHTML).not.toContain('Thiết kế giao diện Dark Mode');

    // Reset filters
    await act(async () => {
      useKanbanStore.getState().resetFilters();
    });

    expect(container.innerHTML).toContain('Thiết kế giao diện Dark Mode');

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('safely handles corrupted null/empty columns and tasks in localStorage without crash', async () => {
    localStorage.setItem('kanban-board-storage', JSON.stringify({
      state: {
        columns: null,
        tasks: null
      },
      version: 0
    }));

    await act(async () => {
      useKanbanStore.persist.rehydrate();
    });

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<App />);
    });

    expect(container.innerHTML).toContain('Kanban Flow');
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('safely handles non-array / primitive types in localStorage without crash', async () => {
    localStorage.setItem('kanban-board-storage', JSON.stringify({
      state: {
        columns: 'not-an-array',
        tasks: 12345
      },
      version: 0
    }));

    await act(async () => {
      useKanbanStore.persist.rehydrate();
    });

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<App />);
    });

    expect(container.innerHTML).toContain('Kanban Flow');
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('safely handles null elements in tasks array without blank screen', async () => {
    localStorage.setItem('kanban-board-storage', JSON.stringify({
      state: {
        columns: [{ id: 'col-1', title: 'Column 1', order: 0 }],
        tasks: [
          null,
          {
            id: 'task-valid',
            columnId: 'col-1',
            title: 'Valid Task',
            description: '',
            priority: 'low',
            colorTag: 'sky',
            createdAt: ''
          },
          undefined
        ]
      },
      version: 0
    }));

    await act(async () => {
      useKanbanStore.persist.rehydrate();
    });

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<App />);
    });

    expect(container.innerHTML).toContain('Valid Task');
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
