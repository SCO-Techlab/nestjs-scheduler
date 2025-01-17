import { Injectable } from '@nestjs/common';
import {
  Schedule,
  SchedulerContext,
  SchedulerService,
} from '@app/nestjs-scheduler';

@Injectable()
export class RunAtService extends SchedulerContext {
  private readonly delaysServiceRunAtDate: Date = new Date(
    Date.now() + 10000 * 3,
  );

  constructor(private readonly schedulerService: SchedulerService) {
    super(schedulerService);

    this.schedulerService.addTasks({
      type: 'RunAt',
      name: 'runats_runat_1_service',
      options: { runAt: this.delaysServiceRunAtDate },
      context: this,
      fn: async () => {
        console.log(
          'runats_runat_1_service executed at: ' + this.delaysServiceRunAtDate,
        );
      },
    });
  }

  @Schedule('RunAt', 'runats_runat_1_decorator', {
    runAt: new Date(Date.now() + 10000 * 6),
  })
  async decoratorRunAt1() {
    console.log(
      'runats_runat_1_decorator executed at: ' +
        new Date(Date.now() + 10000 * 6),
    );
  }
}