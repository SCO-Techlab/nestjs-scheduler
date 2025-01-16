import { Injectable } from '@nestjs/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { ScheduleTask } from './scheduler.types';

@Injectable()
export class SchedulerStateService {

  private stateMap: Map<string, ScheduleTask> = new Map();
  private subjects: Map<string, BehaviorSubject<ScheduleTask>> = new Map();

  // Method to get observable by key
  getObservable(key: string): Observable<ScheduleTask> {
    if (!this.subjects.has(key)) {
      this.subjects.set(key, new BehaviorSubject<ScheduleTask>(this.stateMap.get(key)));
    }
    return this.subjects.get(key).asObservable();
  }

  // Method to update value in the Map
  setValue(key: string, task: ScheduleTask): void {
    this.stateMap.set(key, task);

    // If subject associated with the key, emit new value
    if (this.subjects.has(key)) {
      this.subjects.get(key).next(task);
    } else {
      // If not exists, create a new BehaviorSubject
      this.subjects.set(key, new BehaviorSubject<ScheduleTask>(task));
    }
  }

  // Method to get current value by key
  getValue(key: string): ScheduleTask {
    return this.stateMap.get(key);
  }

  deleteValue(key: string): boolean {
    if (this.stateMap.has(key)) {
        this.stateMap.delete(key);
    }

    if (this.subjects.has(key)) {
        this.subjects.delete(key);
    }

    return true;
  }

  size(): number {
    if (!this.stateMap) return 0;
    return this.stateMap.size;
  }

  keys(): string[] {
    if (!this.stateMap) return [];
    return Array.from(this.stateMap.keys());
  }

  values(): ScheduleTask[] {
    if (!this.stateMap) return [];
    if (this.size() == 0) return [];
    return Array.from(this.stateMap.values());
  }

  exist(name: string): boolean {
    if (!this.stateMap) return false;
    return this.stateMap.has(name);
  }
}