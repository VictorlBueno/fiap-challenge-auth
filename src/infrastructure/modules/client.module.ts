import {Module} from "@nestjs/common";
import {CreateClient} from "@/application/usecases/create-client.usecase";
import {ClientController} from "@/infrastructure/controller/client.controller";
import {GetClient} from "@/application/usecases/get-client.usecase";
import {CognitoService} from "@/infrastructure/gateway/cognito.service";
import {IIamService} from "@/domain/gateway/IIamService";

@Module({
    controllers: [ClientController],
    providers: [
        {
            provide: "IamService",
            useFactory: () => {
                return new CognitoService();
            },
            inject: [],
        },
        {
            provide: CreateClient.UseCase,
            useFactory: (
                iamService: IIamService,
            ) => {
                return new CreateClient.UseCase(iamService);
            },
            inject: ["IamService"],
        },
        {
            provide: GetClient.UseCase,
            useFactory: (
                iamService: IIamService,
            ) => {
                return new GetClient.UseCase(iamService);
            },
            inject: ["IamService"],
        },
    ],
})

export class ClientModule {
}
