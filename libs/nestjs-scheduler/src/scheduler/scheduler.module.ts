import { DynamicModule, Module } from "@nestjs/common";
import { SchedulerService } from "./scheduler.service";
import { SchedulerStateService } from "./scheduler.state";

@Module({})
export class SchedulerModule {
  static register(): DynamicModule {
    return {
      module: SchedulerModule,
      imports: [],
      controllers: [],
      providers: [
        SchedulerService,
        SchedulerStateService,
      ],
      exports: [
        SchedulerService,
      ],
      global: true,
    };
  }
}