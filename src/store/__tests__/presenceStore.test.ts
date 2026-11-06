import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { usePresenceStore, LOCK_TIMEOUT_MS, clearAllLockTimers } from '../presenceStore';
import type { UserPresence, TaskLock } from '../../types/workspace';

const mockUser1: UserPresence = {
  userId: 'user-1',
  name: 'User One',
  email: 'user1@example.com',
};

const mockUser2: UserPresence = {
  userId: 'user-2',
  name: 'User Two',
  email: 'user2@example.com',
};

describe('presenceStore - Card Locking & Presence Store Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    usePresenceStore.getState().clearAllLocks();
  });

  afterEach(() => {
    clearAllLockTimers();
    vi.useRealTimers();
  });

  // ==========================================
  // NHÓM 1: ACQUIRE LOCK (CHIẾM KHÓA)
  // ==========================================
  describe('Nhóm 1: acquireLock', () => {
    it('chiếm lock thành công khi task chưa ai khóa', () => {
      const success = usePresenceStore.getState().acquireLock('task-100', mockUser1);
      expect(success).toBe(true);

      const lock = usePresenceStore.getState().getLockInfo('task-100');
      expect(lock).not.toBeNull();
      expect(lock?.taskId).toBe('task-100');
      expect(lock?.lockedBy.userId).toBe('user-1');
      expect(lock?.expiresAt).toBe(lock!.lockedAt + LOCK_TIMEOUT_MS);
    });

    it('từ chối chiếm lock khi task đang bị user khác giữ và chưa hết hạn 10s', () => {
      usePresenceStore.getState().acquireLock('task-100', mockUser1);

      // Đi được 5 giây (< 10s)
      vi.advanceTimersByTime(5000);

      // User 2 cố gắng chiếm lock
      const success = usePresenceStore.getState().acquireLock('task-100', mockUser2);
      expect(success).toBe(false);

      // Lock vẫn thuộc về User 1
      const lock = usePresenceStore.getState().getLockInfo('task-100');
      expect(lock?.lockedBy.userId).toBe('user-1');
    });

    it('cho phép cùng một user gia hạn (renew) lock của chính mình', () => {
      usePresenceStore.getState().acquireLock('task-100', mockUser1);
      vi.advanceTimersByTime(6000);

      // User 1 gọi acquireLock lại để gia hạn
      const success = usePresenceStore.getState().acquireLock('task-100', mockUser1);
      expect(success).toBe(true);

      // Thêm 5 giây nữa (tổng 11 giây từ đầu, nhưng mới gia hạn 5 giây trước)
      vi.advanceTimersByTime(5000);

      // Lock vẫn còn hiệu lực vì đã được renew
      const lock = usePresenceStore.getState().getLockInfo('task-100');
      expect(lock).not.toBeNull();
      expect(lock?.lockedBy.userId).toBe('user-1');
    });

    it('tự động cho phép user khác chiếm lock khi lock cũ đã quá 10 giây (Lazy Check)', () => {
      usePresenceStore.getState().acquireLock('task-100', mockUser1);

      // Trôi qua 10.1 giây mà không gọi clean
      vi.advanceTimersByTime(10100);

      // User 2 chiếm lock thành công vì lock cũ đã hết hạn
      const success = usePresenceStore.getState().acquireLock('task-100', mockUser2);
      expect(success).toBe(true);

      const lock = usePresenceStore.getState().getLockInfo('task-100');
      expect(lock?.lockedBy.userId).toBe('user-2');
    });
  });

  // ==========================================
  // NHÓM 2: RELEASE LOCK (GIẢI PHÓNG KHÓA)
  // ==========================================
  describe('Nhóm 2: releaseLock', () => {
    it('giải phóng lock thành công nếu đúng userId sở hữu', () => {
      usePresenceStore.getState().acquireLock('task-100', mockUser1);
      expect(usePresenceStore.getState().getLockInfo('task-100')).not.toBeNull();

      usePresenceStore.getState().releaseLock('task-100', 'user-1');
      expect(usePresenceStore.getState().getLockInfo('task-100')).toBeNull();
    });

    it('không cho phép user khác giải phóng lock của người khác', () => {
      usePresenceStore.getState().acquireLock('task-100', mockUser1);

      // User 2 cố tình gỡ lock của User 1
      usePresenceStore.getState().releaseLock('task-100', 'user-2');

      // Lock vẫn còn nguyên
      const lock = usePresenceStore.getState().getLockInfo('task-100');
      expect(lock).not.toBeNull();
      expect(lock?.lockedBy.userId).toBe('user-1');
    });

    it('xử lý an toàn khi release taskId không tồn tại', () => {
      expect(() => {
        usePresenceStore.getState().releaseLock('non-existent-task', 'user-1');
      }).not.toThrow();
    });
  });

  // ==========================================
  // NHÓM 3: IS TASK LOCKED BY OTHER
  // ==========================================
  describe('Nhóm 3: isTaskLockedByOther', () => {
    it('trả về false nếu task không bị ai khóa', () => {
      const isLocked = usePresenceStore.getState().isTaskLockedByOther('task-free', 'user-1');
      expect(isLocked).toBe(false);
    });

    it('trả về false nếu chính currentUserId đang giữ lock', () => {
      usePresenceStore.getState().acquireLock('task-100', mockUser1);
      const isLocked = usePresenceStore.getState().isTaskLockedByOther('task-100', 'user-1');
      expect(isLocked).toBe(false);
    });

    it('trả về true nếu user khác đang giữ lock và chưa quá 10 giây', () => {
      usePresenceStore.getState().acquireLock('task-100', mockUser1);
      const isLocked = usePresenceStore.getState().isTaskLockedByOther('task-100', 'user-2');
      expect(isLocked).toBe(true);
    });

    it('trả về false nếu lock của user khác đã quá 10 giây (Lazy Check)', () => {
      usePresenceStore.getState().acquireLock('task-100', mockUser1);
      vi.advanceTimersByTime(10050);

      const isLocked = usePresenceStore.getState().isTaskLockedByOther('task-100', 'user-2');
      expect(isLocked).toBe(false);
    });
  });

  // ==========================================
  // NHÓM 4: GET LOCK INFO
  // ==========================================
  describe('Nhóm 4: getLockInfo', () => {
    it('trả về thông tin lock khi còn hạn', () => {
      usePresenceStore.getState().acquireLock('task-100', mockUser1);
      const lock = usePresenceStore.getState().getLockInfo('task-100');

      expect(lock).not.toBeNull();
      expect(lock?.taskId).toBe('task-100');
      expect(lock?.lockedBy.name).toBe('User One');
    });

    it('trả về null khi task không có lock hoặc đã hết hạn', () => {
      expect(usePresenceStore.getState().getLockInfo('task-none')).toBeNull();

      usePresenceStore.getState().acquireLock('task-expired', mockUser1);
      vi.advanceTimersByTime(10001);

      expect(usePresenceStore.getState().getLockInfo('task-expired')).toBeNull();
    });
  });

  // ==========================================
  // NHÓM 5: ACTIVE TIMEOUT & CLEAN EXPIRED
  // ==========================================
  describe('Nhóm 5: Active Timeout & cleanExpiredLocks', () => {
    it('tự động gỡ bỏ lock khỏi state sau 10 giây bằng active timeout', () => {
      usePresenceStore.getState().acquireLock('task-100', mockUser1);
      expect(usePresenceStore.getState().locks['task-100']).toBeDefined();

      // Cho chạy đúng 10,000ms timeout
      vi.advanceTimersByTime(10000);

      // Active timer đã kích hoạt và xóa lock trong state
      expect(usePresenceStore.getState().locks['task-100']).toBeUndefined();
    });

    it('cleanExpiredLocks xóa thủ công các lock đã hết hạn', () => {
      const now = Date.now();
      usePresenceStore.setState({
        locks: {
          'task-alive': {
            taskId: 'task-alive',
            lockedBy: mockUser1,
            lockedAt: now,
            expiresAt: now + 10000,
          },
          'task-dead': {
            taskId: 'task-dead',
            lockedBy: mockUser2,
            lockedAt: now - 12000,
            expiresAt: now - 2000,
          },
        },
      });

      usePresenceStore.getState().cleanExpiredLocks();

      expect(usePresenceStore.getState().locks['task-alive']).toBeDefined();
      expect(usePresenceStore.getState().locks['task-dead']).toBeUndefined();
    });
  });

  // ==========================================
  // NHÓM 6: SYNC LOCKS FROM REMOTE
  // ==========================================
  describe('Nhóm 6: syncLocksFromRemote', () => {
    it('đồng bộ lock hợp lệ từ remote và bỏ qua các lock đã hết hạn', () => {
      const now = Date.now();
      const remoteLocks: Record<string, TaskLock> = {
        'task-valid': {
          taskId: 'task-valid',
          lockedBy: mockUser1,
          lockedAt: now,
          expiresAt: now + 10000,
        },
        'task-stale': {
          taskId: 'task-stale',
          lockedBy: mockUser2,
          lockedAt: now - 15000,
          expiresAt: now - 5000,
        },
      };

      usePresenceStore.getState().syncLocksFromRemote(remoteLocks);

      const state = usePresenceStore.getState().locks;
      expect(state['task-valid']).toBeDefined();
      expect(state['task-stale']).toBeUndefined();
    });

    it('lên lịch active timeout cho các lock nhận từ remote', () => {
      const now = Date.now();
      const remoteLocks: Record<string, TaskLock> = {
        'task-remote': {
          taskId: 'task-remote',
          lockedBy: mockUser1,
          lockedAt: now - 6000, // Đã trôi qua 6s
          expiresAt: now + 4000, // Còn 4s
        },
      };

      usePresenceStore.getState().syncLocksFromRemote(remoteLocks);
      expect(usePresenceStore.getState().locks['task-remote']).toBeDefined();

      // Sau 3 giây vẫn còn
      vi.advanceTimersByTime(3000);
      expect(usePresenceStore.getState().locks['task-remote']).toBeDefined();

      // Sau thêm 1.1 giây (tổng 4.1s) -> tự động hết hạn và xóa
      vi.advanceTimersByTime(1100);
      expect(usePresenceStore.getState().locks['task-remote']).toBeUndefined();
    });
  });
});
