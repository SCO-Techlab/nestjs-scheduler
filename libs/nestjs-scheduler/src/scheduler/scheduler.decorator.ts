import * as moment from 'moment-timezone';
import { ExecutionType, ScheduleOptions, ScheduleTask } from './scheduler.types';

const tasks: ScheduleTask[] = [];

// Expose tasks list
export function getInitialDecoratorsTasks(): ScheduleTask[] {
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

// Validate new task
export function validateTask(type: ExecutionType, name: string, options: ScheduleOptions = {}): string {
  // Check if task name is already registered
  if (tasks.find(t => t.name === name)) {
    return `Task name '${name}' already registered`;
  }

  // Priority will only apply to decorator tasks
  if (options.priority != undefined && options.priority >= 0) {
    if (tasks.find(t => t.options.priority === options.priority)) {
      return `Task name '${name}' priority '${options.priority}' already registered`;
    }
  }

  if (type === 'Cron') {
    if (!options?.cronTime) {
      return 'Cron tasks require a valid cronTime';
    }

    if (options.timeZone != undefined) {
      if (!moment.tz.names().includes(options.timeZone)) {
        return 'Cron tasks require a valid timeZone';
      }
    }
  }
  
  if (type === 'Interval') {
    if (options?.ms == undefined || options?.ms < 0) {
      return 'Interval tasks require a valid ms';
    }
  }
  
  if (type == 'Delay') {
    if (options?.ms == undefined || options?.ms < 0) {
      return 'Delay tasks require a valid ms';
    }
  }
  
  if (type == 'RunAt') {
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

// Fill task default values
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

  if (task.response != undefined) task.response = undefined;

  return task;
}

// Main Scheduler decorator
export function Schedule(type: ExecutionType, name: string, options: ScheduleOptions = {}): MethodDecorator {
  return (target: Object, methodName: string | symbol, descriptor: PropertyDescriptor) => {

    // Validate task, if error reported not continue with execution
    const val_error: string = validateTask(type, name, options);
    if (val_error) throw new Error(val_error);

    // Create the new task with the defaults values filled
    const new_task: ScheduleTask = fillTaskDefaults({
      type,
      name,
      options,
      context: target,
      fn: target[methodName.toString()],
      object: undefined,
      response: undefined,
    });
    
    // Add task to the list
    tasks.push(new_task);
  };
}