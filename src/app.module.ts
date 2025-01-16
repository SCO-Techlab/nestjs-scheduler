import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SchedulerModule } from '@app/nestjs-scheduler';
 
@Module({
  imports: [
    SchedulerModule.register(),
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
