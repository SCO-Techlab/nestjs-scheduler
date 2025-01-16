import { Type } from '@nestjs/common';
import * as moment from 'moment-timezone';
import { ExecutionType, ScheduleOptions, ScheduleTask } from './scheduler.types';
import { isObservable } from 'rxjs';

const tasks: ScheduleTask[] = [];

// Expose tasks list
export function getRegisteredTasks(): ScheduleTask[] {
  return tasks.sort((a, b) => {
    // If both have priority defined, they are compared normally
    if (a.options.priority !== undefined && b.options.priority !== undefined) {
      return a.options.priority - b.options.priority;
    }
    
    // If only one has priority defined, the other goes to the end
    if (a.options.priority === undefined) return 1;
    if (b.options.priority === undefined) return -1;
    
    // If both are undefined, they are kept equal
    return 0;
  }) ?? [];
}

export async function manageTaskSubscription(task: ScheduleTask, response: any): Promise<void> {
  if (!task || !response) return;

  if (isObservable(response)) {
    response.subscribe({
      next: async (value: any) => { if (value && value === 'function') await value(); },
      error: (err) => { console.error(`[Scheduler] Task '${task.name}' subscription error: ${err}`); },
      complete: () => { },
    });
  }
  
  if (response instanceof Promise) {
    await response;
  }
}

export function validateTask(type: ExecutionType, name: string, options: ScheduleOptions = {}): string {
  // Check if task name is already registered
  if (tasks.find(t => t.name === name)) {
    return `Task name '${name}' already registered`;
  }

  if (options.priority != undefined && options.priority >= 0) {
    if (tasks.find(t => t.options.priority === options.priority)) {
      return `Task name '${name}' priority '${options.priority}' already registered`;
    }
  }

  // Check task type parámeters and options
  if (type === 'Cron') {
    if (!options?.cronTime) {
      return 'Cron tasks require a valid cronTime';
    }

    if (options.timeZone != undefined) {
      if (!moment.tz.names().includes(options.timeZone)) {
        return 'Cron tasks require a valid timeZone';
      }
    }
  } else if (type === 'Interval') {
    if (options?.ms == undefined || options?.ms < 0) {
      return 'Interval tasks require a valid ms';
    }
  } else if (type == 'Delay') {
    if (options?.ms == undefined || options?.ms < 0) {
      return 'Delay tasks require a valid ms';
    }
  } else if (type == 'RunAt') {
    if (options?.runAt == undefined ) {
      return 'RunAt tasks require a valid runAt';
    }

    if (options.runAt.getTime() < Date.now()) {
      return 'RunAt tasks require a future runAt date';
    }

    if (options.timeZone != undefined) {
      if (!moment.tz.names().includes(options.timeZone)) {
        return 'RunAt tasks require a valid timeZone';
      }
    }
  }

  return '';
}

export function fillTaskDefaults(task: ScheduleTask): ScheduleTask {
  if (!task) return task;

  if (task.options?.priority != undefined && task.options?.priority < 0) {
    task.options.priority = undefined;
  }

  if (task.type == 'RunAt') {
    if (task.options?.runAt != undefined) {
      const delayInMs: number = task.options.timeZone == undefined
        ? task.options.runAt.getTime() - Date.now()
        : moment(task.options.runAt).tz(task.options.timeZone).valueOf() - Date.now();

      task.options.ms = delayInMs != undefined && delayInMs >= 0 
        ? delayInMs 
        : 0;
    }
  }

  return task;
}

// Decorador principal
export function Schedule(type: ExecutionType, name: string, options: ScheduleOptions = {}): MethodDecorator {
  return (target: Object, methodName: string | symbol, descriptor: PropertyDescriptor) => {
    const val_error: string = validateTask(type, name, options);
    if (val_error) throw new Error(val_error);

    const new_task: ScheduleTask = fillTaskDefaults({
      type,
      name,
      options,
      decorator: {
        target: target.constructor as Type<any>,
        methodName: methodName.toString(),
      },
      fn: undefined,
      object: undefined,
    });
    
    // Add task to the list
    tasks.push(new_task);
  };
}