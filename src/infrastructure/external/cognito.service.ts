import {createHmac} from 'crypto';
import {
    AdminGetUserCommand,
    CognitoIdentityProviderClient,
    SignUpCommand
} from "@aws-sdk/client-cognito-identity-provider";
import {ClientEntity} from "@/domain/entities/client.entity";
import {UsernameExistsError} from "@/infrastructure/shared/errors/username-exists-error";
import {NotFoundError} from "@/infrastructure/shared/errors/not-found-error";
import {IamService} from "@/domain/external/iam.service";

export class CognitoService implements IamService{
    private cognitoClient: CognitoIdentityProviderClient;
    private clientId: string = '4cfnvonicktdark421fvtp0p7v';
    private clientSecret: string = '1i2abo0j35mei4j0lkfdl00qo1oc9lhopb1ku3cehr27qdp50otk';
    private userPoolId: string = 'us-east-1_TqEVTFJix';

    constructor() {
        this.cognitoClient = new CognitoIdentityProviderClient({
            region: 'us-east-1',
        });
    }

    async createUser(client: ClientEntity): Promise<ClientEntity> {
        const secretHash = this.calculateSecretHash(client.cpf);

        const params = {
            ClientId: this.clientId,
            Username: client.cpf,
            Password: client.password,
            SecretHash: secretHash,
            UserAttributes: [
                {Name: 'name', Value: client.name},
                {Name: 'email', Value: client.email},
            ],
        };

        try {
            const command = new SignUpCommand(params);
            const signUpResponse = await this.cognitoClient.send(command);

            client.id = signUpResponse.UserSub;
            return client;
        } catch (error: any) {
            if (error.name === "UsernameExistsException") {
                throw new UsernameExistsError("Usuário já existe");
            }

            console.error("Erro ao criar usuário:", error.code || error.message);
            throw new Error('Erro ao criar usuário no Cognito');
        }
    }

    async getUserDetailsByUsername(username: string): Promise<ClientEntity> {
        const params = {
            UserPoolId: this.userPoolId,
            Username: username,
        };

        try {
            const command = new AdminGetUserCommand(params);
            const userResponse = await this.cognitoClient.send(command);

            return new ClientEntity({
                cpf: userResponse.Username,
                id: userResponse.UserAttributes?.find(attr => attr.Name === 'sub')?.Value || '',
                name: userResponse.UserAttributes?.find(attr => attr.Name === 'name')?.Value || '',
            });
        } catch (error: any) {
            if (error.name === 'ResourceNotFoundException') {
                throw new NotFoundError('Usuário não encontrado');
            }

            console.error('Erro ao obter detalhes do usuário:', error);
            throw new Error('Erro ao buscar usuário no Cognito');
        }
    }

    private calculateSecretHash(username: string): string {
        return createHmac('SHA256', this.clientSecret)
            .update(username + this.clientId)
            .digest('base64');
    }
}
