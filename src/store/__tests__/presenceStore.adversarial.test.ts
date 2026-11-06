import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { usePresenceStore, LOCK_TIMEOUT_MS, clearAllLockTimers } from '../presenceStore';
import type { UserPresence, TaskLock } from '../../types/workspace';

describe('presenceStore - Adversarial & Stress Testing (Anti-Cheating QA)', () => {
  const alice: UserPresence = {
    userId: 'user-alice-001',
    name: 'Alice Quality',
    email: 'alice@test.local',
  };

  const bob: UserPresence = {
    userId: 'user-bob-002',
    name: 'Bob Impostor',
    email: 'bob@test.local',
  };

  const eve: UserPresence = {
    userId: 'user-eve-003',
    name: 'Eve Attacker',
    email: 'eve@test.local',
  };

  beforeEach(() => {
    vi.useFakeTimers();
    usePresenceStore.getState().clearAllLocks();
  });

  afterEach(() => {
    clearAllLockTimers();
    vi.useRealTimers();
  });

  // =========================================================================
  // 1. HAPPY PATH: LUỒNG CHUẨN
  // =========================================================================
  describe('1. Happy Path Baseline', () => {
    it('cho phép user hợp lệ acquire và release lock chuẩn xác', () => {
      const acquired = usePresenceStore.getState().acquireLock('task-normal', alice);
      expect(acquired).toBe(true);

      const lock = usePresenceStore.getState().getLockInfo('task-normal');
      expect(lock).not.toBeNull();
      expect(lock?.taskId).toBe('task-normal');
      expect(lock?.lockedBy.userId).toBe('user-alice-001');

      usePresenceStore.getState().releaseLock('task-normal', 'user-alice-001');
      expect(usePresenceStore.getState().getLockInfo('task-normal')).toBeNull();
      expect(usePresenceStore.getState().isTaskLockedByOther('task-normal', 'user-bob-002')).toBe(false);
    });
  });

  // =========================================================================
  // 2. BOUNDARY & EDGE CASES: DỮ LIỆU BIÊN, RỖNG, KHOẢNG TRẮNG, DỮ LIỆU BẤT HỢP LỆ
  // =========================================================================
  describe('2. Boundary & Edge Cases', () => {
    it('từ chối acquireLock khi taskId là chuỗi rỗng ("")', () => {
      const result = usePresenceStore.getState().acquireLock('', alice);
      expect(result).toBe(false);
      expect(usePresenceStore.getState().getLockInfo('')).toBeNull();
      expect(usePresenceStore.getState().locks['']).toBeUndefined();
    });

    it('từ chối acquireLock khi taskId chỉ chứa khoảng trắng ("   ")', () => {
      const result = usePresenceStore.getState().acquireLock('   ', alice);
      expect(result).toBe(false);
      expect(usePresenceStore.getState().getLockInfo('   ')).toBeNull();
      expect(usePresenceStore.getState().locks['   ']).toBeUndefined();
    });

    it('từ chối acquireLock khi taskId là null hoặc undefined ép kiểu', () => {
      const resultNull = usePresenceStore.getState().acquireLock(null as unknown as string, alice);
      expect(resultNull).toBe(false);

      const resultUndef = usePresenceStore.getState().acquireLock(undefined as unknown as string, alice);
      expect(resultUndef).toBe(false);
    });

    it('từ chối acquireLock khi user là null hoặc thiếu userId hợp lệ', () => {
      const resultNullUser = usePresenceStore.getState().acquireLock('task-edge-1', null as unknown as UserPresence);
      expect(resultNullUser).toBe(false);

      const resultEmptyUserId = usePresenceStore.getState().acquireLock('task-edge-2', {
        userId: '',
        name: 'No Id',
      });
      expect(resultEmptyUserId).toBe(false);

      const resultWhitespaceUserId = usePresenceStore.getState().acquireLock('task-edge-3', {
        userId: '   ',
        name: 'Space Id',
      });
      expect(resultWhitespaceUserId).toBe(false);
    });

    it('xử lý an toàn khi taskId chứa ký tự đặc biệt hoặc cực dài', () => {
      const hugeId = 'task-'.repeat(2000);
      const acquiredHuge = usePresenceStore.getState().acquireLock(hugeId, alice);
      expect(acquiredHuge).toBe(true);
      expect(usePresenceStore.getState().getLockInfo(hugeId)?.taskId).toBe(hugeId);

      const xssId = 'task-<script>alert("xss")</script>';
      const acquiredXss = usePresenceStore.getState().acquireLock(xssId, alice);
      expect(acquiredXss).toBe(true);
      expect(usePresenceStore.getState().getLockInfo(xssId)?.taskId).toBe(xssId);
    });

    it('ngăn chặn prototype pollution thông qua taskId "__proto__" hoặc "constructor"', () => {
      usePresenceStore.getState().acquireLock('__proto__', alice);
      // Ngay cả khi được cho phép hay từ chối, không được làm hỏng Object prototype
      const plainObj = {};
      expect((plainObj as Record<string, unknown>)['lockedBy']).toBeUndefined();
      usePresenceStore.getState().releaseLock('__proto__', alice.userId);
    });
  });

  // =========================================================================
  // 3. UNAUTHORIZED RELEASE (Mismatched UserId giả danh)
  // =========================================================================
  describe('3. Unauthorized Release & Impersonation Attack', () => {
    it('chặn kẻ mạo danh (Bob) giải phóng lock của Alice', () => {
      usePresenceStore.getState().acquireLock('task-classified', alice);

      // Bob gửi request đòi giải phóng lock
      usePresenceStore.getState().releaseLock('task-classified', bob.userId);

      // Lock vẫn phải thuộc về Alice
      const lock = usePresenceStore.getState().getLockInfo('task-classified');
      expect(lock).not.toBeNull();
      expect(lock?.lockedBy.userId).toBe(alice.userId);
    });

    it('chặn giải phóng lock khi truyền userId rỗng hoặc khoảng trắng', () => {
      usePresenceStore.getState().acquireLock('task-classified-2', alice);

      usePresenceStore.getState().releaseLock('task-classified-2', '');
      usePresenceStore.getState().releaseLock('task-classified-2', '   ');
      usePresenceStore.getState().releaseLock('task-classified-2', null as unknown as string);

      const lock = usePresenceStore.getState().getLockInfo('task-classified-2');
      expect(lock).not.toBeNull();
      expect(lock?.lockedBy.userId).toBe(alice.userId);
    });

    it('chặn kẻ tấn công sử dụng taskId bị lệch whitespace để giải phóng lock', () => {
      usePresenceStore.getState().acquireLock('task-exact', alice);

      // Kẻ tấn công gọi với whitespace
      usePresenceStore.getState().releaseLock('task-exact ', alice.userId);
      usePresenceStore.getState().releaseLock(' task-exact', alice.userId);

      const lock = usePresenceStore.getState().getLockInfo('task-exact');
      expect(lock).not.toBeNull();
    });
  });

  // =========================================================================
  // 4. RACE CONDITION & HIGH CONCURRENCY (Tranh chấp trong cùng 1 millisecond)
  // =========================================================================
  describe('4. Race Condition & Concurrency', () => {
    it('khi nhiều user tranh chấp 1 thẻ trong cùng 1 millisecond, CHỈ ĐÚNG 1 user thành công', () => {
      const candidates: UserPresence[] = [
        alice,
        bob,
        eve,
        { userId: 'user-4', name: 'User 4' },
        { userId: 'user-5', name: 'User 5' },
        { userId: 'user-6', name: 'User 6' },
        { userId: 'user-7', name: 'User 7' },
        { userId: 'user-8', name: 'User 8' },
      ];

      // Giả lập tất cả cùng gọi acquireLock trong cùng 1 tick
      const results = candidates.map((candidate) =>
        usePresenceStore.getState().acquireLock('task-race-001', candidate)
      );

      // Đếm số lần acquire thành công
      const successCount = results.filter((res) => res === true).length;
      const failCount = results.filter((res) => res === false).length;

      expect(successCount).toBe(1);
      expect(failCount).toBe(candidates.length - 1);

      // Người giữ lock phải là người đầu tiên
      const currentLock = usePresenceStore.getState().getLockInfo('task-race-001');
      expect(currentLock?.lockedBy.userId).toBe(alice.userId);
    });

    it('xử lý tranh chấp đúng tại thời điểm lock cũ vừa hết hạn (boundary tick 10000ms)', () => {
      usePresenceStore.getState().acquireLock('task-race-boundary', alice);

      // Đi tới đúng 10,000ms (vừa chạm ngưỡng hết hạn)
      vi.advanceTimersByTime(LOCK_TIMEOUT_MS);

      // Bob và Eve đồng thời tranh lock
      const bobAttempt = usePresenceStore.getState().acquireLock('task-race-boundary', bob);
      const eveAttempt = usePresenceStore.getState().acquireLock('task-race-boundary', eve);

      expect(bobAttempt).toBe(true);
      expect(eveAttempt).toBe(false);

      const finalLock = usePresenceStore.getState().getLockInfo('task-race-boundary');
      expect(finalLock?.lockedBy.userId).toBe(bob.userId);
    });
  });

  // =========================================================================
  // 5. RENEW LOCK & TIMER LEAK TEST
  // =========================================================================
  describe('5. Renew Lock & Timer Memory Leak Prevention', () => {
    it('gia hạn lock 50 lần liên tiếp không gây rò rỉ timer (chỉ tồn tại 1 active timer)', () => {
      usePresenceStore.getState().acquireLock('task-leak-test', alice);

      // Gọi renew liên tục 50 lần
      for (let i = 0; i < 50; i++) {
        vi.advanceTimersByTime(200); // 200ms mỗi lần
        const renewed = usePresenceStore.getState().acquireLock('task-leak-test', alice);
        expect(renewed).toBe(true);
      }

      // Tổng thời gian đã trôi qua: 50 * 200 = 10,000ms
      // Nếu không reset timer chuẩn, timer đầu tiên có thể đã trigger dọn dẹp mất lock!
      const lockDuring = usePresenceStore.getState().getLockInfo('task-leak-test');
      expect(lockDuring).not.toBeNull();
      expect(lockDuring?.lockedBy.userId).toBe(alice.userId);

      // Từ lần renew cuối cùng, timer phải gia hạn thêm đúng 10,000ms nữa
      vi.advanceTimersByTime(9990);
      expect(usePresenceStore.getState().getLockInfo('task-leak-test')).not.toBeNull();

      // Sau thêm 20ms nữa (> 10s kể từ lần renew cuối), lock mới tự động hết hạn
      vi.advanceTimersByTime(20);
      expect(usePresenceStore.getState().getLockInfo('task-leak-test')).toBeNull();
    });

    it('kiểm tra số lượng timer đang hoạt động không tăng phi mã khi renew', () => {
      usePresenceStore.getState().acquireLock('task-timer-count', alice);
      const timerAfterFirstAcquire = vi.getTimerCount();

      // Sau 20 lần renew
      for (let i = 0; i < 20; i++) {
        usePresenceStore.getState().acquireLock('task-timer-count', alice);
      }

      const timerAfterManyRenews = vi.getTimerCount();
      // Số lượng timer không được tích lũy (không leak)
      expect(timerAfterManyRenews).toBe(timerAfterFirstAcquire);
    });
  });

  // =========================================================================
  // 6. SYNC LOCKS FROM REMOTE: DỮ LIỆU BẨN, TIMESTAMP ÂM, TIMESTAMP TƯƠNG LAI
  // =========================================================================
  describe('6. syncLocksFromRemote with Malicious / Corrupted Data', () => {
    it('không bị crash khi nhận incomingLocks là null, undefined, số hoặc mảng', () => {
      expect(() => {
        usePresenceStore.getState().syncLocksFromRemote(null as unknown as Record<string, TaskLock>);
      }).not.toThrow();

      expect(() => {
        usePresenceStore.getState().syncLocksFromRemote(undefined as unknown as Record<string, TaskLock>);
      }).not.toThrow();

      expect(() => {
        usePresenceStore.getState().syncLocksFromRemote('invalid-string' as unknown as Record<string, TaskLock>);
      }).not.toThrow();

      expect(() => {
        usePresenceStore.getState().syncLocksFromRemote(12345 as unknown as Record<string, TaskLock>);
      }).not.toThrow();

      expect(() => {
        usePresenceStore.getState().syncLocksFromRemote([] as unknown as Record<string, TaskLock>);
      }).not.toThrow();
    });

    it('bỏ qua và không crash khi remote chứa phần tử null, undefined hoặc object rác', () => {
      const corruptedLocks = {
        'task-corrupted-null': null as unknown as TaskLock,
        'task-corrupted-undef': undefined as unknown as TaskLock,
        'task-corrupted-empty': {} as unknown as TaskLock,
        'task-corrupted-no-user': {
          taskId: 'task-corrupted-no-user',
          lockedAt: Date.now(),
          expiresAt: Date.now() + 5000,
        } as unknown as TaskLock,
      };

      expect(() => {
        usePresenceStore.getState().syncLocksFromRemote(corruptedLocks);
      }).not.toThrow();

      // State không được chứa các lock rác không có lockedBy hợp lệ
      const state = usePresenceStore.getState().locks;
      expect(state['task-corrupted-null']).toBeUndefined();
      expect(state['task-corrupted-undef']).toBeUndefined();
      expect(state['task-corrupted-empty']).toBeUndefined();
      expect(state['task-corrupted-no-user']).toBeUndefined();
    });

    it('xử lý timestamp âm: lock có timestamp âm phải bị coi là hết hạn ngay lập tức', () => {
      const negativeLocks: Record<string, TaskLock> = {
        'task-negative-1': {
          taskId: 'task-negative-1',
          lockedBy: alice,
          lockedAt: -50000,
          expiresAt: -1000,
        },
        'task-negative-2': {
          taskId: 'task-negative-2',
          lockedBy: bob,
          lockedAt: -100000,
        },
      };

      usePresenceStore.getState().syncLocksFromRemote(negativeLocks);

      expect(usePresenceStore.getState().locks['task-negative-1']).toBeUndefined();
      expect(usePresenceStore.getState().locks['task-negative-2']).toBeUndefined();
      expect(usePresenceStore.getState().getLockInfo('task-negative-1')).toBeNull();
    });

    it('chặn tấn công DoS bằng timestamp NaN: không được để NaN gây lock vĩnh viễn', () => {
      const nanLock: Record<string, TaskLock> = {
        'task-nan': {
          taskId: 'task-nan',
          lockedBy: eve,
          lockedAt: NaN,
          expiresAt: NaN,
        },
      };

      usePresenceStore.getState().syncLocksFromRemote(nanLock);

      // Lock có NaN không được coi là hợp lệ hoặc tồn tại vĩnh viễn
      expect(usePresenceStore.getState().locks['task-nan']).toBeUndefined();
      expect(usePresenceStore.getState().isTaskLockedByOther('task-nan', alice.userId)).toBe(false);
      expect(usePresenceStore.getState().getLockInfo('task-nan')).toBeNull();
    });

    it('chặn tấn công DoS bằng timestamp tương lai cực lớn (Future Timestamp Attack)', () => {
      const now = Date.now();
      // Kẻ tấn công gửi expiresAt là 10 năm sau nhằm chiếm vĩnh viễn thẻ
      const maliciousFutureLock: Record<string, TaskLock> = {
        'task-forever': {
          taskId: 'task-forever',
          lockedBy: eve,
          lockedAt: now,
          expiresAt: now + 10 * 365 * 24 * 60 * 60 * 1000, // 10 năm
        },
      };

      usePresenceStore.getState().syncLocksFromRemote(maliciousFutureLock);

      const lock = usePresenceStore.getState().locks['task-forever'];
      // Nếu hệ thống chấp nhận, thời gian hết hạn không được vượt quá LOCK_TIMEOUT_MS (10s)
      // hoặc phải bị cắt ngắn về ngưỡng an toàn (capped)
      if (lock) {
        const remaining = (lock.expiresAt ?? lock.lockedAt + LOCK_TIMEOUT_MS) - now;
        expect(remaining).toBeLessThanOrEqual(LOCK_TIMEOUT_MS);
      }
    });

    it('từ chối hoặc làm sạch lock có taskId không khớp với key của object', () => {
      const mismatchedLocks: Record<string, TaskLock> = {
        'task-key-A': {
          taskId: 'task-key-B', // mismatch
          lockedBy: alice,
          lockedAt: Date.now(),
          expiresAt: Date.now() + 5000,
        },
      };

      usePresenceStore.getState().syncLocksFromRemote(mismatchedLocks);

      // Không thể tồn tại lock trong đó key !== lock.taskId
      const lockA = usePresenceStore.getState().locks['task-key-A'];
      if (lockA) {
        expect(lockA.taskId).toBe('task-key-A');
      }
    });
  });
});
