import { Type } from '@nestjs/common';
import { ExecutionType, ScheduleOptions, ScheduleTask } from './scheduler.types';

const tasks: ScheduleTask[] = [];

// Expose tasks list
export function getRegisteredTasks(): ScheduleTask[] {
  return tasks ?? [];
}

// Decorador principal
export function Schedule(type: ExecutionType, name: string, options: ScheduleOptions = {}): MethodDecorator {
  return (target: Object, methodName: string | symbol, descriptor: PropertyDescriptor) => {

    // Check if task name is already registered
    if (tasks.find(t => t.name === name)) {
      throw new Error(`Task name '${name}' already registered`);
    }


    // Check task type parámeters and options
    if (type === 'Cron') {
      if (!options || !options.cronOptions || !options.cronOptions.cronTime) {
        throw new Error('Cron tasks require a valid cronTime');
      }
    } else if (type === 'Interval') {

    } else if (type == 'Delay') {
      
    }

    // Add task to the list
    tasks.push({
      type,
      name,
      options,
      target: target.constructor as Type<any>,
      methodName: methodName.toString(),
      object: undefined,
    });
  };
}