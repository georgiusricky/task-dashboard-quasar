import { UserModel } from '../models/UserModel';
import { MockDataService } from './MockDataService';

export class UserService {
  private static instance?: UserService;

  private constructor() {
    if (UserService.instance instanceof UserService) {
      return UserService.instance;
    }
    UserService.instance = this;
    this.initialize();
  }

  public static getInstance(): UserService {
    return new UserService();
  }

  _list = [] as Array<UserModel>;
  private _listFetched = false;

  public get list(): Array<UserModel> {
    return this._list;
  }

  private initialize(): void {
    this.loadFromLocalStorage();
    if (this._list.length === 0) {
      this._list = MockDataService.getUsers();
      this.saveToLocalStorage();
    }
    this._listFetched = true;
  }

  public loadFromLocalStorage(): void {
    const stored = localStorage.getItem('users');
    if (stored) {
      const users = JSON.parse(stored).map((user: unknown) =>
        UserModel.fromJson(user as Record<string, unknown>),
      );
      this._list = users;
    }
  }

  public saveToLocalStorage(): void {
    localStorage.setItem('users', JSON.stringify(this._list));
  }

  public getUserById(userId: string): UserModel | undefined {
    return this._list.find((user) => user.id === userId);
  }

  public getUserByName(name: string): UserModel | undefined {
    return this._list.find((user) => user.name.toLowerCase().includes(name.toLowerCase()));
  }

  public getAllUsers(): UserModel[] {
    return this._list;
  }
}
