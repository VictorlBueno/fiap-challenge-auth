import { ClientEntity } from '@/domain/entities/client.entity';
import { UsernameExistsError } from '@/infrastructure/shared/errors/username-exists-error';
import { NotFoundError } from '@/infrastructure/shared/errors/not-found-error';
import {
    CognitoIdentityProviderClient,
    SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {CognitoService} from "@/infrastructure/gateway/cognito.service";

jest.mock('@aws-sdk/client-cognito-identity-provider');

describe('Feature: AWS Cognito User Management', () => {
    let cognitoService: CognitoService;
    let cognitoClientMock: jest.Mocked<CognitoIdentityProviderClient>;

    beforeEach(() => {
        cognitoService = new CognitoService();

        cognitoClientMock = (cognitoService as any).cognitoClient;
        cognitoClientMock.send = jest.fn() as jest.Mock;
    });

    describe('Scenario: Successfully creating a new user', () => {
        it('Should create a user and return a ClientEntity with user id', async () => {
            // Given a client to register
            const client = new ClientEntity({
                cpf: '52998224725',
                password: '52998224725',
                name: 'Victor B',
                email: '52998224725@victorb.com',
            });

            // Mock Cognito SignUpCommand response
            cognitoClientMock.send.mockResolvedValueOnce({ UserSub: 'fake-user-sub-123' } as never);

            // When calling createUser
            const createdClient = await cognitoService.createUser(client);

            // Then it should call Cognito with correct command
            expect(cognitoClientMock.send).toHaveBeenCalledWith(expect.any(SignUpCommand));
            // And the returned client must contain the UserSub as id
            expect(createdClient.id).toBe('fake-user-sub-123');
            expect(createdClient.cpf).toBe(client.cpf);
        });
    });

    describe('Scenario: Creating a user that already exists', () => {
        it('Should throw UsernameExistsError', async () => {
            const client = new ClientEntity({
                cpf: '52998224725',
                password: '52998224725',
                name: 'Victor B',
                email: '52998224725@victorb.com',
            });

            // Mock error from Cognito for existing username
            cognitoClientMock.send.mockRejectedValueOnce({ name: 'UsernameExistsException' } as never);

            // When calling createUser with existing user
            await expect(cognitoService.createUser(client)).rejects.toThrow(UsernameExistsError);

            // And Cognito was called exactly once
            expect(cognitoClientMock.send).toHaveBeenCalledTimes(1);
        });
    });

    describe('Scenario: Successfully fetching user details by username', () => {
        it('Should return a ClientEntity with user info', async () => {
            // Given username to query
            const username = '52998224725';

            // Mock Cognito AdminGetUserCommand response
            cognitoClientMock.send.mockResolvedValueOnce({
                Username: username,
                UserAttributes: [
                    { Name: 'sub', Value: 'user-sub-456' },
                    { Name: 'name', Value: 'Victor B' },
                    { Name: 'email', Value: '52998224725@victorb.com' },
                ],
            } as never);

            // When calling getUserDetailsByUsername
            const client = await cognitoService.getUserDetailsByUsername(username);

            // Then the client entity must have the data from Cognito
            expect(client).toBeInstanceOf(ClientEntity);
            expect(client.id).toBe('user-sub-456');
            expect(client.cpf).toBe(username);
            expect(client.name).toBe('Victor B');
        });
    });

    describe('Scenario: Fetching user details for non-existing user', () => {
        it('Should throw NotFoundError', async () => {
            const username = 'nonexistentuser';

            // Mock Cognito error for user not found
            cognitoClientMock.send.mockRejectedValueOnce({ name: 'ResourceNotFoundException' } as never);

            // When querying non-existing user
            await expect(cognitoService.getUserDetailsByUsername(username)).rejects.toThrow(NotFoundError);
        });
    });
});
