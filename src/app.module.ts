import {Module} from '@nestjs/common';
import {ClientModule} from "@/infrastructure/modules/client.module";

@Module({
    imports: [ClientModule],
})

export class AppModule {
}
