export type Priority = 'low' | 'medium' | 'high';

export interface TaskModelParams {
  id?: string | undefined;
  title: string;
  description?: string;
  isCompleted?: boolean;
  priority?: Priority;
  dueDate?: string | null;
  assignedTo?: string | null;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
}

export class TaskModel {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  priority: Priority;
  dueDate: string | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;

  constructor(params: TaskModelParams) {
    this.id = params.id ?? TaskModel.generateId();
    this.title = params.title;
    this.description = params.description ?? '';
    this.isCompleted = params.isCompleted ?? false;
    this.priority = params.priority ?? 'medium';
    this.dueDate = params.dueDate ?? null;
    this.assignedTo = params.assignedTo ?? null;
    this.createdAt = params.createdAt ?? new Date().toISOString();
    this.updatedAt = params.updatedAt ?? new Date().toISOString();
    this.isDeleted = params.isDeleted ?? false;
    this.deletedAt = params.deletedAt ?? null;
  }

  static fromJson(json?: Record<string, unknown>): TaskModel {
    if (!json) return new TaskModel({ title: '' });
    return new TaskModel({
      id: typeof json.id === 'string' ? json.id : undefined,
      title: typeof json.title === 'string' ? json.title : '',
      description: typeof json.description === 'string' ? json.description : '',
      isCompleted: typeof json.isCompleted === 'boolean' ? json.isCompleted : false,
      priority: (json.priority as Priority) ?? 'medium',
      dueDate: typeof json.dueDate === 'string' ? json.dueDate : null,
      assignedTo: typeof json.assignedTo === 'string' ? json.assignedTo : null,
      createdAt: typeof json.createdAt === 'string' ? json.createdAt : new Date().toISOString(),
      updatedAt: typeof json.updatedAt === 'string' ? json.updatedAt : new Date().toISOString(),
      isDeleted: typeof json.isDeleted === 'boolean' ? json.isDeleted : false,
      deletedAt: typeof json.deletedAt === 'string' ? json.deletedAt : null,
    });
  }

  public get isOverdue(): boolean {
    if (!this.dueDate || this.isCompleted) return false;
    return new Date(this.dueDate) < new Date();
  }

  public get priorityColor(): string {
    switch (this.priority.toLowerCase()) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      default:
        return 'green';
    }
  }

  public get statusIcon(): string {
    return this.isCompleted ? 'check_circle' : 'radio_button_unchecked';
  }

  public copy(): TaskModel {
    const copy = Object.assign(TaskModel.fromJson(), this);
    return copy;
  }

  static generateId(): string {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
