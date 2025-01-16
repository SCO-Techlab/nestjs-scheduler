import { Type } from "@nestjs/common";

export type ExecutionType = 'Cron' | 'Interval' | 'Delay' | 'RunAt';

/* Decorator Parameters */
export interface ScheduleDecoratorOptions {
    target: Type<any>; 
    methodName: string;
}

/* Options */
export interface ScheduleOptions {
    priority?: number;
    cronTime?: string;
    ms?: number;
    runAt?: Date;
    timeZone?: string;
}

export class ScheduleTask {
    type: ExecutionType; 
    name: string;
    options: ScheduleOptions; 
    decorator?: ScheduleDecoratorOptions;
    fn?: any;
    object?: any;
}