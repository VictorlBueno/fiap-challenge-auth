import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from '@/infrastructure/modules/app.module';
import { ClientEntity } from '@/domain/entities/client.entity';

// Mock do IamService para ser injetado no ClientModule via AppModule
const mockIamService = {
    createUser: jest.fn(),
    getUserDetailsByUsername: jest.fn(),
};

describe('Feature: Client API Integration through AppModule', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider('IamService')
            .useValue(mockIamService)
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Scenario: Create a client', () => {
        it('Given valid client data, when POST /clients, then create client successfully', async () => {
            const input = {
                name: 'Victor B',
                cpf: '52998224725',
                password: '52998224725',
                email: '52998224725@victorb.com',
            };

            const createdClient = new ClientEntity(input);
            createdClient.id = 'user-sub-123';

            mockIamService.createUser.mockResolvedValueOnce(createdClient);

            const response = await request(app.getHttpServer())
                .post('/clients')
                .send(input)
                .expect(201);

            expect(mockIamService.createUser).toHaveBeenCalledWith(expect.objectContaining({
                name: input.name,
                cpf: input.cpf,
                password: input.password,
                email: input.email,
            }));

            expect(response.body).toMatchObject({
                id: 'user-sub-123',
                name: input.name,
                cpf: input.cpf,
                email: input.email,
            });
        });
    });

    describe('Scenario: Get client by CPF', () => {
        it('Given existing client CPF, when GET /clients/:cpf, then return client data', async () => {
            const cpf = '52998224725';

            const client = new ClientEntity({
                id: 'user-sub-123',
                cpf,
                name: 'Victor B',
                email: '52998224725@victorb.com',
            });

            mockIamService.getUserDetailsByUsername.mockResolvedValueOnce(client);

            const response = await request(app.getHttpServer())
                .get(`/clients/${cpf}`)
                .expect(200);

            expect(mockIamService.getUserDetailsByUsername).toHaveBeenCalledWith(cpf);

            expect(response.body).toMatchObject({
                id: 'user-sub-123',
                cpf,
                name: 'Victor B',
                email: '52998224725@victorb.com',
            });
        });
    });
});
