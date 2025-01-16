import { Injectable } from '@nestjs/common';
import { getRegisteredTasks } from './scheduler.decorator';
import { ScheduleTask } from './scheduler.types';
import { CronJob } from 'cron';

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
      const index: number = this._tasks.indexOf(task);

      if (task.type === 'Cron') {
        this.initialiceCronJob(task, index);
      }

      if (task.type === 'Interval') {

      }

      if (task.type === 'Delay') {

      }
    }
  }

  private initialiceCronJob(task: ScheduleTask, index: number): void {
    const cronJob = new CronJob(task.options.cronOptions.cronTime, async () => {
      try {
        const instance = new task.target();
        await instance[task.methodName]();
      } catch (error) {
        console.error(`[initialiceCronJob] Cron '${task.methodName}' Error: ${error}`);
      }
    });

    this._tasks[index].object = cronJob;
    this._tasks[index].object.start();
  }
}