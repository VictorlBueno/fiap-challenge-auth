import {UseCase as DefaultUseCase} from "@/application/shared/usecases/usecase";
import {ClientEntity} from "@/domain/entities/client.entity";
import {IamService} from "@/domain/external/iam.service";
import {BadRequestError} from "@/application/shared/errors/bad-request-error";
import {cpf} from 'cpf-cnpj-validator';

/**
 * Como o sistema é baseado em um totem, não exijo uma senha e nem e-mail para agilidade e até mesmo
 * evitar frustração por esquecimento do cliente.
 *
 * Então defino a senha como o mesmo número do cpf, e o e-mail algo aleatório, devido a limitação do cognito
 * para esta função e para que, se futuramente for evoluir para um aplicativo, este usuário pode reaproveitar o
 * cadastro.
 */
export namespace CreateClient {
    export type Input = {
        name: string;
        cpf: string;
    };

    export type Output = ClientEntity;

    export class UseCase implements DefaultUseCase<Input, Output> {
        constructor(private iamService: IamService) {
        }

        async execute(input: Input): Promise<Output> {
            const cleanedCpf = this.cleanCpf(input.cpf)

            if (!input.cpf || !cpf.isValid(cleanedCpf)) {
                throw new BadRequestError("CPF inválido.")
            }

            const clientEntity = new ClientEntity({
                name: input.name,
                cpf: cleanedCpf,
                password: cleanedCpf,
                email: this.generateEmail(input.name, cleanedCpf)
            })

            return await this.iamService.createUser(clientEntity);
        }

        private generateEmail(name: string, cpf: string) {
            name = name.replace(/\s+/g, '').toLowerCase()
            return `${cpf}@${name}.com`
        }

        private cleanCpf(cpf: string) {
            return cpf.replace(/[^a-zA-Z0-9\s]/g, '');
        }
    }
}