import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { arrayMove } from '@dnd-kit/sortable';
import type { Column, Task } from '../types/kanban';
import { INITIAL_COLUMNS, INITIAL_TASKS } from '../data/initialData';

export type NewTaskInput = Omit<Task, 'id' | 'createdAt'>;
export type UpdateTaskInput = Partial<Omit<Task, 'id' | 'createdAt'>>;

interface KanbanState {
  columns: Column[];
  tasks: Task[];
  // Task actions
  addTask: (taskData: NewTaskInput) => void;
  updateTask: (id: string, updates: UpdateTaskInput) => void;
  deleteTask: (id: string) => void;
  moveTask: (activeId: string, overId: string) => void;
  // Column actions
  addColumn: (title: string) => void;
  updateColumn: (id: string, title: string) => void;
  deleteColumn: (id: string) => void;
  // Reset
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

      moveTask: (activeId: string, overId: string) => {
        if (activeId === overId) return;

        set((state) => {
          const activeTask = state.tasks.find((t) => t.id === activeId);
          if (!activeTask) return state;

          // Trường hợp 1: Thả lên trên một Task khác
          const overTask = state.tasks.find((t) => t.id === overId);
          if (overTask) {
            const activeIndex = state.tasks.findIndex((t) => t.id === activeId);
            const overIndex = state.tasks.findIndex((t) => t.id === overId);

            // Cùng cột: chỉ sắp xếp lại vị trí
            if (activeTask.columnId === overTask.columnId) {
              return {
                tasks: arrayMove(state.tasks, activeIndex, overIndex),
              };
            }

            // Khác cột: cập nhật columnId và đưa vào vị trí overIndex
            const updatedTask = { ...activeTask, columnId: overTask.columnId };
            const newTasks = [...state.tasks];
            newTasks[activeIndex] = updatedTask;
            return {
              tasks: arrayMove(newTasks, activeIndex, overIndex),
            };
          }

          // Trường hợp 2: Thả vào một Column (ví dụ: cột rỗng hoặc vùng đệm cột)
          const overColumn = state.columns.find((c) => c.id === overId);
          if (overColumn) {
            if (activeTask.columnId === overColumn.id) return state;

            const updatedTask = { ...activeTask, columnId: overColumn.id };
            const filtered = state.tasks.filter((t) => t.id !== activeId);

            // Tìm vị trí thẻ cuối cùng của cột đích để chèn vào sau
            const lastIndexInColumn = filtered
              .map((t) => t.columnId)
              .lastIndexOf(overColumn.id);

            if (lastIndexInColumn !== -1) {
              filtered.splice(lastIndexInColumn + 1, 0, updatedTask);
            } else {
              filtered.push(updatedTask);
            }

            return {
              tasks: filtered,
            };
          }

          return state;
        });
      },

      addColumn: (title: string) => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) return;

        set((state) => {
          const maxOrder =
            state.columns.length > 0
              ? Math.max(...state.columns.map((c) => c.order))
              : 0;

          const newColumn: Column = {
            id: `col-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            title: trimmedTitle,
            order: maxOrder + 1,
          };

          return {
            columns: [...state.columns, newColumn],
          };
        });
      },

      updateColumn: (id: string, title: string) => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) return;

        set((state) => ({
          columns: state.columns.map((col) =>
            col.id === id ? { ...col, title: trimmedTitle } : col
          ),
        }));
      },

      deleteColumn: (id: string) => {
        set((state) => ({
          columns: state.columns.filter((col) => col.id !== id),
          tasks: state.tasks.filter((task) => task.columnId !== id),
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
