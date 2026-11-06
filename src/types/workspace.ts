export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface WorkspaceMember {
  userId: string;
  email: string;
  role: WorkspaceRole;
  name?: string;
  avatar?: string;
  joinedAt?: string;
}

export interface BoardMetadata {
  id: string;
  title: string;
  workspaceId: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members: WorkspaceMember[];
  description?: string;
  boards?: BoardMetadata[];
  createdAt: string;
  updatedAt?: string;
}

export interface UserPresence {
  userId: string;
  name: string;
  avatar?: string;
  email?: string;
  lastActiveAt?: number;
}

export interface TaskLock {
  taskId: string;
  lockedBy: UserPresence;
  lockedAt: number; // Timestamp in milliseconds
  expiresAt?: number; // Timestamp in milliseconds
}

export interface TaskLocksMap {
  [taskId: string]: TaskLock;
}
