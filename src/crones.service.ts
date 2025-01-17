import { Injectable } from '@nestjs/common';
import { of } from 'rxjs';
import {
  Schedule,
  SchedulerContext,
  SchedulerService,
  ScheduleTask,
} from '@app/nestjs-scheduler';

// Extend the Service Class from SchedulerContext to set the service context (this) to the tasks
@Injectable()
export class CronesService extends SchedulerContext {
  private cronesServiceExecutionCounter: number = 0;
  private cronesDecoratorExecutionCounter: number = 0;

  // Inject SchedulerService and pass it as param to SchedulerContext in super()
  constructor(private readonly schedulerService: SchedulerService) {
    super(schedulerService);

    // Add Programatically Cron Task
    this.schedulerService.addTasks({
      type: 'Cron', // Task Type
      name: 'crones_cron_1_service', // Task Name (Unique)
      options: { cronTime: '*/5 * * * * *' }, // Task options
      context: this, // Context
      fn: async () => {
        // CronJob Callback
        this.cronesServiceExecutionCounter++;

        // You are able to return a observable, a promise, a normal value...
        return of(this.cronesServiceExecutionCounter);
      },
    });

    // Subscribe to Programatically task
    this.schedulerService
      .subscribeToTask('crones_cron_1_service') // Task Name
      .subscribe((data: ScheduleTask) => {
        // Subscription response
        console.log('Sub crones_cron_1_service: ' + data?.response);
      });

    // Subscribe to Decorator task
    this.schedulerService
      .subscribeToTask('crones_cron_1_decorator') // Task Name
      .subscribe((data: ScheduleTask) => {
        // Subscription response
        console.log('Sub crones_cron_1_decorator: ' + data?.response);
      });
  }

  // Add Decorator Cron Task
  // 1º Task Type, 2º Task Name (Unique), 3º Task Options
  @Schedule('Cron', 'crones_cron_1_decorator', { cronTime: '*/5 * * * * *' })
  async handleTask() {
    this.cronesDecoratorExecutionCounter++;
    return of(this.cronesDecoratorExecutionCounter);
  }
}
