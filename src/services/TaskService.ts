import { TaskModel } from '../models/TaskModel';
import { MockDataService } from './MockDataService';

export class TaskService {
  private static instance?: TaskService;
  private constructor() {
    if (TaskService.instance instanceof TaskService) {
      return TaskService.instance;
    }
    TaskService.instance = this;
    this.initialize();
  }
  public static getInstance(): TaskService {
    return new TaskService();
  }
  _list = [] as Array<TaskModel>;
  _details = TaskModel.fromJson();
  private _listFetched = false;
  private _offlineMode = true;
  public get list(): Array<TaskModel> {
    return this._list;
  }
  public get details(): TaskModel {
    return this._details;
  }
  public get offlineMode(): boolean {
    return this._offlineMode;
  }
  public setList(list: Array<TaskModel>) {
    this._list = list;
    this.saveToLocalStorage();
  }
  public setDetails(details: TaskModel) {
    this._details = details;
  }
  private initialize(): void {
    this.loadFromLocalStorage();
    if (this._list.length === 0) {
      this._list = MockDataService.getTasks();
      this.saveToLocalStorage();
    }
    this._listFetched = true;
  }

  public loadFromLocalStorage(): void {
    const stored = localStorage.getItem('tasks');
    if (stored) {
      const tasks = JSON.parse(stored).map((task: unknown) =>
        TaskModel.fromJson(task as Record<string, unknown>),
      );
      this._list = tasks;
    }
  }
  public saveToLocalStorage(): void {
    localStorage.setItem('tasks', JSON.stringify(this._list));
  }
  public async create(task: TaskModel): Promise<TaskModel> {
    const newTask = task.copy();
    newTask.id = this.generateId();
    newTask.createdAt = new Date().toISOString();
    newTask.updatedAt = new Date().toISOString();
    this._list.push(newTask);
    this.saveToLocalStorage();
    if (!this._offlineMode) {
      await this.syncToAPI('create', newTask);
    }
    return newTask;
  }
  public async update(task: TaskModel): Promise<TaskModel> {
    const index = this._list.findIndex((t) => t.id === task.id);
    if (index !== -1) {
      task.updatedAt = new Date().toISOString();
      this._list[index] = task;
      this.saveToLocalStorage();
      if (!this._offlineMode) {
        await this.syncToAPI('update', task);
      }
    }
    return task;
  }
  public async delete(taskId: string): Promise<TaskModel | undefined> {
    const index = this._list.findIndex((t) => t.id === taskId);
    if (index === -1) {
      return undefined;
    }

    const task = this._list[index];
    if (!task) {
      return undefined;
    }

    task.isDeleted = true;
    task.deletedAt = new Date().toISOString();
    task.updatedAt = new Date().toISOString();
    this._list[index] = task;
    this.saveToLocalStorage();
    if (!this._offlineMode) {
      await this.syncToAPI('delete', task);
    }
    return task;
  }
  private syncToAPI(action: string, task: TaskModel): Promise<void> {
    console.log(`Would sync ${action} for task:`, task.id);
    return Promise.resolve();
  }
  public async toggle(taskId: string): Promise<TaskModel | undefined> {
    const task = this._list.find((t) => t.id === taskId);
    if (task) {
      task.isCompleted = !task.isCompleted;
      task.updatedAt = new Date().toISOString();
      this.saveToLocalStorage();

      if (!this._offlineMode) {
        await this.syncToAPI('update', task);
      }

      return task;
    }
    return undefined;
  }

  private generateId(): string {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
