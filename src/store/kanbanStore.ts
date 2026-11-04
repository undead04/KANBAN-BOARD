import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { arrayMove } from '@dnd-kit/sortable';
import type { Column, Task, Priority } from '../types/kanban';
import { INITIAL_COLUMNS, INITIAL_TASKS } from '../data/initialData';

export type NewTaskInput = Omit<Task, 'id' | 'createdAt'>;
export type UpdateTaskInput = Partial<Omit<Task, 'id' | 'createdAt'>>;

interface KanbanState {
  columns: Column[];
  tasks: Task[];

  // Filter state
  searchQuery: string;
  priorityFilter: Priority | 'all';
  tagFilter: string | 'all';

  // Filter actions
  setSearchQuery: (query: string) => void;
  setPriorityFilter: (priority: Priority | 'all') => void;
  setTagFilter: (tag: string | 'all') => void;
  resetFilters: () => void;
  getFilteredTasks: () => Task[];

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

export function filterTasks(
  tasks: Task[],
  searchQuery: string = '',
  priorityFilter: Priority | 'all' = 'all',
  tagFilter: string | 'all' = 'all'
): Task[] {
  const query = (searchQuery || '').trim().toLowerCase();
  const safePriority = priorityFilter || 'all';
  const safeTag = tagFilter || 'all';

  return (tasks || []).filter((task): task is Task => {
    if (!task || typeof task !== 'object') return false;

    // 1. Kiểm tra từ khóa
    if (query) {
      const matchTitle = (task.title || '').toLowerCase().includes(query);
      const matchDescription = (task.description || '')
        .toLowerCase()
        .includes(query);
      if (!matchTitle && !matchDescription) return false;
    }

    // 2. Kiểm tra độ ưu tiên
    if (safePriority !== 'all' && task.priority !== safePriority) {
      return false;
    }

    // 3. Kiểm tra nhãn màu
    if (safeTag !== 'all' && task.colorTag !== safeTag) {
      return false;
    }

    return true;
  });
}

export type KanbanPersistedState = {
  columns: Column[];
  tasks: Task[];
};

export const useKanbanStore = create<KanbanState>()(
  persist<KanbanState, [], [], KanbanPersistedState>(
    (set, get) => ({
      columns: INITIAL_COLUMNS,
      tasks: INITIAL_TASKS,

      // Filter initial state
      searchQuery: '',
      priorityFilter: 'all',
      tagFilter: 'all',

      setSearchQuery: (query: string) => {
        set({ searchQuery: query || '' });
      },

      setPriorityFilter: (priority: Priority | 'all') => {
        set({ priorityFilter: priority || 'all' });
      },

      setTagFilter: (tag: string | 'all') => {
        set({ tagFilter: tag || 'all' });
      },

      resetFilters: () => {
        set({
          searchQuery: '',
          priorityFilter: 'all',
          tagFilter: 'all',
        });
      },

      getFilteredTasks: () => {
        const { tasks = [], searchQuery = '', priorityFilter = 'all', tagFilter = 'all' } = get();
        return filterTasks(tasks, searchQuery, priorityFilter, tagFilter);
      },

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
          tasks: (state.tasks || []).map((task) =>
            task && task.id === id ? { ...task, ...updates } : task
          ),
        }));
      },

      deleteTask: (id: string) => {
        set((state) => ({
          tasks: (state.tasks || []).filter((task) => task && task.id !== id),
        }));
      },

      moveTask: (activeId: string, overId: string) => {
        if (!activeId || !overId || activeId === overId) return;

        set((state) => {
          const tasks = state.tasks || [];
          const columns = state.columns || [];
          const activeTask = tasks.find((t) => t && t.id === activeId);
          if (!activeTask) return state;

          // Trường hợp 1: Thả lên trên một Task khác
          const overTask = tasks.find((t) => t && t.id === overId);
          if (overTask) {
            const activeIndex = tasks.findIndex((t) => t && t.id === activeId);
            const overIndex = tasks.findIndex((t) => t && t.id === overId);

            if (activeIndex === -1 || overIndex === -1) return state;

            // Cùng cột: chỉ sắp xếp lại vị trí
            if (activeTask.columnId === overTask.columnId) {
              return {
                tasks: arrayMove(tasks, activeIndex, overIndex),
              };
            }

            // Khác cột: cập nhật columnId và đưa vào vị trí overIndex
            const updatedTask = { ...activeTask, columnId: overTask.columnId };
            const newTasks = [...tasks];
            newTasks[activeIndex] = updatedTask;
            return {
              tasks: arrayMove(newTasks, activeIndex, overIndex),
            };
          }

          // Trường hợp 2: Thả vào một Column (ví dụ: cột rỗng hoặc vùng đệm cột)
          const overColumn = columns.find((c) => c && c.id === overId);
          if (overColumn) {
            if (activeTask.columnId === overColumn.id) return state;

            const updatedTask = { ...activeTask, columnId: overColumn.id };
            const filtered = tasks.filter((t) => t && t.id !== activeId);

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
        const trimmedTitle = (title || '').trim();
        if (!trimmedTitle) return;

        set((state) => {
          const columns = state.columns || [];
          const maxOrder =
            columns.length > 0
              ? Math.max(...columns.map((c) => (c ? c.order : 0)))
              : 0;

          const newColumn: Column = {
            id: `col-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            title: trimmedTitle,
            order: maxOrder + 1,
          };

          return {
            columns: [...columns, newColumn],
          };
        });
      },

      updateColumn: (id: string, title: string) => {
        const trimmedTitle = (title || '').trim();
        if (!trimmedTitle) return;

        set((state) => ({
          columns: (state.columns || []).map((col) =>
            col && col.id === id ? { ...col, title: trimmedTitle } : col
          ),
        }));
      },

      deleteColumn: (id: string) => {
        set((state) => ({
          columns: (state.columns || []).filter((col) => col && col.id !== id),
          tasks: (state.tasks || []).filter((task) => task && task.columnId !== id),
        }));
      },

      resetToInitialData: () => {
        set({
          columns: INITIAL_COLUMNS,
          tasks: INITIAL_TASKS,
          searchQuery: '',
          priorityFilter: 'all',
          tagFilter: 'all',
        });
      },
    }),
    {
      name: 'kanban-board-storage',
      // Chỉ lưu trữ columns và tasks vào localStorage, filter là session-state
      partialize: (state) => ({
        columns: state.columns,
        tasks: state.tasks,
      }),
      merge: (persistedState: unknown, currentState: KanbanState) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return {
            ...currentState,
            searchQuery: '',
            priorityFilter: 'all',
            tagFilter: 'all',
          };
        }

        const typedPersisted = persistedState as Partial<KanbanState>;

        const validColumns = Array.isArray(typedPersisted.columns)
          ? typedPersisted.columns.filter(
              (c): c is Column =>
                Boolean(c && typeof c === 'object' && c.id && c.title)
            )
          : null;

        const validTasks = Array.isArray(typedPersisted.tasks)
          ? typedPersisted.tasks
              .filter(
                (t): t is Task =>
                  Boolean(t && typeof t === 'object' && t.id && t.columnId && t.title)
              )
              .map((t) => ({
                ...t,
                priority: t.priority || 'medium',
                colorTag: t.colorTag || 'sky',
                description: t.description || '',
              }))
          : null;

        return {
          ...currentState,
          columns:
            validColumns && validColumns.length > 0
              ? validColumns
              : currentState.columns,
          tasks: validTasks !== null ? validTasks : currentState.tasks,
          // Đảm bảo các trường filter luôn có giá trị mặc định hợp lệ khi nạp từ storage cũ
          searchQuery: '',
          priorityFilter: 'all',
          tagFilter: 'all',
        };
      },
    }
  )
);
