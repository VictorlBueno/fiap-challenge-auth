import {Module} from "@nestjs/common";
import {CognitoService} from "@/infrastructure/external/cognito.service";
import {CreateClient} from "@/application/usecases/create-client.usecase";
import {IamService} from "@/domain/external/iam.service";
import {ClientController} from "@/infrastructure/controller/client.controller";
import {GetClient} from "@/application/usecases/get-client.usecase";

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
                iamService: IamService,
            ) => {
                return new CreateClient.UseCase(iamService);
            },
            inject: ["IamService"],
        },
        {
            provide: GetClient.UseCase,
            useFactory: (
                iamService: IamService,
            ) => {
                return new GetClient.UseCase(iamService);
            },
            inject: ["IamService"],
        },
    ],
})

export class ClientModule {
}
