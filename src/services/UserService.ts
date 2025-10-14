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

  public setList(list: Array<UserModel>) {
    this._list = list;
    this.saveToLocalStorage();
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

  public create(user: UserModel): UserModel {
    const newUser = new UserModel({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role ?? 'member',
    });
    this._list.push(newUser);
    this.saveToLocalStorage();
    return newUser;
  }

  public update(user: UserModel): UserModel {
    const index = this._list.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      this._list[index] = new UserModel({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role ?? 'member',
      });
      this.saveToLocalStorage();
    }
    return user;
  }

  public delete(userId: string): UserModel | undefined {
    const index = this._list.findIndex((u) => u.id === userId);
    if (index === -1) return undefined;
    const [removed] = this._list.splice(index, 1);
    this.saveToLocalStorage();
    return removed;
  }
}
