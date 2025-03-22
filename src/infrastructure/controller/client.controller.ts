import {Body, Controller, Get, Param, Post} from "@nestjs/common";
import {ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {CreateClient} from "@/application/usecases/create-client.usecase";
import {ClientEntity} from "@/domain/entities/client.entity";
import {GetClient} from "@/application/usecases/get-client.usecase";

@ApiTags("clients")
@Controller("clients")
export class ClientController {
    constructor(
        private readonly createClientUseCase: CreateClient.UseCase,
        private readonly getClientUseCase: GetClient.UseCase,
    ) {
    }

    @Post()
    @ApiOperation({summary: 'Create a new client'})
    @ApiResponse({
        status: 201,
        type: ClientEntity
    })
    @ApiResponse({status: 400, description: 'Invalid input data.'})
    async create(@Body() dto: CreateClient.Input): Promise<CreateClient.Output> {
        return this.createClientUseCase.execute(dto);
    }

    @Get(":cpf")
    @ApiOperation({summary: 'Get a client'})
    @ApiResponse({
        status: 200,
        type: ClientEntity
    })
    @ApiResponse({status: 400, description: 'Invalid input data.'})
    async get(@Param() dto: GetClient.Input): Promise<GetClient.Output> {
        return this.getClientUseCase.execute(dto);
    }
}