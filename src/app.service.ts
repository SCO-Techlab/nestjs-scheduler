import { Schedule, SchedulerService } from "@app/nestjs-scheduler";
import { Injectable } from "@nestjs/common";
import { delay, of, tap } from "rxjs";

@Injectable()
export class AppService {

    constructor(private readonly schedulerService: SchedulerService) {}

    @Schedule('Cron', 'decoratorCron1', { cronTime: '*/5 * * * * *', /* timeZone: 'America/New_York' */ })
    async decoratorCron1() {
        //console.log('decoratorCron1 executed every 5 seconds.');
    }

    @Schedule('Interval', 'decoratorInterval1', { ms: 10000 })
    async decoratorInterval1() {
        //console.log('decoratorInterval1 executed every 10 seconds.');
    }

    @Schedule('Delay', 'decoratorDelay1', { ms: 20000 })
    async decoratorDelay1() {
        //console.log('decoratorDelay1 executed once after 20 seconds.');
    }

    @Schedule('RunAt', 'decoratorRunAt1', { runAt: new Date(Date.now() + (10000 * 6)), /* timeZone: 'America/New_York' */ })
    async decoratorRunAt1() {
        //console.log('decoratorRunAt1 executed at: ' + new Date(Date.now() + (10000 * 6)).toString());
    }

    @Schedule('Cron', 'decoratorCronSubscription1', { cronTime: '*/7 * * * * *', timeZone: 'America/New_York' })
    async handleTask() {
        // console.log('decoratorCronSubscription1 executed every 7 seconds.');
        // return of(
        //     // Return of function, value, promise, observable...
        //     async () => {
        //         console.log("Executing decoratorCronSubscription1 next callback...!");
        //     }
        // ).pipe(
        //   tap(() => { console.log('Processing task decoratorCronSubscription1...'); }),
        //   delay(1000),
        //   tap(() => { console.log('Task finished decoratorCronSubscription1'); })
        // );
    }

    async onModuleInit() {
        await this.schedulerService.addTasks(
            { 
                type: 'Cron', 
                name: 'serviceCron1', 
                options: { cronTime: '*/5 * * * * *', /* timeZone: 'America/New_York' */ },
                fn: async () => {
                    console.log('serviceCron1 executed every 5 seconds.');
                }
            },
        );

        await this.schedulerService.addTasks(
            { 
                type: 'Interval', 
                name: 'serviceInterval1', 
                options: { ms: 10000 },
                fn: async () => {
                    console.log('serviceInterval1 executed every 10 seconds.');
                }
            },
        );

        await this.schedulerService.addTasks(
            { 
                type: 'Delay', 
                name: 'serviceDelay1', 
                options: { ms: 20000 },
                fn: async () => {
                    console.log('serviceDelay1 executed every 20 seconds.');
                }
            },
        );

        await this.schedulerService.addTasks(
            { 
                type: 'RunAt', 
                name: 'serviceRunAt1', 
                options: { runAt: new Date(Date.now() + (10000 * 6)), /* timeZone: 'America/New_York' */ },
                fn: async () => {
                    console.log('serviceRunAt1 executed at: ' + new Date(Date.now() + (10000 * 6)).toString());
                }
            },
        );

        await this.schedulerService.addTasks(
            { 
                type: 'Cron', 
                name: 'serviceCronSubscription1', 
                options: { cronTime: '*/5 * * * * *', timeZone: 'America/New_York' },
                fn: async () => {
                    console.log('serviceCronSubscription1 executed every 7 seconds.');
                    return of(
                        // Return of function, value, promise, observable...
                        async () => {
                            console.log("Executing serviceCronSubscription1 next callback...!");
                        }
                    ).pipe(
                        tap(() => { console.log('Processing task serviceCronSubscription1...'); }),
                        delay(1000),
                        tap(() => { console.log('Task finished serviceCronSubscription1'); })
                    );
                }
            },
        );
    }
}
