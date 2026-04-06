import { Submission } from '@/core/forms/domain/entities/Submission';

export class SubmissionMapper {
  static toDomain(raw: any): Submission {
    return {
      id: raw.id,
      formData: raw.formData || {},
      userId: raw.userId,
      formId: raw.formId,
      createdAt: new Date(raw.createdAt),
      user: raw.user ? { name: raw.user.name, email: raw.user.email } : undefined,
    };
  }

  static toDomainList(rawList: any[]): Submission[] {
    return rawList.map(item => this.toDomain(item));
  }
}