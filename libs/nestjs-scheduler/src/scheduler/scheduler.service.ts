import { Injectable } from '@nestjs/common';
import * as cron from 'node-cron';
import { getRegisteredTasks } from './scheduler.decorator';
import { ScheduleTask } from './scheduler.types';

@Injectable()
export class SchedulerService {

  private _tasks: ScheduleTask[];
  
  constructor() {
    this._tasks = [];
  }

  async onModuleInit(): Promise<void> {
    this._tasks = getRegisteredTasks() ?? [];
    if (!this._tasks || this._tasks.length == 0) return;

    for (const task of this._tasks) {
      console.log(task.name)

      if (task.type === 'Cron') {
      this.initialiceCronJob(task);
      }

      if (task.type === 'Interval') {

      }

      if (task.type === 'Delay') {

      }
    }
  }

  private initialiceCronJob(task: ScheduleTask): void {
    cron.schedule(task.options.cronOptions.cronTime, async () => {
      try {
        const instance = new task.target();
        await instance[task.methodName]();
      } catch (error) {
        console.error(`[initialiceCronJob] Cron '${task.methodName}' Error: ${error}`);
      }
    });
  }
}