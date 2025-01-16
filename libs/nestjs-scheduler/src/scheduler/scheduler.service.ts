import { Injectable } from '@nestjs/common';
import { CronJob } from 'cron';
import { getRegisteredTasks } from './scheduler.decorator';
import { ScheduleTask } from './scheduler.types';

@Injectable()
export class SchedulerService {

  private _tasks: ScheduleTask[];
  
  constructor() {
    this._tasks = [];
  }

  private async onModuleInit(): Promise<void> {
    this._tasks = getRegisteredTasks() ?? [];
    if (!this._tasks || this._tasks.length == 0) return;

    for (const task of this._tasks) {
      const index: number = this._tasks.indexOf(task);

      if (task.type === 'Cron') {
        this.initialiceCronJob(task, index);
      }

      if (task.type === 'Interval') {
        this.initialiceIntervalJob(task, index);
      }

      if (task.type === 'Delay') {
        await this.initialiceDelayJob(task, index);
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

  private initialiceIntervalJob(task: ScheduleTask, index: number): void {
    const intervalJob = setInterval(async () => {
      try {
        const instance = new task.target();
        await instance[task.methodName]();
      } catch (error) {
        console.error(`[initialiceIntervalJob] Interval '${task.methodName}' Error: ${error}`);
      }
    }, task.options.intervalOptions.intervalTime);

    this._tasks[index].object = intervalJob;
    // clearInterval(this.mapmanager.get(this._intervals, body.name));
  }

  private initialiceDelayJob(task: ScheduleTask, index: number): void {
    const timeOutJob: NodeJS.Timeout = setTimeout(async () => {
      try {
        const instance = new task.target();
        await instance[task.methodName]();
      } catch (error) {
        console.error(`[initialiceDelayJob] Delay '${task.methodName}' Error: ${error}`);
      }
    }, task.options.delayOptions.delayTime);

    this._tasks[index].object = timeOutJob;
  }
}