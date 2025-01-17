import { Injectable } from "@nestjs/common";
import { of } from "rxjs";
import { Schedule, SchedulerContext, SchedulerService, ScheduleTask } from "@app/nestjs-scheduler";

@Injectable()
export class CronesService extends SchedulerContext {

    private cronesServiceExecutionCounter: number = 0;

    constructor(private readonly schedulerService: SchedulerService) { 
        super(schedulerService);
    
        // Add Programatically Cron Task
        this.schedulerService.addTasks(
            { 
                type: 'Cron', 
                name: 'crones_cron_1_service', 
                options: { cronTime: '*/5 * * * * *',  },
                context: this,
                fn: async () => {
                    this.cronesServiceExecutionCounter++;
                    return of(this.cronesServiceExecutionCounter);
                }
            },
        );

        // Subscribe to Programatically task
        this.schedulerService.subscribeToTask('crones_cron_1_service').subscribe((data: ScheduleTask) => {
            console.log("Sub crones_cron_1_service: " + data?.response)
        });

        // Subscribe to Decorator task
        this.schedulerService.subscribeToTask('crones_cron_1_decorator').subscribe((data: ScheduleTask) => {
            console.log("Sub crones_cron_1_decorator: " + data?.response)
        });
    }

    @Schedule('Cron', 'crones_cron_1_decorator', { cronTime: '*/5 * * * * *',  })
    async handleTask() {
        return of(this.cronesServiceExecutionCounter);
    }
}
