import * as Crypto from 'expo-crypto';
import { ISubmissionRepository } from '@/core/forms/domain/repositories/ISubmissionRepository';

export class SubmitFormUseCase {
  constructor(private repository: ISubmissionRepository) {}

  async execute(formId: string, formData: Record<string, any>, userId: string) {
    const submission = {
      id: Crypto.randomUUID(),
      formId,
      userId,
      formData,
      createdAt: new Date().toISOString()
    };

    return await this.repository.send(submission);
  }
}