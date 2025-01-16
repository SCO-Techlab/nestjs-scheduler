import { Injectable } from '@nestjs/common';
import { CronJob } from 'cron';
import { fillTaskDefaults, getRegisteredTasks, validateTask } from './scheduler.decorator';
import { ScheduleTask } from './scheduler.types';
import { isObservable, Observable } from 'rxjs';
import { SchedulerStateService } from './scheduler.state';

@Injectable()
export class SchedulerService {

  public get tasks(): ScheduleTask[] {
    return this.state.values();
  }
  
  constructor(private readonly state: SchedulerStateService) {}

  private async onModuleInit(): Promise<void> {
    // Get registered tasks from decoratos
    const tasks: ScheduleTask[] = getRegisteredTasks() ?? [];
    if (!tasks || tasks.length == 0) return;

    for (const task of tasks) {

      // Initial tasks loaded by decorats will be added in map before start
      // If not add in map before start, will not pass the task find validation
      this.state.setValue(task.name, task);
      await this.startTasks(task.name);
    }
  }

  public async addTasks(tasks: ScheduleTask[] | ScheduleTask): Promise<boolean> {
    // Convert input param to list
    tasks = Array.isArray(tasks) ? tasks : [tasks];
    if (!tasks || tasks.length == 0) throw new Error('Tasks are required');

    for (const task of tasks) {
      // Validate new task params
      const val_error: string = validateTask(task.type, task.name, task.options);
      if (val_error) throw new Error(val_error);

      // Fill task default params values
      const filled_task: ScheduleTask = fillTaskDefaults(task);

      // Add task to the map and start it
      this.state.setValue(filled_task.name, filled_task);
      await this.startTasks(filled_task.name);
    }

    return true;
  }

  public async removeTasks(names: string[] | string): Promise<boolean> {
    // Convert input param to list
    names = Array.isArray(names) ? names : [names];
    if (!names || names.length == 0) throw new Error('Names are required');

    // Loop the tasks returned by getTasksByNames, this method will validate if tasks exists
    for (const task of getTasksByNames.bind(this)(names)) {

      // Stop task before remove it
      const stop_task: boolean = await this.stopTasks(task.name);
      if (!stop_task) throw new Error(`Unnable to stop task ${task.name}`);
      
      // Delete task from the map
      this.state.deleteValue(task.name);
    }
    
    return true;
  }

  public async stopTasks(names: string[] | string): Promise<boolean> {
    // Convert input param to list
    names = Array.isArray(names) ? names : [names];
    if (!names || names.length == 0) throw new Error('Names are required');
    
    // Loop the tasks returned by getTasksByNames, this method will validate if tasks exists
    for (const task of getTasksByNames.bind(this)(names)) {

      // Stop the task by type
      if (task.type === 'Cron') task.object.stop();
      if (task.type === 'Interval') clearInterval(task.object);
      if (task.type === 'Delay') clearTimeout(task.object);
      if (task.type === 'RunAt') clearTimeout(task.object);

      // Remove task response
      if (task.response) task.response = undefined;
    }

    return true;
  }

  public async startTasks(names: string[] | string): Promise<boolean> {
    // Convert input param to list
    names = Array.isArray(names) ? names : [names];
    if (!names || names.length == 0) throw new Error('Names are required');

    // Loop the tasks returned by getTasksByNames, this method will validate if tasks exists
    for (const task of getTasksByNames.bind(this)(names)) {

      // Get the task from map by key
      const state_task: ScheduleTask = this.state.getValue(task.name);

      if (task.type === 'Cron') {
        state_task.object = new CronJob(
          task.options.cronTime, // CronTime
          await cronJobCallback.bind(this, task), // OnTick
          null, // OnComplete
          false, // Start,
          task.options?.timeZone ? task.options.timeZone : null, // Timezone
        );

        state_task.object.start();
      }

      if (task.type === 'Interval') {
        state_task.object = setInterval(
          await intervalJobCallback.bind(this, task), 
          task.options.ms
        );
      }

      if (task.type === 'Delay') {
        state_task.object = setTimeout(
          await delayJobCallback.bind(this, task), 
          task.options.ms
        );
      }

      if (task.type === 'RunAt') {
        state_task.object = setTimeout(
          await delayJobCallback.bind(this, task), 
          task.options.ms
        );
      }
     
      // Update the task in the map
      this.state.setValue(task.name, state_task);
    }

    return true;
  }

  public async restartTasks(names: string[] | string): Promise<boolean> {
    // Convert input param to list
    names = Array.isArray(names) ? names : [names];
    if (!names || names.length == 0) throw new Error('Names are required');

    // Loop the tasks returned by getTasksByNames, this method will validate if tasks exists
    for (const task of getTasksByNames.bind(this)(names)) {
      await this.stopTasks(task.name);
      await this.startTasks(task.name);
    }

    return true;
  }

  public subscribeToTask(name: string): Observable<ScheduleTask> {
    const exist_task: boolean = this.state.exist(name);
    if (!exist_task) throw new Error(`Task ${name} not found`);

    return this.state.getObservable(name);
  }
}

async function cronJobCallback(task: ScheduleTask): Promise<void> {
  try {
    // Get response from cron callback
    // Task.decorator will start the task from the metadata
    // If the Job is programmatically started, the task.fn will be called
    const response: any = task.decorator
      ? await new task.decorator.target()[task.decorator.methodName]()
      : task.fn ? await task.fn() : null;

    // If callback return a value, manage the subscription and update value
    if (response) {
      const current_task: ScheduleTask = this.state.getValue(task.name);
      current_task.response = await manageTaskSubscription(task, response);
      this.state.setValue(task.name, current_task);
    }
  } catch (error) {
    console.error(`[Scheduler] Cron '${task.name}' execution error: ${error}`);
  }
}

async function intervalJobCallback(task: ScheduleTask): Promise<void> {
  try {
    // Get response from cron callback
    // Task.decorator will start the task from the metadata
    // If the Job is programmatically started, the task.fn will be called
    const response: any = task.decorator
      ? await new task.decorator.target()[task.decorator.methodName]()
      : task.fn ? await task.fn() : null;

    // If callback return a value, manage the subscription and update value
    if (response) {
      const current_task: ScheduleTask = this.state.getValue(task.name).response;
      current_task.response = await manageTaskSubscription(task, response);
      this.state.setValue(task.name, current_task);
    }
  } catch (error) {
    console.error(`[Scheduler] Interval '${task.name}' execution error: ${error}`);
  }
}

async function delayJobCallback(task: ScheduleTask): Promise<void> {
  try {
    // Get response from cron callback
    // Task.decorator will start the task from the metadata
    // If the Job is programmatically started, the task.fn will be called
    const response: any = task.decorator
      ? await new task.decorator.target()[task.decorator.methodName]()
      : task.fn ? await task.fn() : null;

    // If callback return a value, manage the subscription and update value
    if (response) {
      const current_task: ScheduleTask = this.state.getValue(task.name).response;
      current_task.response = await manageTaskSubscription(task, response);
      this.state.setValue(task.name, current_task);
    }
  } catch (error) {
    console.error(`[Scheduler] ${task.type == 'RunAt' ? 'RunAt' : 'Delay'} '${task.name}' execution error: ${error}`);
  }
}

function getTasksByNames(names: string[]) : ScheduleTask[] {
  // This method will validate if the task list provide by input exist in the scheduler

  const tasks: ScheduleTask[] = [];
  for (const name of names) {
    const exist_task: ScheduleTask = this.state.values().find(t => t.name === name);

    if (!exist_task) 
      throw new Error(`Task ${name} not found`);

    tasks.push(exist_task);
  }

  return tasks;
}

function isFunction(variable: any): boolean {
  return typeof variable === 'function' && !/^class\s/.test(variable.toString());
}

async function resolveValue(value: any): Promise<any> {
  // Recursive function to resolve values

  if (!value) return null;

  if (isFunction(value)) {
    return await resolveValue(value());
  }

  if (value instanceof Promise) {
    const resolved = await value;
    return await resolveValue(resolved);
  }

  if (isObservable(value)) {
    const resolved: any = await new Promise<any>((resolve) => {
      value.subscribe({
        next: (data: any) => {
          resolve(data);
        },
        error: () => {
          resolve(null);
        }
      })
    });
    return await resolveValue(resolved);
  }

  return value;
}

async function manageTaskSubscription(task: ScheduleTask, response: any): Promise<void> {
  if (!task || !response) return;

  // Observable management
  if (isObservable(response)) {
    return await new Promise<any>((resolve) => {
      response.subscribe({
        next: async (value: any) => {
          const resolved = await resolveValue(value);
          resolve(resolved);
        },
        error: (err) => {
          console.error(`[Scheduler] Task '${task.name}' subscription error: ${err}`);
          resolve(undefined);
        },
      });
    });
  }

  // Promise management
  if (response instanceof Promise) {
    return await resolveValue(response);
  }

  // Function management
  if (isFunction(response)) {
    return await resolveValue(await response());
  }

  // Normal value management
  return response;
}