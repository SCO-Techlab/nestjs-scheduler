import { Module } from '@nestjs/common';
import { SchedulerModule } from '@app/nestjs-scheduler';
import { CronesService } from './crones.service';
import { IntervalsService } from './intervals.service';
import { DelayService } from './delay.service';
import { RunAtService } from './runat.service';
 
@Module({
  imports: [
    SchedulerModule.register(),
  ],
  providers: [
    CronesService,
    IntervalsService,
    DelayService,
    RunAtService,
  ],
})

export class AppModule {}
