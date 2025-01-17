import { Injectable } from "@nestjs/common";
import { of } from "rxjs";
import { Schedule, SchedulerContext, SchedulerService, ScheduleTask } from "@app/nestjs-scheduler";

@Injectable()
export class IntervalsService extends SchedulerContext {

    private intervalsServiceExecutionCounter: number = 0;

    constructor(private readonly schedulerService: SchedulerService) { 
        super(schedulerService);

        // Add Programatically Cron Task
        this.schedulerService.addTasks(
            { 
                type: 'Interval', 
                name: 'intervals_interval_1_service', 
                options: { ms: 10000  },
                context: this,
                fn: async () => {
                    return of(this.intervalsServiceExecutionCounter);
                }
            },
        );

         // Subscribe to Programatically task
         this.schedulerService.subscribeToTask('intervals_interval_1_service').subscribe((data: ScheduleTask) => {
            console.log("Sub intervals_interval_1_service: " + data?.response)
        });

        // Subscribe to Decorator task
        this.schedulerService.subscribeToTask('intervals_interval_1_decorator').subscribe((data: ScheduleTask) => {
            console.log("Sub intervals_interval_1_decorator: " + data?.response)
        });
    }

    @Schedule('Interval', 'intervals_interval_1_decorator', { ms: 10000 })
    async decoratorInterval1() {
        this.intervalsServiceExecutionCounter++;
        return of(this.intervalsServiceExecutionCounter);
    }
}
