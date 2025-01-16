import { Injectable } from '@nestjs/common';
import { CronJob } from 'cron';
import { fillTaskDefaults, getRegisteredTasks, validateTask } from './scheduler.decorator';
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
      await this.startTasks(task.name);
    }
  }

  public async addTasks(tasks: ScheduleTask[] | ScheduleTask): Promise<boolean> {
    tasks = Array.isArray(tasks) ? tasks : [tasks];
    if (!tasks || tasks.length == 0) throw new Error('Tasks are required');

    for (const task of tasks) {
      const val_error: string = validateTask(task.type, task.name, task.options);
      if (val_error) {
        console.log(`[addTask] Task '${task.name}' Error: ${val_error}`);
        throw new Error(val_error);
      }

      this._tasks.push(fillTaskDefaults(task));
      await this.startTasks(task.name);
    }

    return true;
  }

  public async removeTasks(names: string[] | string): Promise<boolean> {
    names = Array.isArray(names) ? names : [names];
    if (!names || names.length == 0) throw new Error('Names are required');

    for (const task of getTasksByNames.bind(this)(names)) {
      const index: number = this._tasks.indexOf(task);
      const stop_task: boolean = await this.stopTasks(task.name);
      if (!stop_task) {
        throw new Error(`Unnable to stop task ${task.name}`);
      }
      
      this._tasks.splice(index, 1);
    }
    
    return true;
  }

  public async stopTasks(names: string[] | string): Promise<boolean> {
    names = Array.isArray(names) ? names : [names];
    if (!names || names.length == 0) throw new Error('Names are required');
    
    for (const task of getTasksByNames.bind(this)(names)) {
      if (task.type === 'Cron') task.object.stop();
      if (task.type === 'Interval') clearInterval(task.object);
      if (task.type === 'Delay') clearTimeout(task.object);
      if (task.type === 'RunAt') clearTimeout(task.object);
    }

    return true;
  }

  public async startTasks(names: string[] | string): Promise<boolean> {
    names = Array.isArray(names) ? names : [names];
    if (!names || names.length == 0) throw new Error('Names are required');

    for (const task of getTasksByNames.bind(this)(names)) {
      const index: number = this._tasks.indexOf(task);
      if (task.type === 'Cron') initialiceCronJob.bind(this)(task, index);
      if (task.type === 'Interval') initialiceIntervalJob.bind(this)(task, index);
      if (task.type === 'Delay') initialiceDelayJob.bind(this)(task, index);
      if (task.type === 'RunAt') initialiceDelayJob.bind(this)(task, index);
    }

    return true;
  }

  public async restartTasks(names: string[] | string): Promise<boolean> {
    names = Array.isArray(names) ? names : [names];
    if (!names || names.length == 0) throw new Error('Names are required');

    for (const task of getTasksByNames.bind(this)(names)) {
      await this.stopTasks(task.name);
      await this.startTasks(task.name);
    }

    return true;
  }
}

function initialiceCronJob(task: ScheduleTask, index: number): void {
  const cronJob = new CronJob(
    task.options.cronTime, // CronTime
    async () => { // OnTick
      try {
        if (task.decorator) {
          const instance = new task.decorator.target();
          await instance[task.decorator.methodName]();
        } else {
          if (task.fn) await task.fn();
        }
      } catch (error) {
        console.error(`[initialiceCronJob] Cron '${task.name}' Error: ${error}`);
      }
    },
    null, // OnComplete
    false, // Start,
    task.options?.timeZone ? task.options.timeZone : null, // Timezone
  );

  this._tasks[index].object = cronJob;
  this._tasks[index].object.start();
}

function initialiceIntervalJob(task: ScheduleTask, index: number): void {
  const intervalJob = setInterval(async () => {
    try {
      if (task.decorator) {
        const instance = new task.decorator.target();
        await instance[task.decorator.methodName]();
      } else {
        if (task.fn) await task.fn();
      }
    } catch (error) {
      console.error(`[initialiceIntervalJob] Interval '${task.name}' Error: ${error}`);
    }
  }, task.options.ms);

  this._tasks[index].object = intervalJob;
}

function initialiceDelayJob(task: ScheduleTask, index: number): void {
  const timeOutJob: NodeJS.Timeout = setTimeout(async () => {
    try {
      if (task.decorator) {
        const instance = new task.decorator.target();
        await instance[task.decorator.methodName]();
      } else {
        if (task.fn) await task.fn();
      }
    } catch (error) {
      console.error(`[initialiceDelayJob] Delay '${task.name}' Error: ${error}`);
    }
  }, task.options.ms);

  this._tasks[index].object = timeOutJob;
}

function getTasksByNames(names: string[]) : ScheduleTask[] {
  const tasks: ScheduleTask[] = [];
  
  for (const name of names) {
    const exist_task: ScheduleTask = this._tasks.find(t => t.name === name);
    if (!exist_task) throw new Error(`Task ${name} not found`);
    tasks.push(exist_task);
  }

  return tasks;
}