import { Submission, SubmissionCreate } from '../entities/Submission';

export interface ISubmissionRepository {
  send(data: SubmissionCreate): Promise<Submission>;
  listMyHistory(): Promise<Submission[]>;
  listByForm(formId: string): Promise<Submission[]>;
  update(id: string, formData: Record<string, any>): Promise<Submission>;
}