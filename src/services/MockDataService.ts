import { TaskModel } from '../models/TaskModel';
import { UserModel } from '../models/UserModel';

export class MockDataService {
  private static _users: UserModel[] = [
    new UserModel({
      id: 'user_1',
      name: 'Ricky',
      email: 'ricky.georgius@gmail.com',
      role: 'Software Engineer',
    }),
  ];

  private static _tasks: TaskModel[] = [
    new TaskModel({
      id: 'task_1760484360103_stu564ue9',
      title: 'User Management',
      description: '',
      isCompleted: true,
      priority: 'medium',
      dueDate: '2025-10-15',
      assignedTo: 'user_1',
      createdAt: '2025-10-14T23:26:00.103Z',
      updatedAt: '2025-10-14T23:26:03.645Z',
      isDeleted: false,
      deletedAt: null,
    }),
    new TaskModel({
      id: 'task_1760484402390_v197irsva',
      title: 'Task List',
      description: 'Show task list and divide based on the stats',
      isCompleted: true,
      priority: 'high',
      dueDate: '2025-10-16',
      assignedTo: 'user_1',
      createdAt: '2025-10-14T23:26:42.390Z',
      updatedAt: '2025-10-14T23:26:45.269Z',
      isDeleted: false,
      deletedAt: null,
    }),
    new TaskModel({
      id: 'task_1760484436369_qnjifs7jh',
      title: 'Integrate Backend API',
      description: 'Waiting for the API from backend',
      isCompleted: false,
      priority: 'high',
      dueDate: '2025-10-31',
      assignedTo: 'user_1',
      createdAt: '2025-10-14T23:27:16.369Z',
      updatedAt: '2025-10-14T23:27:16.369Z',
      isDeleted: false,
      deletedAt: null,
    }),
    new TaskModel({
      id: 'task_1760484456317_9j7ifc33l',
      title: 'Documentation',
      description: '',
      isCompleted: false,
      priority: 'medium',
      dueDate: '2025-10-14',
      assignedTo: 'user_1',
      createdAt: '2025-10-14T23:27:36.317Z',
      updatedAt: '2025-10-14T23:27:36.317Z',
      isDeleted: false,
      deletedAt: null,
    }),
  ];

  static getUsers(): UserModel[] {
    return this._users;
  }

  static getTasks(): TaskModel[] {
    return this._tasks;
  }

  static getUserById(userId: string): UserModel | undefined {
    return this._users.find((user) => user.id === userId);
  }

  static getUserByName(name: string): UserModel | undefined {
    return this._users.find((user) => user.name.toLowerCase().includes(name.toLowerCase()));
  }
}
