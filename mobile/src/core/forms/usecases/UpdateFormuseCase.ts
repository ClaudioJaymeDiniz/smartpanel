import { FormCreate } from "../domain/entities/Form";
import { IFormRepository } from "../domain/repositories/IFormRepository";

export class UpdateFormUseCase {
  constructor(private formRepository: IFormRepository) {}

  async execute(id: string, data: Partial<FormCreate>) {
    if (!id) throw new Error("ID inválido");

    return this.formRepository.update(id, data);
  }
}