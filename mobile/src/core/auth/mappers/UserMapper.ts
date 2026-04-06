import { User } from '../../../core/auth/domain/entities/User';

export class UserMapper {
  static toDomain(raw: any): User {
    return {
      id: raw.id,
      email: raw.email,
      name: raw.name,
      provider: raw.provider,
      globalMetadata: raw.globalMetadata,
      createdAt: new Date(raw.createdAt),
    };
  }
}