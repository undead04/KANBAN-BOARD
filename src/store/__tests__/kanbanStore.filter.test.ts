import { describe, it, expect, beforeEach } from 'vitest';
import { useKanbanStore, filterTasks } from '../kanbanStore';

describe('kanbanStore - Search & Filters (Milestone 6 - Spec-Driven Tests)', () => {
  beforeEach(() => {
    useKanbanStore.getState().resetToInitialData();
    useKanbanStore.getState().resetFilters();
  });

  // ==========================================
  // NHÓM 1: HAPPY PATH (LUỒNG CHUẨN)
  // ==========================================
  describe('Nhóm 1: Happy Path', () => {
    it('lọc công việc theo từ khóa tìm kiếm trong tiêu đề hoặc mô tả (case-insensitive)', () => {
      // Tìm từ khóa 'Kiến trúc' (xuất hiện trong task-1 và task-5)
      useKanbanStore.getState().setSearchQuery('kiến trúc');

      const filtered = useKanbanStore.getState().getFilteredTasks();
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((task) => {
        const text = `${task.title} ${task.description}`.toLowerCase();
        expect(text).toContain('kiến trúc');
      });
    });

    it('lọc công việc theo độ ưu tiên (priority)', () => {
      useKanbanStore.getState().setPriorityFilter('high');

      const filtered = useKanbanStore.getState().getFilteredTasks();
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((task) => {
        expect(task.priority).toBe('high');
      });
    });

    it('lọc công việc theo nhãn màu (tag)', () => {
      useKanbanStore.getState().setTagFilter('rose');

      const filtered = useKanbanStore.getState().getFilteredTasks();
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((task) => {
        expect(task.colorTag).toBe('rose');
      });
    });

    it('kết hợp đồng thời cả 3 bộ lọc (searchQuery + priority + tagFilter)', () => {
      // Thêm 1 task đặc biệt để kiểm tra kết hợp
      useKanbanStore.getState().addTask({
        title: 'Thử nghiệm tích hợp Search Filter',
        description: 'Đảm bảo cả 3 điều kiện cùng thỏa mãn',
        columnId: 'col-todo',
        priority: 'high',
        colorTag: 'amber',
      });

      useKanbanStore.getState().setSearchQuery('Thử nghiệm');
      useKanbanStore.getState().setPriorityFilter('high');
      useKanbanStore.getState().setTagFilter('amber');

      const filtered = useKanbanStore.getState().getFilteredTasks();
      expect(filtered.length).toBe(1);
      expect(filtered[0].title).toBe('Thử nghiệm tích hợp Search Filter');
    });

    it('resetFilters khôi phục lại toàn bộ bộ lọc về trạng thái ban đầu', () => {
      useKanbanStore.getState().setSearchQuery('random query');
      useKanbanStore.getState().setPriorityFilter('high');
      useKanbanStore.getState().setTagFilter('rose');

      useKanbanStore.getState().resetFilters();

      const state = useKanbanStore.getState();
      expect(state.searchQuery).toBe('');
      expect(state.priorityFilter).toBe('all');
      expect(state.tagFilter).toBe('all');
      expect(state.getFilteredTasks().length).toBe(state.tasks.length);
    });
  });

  // ==========================================
  // NHÓM 2: BOUNDARY & EDGE CASES (DỮ LIỆU BIÊN & BẨN)
  // ==========================================
  describe('Nhóm 2: Boundary & Edge Cases', () => {
    it('tự động trim khoảng trắng khi tìm kiếm từ khóa', () => {
      useKanbanStore.getState().setSearchQuery('   Dark Mode   ');

      const filtered = useKanbanStore.getState().getFilteredTasks();
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((task) => {
        const text = `${task.title} ${task.description}`.toLowerCase();
        expect(text).toContain('dark mode');
      });
    });

    it('trả về mảng rỗng khi không có thẻ nào khớp với từ khóa', () => {
      useKanbanStore.getState().setSearchQuery('Từ khóa hoàn toàn không tồn tại 123456');

      const filtered = useKanbanStore.getState().getFilteredTasks();
      expect(filtered).toEqual([]);
    });

    it('xử lý an toàn khi từ khóa chứa các ký tự đặc biệt của regex', () => {
      expect(() => {
        useKanbanStore.getState().setSearchQuery('.*+?^${}()|[]\\');
        useKanbanStore.getState().getFilteredTasks();
      }).not.toThrow();
    });

    it('khi priorityFilter hoặc tagFilter là "all" thì không hạn chế kết quả', () => {
      useKanbanStore.getState().setPriorityFilter('all');
      useKanbanStore.getState().setTagFilter('all');

      const filtered = useKanbanStore.getState().getFilteredTasks();
      expect(filtered.length).toBe(useKanbanStore.getState().tasks.length);
    });
  });

  // ==========================================
  // NHÓM 3: STATE MUTATION & INTEGRITY (TÍNH TOÀN VẸN DỮ LIỆU)
  // ==========================================
  describe('Nhóm 3: State Mutation & Integrity', () => {
    it('bộ lọc không làm thay đổi hay mutate mảng tasks gốc trong store', () => {
      const originalTasksCount = useKanbanStore.getState().tasks.length;

      useKanbanStore.getState().setSearchQuery('abcxyz');
      expect(useKanbanStore.getState().getFilteredTasks().length).toBe(0);
      expect(useKanbanStore.getState().tasks.length).toBe(originalTasksCount);
    });

    it('thêm task mới trong khi đang áp dụng filter vẫn lưu đúng vào store', () => {
      useKanbanStore.getState().setPriorityFilter('high');

      useKanbanStore.getState().addTask({
        title: 'Task mới lúc đang filter',
        description: 'Mô tả',
        columnId: 'col-todo',
        priority: 'high',
        colorTag: 'sky',
      });

      const filtered = useKanbanStore.getState().getFilteredTasks();
      expect(filtered.some((t) => t.title === 'Task mới lúc đang filter')).toBe(true);
    });
  });

  // ==========================================
  // NHÓM 4: PERSISTENCE (LƯU TRỮ VÀ KHÔI PHỤC)
  // ==========================================
  describe('Nhóm 4: Persistence Test', () => {
    it('resetToInitialData đồng thời đặt lại các bộ lọc về mặc định', () => {
      useKanbanStore.getState().setSearchQuery('Something');
      useKanbanStore.getState().setPriorityFilter('low');
      useKanbanStore.getState().setTagFilter('purple');

      useKanbanStore.getState().resetToInitialData();

      const state = useKanbanStore.getState();
      expect(state.searchQuery).toBe('');
      expect(state.priorityFilter).toBe('all');
      expect(state.tagFilter).toBe('all');
    });

    it('filterTasks xử lý an toàn khi các giá trị lọc bị undefined hoặc null (không ném TypeError trim)', () => {
      const allTasks = useKanbanStore.getState().tasks;
      const resultUndefined = filterTasks(allTasks, undefined, undefined, undefined);
      expect(resultUndefined.length).toBe(allTasks.length);

      const resultNull = filterTasks(allTasks, null as unknown as string, null as unknown as 'all', null as unknown as string);
      expect(resultNull.length).toBe(allTasks.length);

      // Thẻ có description hoặc title rỗng
      const tasksWithMissingFields = [
        {
          id: 'test-1',
          columnId: 'col-1',
          title: 'Title only',
          description: '',
          priority: 'low' as const,
          colorTag: 'sky',
          createdAt: '',
        },
      ];
      expect(filterTasks(tasksWithMissingFields, 'title').length).toBe(1);
    });
  });
});


