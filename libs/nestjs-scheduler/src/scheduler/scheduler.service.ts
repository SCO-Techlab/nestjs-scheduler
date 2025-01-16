import { Injectable } from '@nestjs/common';
import { CronJob } from 'cron';
import { getRegisteredTasks, validateTask } from './scheduler.decorator';
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
        initialiceCronJob.bind(this)(task, index);
      }

      if (task.type === 'Interval') {
        initialiceIntervalJob.bind(this)(task, index);
      }

      if (task.type === 'Delay') {
        await initialiceDelayJob.bind(this)(task, index);
      }
    }
  }

  public async addTask(task: ScheduleTask): Promise<boolean> {
    const val_error: string = validateTask(task.type, task.name, task.options);
    if (val_error) {
      console.log(`[addTask] Task '${task.name}' Error: ${val_error}`);
      throw new Error(val_error);
    }

    this._tasks.push(task);
    const index: number = this._tasks.length - 1;

    if (task.type === 'Cron') {
      initialiceCronJob.bind(this)(task, index);
    }

    if (task.type === 'Interval') {
      initialiceIntervalJob.bind(this)(task, index);
    } 

    if (task.type === 'Delay') {
      initialiceDelayJob.bind(this)(task, index);
    }

    return true;
  }

  public async removeTask(name: string): Promise<boolean> {
    const task = this._tasks.find(t => t.name === name);
    if (!task) return false;

    const index: number = this._tasks.indexOf(task);
    if (index < 0) return false;

    try {
      const stop_task: boolean = await this.stopTask(name);
      if (!stop_task) {
        console.error(`[removeTask] Unnable to stop task '${name}'`);
        return false;
      }

      this._tasks.splice(index, 1);
      return true;
    } catch (error) {
      console.error(`[removeTask] Task '${name}' Error: ${error}`);
      return false;
    }
  }

  public async stopTask(name: string): Promise<boolean> {
    const task = this._tasks.find(t => t.name === name);
    if (!task || !task.object) return false;
    
    const index: number = this._tasks.indexOf(task);
    if (index < 0) return false;

    if (task.type === 'Cron') {
      task.object.stop();
    }
    
    if (task.type === 'Interval') {
      clearInterval(task.object);
    }

    if (task.type === 'Delay') {
      clearTimeout(task.object);
    }

    return true;
  }

  public async startTask(name: string): Promise<void> {
    const task = this._tasks.find(t => t.name === name);
    if (!task || !task.object) return;

    const index: number = this._tasks.indexOf(task);
    if (index < 0) return;

    if (task.type === 'Cron') {
      this._tasks[index].object.start();
    }

    if (task.type === 'Interval') {
      this._tasks[index].object.start();
    }

    if (task.type === 'Delay') {
      this._tasks[index].object.start();
    }
  }

  // public async restartTask(name: string): Promise<void> {
  //   await this.stopTask(name);
  //   await this.startTask(name);
  // }
}

function initialiceCronJob(task: ScheduleTask, index: number): void {
  const cronJob = new CronJob(task.options.cronOptions.cronTime, async () => {
    try {
      if (task.target) {
        const instance = new task.target();
        await instance[task.methodName]();
      } else {
        if (task.fn) await task.fn();
      }
    } catch (error) {
      console.error(`[initialiceCronJob] Cron '${task.methodName}' Error: ${error}`);
    }
  });

  this._tasks[index].object = cronJob;
  this._tasks[index].object.start();
}

function initialiceIntervalJob(task: ScheduleTask, index: number): void {
  const intervalJob = setInterval(async () => {
    try {
      if (task.target) {
        const instance = new task.target();
        await instance[task.methodName]();
      } else {
        if (task.fn) await task.fn();
      }
    } catch (error) {
      console.error(`[initialiceIntervalJob] Interval '${task.methodName}' Error: ${error}`);
    }
  }, task.options.intervalOptions.intervalTime);

  this._tasks[index].object = intervalJob;
}

function initialiceDelayJob(task: ScheduleTask, index: number): void {
  const timeOutJob: NodeJS.Timeout = setTimeout(async () => {
    try {
      if (task.target) {
        const instance = new task.target();
        await instance[task.methodName]();
      } else {
        if (task.fn) await task.fn();
      }
    } catch (error) {
      console.error(`[initialiceDelayJob] Delay '${task.methodName}' Error: ${error}`);
    }
  }, task.options.delayOptions.delayTime);

  this._tasks[index].object = timeOutJob;
}