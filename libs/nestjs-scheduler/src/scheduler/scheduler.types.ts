export type ExecutionType = 'Cron' | 'Interval' | 'Delay' | 'RunAt';

export class ScheduleTask {
    type: ExecutionType; // Type of execution
    name: string; // Name of the task, must be unique
    options: ScheduleOptions; // Options / parameters of the task
    fn?: any; // Function to execute
    object?: any; // Object to save the execution
    response?: any; // Response of the execution
}

export interface ScheduleOptions {
    priority?: number; // Priority of execution of initial decorator tasks
    cronTime?: string; // Cron time value for cron tasks
    ms?: number; // Milliseconds value for interval tasks
    runAt?: Date; // Date value for runAt tasks
    timeZone?: string; // Timezone value for cron and runAt tasks, on runAt
}