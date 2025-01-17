import { Injectable } from '@nestjs/common';
import { CronJob } from 'cron';
import { isObservable, Observable } from 'rxjs';
import { fillTaskDefaults, getInitialDecoratorsTasks, validateTask } from './scheduler.decorator';
import { ScheduleTask } from './scheduler.types';
import { SchedulerStateService } from './scheduler.state';

@Injectable()
export class SchedulerService {
  
  private readonly _contexts: Map<string, any>;

  public get contexts(): any[] {
    if (!this._contexts) return [];
    if (this._contexts.size == 0) return [];
    return Array.from(this._contexts.values());
  }

  public set context(context: any) {
    if (!isClass(context.constructor))
      throw new Error('Context must be a class');

    this._contexts.set(context.constructor.name, context);
  }

  public get tasks(): ScheduleTask[] {
    return this.state.values();
  }

  constructor(private readonly state: SchedulerStateService) {
    this._contexts = new Map<string, any>();
  }

  async onModuleInit() {
    // Get registered tasks from decoratos
    const tasks: ScheduleTask[] = getInitialDecoratorsTasks() ?? [];
    if (!tasks || tasks.length == 0) return;

    for (const task of tasks) {
      // Initial tasks loaded by decorats will be added in map before start
      // If not add in map before start, will not pass the task find validation
      this.state.set(task.name, task);
      this.startTasks(task.name);
    }
  }

  public addTasks(tasks: ScheduleTask[] | ScheduleTask): boolean {
    // Convert input param to list
    tasks = Array.isArray(tasks) ? tasks : [tasks];
    if (!tasks || tasks.length == 0) throw new Error('Tasks are required');

    for (const task of tasks) {
      // Validate new task params
      const val_error: string = validateTask(this.state.values(),task.type, task.name, task.options);
      if (val_error) throw new Error(val_error);

      // Fill task default params values
      const filled_task: ScheduleTask = fillTaskDefaults(task);

      if (this.state.exist(filled_task.name)) {
        this.stopTasks(filled_task.name);
      }

      // Add task to the map and start it
      this.state.set(filled_task.name, filled_task);
      this.startTasks(filled_task.name);
    }

    return true;
  }

  public removeTasks(names: string[] | string): boolean {
    // Convert input param to list
    names = Array.isArray(names) ? names : [names];
    if (!names || names.length == 0) throw new Error('Names are required');

    // Loop the tasks returned by getTasksByNames, this method will validate if tasks exists
    for (const task of getTasksByNames.bind(this)(names)) {

      // Stop task before remove it
      const stop_task: boolean = this.stopTasks(task.name);
      if (!stop_task) throw new Error(`Unnable to stop task ${task.name}`);
      
      // Delete task from the map
      this.state.delete(task.name);
    }
    
    return true;
  }

  public stopTasks(names: string[] | string): boolean {
    // Convert input param to list
    names = Array.isArray(names) ? names : [names];
    if (!names || names.length == 0) throw new Error('Names are required');
    
    // Loop the tasks returned by getTasksByNames, this method will validate if tasks exists
    for (const task of getTasksByNames.bind(this)(names)) {

      // Stop the task by type
      if (this.state.get(task.name).type === 'Cron') 
        this.state.get(task.name).object.stop();

      if (this.state.get(task.name).type === 'Interval')
         clearInterval(this.state.get(task.name).object);

      if (this.state.get(task.name).type === 'Delay' || this.state.get(task.name).type === 'RunAt') 
        clearTimeout(this.state.get(task.name).object);

      // Remove task response
      if (this.state.get(task.name).response) 
        this.state.get(task.name).response = undefined;
    }

    return true;
  }

  public startTasks(names: string[] | string): boolean {
    // Convert input param to list
    names = Array.isArray(names) ? names : [names];
    if (!names || names.length == 0) throw new Error('Names are required');

    // Loop the tasks returned by getTasksByNames, this method will validate if tasks exists
    for (const task of getTasksByNames.bind(this)(names)) {

      if (this.state.get(task.name).type === 'Cron') {
        this.state.get(task.name).object = new CronJob(
          this.state.get(task.name).options.cronTime, // CronTime
          cronJobCallback.bind(
            this._contexts.get(this.state.get(task.name).context.constructor.name),
            this.state.get(task.name), 
            this.state, 
            this._contexts.get(this.state.get(task.name).context.constructor.name)
          ), // OnTick
          null, // OnComplete
          false, // Start,
          this.state.get(task.name).options?.timeZone 
            ? this.state.get(task.name).options.timeZone 
            : null, // Timezone
        );
      }

      if (this.state.get(task.name).type === 'Interval') {
        this.state.get(task.name).object = setInterval(
          intervalJobCallback.bind(
            this._contexts.get(this.state.get(task.name).context.constructor.name),
            this.state.get(task.name), 
            this.state, 
            this._contexts.get(this.state.get(task.name).context.constructor.name),
          ),
          this.state.get(task.name).options.ms
        );
      }

      if (this.state.get(task.name).type === 'Delay' || this.state.get(task.name).type === 'RunAt') {
        this.state.get(task.name).object = setTimeout(
          delayJobCallback.bind(
            this._contexts.get(this.state.get(task.name).context.constructor.name),
            this.state.get(task.name), 
            this.state, 
            this._contexts.get(this.state.get(task.name).context.constructor.name),
          ),
          this.state.get(task.name).options.ms
        );
      }
     
      // Update the task in the map
      if (this.state.get(task.name).type === 'Cron') {
        this.state.get(task.name).object.start();
      }
    }

    return true;
  }

  public restartTasks(names: string[] | string): boolean {
    // Convert input param to list
    names = Array.isArray(names) ? names : [names];
    if (!names || names.length == 0) throw new Error('Names are required');

    // Loop the tasks returned by getTasksByNames, this method will validate if tasks exists
    for (const task of getTasksByNames.bind(this)(names)) {
      this.stopTasks(task.name);
      this.startTasks(task.name);
    }

    return true;
  }

  public subscribeToTask(name: string): Observable<ScheduleTask> {
    return this.state.getObservable(name);
  }
}

async function cronJobCallback(task: ScheduleTask, state: SchedulerStateService, context: any): Promise<void> {
  try {
    // Get response from cron callback
    // Task.decorator will start the task from the metadata
    // If the Job is programmatically started, the task.fn will be called
    const response: any = !state.get(task.name).fn 
      ? null
      : context 
        ? await state.get(task.name).fn.bind(context)() 
        : await state.get(task.name).fn();

    // If callback return a value, manage the subscription and update value
    if (response != undefined) {
      const current_task: ScheduleTask = state.get(task.name);
      current_task.response = await manageTaskSubscription(state.get(task.name), response);
      state.set(task.name, current_task);
    }
  } catch (error) {
    console.error(`[Scheduler] Cron '${task.name}' execution error: ${error}`);
  }
}

async function intervalJobCallback(task: ScheduleTask, state: SchedulerStateService, context: any): Promise<void> {
  try {
    // Get response from cron callback
    // Task.decorator will start the task from the metadata
    // If the Job is programmatically started, the task.fn will be called
    const response: any = !state.get(task.name).fn 
      ? null
      : context 
        ? await state.get(task.name).fn.bind(context)() 
        : await state.get(task.name).fn();

    // If callback return a value, manage the subscription and update value
    if (response != undefined) {
      const current_task: ScheduleTask = state.get(task.name);
      current_task.response = await manageTaskSubscription(state.get(task.name), response);
      state.set(task.name, current_task);
    }
  } catch (error) {
    console.error(`[Scheduler] Interval '${task.name}' execution error: ${error}`);
  }
}

async function delayJobCallback(task: ScheduleTask, state: SchedulerStateService, context: any): Promise<void> {
  try {
    // Get response from cron callback
    // Task.decorator will start the task from the metadata
    // If the Job is programmatically started, the task.fn will be called
    const response: any = !state.get(task.name).fn 
      ? null
      : context 
        ? await state.get(task.name).fn.bind(context)() 
        : await state.get(task.name).fn();

    // If callback return a value, manage the subscription and update value
    if (response != undefined) {
      const current_task: ScheduleTask = state.get(task.name);
      current_task.response = await manageTaskSubscription(state.get(task.name), response);
      state.set(task.name, current_task);
    }
  } catch (error) {
    console.error(`[Scheduler] ${task.type == 'RunAt' ? 'RunAt' : 'Delay'} '${task.name}' execution error: ${error}`);
  }
}

function getTasksByNames(names: string[]) : ScheduleTask[] {
  // This method will validate if the task list provide by input exist in the scheduler state

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

function isClass(variable: any): boolean {
  return typeof variable === 'function' && /^class\s/.test(variable.toString());
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

  // TODO: I think that this method can be refacotered to not duplicate code with function resolveValue

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