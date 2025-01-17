<p align="center">
  <img src="sco-techlab.png" alt="plot" width="250" />
</p>

## Nest.JS Gridfs MongoDB
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