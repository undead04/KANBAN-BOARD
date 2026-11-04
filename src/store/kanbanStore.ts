import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Column, Task } from '../types/kanban';
import { INITIAL_COLUMNS, INITIAL_TASKS } from '../data/initialData';

export type NewTaskInput = Omit<Task, 'id' | 'createdAt'>;
export type UpdateTaskInput = Partial<Omit<Task, 'id' | 'createdAt'>>;

interface KanbanState {
  columns: Column[];
  tasks: Task[];
  addTask: (taskData: NewTaskInput) => void;
  updateTask: (id: string, updates: UpdateTaskInput) => void;
  deleteTask: (id: string) => void;
  resetToInitialData: () => void;
}

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set) => ({
      columns: INITIAL_COLUMNS,
      tasks: INITIAL_TASKS,

      addTask: (taskData: NewTaskInput) => {
        const newTask: Task = {
          ...taskData,
          id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },

      updateTask: (id: string, updates: UpdateTaskInput) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
      },

      deleteTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

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
