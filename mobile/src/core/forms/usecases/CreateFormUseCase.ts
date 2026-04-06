import { IFormRepository } from '@/core/forms/domain/repositories/IFormRepository';
import { FormCreate } from '@/core/forms/domain/entities/Form';

export class CreateFormUseCase {
  constructor(private repository: IFormRepository) {}
  async execute(data: FormCreate) {
    if (!data.title.trim()) throw new Error("O título é obrigatório");
    if (data.structure.length === 0) throw new Error("Adicione ao menos uma pergunta");

    return await this.repository.create(data);
  }
}