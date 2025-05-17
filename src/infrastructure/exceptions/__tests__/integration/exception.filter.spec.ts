import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication, HttpException, HttpStatus} from '@nestjs/common';
import * as request from 'supertest';
import {GlobalExceptionFilter} from '@/infrastructure/exceptions/exception.filter';
import {Controller, Get} from '@nestjs/common';

@Controller('test')
class TestExceptionController {
    @Get('http-exception-string')
    throwHttpExceptionString() {
        throw new HttpException('Custom string message', HttpStatus.BAD_REQUEST);
    }

    @Get('http-exception-object')
    throwHttpExceptionObject() {
        throw new HttpException({message: 'Custom object message'}, HttpStatus.NOT_FOUND);
    }

    @Get('error-exception')
    throwErrorException() {
        throw new Error('Standard error message');
    }

    @Get('unknown-exception')
    throwUnknown() {
        throw { some: 'unknown' };
    }
}

describe('Feature: GlobalExceptionFilter catches exceptions and returns formatted response', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [TestExceptionController],
        }).compile();

        app = moduleFixture.createNestApplication();

        app.useGlobalFilters(new GlobalExceptionFilter());

        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('Scenario: Should return HTTP 400 with string message from HttpException', async () => {
        const response = await request(app.getHttpServer()).get('/test/http-exception-string');
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body).toEqual({message: 'Custom string message'});
    });

    it('Scenario: Should return HTTP 404 with object message from HttpException', async () => {
        const response = await request(app.getHttpServer()).get('/test/http-exception-object');
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({message: 'Custom object message'});
    });

    it('Scenario: Should return HTTP 500 with message from standard Error', async () => {
        const response = await request(app.getHttpServer()).get('/test/error-exception');
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({message: 'Standard error message'});
    });

    it('Scenario: Should return HTTP 500 with generic message for unknown exceptions', async () => {
        const response = await request(app.getHttpServer()).get('/test/unknown-exception');
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({message: 'Ocorreu um erro inesperado.'});
    });
});
