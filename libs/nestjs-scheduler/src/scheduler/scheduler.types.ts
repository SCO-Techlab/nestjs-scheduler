import { Type } from "@nestjs/common";

export type ExecutionType = 'Cron' | 'Interval' | 'Delay';

export class ScheduleTask {
    type: ExecutionType; 
    name: string;
    options: ScheduleOptions; 
    decorator?: ScheduleDecoratorOptions;
    fn?: any;
    object?: any;
}

/* Decorator Parameters */
export interface ScheduleDecoratorOptions {
    target: Type<any>; 
    methodName: string;
}

/* Options */
export interface ScheduleOptions {
    priority?: number;

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