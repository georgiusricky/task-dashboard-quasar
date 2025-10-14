import { TaskModel } from '../models/TaskModel';

export class TaskService {
  private static instance: TaskService;
  private _list: TaskModel[] = [];
  private readonly localKey = 'tasks_v1';

  private constructor() {
    this.load();
  }

  static getInstance(): TaskService {
    if (!TaskService.instance) TaskService.instance = new TaskService();
    return TaskService.instance;
  }

  get list(): TaskModel[] {
    return this._list.map((t) => t.copy());
  }

  async create(task: TaskModel): Promise<TaskModel> {
    const newTask = task.copy();
    newTask.id = TaskModel.generateId();
    this._list.unshift(newTask);
    this.save();
    return Promise.resolve(newTask);
  }

  async update(task: TaskModel): Promise<void> {
    const idx = this._list.findIndex((t) => t.id === task.id);
    if (idx !== -1) {
      this._list[idx] = task.copy();
      this.save();
    }
    return Promise.resolve();
  }

  async delete(id: string): Promise<void> {
    this._list = this._list.filter((t) => t.id !== id);
    this.save();
    return Promise.resolve();
  }

  async toggle(id: string): Promise<void> {
    const t = this._list.find((t) => t.id === id);
    if (t) {
      t.isCompleted = !t.isCompleted;
      this.save();
    }
    return Promise.resolve();
  }

  private load() {
    try {
      const raw = localStorage.getItem(this.localKey);
      this._list = raw
        ? (JSON.parse(raw) as unknown[]).map((d) =>
            TaskModel.fromJson(d as Record<string, unknown>),
          )
        : [];
    } catch {
      this._list = [];
    }
  }

  private save() {
    localStorage.setItem(this.localKey, JSON.stringify(this._list));
  }
}
