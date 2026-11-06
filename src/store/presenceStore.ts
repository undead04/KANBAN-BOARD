import { create } from 'zustand';
import type { TaskLock, UserPresence } from '../types/workspace';

export const LOCK_TIMEOUT_MS = 10_000;

/**
 * Validate that a value is a non-empty string after trimming whitespace.
 */
export const isValidString = (val: unknown): val is string => {
  return typeof val === 'string' && val.trim().length > 0;
};

/**
 * Check if a task lock has expired (> 10s or past expiresAt timestamp).
 * Robust against null, undefined, corrupted objects, NaN, negative timestamps, and future attacks.
 */
export function isLockExpired(lock: TaskLock | null | undefined, now: number = Date.now()): boolean {
  if (!lock || typeof lock !== 'object') {
    return true;
  }

  // Validate lockedBy presence and userId
  if (!lock.lockedBy || typeof lock.lockedBy !== 'object' || !isValidString(lock.lockedBy.userId)) {
    return true;
  }

  // Validate lockedAt: must be a positive finite number
  if (
    typeof lock.lockedAt !== 'number' ||
    !Number.isFinite(lock.lockedAt) ||
    Number.isNaN(lock.lockedAt) ||
    lock.lockedAt <= 0
  ) {
    return true;
  }

  // If expiresAt is provided, validate and enforce maximum threshold
  if (lock.expiresAt !== undefined && lock.expiresAt !== null) {
    if (
      typeof lock.expiresAt !== 'number' ||
      !Number.isFinite(lock.expiresAt) ||
      Number.isNaN(lock.expiresAt) ||
      lock.expiresAt <= 0
    ) {
      return true;
    }

    // Effective expiry cannot exceed lockedAt + LOCK_TIMEOUT_MS
    const maxAllowedExpiry = lock.lockedAt + LOCK_TIMEOUT_MS;
    const effectiveExpiry = Math.min(lock.expiresAt, maxAllowedExpiry);
    return now >= effectiveExpiry;
  }

  // Fallback to lockedAt + LOCK_TIMEOUT_MS
  return (now - lock.lockedAt) >= LOCK_TIMEOUT_MS;
}

/**
 * Safely retrieve an own property lock from the locks dictionary without prototype traversal.
 */
export const getLockFromLocks = (
  locks: Record<string, TaskLock>,
  taskId: string
): TaskLock | undefined => {
  if (!isValidString(taskId)) return undefined;
  if (!Object.prototype.hasOwnProperty.call(locks, taskId)) return undefined;

  const lock = locks[taskId];
  if (!lock || typeof lock !== 'object' || !lock.lockedBy || typeof lock.lockedBy !== 'object') {
    return undefined;
  }
  return lock;
};

/**
 * Safely define an own property on a locks record to avoid prototype pollution.
 */
const defineLock = (
  record: Record<string, TaskLock>,
  taskId: string,
  lock: TaskLock
): void => {
  Object.defineProperty(record, taskId, {
    value: lock,
    writable: true,
    enumerable: true,
    configurable: true,
  });
};

// Active timeout timer handles
const lockTimers = new Map<string, ReturnType<typeof setTimeout>>();

const clearLockTimer = (taskId: string): void => {
  const timer = lockTimers.get(taskId);
  if (timer) {
    clearTimeout(timer);
    lockTimers.delete(taskId);
  }
};

export const clearAllLockTimers = (): void => {
  for (const timer of lockTimers.values()) {
    clearTimeout(timer);
  }
  lockTimers.clear();
};

const scheduleLockTimer = (taskId: string, delayMs: number): void => {
  clearLockTimer(taskId);
  if (delayMs <= 0) return;

  const timer = setTimeout(() => {
    lockTimers.delete(taskId);
    usePresenceStore.getState().cleanExpiredLocks();
  }, delayMs);

  lockTimers.set(taskId, timer);
};

export interface PresenceState {
  locks: Record<string, TaskLock>;

  acquireLock: (taskId: string, user: UserPresence) => boolean;
  releaseLock: (taskId: string, userId: string) => void;
  isTaskLockedByOther: (taskId: string, currentUserId: string) => boolean;
  getLockInfo: (taskId: string) => TaskLock | null;
  cleanExpiredLocks: () => void;
  syncLocksFromRemote: (incomingLocks: Record<string, TaskLock>) => void;
  clearAllLocks: () => void;
}

export const usePresenceStore = create<PresenceState>()((set, get) => ({
  locks: {},

  acquireLock: (taskId: string, user: UserPresence): boolean => {
    // Validate inputs
    if (!isValidString(taskId)) {
      return false;
    }

    if (!user || typeof user !== 'object' || !isValidString(user.userId)) {
      return false;
    }

    const now = Date.now();
    const currentLocks = get().locks;
    const currentLock = getLockFromLocks(currentLocks, taskId);

    // Check if task is locked by another user and still valid (< 10s)
    if (
      currentLock &&
      !isLockExpired(currentLock, now) &&
      currentLock.lockedBy.userId !== user.userId.trim()
    ) {
      return false;
    }

    // Clear existing timer if any
    clearLockTimer(taskId);

    const newLock: TaskLock = {
      taskId,
      lockedBy: {
        ...user,
        userId: user.userId.trim(),
      },
      lockedAt: now,
      expiresAt: now + LOCK_TIMEOUT_MS,
    };

    // Schedule active timeout to auto-release after 10 seconds
    scheduleLockTimer(taskId, LOCK_TIMEOUT_MS);

    set((state) => {
      const nextLocks = { ...state.locks };
      defineLock(nextLocks, taskId, newLock);
      return { locks: nextLocks };
    });

    return true;
  },

  releaseLock: (taskId: string, userId: string): void => {
    if (!isValidString(taskId) || !isValidString(userId)) return;

    const currentLocks = get().locks;
    const currentLock = getLockFromLocks(currentLocks, taskId);
    if (!currentLock) return;

    // Only release if owned by the requesting user
    if (currentLock.lockedBy?.userId === userId.trim()) {
      clearLockTimer(taskId);
      set((state) => {
        const nextLocks = { ...state.locks };
        delete nextLocks[taskId];
        return { locks: nextLocks };
      });
    }
  },

  isTaskLockedByOther: (taskId: string, currentUserId: string): boolean => {
    if (!isValidString(taskId) || !isValidString(currentUserId)) return false;

    const currentLock = getLockFromLocks(get().locks, taskId);
    if (!currentLock) return false;

    // Lazy check: if expired, it is no longer locked
    if (isLockExpired(currentLock)) return false;

    return currentLock.lockedBy.userId !== currentUserId.trim();
  },

  getLockInfo: (taskId: string): TaskLock | null => {
    if (!isValidString(taskId)) return null;

    const currentLock = getLockFromLocks(get().locks, taskId);
    if (!currentLock) return null;

    // Lazy check: return null if expired
    if (isLockExpired(currentLock)) return null;

    return currentLock;
  },

  cleanExpiredLocks: (): void => {
    const now = Date.now();
    set((state) => {
      let hasChanged = false;
      const nextLocks: Record<string, TaskLock> = {};

      for (const id of Object.getOwnPropertyNames(state.locks)) {
        if (!Object.prototype.hasOwnProperty.call(state.locks, id)) continue;
        const lock = state.locks[id];
        if (isLockExpired(lock, now)) {
          hasChanged = true;
          clearLockTimer(id);
        } else {
          defineLock(nextLocks, id, lock);
        }
      }

      return hasChanged ? { locks: nextLocks } : state;
    });
  },

  syncLocksFromRemote: (incomingLocks: Record<string, TaskLock>): void => {
    if (!incomingLocks || typeof incomingLocks !== 'object' || Array.isArray(incomingLocks)) {
      return;
    }

    const now = Date.now();
    const validLocks: Record<string, TaskLock> = {};

    for (const [key, rawLock] of Object.entries(incomingLocks)) {
      if (!Object.prototype.hasOwnProperty.call(incomingLocks, key)) continue;
      if (!isValidString(key)) continue;

      // Skip invalid/null/corrupted locks
      if (!rawLock || typeof rawLock !== 'object') continue;

      // Skip missing or invalid user
      const user = rawLock.lockedBy;
      if (!user || typeof user !== 'object' || !isValidString(user.userId)) continue;

      // Validate lockedAt: must be positive finite number
      const lockedAt = rawLock.lockedAt;
      if (
        typeof lockedAt !== 'number' ||
        !Number.isFinite(lockedAt) ||
        Number.isNaN(lockedAt) ||
        lockedAt <= 0
      ) {
        continue;
      }

      // Calculate capped expiresAt: cannot exceed LOCK_TIMEOUT_MS from now or lockedAt
      let expiresAt: number;
      if (
        typeof rawLock.expiresAt === 'number' &&
        Number.isFinite(rawLock.expiresAt) &&
        !Number.isNaN(rawLock.expiresAt) &&
        rawLock.expiresAt > 0
      ) {
        expiresAt = Math.min(rawLock.expiresAt, lockedAt + LOCK_TIMEOUT_MS, now + LOCK_TIMEOUT_MS);
      } else {
        expiresAt = Math.min(lockedAt + LOCK_TIMEOUT_MS, now + LOCK_TIMEOUT_MS);
      }

      // Skip if already expired
      if (expiresAt <= now) {
        continue;
      }

      const sanitizedLock: TaskLock = {
        ...rawLock,
        taskId: key, // Ensure taskId matches the object key
        lockedBy: {
          ...user,
          userId: user.userId.trim(),
        },
        lockedAt,
        expiresAt,
      };

      defineLock(validLocks, key, sanitizedLock);

      const remaining = expiresAt - now;
      if (remaining > 0) {
        scheduleLockTimer(key, remaining);
      } else {
        clearLockTimer(key);
      }
    }

    // Cancel active timers for tasks that are no longer in valid incoming locks
    const currentLocks = get().locks;
    for (const taskId of Object.getOwnPropertyNames(currentLocks)) {
      if (!Object.prototype.hasOwnProperty.call(validLocks, taskId)) {
        clearLockTimer(taskId);
      }
    }

    set({ locks: validLocks });
  },

  clearAllLocks: (): void => {
    clearAllLockTimers();
    set({ locks: {} });
  },
}));
