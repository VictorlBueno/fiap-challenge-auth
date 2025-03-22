import {ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus} from '@nestjs/common';
import {Response} from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse<Response>();

        let status = exception.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Ocorreu um erro inesperado.';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const errorResponse = exception.getResponse();

            if (typeof errorResponse === 'string') {
                message = errorResponse;
            } else if (typeof errorResponse === 'object' && errorResponse !== null) {
                message = (errorResponse as any).message || message;
            }
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        response.status(status).json({message});
    }
}