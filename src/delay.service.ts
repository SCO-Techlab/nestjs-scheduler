import { Injectable } from "@nestjs/common";
import { of } from "rxjs";
import { Schedule, SchedulerContext, SchedulerService, ScheduleTask } from "@app/nestjs-scheduler";

@Injectable()
export class DelayService extends SchedulerContext {

    private delayServiceExecutionCounter: number = 0;

    constructor(private readonly schedulerService: SchedulerService) { 
        super(schedulerService);

        // Add Programatically Cron Task
        this.schedulerService.addTasks(
            { 
                type: 'Delay', 
                name: 'delays_delay_1_service', 
                options: { ms: 20000  },
                context: this,
                fn: async () => {
                    return of(this.delayServiceExecutionCounter);
                }
            },
        );

         // Subscribe to Programatically task
         this.schedulerService.subscribeToTask('delays_delay_1_service').subscribe((data: ScheduleTask) => {
            console.log("Sub delays_delay_1_service: " + data?.response)
        });

        // Subscribe to Decorator task
        this.schedulerService.subscribeToTask('delays_delay_1_decorator').subscribe((data: ScheduleTask) => {
            console.log("Sub delays_delay_1_decorator: " + data?.response)
        });
    }

    @Schedule('Delay', 'delays_delay_1_decorator', { ms: 20000 })
    async decoratorDelay1() {
        this.delayServiceExecutionCounter++;
        return of(this.delayServiceExecutionCounter);
    }
}
