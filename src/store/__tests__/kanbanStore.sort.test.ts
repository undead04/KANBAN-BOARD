import { describe, it, expect, beforeEach } from 'vitest';
import { useKanbanStore, PRIORITY_WEIGHT } from '../kanbanStore';
import { INITIAL_COLUMNS } from '../../data/initialData';

describe('kanbanStore - Priority Sorting (Spec-Driven Tests)', () => {
  beforeEach(() => {
    useKanbanStore.getState().resetToInitialData();
    useKanbanStore.getState().resetFilters();
  });

  // ==========================================
  // NHÓM 1: HAPPY PATH (LUỒNG CHUẨN)
  // ==========================================
  describe('Nhóm 1: Happy Path', () => {
    it('sắp xếp vĩnh viễn các thẻ trong cột theo độ ưu tiên: Cao -> Thấp', () => {
      useKanbanStore.getState().addColumn('Cột test sort');
      const newCol = useKanbanStore.getState().columns.slice(-1)[0];

      // Thêm 3 task với thứ tự ngẫu nhiên: Low -> High -> Medium
      useKanbanStore.getState().addTask({
        title: 'Task Low',
        description: 'Mô tả',
        columnId: newCol.id,
        priority: 'low',
        colorTag: 'emerald',
      });
      useKanbanStore.getState().addTask({
        title: 'Task High',
        description: 'Mô tả',
        columnId: newCol.id,
        priority: 'high',
        colorTag: 'rose',
      });
      useKanbanStore.getState().addTask({
        title: 'Task Medium',
        description: 'Mô tả',
        columnId: newCol.id,
        priority: 'medium',
        colorTag: 'amber',
      });

      // Gọi sắp xếp theo độ ưu tiên giảm dần
      useKanbanStore.getState().sortColumnByPriority(newCol.id, 'desc');

      const tasksAfter = useKanbanStore
        .getState()
        .tasks.filter((t) => t.columnId === newCol.id);

      expect(tasksAfter[0].priority).toBe('high');
      expect(tasksAfter[1].priority).toBe('medium');
      expect(tasksAfter[2].priority).toBe('low');
    });

    it('bộ lọc sortBy="priority-desc" hiển thị thẻ ưu tiên cao lên đầu', () => {
      useKanbanStore.getState().setSortBy('priority-desc');

      const filtered = useKanbanStore.getState().getFilteredTasks();
      for (let i = 0; i < filtered.length - 1; i++) {
        const weightCurrent = PRIORITY_WEIGHT[filtered[i].priority] ?? 0;
        const weightNext = PRIORITY_WEIGHT[filtered[i + 1].priority] ?? 0;
        expect(weightCurrent).toBeGreaterThanOrEqual(weightNext);
      }
    });

    it('bộ lọc sortBy="priority-asc" hiển thị thẻ ưu tiên thấp lên đầu', () => {
      useKanbanStore.getState().setSortBy('priority-asc');

      const filtered = useKanbanStore.getState().getFilteredTasks();
      for (let i = 0; i < filtered.length - 1; i++) {
        const weightCurrent = PRIORITY_WEIGHT[filtered[i].priority] ?? 0;
        const weightNext = PRIORITY_WEIGHT[filtered[i + 1].priority] ?? 0;
        expect(weightCurrent).toBeLessThanOrEqual(weightNext);
      }
    });
  });

  // ==========================================
  // NHÓM 2: BOUNDARY & EDGE CASES (DỮ LIỆU BIÊN & BẨN)
  // ==========================================
  describe('Nhóm 2: Boundary & Edge Cases', () => {
    it('sắp xếp cột rỗng hoặc cột chỉ có 1 thẻ không gây ra lỗi', () => {
      const colId = INITIAL_COLUMNS[0].id;
      expect(() => {
        useKanbanStore.getState().sortColumnByPriority(colId, 'desc');
      }).not.toThrow();
    });

    it('gọi sortColumnByPriority với ID không tồn tại không làm hỏng state', () => {
      const tasksBefore = [...useKanbanStore.getState().tasks];
      expect(() => {
        useKanbanStore.getState().sortColumnByPriority('non-existent-col', 'desc');
      }).not.toThrow();
      expect(useKanbanStore.getState().tasks).toEqual(tasksBefore);
    });

    it('sắp xếp theo hạn chót (dueDate): thẻ có hạn chót sớm hơn lên trước', () => {
      useKanbanStore.getState().setSortBy('dueDate');
      const filtered = useKanbanStore.getState().getFilteredTasks();

      // Những thẻ có dueDate xuất hiện trước
      const withDueDate = filtered.filter((t) => !!t.dueDate);
      for (let i = 0; i < withDueDate.length - 1; i++) {
        expect(new Date(withDueDate[i].dueDate!).getTime()).toBeLessThanOrEqual(
          new Date(withDueDate[i + 1].dueDate!).getTime()
        );
      }
    });
  });

  // ==========================================
  // NHÓM 3: STATE MUTATION & INTEGRITY
  // ==========================================
  describe('Nhóm 3: State Mutation & Integrity', () => {
    it('sắp xếp cột A không làm thay đổi thứ tự hay số lượng task của cột B', () => {
      const colA = INITIAL_COLUMNS[1].id;
      const colB = INITIAL_COLUMNS[2].id;

      const tasksBBefore = useKanbanStore
        .getState()
        .tasks.filter((t) => t.columnId === colB);

      useKanbanStore.getState().sortColumnByPriority(colA, 'desc');

      const tasksBAfter = useKanbanStore
        .getState()
        .tasks.filter((t) => t.columnId === colB);

      expect(tasksBAfter).toEqual(tasksBBefore);
    });

    it('tổng số lượng task trên toàn board không bị thay đổi sau khi sắp xếp', () => {
      const totalBefore = useKanbanStore.getState().tasks.length;
      useKanbanStore.getState().sortColumnByPriority(INITIAL_COLUMNS[1].id, 'desc');
      expect(useKanbanStore.getState().tasks.length).toBe(totalBefore);
    });
  });

  // ==========================================
  // NHÓM 4: PERSISTENCE (LƯU TRỮ VÀ KHÔI PHỤC)
  // ==========================================
  describe('Nhóm 4: Persistence Test', () => {
    it('resetFilters đặt lại sortBy về "manual"', () => {
      useKanbanStore.getState().setSortBy('priority-desc');
      useKanbanStore.getState().resetFilters();
      expect(useKanbanStore.getState().sortBy).toBe('manual');
    });
  });
});
