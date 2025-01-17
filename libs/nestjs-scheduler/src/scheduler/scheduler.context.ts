import { SchedulerService } from "./scheduler.service";

export abstract class SchedulerContext {
    constructor(schedulerService: SchedulerService) {
        if (schedulerService.constructor.name !== 'SchedulerService')
            throw new Error('SchedulerContext must require a SchedulerService instance');

        schedulerService.context = this;
    }
}