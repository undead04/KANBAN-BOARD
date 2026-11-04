import { describe, it, expect, beforeEach } from 'vitest';
import { useKanbanStore } from '../kanbanStore';
import { INITIAL_COLUMNS } from '../../data/initialData';

describe('kanbanStore - Drag & Drop Task Movement (Milestone 5 - Spec-Driven Tests)', () => {
  beforeEach(() => {
    useKanbanStore.getState().resetToInitialData();
  });

  // ==========================================
  // NHÓM 1: HAPPY PATH (LUỒNG CHUẨN)
  // ==========================================
  describe('Nhóm 1: Happy Path', () => {
    it('sắp xếp lại thứ tự công việc trong cùng một cột', () => {
      const state = useKanbanStore.getState();
      // col-todo có 2 tasks: task-2 và task-3
      const colId = 'col-todo';
      const tasksInCol = state.tasks.filter((t) => t.columnId === colId);
      expect(tasksInCol.length).toBeGreaterThanOrEqual(2);

      const firstTask = tasksInCol[0];
      const secondTask = tasksInCol[1];

      // Kéo firstTask xuống vị trí secondTask
      useKanbanStore.getState().moveTask(firstTask.id, secondTask.id);

      const tasksAfter = useKanbanStore
        .getState()
        .tasks.filter((t) => t.columnId === colId);

      expect(tasksAfter[0].id).toBe(secondTask.id);
      expect(tasksAfter[1].id).toBe(firstTask.id);
      expect(tasksAfter[0].columnId).toBe(colId);
      expect(tasksAfter[1].columnId).toBe(colId);
    });

    it('di chuyển thẻ từ cột này sang vị trí một thẻ ở cột khác', () => {
      const sourceColId = 'col-backlog';
      const targetColId = 'col-todo';

      const sourceTask = useKanbanStore
        .getState()
        .tasks.find((t) => t.columnId === sourceColId)!;
      const targetTask = useKanbanStore
        .getState()
        .tasks.find((t) => t.columnId === targetColId)!;

      const sourceCountBefore = useKanbanStore
        .getState()
        .tasks.filter((t) => t.columnId === sourceColId).length;
      const targetCountBefore = useKanbanStore
        .getState()
        .tasks.filter((t) => t.columnId === targetColId).length;

      // Kéo thẻ từ sourceCol sang vị trí targetTask ở targetCol
      useKanbanStore.getState().moveTask(sourceTask.id, targetTask.id);

      const movedTask = useKanbanStore
        .getState()
        .tasks.find((t) => t.id === sourceTask.id)!;
      expect(movedTask.columnId).toBe(targetColId);

      // Thẻ phải biến mất khỏi sourceCol và có mặt ở targetCol
      const sourceTasksAfter = useKanbanStore
        .getState()
        .tasks.filter((t) => t.columnId === sourceColId);
      const targetTasksAfter = useKanbanStore
        .getState()
        .tasks.filter((t) => t.columnId === targetColId);

      expect(sourceTasksAfter.length).toBe(sourceCountBefore - 1);
      expect(targetTasksAfter.length).toBe(targetCountBefore + 1);
      expect(sourceTasksAfter.some((t) => t.id === sourceTask.id)).toBe(false);
      expect(targetTasksAfter.some((t) => t.id === sourceTask.id)).toBe(true);
    });

    it('kéo thẻ thả vào một cột rỗng (overId là columnId)', () => {
      // Tạo một cột mới tinh không có task nào
      useKanbanStore.getState().addColumn('Cột rỗng thử nghiệm');
      const emptyColumn = useKanbanStore.getState().columns.slice(-1)[0];

      const sourceTask = useKanbanStore.getState().tasks[0];
      const sourceColId = sourceTask.columnId;

      // Kéo thả sourceTask vào emptyColumn
      useKanbanStore.getState().moveTask(sourceTask.id, emptyColumn.id);

      const taskAfter = useKanbanStore
        .getState()
        .tasks.find((t) => t.id === sourceTask.id)!;
      expect(taskAfter.columnId).toBe(emptyColumn.id);

      const tasksInEmptyCol = useKanbanStore
        .getState()
        .tasks.filter((t) => t.columnId === emptyColumn.id);
      expect(tasksInEmptyCol.length).toBe(1);
      expect(tasksInEmptyCol[0].id).toBe(sourceTask.id);

      // Task không còn ở cột cũ
      expect(
        useKanbanStore
          .getState()
          .tasks.filter((t) => t.columnId === sourceColId)
          .some((t) => t.id === sourceTask.id)
      ).toBe(false);
    });
  });

  // ==========================================
  // NHÓM 2: BOUNDARY & EDGE CASES (DỮ LIỆU BIÊN & BẨN)
  // ==========================================
  describe('Nhóm 2: Boundary & Edge Cases', () => {
    it('không làm gì nếu activeId trùng với overId', () => {
      const tasksBefore = [...useKanbanStore.getState().tasks];
      const taskId = tasksBefore[0].id;

      useKanbanStore.getState().moveTask(taskId, taskId);

      expect(useKanbanStore.getState().tasks).toEqual(tasksBefore);
    });

    it('không gây lỗi khi activeId không tồn tại', () => {
      const tasksBefore = [...useKanbanStore.getState().tasks];
      const validOverId = tasksBefore[0].id;

      expect(() => {
        useKanbanStore.getState().moveTask('non-existent-task-id', validOverId);
      }).not.toThrow();

      expect(useKanbanStore.getState().tasks).toEqual(tasksBefore);
    });

    it('không gây lỗi khi overId không tồn tại', () => {
      const tasksBefore = [...useKanbanStore.getState().tasks];
      const validActiveId = tasksBefore[0].id;

      expect(() => {
        useKanbanStore
          .getState()
          .moveTask(validActiveId, 'non-existent-over-id');
      }).not.toThrow();

      expect(useKanbanStore.getState().tasks).toEqual(tasksBefore);
    });

    it('kéo thẻ duy nhất ra khỏi một cột khiến cột đó rỗng mà không lỗi', () => {
      // Tạo một cột mới và gán 1 task duy nhất vào đó
      useKanbanStore.getState().addColumn('Cột 1 task');
      const singleCol = useKanbanStore.getState().columns.slice(-1)[0];

      useKanbanStore.getState().addTask({
        title: 'Thẻ duy nhất',
        description: 'Mô tả',
        columnId: singleCol.id,
        priority: 'high',
        colorTag: 'rose',
      });

      const singleTask = useKanbanStore
        .getState()
        .tasks.find((t) => t.columnId === singleCol.id)!;
      const targetCol = INITIAL_COLUMNS[0];

      // Kéo thẻ này sang targetCol
      useKanbanStore.getState().moveTask(singleTask.id, targetCol.id);

      const tasksInSingleCol = useKanbanStore
        .getState()
        .tasks.filter((t) => t.columnId === singleCol.id);
      expect(tasksInSingleCol.length).toBe(0);
    });
  });

  // ==========================================
  // NHÓM 3: STATE MUTATION & RACE CONDITION (TÍNH TOÀN VẸN DỮ LIỆU)
  // ==========================================
  describe('Nhóm 3: State Mutation & Race Condition', () => {
    it('đảm bảo tính bất biến (immutability) của mảng tasks khi kéo thả', () => {
      const stateBefore = useKanbanStore.getState();
      const originalTasksRef = stateBefore.tasks;
      const t1 = originalTasksRef[0];
      const t2 = originalTasksRef[1];

      useKanbanStore.getState().moveTask(t1.id, t2.id);

      const stateAfter = useKanbanStore.getState();
      expect(stateAfter.tasks).not.toBe(originalTasksRef);
    });

    it('tuyệt đối không làm nhân đôi (duplicate) task sau khi kéo thả', () => {
      const tasks = useKanbanStore.getState().tasks;
      const t1 = tasks[0];
      const t2 = tasks[tasks.length - 1];

      useKanbanStore.getState().moveTask(t1.id, t2.id);

      const allIds = useKanbanStore.getState().tasks.map((t) => t.id);
      const uniqueIds = new Set(allIds);

      expect(allIds.length).toBe(uniqueIds.size);
      expect(allIds.length).toBe(tasks.length);
    });

    it('tổng số lượng task trên toàn board không thay đổi sau nhiều lần kéo thả liên tiếp', () => {
      const initialTotal = useKanbanStore.getState().tasks.length;
      const tasks = useKanbanStore.getState().tasks;

      // Di chuyển liên tục 3 lần
      useKanbanStore.getState().moveTask(tasks[0].id, tasks[2].id);
      useKanbanStore.getState().moveTask(tasks[1].id, INITIAL_COLUMNS[2].id);
      useKanbanStore.getState().moveTask(tasks[2].id, tasks[3].id);

      const currentTotal = useKanbanStore.getState().tasks.length;
      expect(currentTotal).toBe(initialTotal);
    });
  });

  // ==========================================
  // NHÓM 4: PERSISTENCE (LƯU TRỮ LOCALSTORAGE)
  // ==========================================
  describe('Nhóm 4: Persistence Test', () => {
    it('vị trí mới và columnId của task được lưu nguyên vẹn vào state persist', () => {
      const t1 = useKanbanStore.getState().tasks[0];
      const targetCol = INITIAL_COLUMNS[2];

      useKanbanStore.getState().moveTask(t1.id, targetCol.id);

      const moved = useKanbanStore.getState().tasks.find((t) => t.id === t1.id);
      expect(moved?.columnId).toBe(targetCol.id);
    });
  });
});
