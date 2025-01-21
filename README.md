<p align="center">
  <img src="sco-techlab.png" alt="plot" width="250" />
</p>

## Nest.JS Scheduler
Nest.JS Scheduler is a easy scheduler manager (Cron, Interval, Delay) for Nest.JS framework.
Enables you to schedule tasks and manage their execution, from decorator or programmatically.

### Get Started
- Install dependency
<pre>
npm i @sco-techlab/nestjs-scheduler
</pre>
- Import SchedulerModule module in your 'app.module.ts' file with register method
<pre>
import { Module } from '@nestjs/common';
import { SchedulerModule } from '@app/nestjs-scheduler';

@Module({
  imports: [
    SchedulerModule.register(),
  ],
})
export class AppModule {}
</pre>
- Module import is global mode, to use gridfs service only need to provide constructor dependency inyection

### Nest.JS Scheduler types
<pre>

export type ExecutionType = 'Cron' | 'Interval' | 'Delay' | 'RunAt';

export class ScheduleTask {
  type: ExecutionType; // Type of execution
  name: string; // Name of the task, must be unique
  options: ScheduleOptions; // Options / parameters of the task
  context: any; // Context to execute
  fn?: any; // Function to execute
  object?: any; // Object to save the execution
  response?: any; // Response of the execution
}

export interface ScheduleOptions {
  priority?: number; // Priority of execution of initial decorator tasks
  cronTime?: string; // Cron time value for cron tasks
  ms?: number; // Milliseconds value for interval tasks
  runAt?: Date; // Date value for runAt tasks
  timeZone?: string; // Timezone value for cron and runAt tasks, on runAt
}
</pre>

### Implementation example
<pre>
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
</pre>

### Examples
- Live coding: [Stackblitz example](https://stackblitz.com/edit/nestjs-typescript-starter-8fth79jg)

## Author
Santiago Comeras Oteo
- <a href="https://web.sco-techlab.es/">SCO Techlab</a>
- <a href="https://github.com/SCO-Techlab">GitHub</a>
- <a href="https://www.npmjs.com/settings/sco-techlab/packages">Npm</a>
- <a href="https://www.linkedin.com/in/santiago-comeras-oteo-4646191b3/">LinkedIn</a>  

<p align="center">
  <img src="sco-techlab.png" alt="plot" width="250" />
</p>