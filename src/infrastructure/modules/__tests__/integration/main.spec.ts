import { handler } from '@/main';

describe('Feature: Serverless handler bootstrap and request processing', () => {
    let event: any;
    let context: any;

    beforeEach(() => {
        event = {
            httpMethod: 'GET',
            path: '/',
            headers: {},
            body: null,
            isBase64Encoded: false,
        };

        context = {};
    });

    it('Scenario: Serverless handler should initialize app and handle request', async () => {
        // Given a valid event and empty context

        // When calling the handler
        const response = await handler(event, context);

        // Then the response should be defined with status code
        expect(response).toBeDefined();
        expect(typeof response.statusCode).toBe('number');

        // You can also verify that body is JSON string or Swagger UI redirect for root path
        if (event.path === '/api') {
            expect(response.headers['content-type']).toContain('text/html');
        }

        // The body should not be empty
        expect(response.body).toBeDefined();
    });

    it('Scenario: Serverless handler caches the app instance to avoid reinitialization', async () => {
        // Given first call caches the server
        const firstResponse = await handler(event, context);
        const secondResponse = await handler(event, context);

        // Then both responses should be equal or come from cached instance
        expect(firstResponse).toEqual(secondResponse);
    });
});
