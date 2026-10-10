// Several cars. A hall call goes to the closest car already heading that way, or an idle car.

export class ElevatorSystem {
  constructor(cars, floors = 10) {
    this.floors = floors;
    this.cars = Array.from({ length: cars }, (_, id) => ({ id, floor: 0, dir: 0, stops: new Set() }));
  }
  request(floor) {
    if (floor < 0 || floor >= this.floors) throw new Error("no such floor");
    let best = this.cars[0];
    let score = Infinity;
    for (const car of this.cars) {
      const distance = Math.abs(car.floor - floor);
      const penalty = car.dir === 0 || Math.sign(floor - car.floor) === car.dir ? 0 : 100;
      if (distance + penalty < score) {
        score = distance + penalty;
        best = car;
      }
    }
    best.stops.add(floor);
    if (best.dir === 0 && best.floor !== floor) best.dir = Math.sign(floor - best.floor);
    return best.id;
  }
  step() {
    for (const car of this.cars) {
      if (car.stops.size === 0) {
        car.dir = 0;
        continue;
      }
      if (!car.stops.has(car.floor)) {
        const ahead = [...car.stops].filter((floor) => car.dir >= 0 ? floor >= car.floor : floor <= car.floor);
        const choices = ahead.length ? ahead : [...car.stops];
        const goal = choices.sort((a, b) => Math.abs(a - car.floor) - Math.abs(b - car.floor))[0];
        car.dir = Math.sign(goal - car.floor);
        car.floor += car.dir;
      }
      if (car.stops.has(car.floor)) car.stops.delete(car.floor);
      if (car.stops.size === 0) car.dir = 0;
    }
  }
}

export function demo() {
  const bank = new ElevatorSystem(2);
  const car = bank.request(3);
  if (car !== 0) throw new Error("closest idle car");
  bank.step();
  bank.step();
  bank.step();
  if (bank.cars[0].floor !== 3 || bank.cars[0].stops.size !== 0) throw new Error("arrived");
  bank.cars[1].floor = 9;
  bank.cars[1].dir = -1;
  bank.cars[1].stops.add(8);
  const second = bank.request(1);
  if (second !== 0) throw new Error("do not pull the car that is busy going up the other way");
}

if (import.meta.main) demo();
