import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

import { ClientEntity } from '@/domain/entities/client.entity';
import {ClientModule} from "@/infrastructure/modules/client.module";

const mockCognitoService = {
    createUser: jest.fn(),
    getUserDetailsByUsername: jest.fn(),
};

describe('Feature: Client API Integration (ClientModule)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [ClientModule],
        })
            .overrideProvider('IamService')
            .useValue(mockCognitoService)
            .compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Scenario: Successfully creating a client via POST /clients', () => {
        it('Given valid client data, when creating client, then should respond with created client data', async () => {
            // Given
            const input = {
                name: 'Victor B',
                cpf: '52998224725',
                password: '52998224725',
                email: '52998224725@victorb.com',
            };

            const returnedClient = new ClientEntity(input);
            returnedClient.id = 'user-sub-123';

            mockCognitoService.createUser.mockResolvedValueOnce(returnedClient);

            // When / Then
            const response = await request(app.getHttpServer())
                .post('/clients')
                .send(input)
                .expect(201);

            // Check that createUser was called with object **without id**
            expect(mockCognitoService.createUser).toHaveBeenCalledWith(expect.objectContaining({
                name: input.name,
                cpf: input.cpf,
                password: input.password,
                email: input.email,
            }));

            // Check response body has id
            expect(response.body).toMatchObject({
                id: 'user-sub-123',
                name: input.name,
                cpf: input.cpf,
                email: input.email,
            });
        });
    });

    describe('Scenario: Getting client by CPF via GET /clients/:cpf', () => {
        it('Given existing client CPF, when fetching client, then should return client data', async () => {
            // Given
            const cpf = '52998224725';
            const clientData = new ClientEntity({
                cpf,
                name: 'Victor B',
                id: 'user-sub-123',
                email: '52998224725@victorb.com',
            });

            mockCognitoService.getUserDetailsByUsername.mockResolvedValueOnce(clientData);

            // When
            const response = await request(app.getHttpServer())
                .get(`/clients/${cpf}`)
                .expect(200);

            // Then
            expect(response.body).toMatchObject({
                id: 'user-sub-123',
                cpf,
                name: 'Victor B',
                email: '52998224725@victorb.com',
            });
            expect(mockCognitoService.getUserDetailsByUsername).toHaveBeenCalledWith(cpf);
        });
    });

    describe('Scenario: Validation error on create client with invalid data', () => {
        it('Given invalid client data, when creating client, then should respond with 400', async () => {
            // Given invalid input missing required fields
            const input = { name: '', cpf: 'invalidcpf' };

            // When
            await request(app.getHttpServer())
                .post('/clients')
                .send(input)
                .expect(400);
        });
    });
});
