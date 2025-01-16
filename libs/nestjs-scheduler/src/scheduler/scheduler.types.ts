import { Type } from "@nestjs/common";

export type ExecutionType = 'Cron' | 'Interval' | 'Delay';

export class ScheduleTask {
    type: ExecutionType; 
    name: string;
    options: ScheduleOptions; 
    target: Type<any>; 
    methodName: string;
    object?: any;
}

export interface ScheduleOptions {
    cronOptions?: ScheduleCronOptions;
    intervalOptions?: ScheduleIntervalOptions;
    delayOptions?: ScheduleDelayOptions;
}

export interface ScheduleCronOptions {
    cronTime: string;
}

export interface ScheduleIntervalOptions {
    intervalTime: number;
}

export interface ScheduleDelayOptions {
    delayTime: number;
}