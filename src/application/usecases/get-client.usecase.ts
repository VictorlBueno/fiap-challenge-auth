import {UseCase as DefaultUseCase} from "@/application/shared/usecases/usecase";
import {ClientEntity} from "@/domain/entities/client.entity";
import {IamService} from "@/domain/external/iam.service";

/**
 * Como o sistema é baseado em um totem, apenas verifico a existência do usuário e retorno o seu id, sem a necessidade
 * de geração de um token, e considero um signIn.
 */
export namespace GetClient {
    export type Input = {
        cpf: string;
    };

    export type Output = ClientEntity;

    export class UseCase implements DefaultUseCase<Input, Output> {
        constructor(private iamService: IamService) {
        }

        async execute(input: Input): Promise<Output> {
            return await this.iamService.getUserDetailsByUsername(input.cpf);
        }
    }
}