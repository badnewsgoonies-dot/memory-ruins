// tests/rooms/timePuzzleRoom.test.ts
import TimePuzzleRoom from '../../src/rooms/timePuzzleRoom';
import TimeImmuneObject, { TimeObject } from '../../src/objects/timeImmuneObject';
import { TimeRelation } from '../../src/time/constants';

describe('TimePuzzleRoom', () => {
  test('time-immune object does not advance while normal object does', () => {
    const room = new TimePuzzleRoom();
    const immune = new TimeImmuneObject('immune-1', 0);
    const normal: TimeObject = { id: 'normal-1', relation: TimeRelation.NORMAL, currentTime: 0 };

    room.addObject(immune as unknown as TimeObject);
    room.addObject(normal);

    // Advance three ticks of 1 unit each
    room.update(1);
    room.update(1);
    room.update(1);

    const objs = room.getObjects();
    const im = objs.find(o => o.id === 'immune-1')!;
    const no = objs.find(o => o.id === 'normal-1')!;

    expect(im.currentTime).toBe(0);
    expect(no.currentTime).toBe(3);
  });
});
