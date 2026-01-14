// src/objects/timeImmuneObject.ts
import { TimeRelation } from '../time/constants';
import { advanceObjectTime } from '../time/objectTime';

export interface TimeObject {
  id: string;
  relation: TimeRelation;
  currentTime: number;
}

export class TimeImmuneObject implements TimeObject {
  public id: string;
  public relation: TimeRelation = TimeRelation.IMMUNE;
  public currentTime: number;

  constructor(id: string, initialTime = 0) {
    this.id = id;
    this.currentTime = initialTime;
  }

  public update(baseDelta: number): void {
    // Use the shared time helpers to remain consistent with engine rules
    this.currentTime = advanceObjectTime(this.currentTime, this.relation, baseDelta);
  }
}

export default TimeImmuneObject;
