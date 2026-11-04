import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Column, Task } from '../types/kanban';
import { INITIAL_COLUMNS, INITIAL_TASKS } from '../data/initialData';

interface KanbanState {
  columns: Column[];
  tasks: Task[];
  resetToInitialData: () => void;
}

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set) => ({
      columns: INITIAL_COLUMNS,
      tasks: INITIAL_TASKS,

      resetToInitialData: () => {
        set({
          columns: INITIAL_COLUMNS,
          tasks: INITIAL_TASKS,
        });
      },
    }),
    {
      name: 'kanban-board-storage',
    }
  )
);
