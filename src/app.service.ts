import { Schedule } from "@app/nestjs-scheduler";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {

    @Schedule('Cron', 'cronName1', { cronOptions: { cronTime: '*/5 * * * * *' } })
    async handleCronTask1() {
        console.log('cronName1 executed every 5 seconds.');
    }

    @Schedule('Cron', 'cronName2', { cronOptions: { cronTime: '*/5 * * * * *' } })
    async handleCronTask2() {
        console.log('cronName2 executed every 5 seconds.');
    }
}
