import {NestFactory} from '@nestjs/core';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {AppModule} from './infrastructure/modules/app.module';
import {GlobalExceptionFilter} from '@/infrastructure/exceptions/exception.filter';
import * as serverless from 'serverless-http';

let cachedServer: serverless.Handler;

async function bootstrap(): Promise<any> {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
        .setTitle('Auth API')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            supportedSubmitMethods: ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'],
            displayRequestDuration: true,
            docExpansion: 'list',
            filter: true,
            showExtensions: true,
            showCommonExtensions: true,
            tryItOutEnabled: true,
        },
        customSiteTitle: 'Fast Food Auth API Docs',
    });

    app.useGlobalFilters(new GlobalExceptionFilter());

    await app.init();
    cachedServer = serverless(app.getHttpAdapter().getInstance());
    return cachedServer;
}

export const handler = async (event: any, context: any) => {
    const server = await bootstrap();
    return server(event, context);
};
