import { Injectable } from '@nestjs/common';
import * as cron from 'node-cron'; // Librería para manejar Cron (puede ser cambiada)
import { getRegisteredTasks } from './scheduler.decorator';

@Injectable()
export class SchedulerService {
  
  constructor() {
    this.initializeTasks();
  }

  initializeTasks() {
    const tasks = getRegisteredTasks();

    for (const task of tasks) {
      if (task.type === 'Cron') {
        cron.schedule(task.options.cronTime, async () => {
          const instance = new task.target(); // Crear instancia del servicio
          await instance[task.methodName](); // Llamar al método decorado
        });
      }
    }
  }
}