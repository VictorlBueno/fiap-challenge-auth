import {ClientEntity} from "../entities/client.entity";

export interface IIamService {
    createUser(client: ClientEntity): Promise<ClientEntity>;

    getUserDetailsByUsername(username: string): Promise<ClientEntity>;
}