import { Schedule, SchedulerService } from "@app/nestjs-scheduler";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {

    constructor(private readonly schedulerService: SchedulerService) {
    
    }

    @Schedule('Cron', 'cronName1', { cronOptions: { cronTime: '*/5 * * * * *' } })
    async handleCronTask1() {
        console.log('cronName1 executed every 5 seconds.');
    }

    @Schedule('Interval', 'intervalName1', { intervalOptions: { intervalTime: 1000 } })
    async handleInterval1() {
        console.log('intervalName1 executed every 1 seconds.');
    }

    @Schedule('Delay', 'delayName1', { delayOptions: { delayTime: 0 } })
    async handleDelay1() {
        console.log('delayName1 executed once in 2.5 seconds.');
    }
}
