// src/rooms/timePuzzleRoom.ts
import { TimeRelation } from '../time/constants';
import { advanceObjectTime } from '../time/objectTime';
import { TimeObject } from '../objects/timeImmuneObject';

export class TimePuzzleRoom {
  private objects: TimeObject[] = [];

  public addObject(obj: TimeObject): void {
    this.objects.push(obj);
  }

  public getObjects(): ReadonlyArray<TimeObject> {
    return this.objects;
  }

  public update(baseDelta: number): void {
    if (baseDelta < 0) throw new Error('baseDelta must be non-negative');
    for (const obj of this.objects) {
      // Advance object's internal time according to its relation
      obj.currentTime = advanceObjectTime(obj.currentTime, obj.relation, baseDelta);
    }
  }
}

export default TimePuzzleRoom;
