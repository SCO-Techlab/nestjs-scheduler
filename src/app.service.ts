import { Schedule, SchedulerService, ScheduleTask, } from "@app/nestjs-scheduler";
import { Injectable } from "@nestjs/common";
import { delay, of, tap } from "rxjs";

@Injectable()
export class AppService {

    private cont_serviceCronSubscription1: number = 0;
    private cont_decoratorCronSubscription1: number = 0;

    constructor(private readonly schedulerService: SchedulerService) {

        // Add Programatically task
        this.schedulerService.addTasks(
            { 
                type: 'Cron', 
                name: 'serviceCronSubscription1', 
                options: { cronTime: '*/5 * * * * *', timeZone: 'America/New_York' },
                fn: async () => {
                    this.cont_serviceCronSubscription1++;
                    console.log("serviceCronSubscription1 exec nº: " + this.cont_serviceCronSubscription1);
                    return of(this.cont_serviceCronSubscription1).pipe();
                }
            },
        );
        
        // Subscribe to Programatically task
        this.schedulerService.subscribeToTask('serviceCronSubscription1').subscribe((data: ScheduleTask) => {
            console.log("Sub serviceCronSubscription1: " + data.response)
        });

        // Subscribe to Decorator task
        this.schedulerService.subscribeToTask('decoratorCronSubscription1').subscribe((data: ScheduleTask) => {
            console.log("Sub decoratorCronSubscription1: " + data.response)
        });
    }

    // @Schedule('Cron', 'decoratorCron1', { cronTime: '*/5 * * * * *', /* timeZone: 'America/New_York' */ })
    // async decoratorCron1() {
    //     console.log('decoratorCron1 executed every 5 seconds.');
    // }

    // @Schedule('Interval', 'decoratorInterval1', { ms: 10000 })
    // async decoratorInterval1() {
    //     console.log('decoratorInterval1 executed every 10 seconds.');
    // }

    // @Schedule('Delay', 'decoratorDelay1', { ms: 20000 })
    // async decoratorDelay1() {
    //     console.log('decoratorDelay1 executed once after 20 seconds.');
    // }

    // @Schedule('RunAt', 'decoratorRunAt1', { runAt: new Date(Date.now() + (10000 * 6)), /* timeZone: 'America/New_York' */ })
    // async decoratorRunAt1() {
    //     console.log('decoratorRunAt1 executed at: ' + new Date(Date.now() + (10000 * 6)).toString());
    // }

    @Schedule('Cron', 'decoratorCronSubscription1', { cronTime: '*/5 * * * * *' })
    async handleTask() {
        this.cont_decoratorCronSubscription1++;
        console.log("decoratorCronSubscription1 exec nº: " + this.cont_decoratorCronSubscription1);
        return of(this.cont_decoratorCronSubscription1).pipe();
    }

    async onModuleInit() {
        // this.schedulerService.addTasks(
        //     { 
        //         type: 'Cron', 
        //         name: 'serviceCron1', 
        //         options: { cronTime: '*/5 * * * * *', /* timeZone: 'America/New_York' */ },
        //         fn: async () => {
        //             //console.log('serviceCron1 executed every 5 seconds.');
        //         }
        //     },
        // );

        // this.schedulerService.addTasks(
        //     { 
        //         type: 'Interval', 
        //         name: 'serviceInterval1', 
        //         options: { ms: 10000 },
        //         fn: async () => {
        //             //console.log('serviceInterval1 executed every 10 seconds.');
        //         }
        //     },
        // );

        // this.schedulerService.addTasks(
        //     { 
        //         type: 'Delay', 
        //         name: 'serviceDelay1', 
        //         options: { ms: 20000 },
        //         fn: async () => {
        //             //console.log('serviceDelay1 executed every 20 seconds.');
        //         }
        //     },
        // );

        // this.schedulerService.addTasks(
        //     { 
        //         type: 'RunAt', 
        //         name: 'serviceRunAt1', 
        //         options: { runAt: new Date(Date.now() + (10000 * 6)), /* timeZone: 'America/New_York' */ },
        //         fn: async () => {
        //             //console.log('serviceRunAt1 executed at: ' + new Date(Date.now() + (10000 * 6)).toString());
        //         }
        //     },
        // );

        // const serviceCronSub1Fn: any = async () => {
        //     this.cont++;
        //     console.log("Continue: " + this.cont);
        //     return of(this.cont).pipe(
        //         delay(1000),
        //     );
        // };

        // this.schedulerService.addTasks(
        //     { 
        //         type: 'Cron', 
        //         name: 'serviceCronSubscription1', 
        //         options: { cronTime: '*/5 * * * * *', timeZone: 'America/New_York' },
        //         fn: serviceCronSub1Fn.bind(this),
        //     },
        // );
        
        // this.schedulerService.subscribeToTask('serviceCronSubscription1').subscribe((data: ScheduleTask) => {
        //     console.log("Sub: " + data.response)
        // });
    }
}
