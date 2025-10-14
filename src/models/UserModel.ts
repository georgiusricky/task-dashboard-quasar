export interface UserModelParams {
  id?: string | undefined;
  name: string;
  email: string;
  avatar?: string | null;
  role?: string;
}

export class UserModel {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;

  constructor(params: UserModelParams) {
    this.id = params.id ?? UserModel.generateId();
    this.name = params.name;
    this.email = params.email;
    this.avatar = params.avatar ?? null;
    this.role = params.role ?? 'member';
  }

  static fromJson(json?: Record<string, unknown>): UserModel {
    if (!json) return new UserModel({ name: '', email: '' });
    
    return new UserModel({
      id: typeof json.id === 'string' ? json.id : undefined,
      name: typeof json.name === 'string' ? json.name : '',
      email: typeof json.email === 'string' ? json.email : '',
      avatar: typeof json.avatar === 'string' ? json.avatar : null,
      role: typeof json.role === 'string' ? json.role : 'member',
    });
  }

  get initials(): string {
    return this.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  static generateId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}