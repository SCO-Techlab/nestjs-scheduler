import { DynamicModule, Module } from "@nestjs/common";
import { SchedulerService } from "./scheduler.service";

@Module({})
export class SchedulerModule {
  static register(): DynamicModule {
    return {
      module: SchedulerModule,
      imports: [],
      controllers: [],
      providers: [
        SchedulerService,
      ],
      exports: [
        SchedulerService,
      ],
      global: true,
    };
  }
}