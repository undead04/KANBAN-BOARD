import { describe, it, expect, beforeEach } from 'vitest';
import { useKanbanStore } from '../kanbanStore';
import { INITIAL_COLUMNS, INITIAL_TASKS } from '../../data/initialData';

describe('kanbanStore - Column CRUD (Milestone 4 - Spec-Driven Tests)', () => {
  beforeEach(() => {
    // Reset store before each test
    useKanbanStore.getState().resetToInitialData();
  });

  // ==========================================
  // NHÓM 1: HAPPY PATH (LUỒNG CHUẨN)
  // ==========================================
  describe('Nhóm 1: Happy Path', () => {
    it('thêm cột mới với tiêu đề hợp lệ thành công và đặt ở cuối bảng', () => {
      const initialCount = useKanbanStore.getState().columns.length;
      useKanbanStore.getState().addColumn('Testing');

      const columns = useKanbanStore.getState().columns;
      expect(columns.length).toBe(initialCount + 1);

      const newCol = columns[columns.length - 1];
      expect(newCol.title).toBe('Testing');
      expect(newCol.id).toBeDefined();
      expect(newCol.order).toBeGreaterThanOrEqual(columns[0].order);
    });

    it('cập nhật đổi tên cột thành công', () => {
      const targetColumn = useKanbanStore.getState().columns[0];
      const oldTitle = targetColumn.title;
      const newTitle = 'Ý tưởng mới';

      useKanbanStore.getState().updateColumn(targetColumn.id, newTitle);

      const updatedColumn = useKanbanStore
        .getState()
        .columns.find((c) => c.id === targetColumn.id);

      expect(updatedColumn?.title).toBe(newTitle);
      expect(updatedColumn?.title).not.toBe(oldTitle);
    });

    it('xóa cột thành công và đồng thời dọn dẹp tất cả các task thuộc cột đó', () => {
      const targetColumn = useKanbanStore.getState().columns[0];
      const columnId = targetColumn.id;

      // Đảm bảo cột có task
      const tasksInTargetColumn = useKanbanStore
        .getState()
        .tasks.filter((t) => t.columnId === columnId);
      expect(tasksInTargetColumn.length).toBeGreaterThan(0);

      const otherColumnTasksCount = useKanbanStore
        .getState()
        .tasks.filter((t) => t.columnId !== columnId).length;

      // Xóa cột
      useKanbanStore.getState().deleteColumn(columnId);

      // Cột phải bị xóa
      const remainingColumns = useKanbanStore.getState().columns;
      expect(remainingColumns.find((c) => c.id === columnId)).toBeUndefined();

      // Toàn bộ task trong cột bị xóa, task cột khác còn nguyên
      const remainingTasks = useKanbanStore.getState().tasks;
      expect(remainingTasks.some((t) => t.columnId === columnId)).toBe(false);
      expect(remainingTasks.length).toBe(otherColumnTasksCount);
    });
  });

  // ==========================================
  // NHÓM 2: BOUNDARY & EDGE CASES (DỮ LIỆU BIÊN & BẨN)
  // ==========================================
  describe('Nhóm 2: Boundary & Edge Cases', () => {
    it('không thêm cột khi tiêu đề rỗng hoặc chỉ có khoảng trắng', () => {
      const countBefore = useKanbanStore.getState().columns.length;

      useKanbanStore.getState().addColumn('');
      useKanbanStore.getState().addColumn('    ');

      expect(useKanbanStore.getState().columns.length).toBe(countBefore);
    });

    it('loại bỏ khoảng trắng thừa ở đầu/cuối tiêu đề cột (trim)', () => {
      useKanbanStore.getState().addColumn('   QA Review   ');
      const columns = useKanbanStore.getState().columns;
      const added = columns[columns.length - 1];
      expect(added.title).toBe('QA Review');
    });

    it('không cập nhật tên cột nếu tên mới rỗng hoặc toàn khoảng trắng', () => {
      const targetColumn = useKanbanStore.getState().columns[0];
      const originalTitle = targetColumn.title;

      useKanbanStore.getState().updateColumn(targetColumn.id, '');
      useKanbanStore.getState().updateColumn(targetColumn.id, '    ');

      const colAfter = useKanbanStore
        .getState()
        .columns.find((c) => c.id === targetColumn.id);
      expect(colAfter?.title).toBe(originalTitle);
    });

    it('không xảy ra lỗi khi cập nhật hoặc xóa cột với ID không tồn tại', () => {
      const columnsBefore = [...useKanbanStore.getState().columns];
      const tasksBefore = [...useKanbanStore.getState().tasks];

      expect(() => {
        useKanbanStore.getState().updateColumn('non-existent-id', 'Test Title');
        useKanbanStore.getState().deleteColumn('non-existent-id');
      }).not.toThrow();

      expect(useKanbanStore.getState().columns).toEqual(columnsBefore);
      expect(useKanbanStore.getState().tasks).toEqual(tasksBefore);
    });

    it('xóa cột khi cột không có task nào diễn ra trơn tru', () => {
      // Tạo một cột rỗng không có task
      useKanbanStore.getState().addColumn('Empty Column');
      const emptyCol = useKanbanStore.getState().columns.slice(-1)[0];

      expect(() => {
        useKanbanStore.getState().deleteColumn(emptyCol.id);
      }).not.toThrow();

      expect(
        useKanbanStore.getState().columns.find((c) => c.id === emptyCol.id)
      ).toBeUndefined();
    });
  });

  // ==========================================
  // NHÓM 3: STATE MUTATION & RACE CONDITION (TÍNH TOÀN VẸN DỮ LIỆU)
  // ==========================================
  describe('Nhóm 3: State Mutation & Race Condition', () => {
    it('đảm bảo tính bất biến (immutability) khi thêm, sửa, xóa cột', () => {
      const stateBefore = useKanbanStore.getState();
      const originalColumnsRef = stateBefore.columns;

      useKanbanStore.getState().addColumn('Immutability Test');
      const stateAfterAdd = useKanbanStore.getState();
      expect(stateAfterAdd.columns).not.toBe(originalColumnsRef);

      const addedCol = stateAfterAdd.columns[stateAfterAdd.columns.length - 1];
      const refBeforeUpdate = stateAfterAdd.columns;
      useKanbanStore.getState().updateColumn(addedCol.id, 'Updated Title');
      const stateAfterUpdate = useKanbanStore.getState();
      expect(stateAfterUpdate.columns).not.toBe(refBeforeUpdate);

      const refBeforeDelete = stateAfterUpdate.columns;
      useKanbanStore.getState().deleteColumn(addedCol.id);
      const stateAfterDelete = useKanbanStore.getState();
      expect(stateAfterDelete.columns).not.toBe(refBeforeDelete);
    });

    it('thêm nhiều cột liên tiếp sinh ra các ID duy nhất và order tăng dần', () => {
      const names = ['Sprint 1', 'Sprint 2', 'Sprint 3'];
      names.forEach((name) => useKanbanStore.getState().addColumn(name));

      const columns = useKanbanStore.getState().columns;
      const ids = columns.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);

      const addedCols = columns.slice(-3);
      expect(addedCols[0].order).toBeLessThan(addedCols[1].order);
      expect(addedCols[1].order).toBeLessThan(addedCols[2].order);
    });
  });

  // ==========================================
  // NHÓM 4: PERSISTENCE (LƯU TRỮ LOCALSTORAGE)
  // ==========================================
  describe('Nhóm 4: Persistence Test', () => {
    it('resetToInitialData khôi phục lại đúng số lượng cột và task mẫu ban đầu', () => {
      useKanbanStore.getState().addColumn('Temp 1');
      useKanbanStore.getState().addColumn('Temp 2');
      useKanbanStore.getState().deleteColumn(INITIAL_COLUMNS[0].id);

      useKanbanStore.getState().resetToInitialData();

      expect(useKanbanStore.getState().columns.length).toBe(INITIAL_COLUMNS.length);
      expect(useKanbanStore.getState().tasks.length).toBe(INITIAL_TASKS.length);
    });
  });
});
