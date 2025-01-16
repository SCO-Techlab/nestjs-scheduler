import { Injectable, Type } from '@nestjs/common';
import { ScheduleOptions } from './scheduler.types';

export type ExecutionType = 'Cron' | 'Interval' | 'Delay';

const tasks: { type: ExecutionType; options: ScheduleOptions; target: Type<any>; methodName: string }[] = [];

// Decorador principal
export function Schedule(type: ExecutionType, options: ScheduleOptions = {}): MethodDecorator {
  return (target: Object, methodName: string | symbol, descriptor: PropertyDescriptor) => {
    // Validación inicial
    if (type === 'Cron' && !options.cronTime) {
      throw new Error('Cron tasks require a valid cronTime.');
    }

    // Registrar la tarea en un almacenamiento interno
    tasks.push({
      type,
      options,
      target: target.constructor as Type<any>,
      methodName: methodName.toString(),
    });
  };
}

// Exponer las tareas registradas
export function getRegisteredTasks() {
  return tasks;
}