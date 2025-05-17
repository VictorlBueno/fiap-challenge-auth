import { BadRequestError } from "@/application/shared/errors/bad-request-error";
import { ClientEntity } from "@/domain/entities/client.entity";
import { CreateClient } from "@/application/usecases/create-client.usecase";
import { IIamService } from "@/domain/gateway/IIamService";

describe('Feature: Client Registration', () => {
    let createClientUseCase: CreateClient.UseCase;
    let iamServiceMock: jest.Mocked<IIamService>;

    beforeEach(() => {
        iamServiceMock = {
            createUser: jest.fn()
        } as any;

        createClientUseCase = new CreateClient.UseCase(iamServiceMock);
    });

    describe('Scenario: Registering a client with valid data', () => {
        it('Should create a client using CPF as password and generate an email based on CPF', async () => {
            // Given valid name and CPF
            const input = {
                name: 'Victor B',
                cpf: '529.982.247-25',
            };

            const expectedClient = new ClientEntity({
                name: 'Victor B',
                cpf: '52998224725',
                password: '52998224725',
                email: '52998224725@victorb.com',
            });

            iamServiceMock.createUser.mockResolvedValue(expectedClient);

            // When executing the use case
            const result = await createClientUseCase.execute(input);

            // Then it should call the IAM service with the expected client
            expect(iamServiceMock.createUser).toHaveBeenCalledWith(expectedClient);
            // And it should return a valid ClientEntity with correct email and password
            expect(result).toBeInstanceOf(ClientEntity);
            expect(result.email).toBe('52998224725@victorb.com');
            expect(result.password).toBe('52998224725');
        });
    });

    describe('Scenario: Registering a client with invalid CPF', () => {
        it('Should throw a BadRequestError and not call the IAM service', async () => {
            // Given an invalid CPF
            const input = {
                name: 'Victor B',
                cpf: '111.111.111-11',
            };

            // When executing the use case
            // Then it should throw a BadRequestError
            await expect(createClientUseCase.execute(input)).rejects.toThrow(BadRequestError);
            // And the IAM service should not be called
            expect(iamServiceMock.createUser).not.toHaveBeenCalled();
        });
    });
});
