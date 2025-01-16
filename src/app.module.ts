import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { SchedulerModule } from '@app/nestjs-scheduler';
 
@Module({
  imports: [
    SchedulerModule.register(),
  ],
  providers: [AppService],
})

export class AppModule {}
