import type { TaskModel } from '../models/TaskModel';
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

  private static _tasks: TaskModel[] = [];

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
