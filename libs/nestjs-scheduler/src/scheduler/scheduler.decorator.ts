import { Type } from '@nestjs/common';
import { ExecutionType, ScheduleOptions, ScheduleTask } from './scheduler.types';

const tasks: ScheduleTask[] = [];

// Expose tasks list
export function getRegisteredTasks(): ScheduleTask[] {
  return tasks ?? [];
}

export function validateTask(type: ExecutionType, name: string, options: ScheduleOptions = {}): string {
  // Check if task name is already registered
  if (tasks.find(t => t.name === name)) {
    return `Task name '${name}' already registered`;
  }

  // Check task type parámeters and options
  if (type === 'Cron') {
    if (!options.cronOptions || !options.cronOptions.cronTime) {
      return 'Cron tasks require a valid cronTime';
    }
  } else if (type === 'Interval') {
    if (!options.intervalOptions || options.intervalOptions.intervalTime == undefined || options.intervalOptions.intervalTime < 0) {
      return 'Interval tasks require a valid intervalTime';
    }
  } else if (type == 'Delay') {
    if (!options.delayOptions || options.delayOptions.delayTime == undefined || options.delayOptions.delayTime < 0) {
      return 'Delay tasks require a valid delayTime';
    }
  }

  return '';
}

// Decorador principal
export function Schedule(type: ExecutionType, name: string, options: ScheduleOptions = {}): MethodDecorator {
  return (target: Object, methodName: string | symbol, descriptor: PropertyDescriptor) => {
    const val_error: string = validateTask(type, name, options);
    if (val_error) throw new Error(val_error);
    
    // Add task to the list
    tasks.push({
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
  };
}