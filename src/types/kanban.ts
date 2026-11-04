export type Priority = 'low' | 'medium' | 'high';

export interface Tag {
  id: string;
  name: string;
  color: string; // Tailwind color class or hex string
}

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate?: string; // YYYY-MM-DD
  colorTag: string; // e.g. 'emerald', 'sky', 'amber', 'rose', 'purple'
  createdAt: string; // ISO string
}

export interface Column {
  id: string;
  title: string;
  order: number;
}
