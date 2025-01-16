import { Type } from "@nestjs/common";

export type ExecutionType = 'Cron' | 'Interval' | 'Delay';

export class ScheduleTask {
    type: ExecutionType; 
    name: string;
    options: ScheduleOptions; 
    target: Type<any>; 
    methodName: string
}

export interface ScheduleOptions {
    cronOptions?: ScheduleCronOptions;
}

export interface ScheduleCronOptions {
    cronTime: string;
}