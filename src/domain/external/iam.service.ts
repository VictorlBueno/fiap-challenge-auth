import {ClientEntity} from "../entities/client.entity";

export interface IamService {
    createUser(client: ClientEntity): Promise<ClientEntity>;

    getUserDetailsByUsername(username: string): Promise<ClientEntity>;
}