import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { CreateClient } from '@/application/usecases/create-client.usecase';
import { GetClient } from '@/application/usecases/get-client.usecase';
import { ClientEntity } from '@/domain/entities/client.entity';
import { BadRequestError } from '@/application/shared/errors/bad-request-error';
import {ClientController} from "@/infrastructure/controller/client.controller";

describe('Feature: Client API Endpoints', () => {
    let app: INestApplication;
    let createClientUseCase: jest.Mocked<CreateClient.UseCase>;
    let getClientUseCase: jest.Mocked<GetClient.UseCase>;

    beforeAll(async () => {
        createClientUseCase = {
            execute: jest.fn(),
        } as any;

        getClientUseCase = {
            execute: jest.fn(),
        } as any;

        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [ClientController],
            providers: [
                { provide: CreateClient.UseCase, useValue: createClientUseCase },
                { provide: GetClient.UseCase, useValue: getClientUseCase },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Scenario: Creating a new client with valid input', () => {
        it('Should return 201 and the created client', async () => {
            // Given valid client input
            const input = { name: 'Victor B', cpf: '529.982.247-25' };
            const output = new ClientEntity({
                name: 'Victor B',
                cpf: '52998224725',
                email: '52998224725@victorb.com',
                password: '52998224725',
            });

            createClientUseCase.execute.mockResolvedValue(output);

            // When making a POST request to /clients
            const response = await request(app.getHttpServer())
                .post('/clients')
                .send(input)
                .expect(201);

            // Then it should return the client data
            expect(response.body).toEqual({
                name: output.name,
                cpf: output.cpf,
                email: output.email,
                password: output.password,
            });
        });
    });

    describe('Scenario: Getting a client by valid CPF', () => {
        it('Should return 200 and the client data', async () => {
            // Given a valid CPF
            const cpf = '52998224725';
            const client = new ClientEntity({
                name: 'Victor B',
                cpf,
                email: '52998224725@victorb.com',
                password: '52998224725',
            });

            getClientUseCase.execute.mockResolvedValue(client);

            // When making a GET request to /clients/:cpf
            const response = await request(app.getHttpServer())
                .get(`/clients/${cpf}`)
                .expect(200);

            // Then it should return the client
            expect(response.body).toEqual({
                name: client.name,
                cpf: client.cpf,
                email: client.email,
                password: client.password,
            });
        });
    });

    describe('Scenario: Creating a client with invalid CPF', () => {
        it('Should return 400 BadRequestError', async () => {
            // Given the use case throws a BadRequestError
            createClientUseCase.execute.mockRejectedValue(new BadRequestError('Invalid CPF'));

            const invalidInput = { name: 'Test', cpf: '111.111.111-11' };

            // When making a POST request
            const response = await request(app.getHttpServer())
                .post('/clients')
                .send(invalidInput)
                .expect(400);

            // Then it should contain the error message
            expect(response.body.message).toContain('Invalid CPF');
        });
    });
});
