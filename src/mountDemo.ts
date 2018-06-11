import {
  Vector,
  Engine,
  Events,
  Render,
  Runner,
  Body,
  Composite,
  Composites,
  Constraint,
  MouseConstraint,
  Mouse,
  World,
  Bodies,
} from 'matter-js';

import SimplexNoise from 'simplex-noise';

export type BalloonBody = Body & { isBalloon: true };

const CHAIN_CIRCLES_COUNT = 10;
const CHAIN_CIRCLE_RADIUS = 5;
const BALLOON_FORCE = { x: 0, y: -0.02 };
const WORLD_SIZE = {
  width: 800,
  height: 600,
};

const WIND_POWER = 0.0015;
const TAU = Math.PI * 2;
class NoisyWind {
  private simplex = new SimplexNoise('awesome-seed');
  private tOffset = 0.01;

  blow(position: Vector): Vector {
    const xOffset = position.x / WORLD_SIZE.width;
    const yOffset = position.y / WORLD_SIZE.height;
    const angle = this.simplex.noise3D(xOffset, yOffset, this.tOffset) * TAU;
    return Vector.mult(Vector.rotate({ x: 1, y: 0 }, angle), WIND_POWER);
  }

  tick() {
    this.tOffset = (this.tOffset + 0.001) % 1;
  }
}

const createRopeWithBalloon = () => {
  const group = Body.nextGroup(true);

  var rope = Composites.stack(
    400,
    500,
    CHAIN_CIRCLES_COUNT,
    1,
    CHAIN_CIRCLE_RADIUS,
    CHAIN_CIRCLE_RADIUS,
    function(x, y) {
      return Bodies.circle(x, y, CHAIN_CIRCLE_RADIUS * 2, {
        mass: 0,
        collisionFilter: { group } as any,
      });
    }
  );

  const balloon: BalloonBody = Object.assign(
    Bodies.circle(700, 500 + CHAIN_CIRCLE_RADIUS * 2, 60, {
      collisionFilter: { group } as any,
      mass: 0,
    }),
    { isBalloon: true as true }
  );

  Composite.add(rope, balloon);

  Composites.chain(rope, 0, -0.5, 0, 0.5, {
    stiffness: 0.8,
    length: 2,
    render: { type: 'line' },
  });
  Composite.add(
    rope,
    Constraint.create({
      bodyB: rope.bodies[0],
      pointB: { x: 0, y: CHAIN_CIRCLE_RADIUS * 2 },
      pointA: { x: rope.bodies[0].position.x, y: rope.bodies[0].position.y },
      stiffness: 0.5,
    })
  );

  Composite.rotate(rope, -Math.PI / 2, rope.bodies[0].position);
  return {
    rope,
    balloon,
  };
};

const attachMouse = (element: HTMLElement, engine: Engine, render?: Render) => {
  // add mouse control
  const mouse = Mouse.create(element);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: Boolean(render),
      },
    } as any,
  });

  World.add(engine.world, mouseConstraint);

  // keep the mouse in sync with rendering
  if (render) {
    (render as any).mouse = mouse;
  }
};

const stabilize = (updates: number, balloon: Body, engine: Engine) => {
  // stabilizing physics (placement of bodies is kinda off) for better entry effect
  for (let i = 0; i < updates; ++i) {
    Body.applyForce(balloon, balloon.position, BALLOON_FORCE);
    Engine.update(engine, 1000 / 60);
  }
};

const mountDemo = (element: HTMLElement, drawRenderer: boolean) => {
  const engine = Engine.create();

  let render = undefined;
  if (drawRenderer) {
    render = Render.create({
      element,
      engine,
      options: {
        ...WORLD_SIZE,
        showAngleIndicator: true,
        showCollisions: true,
        showVelocity: true,
      } as any,
    });

    Render.run(render);
  }

  const { rope, balloon } = createRopeWithBalloon();
  const floor = Bodies.rectangle(400, 630, 1200, 60, { isStatic: true });

  World.add(engine.world, [rope, floor] as any);

  attachMouse(element, engine, render);

  const onUpdate: {
    (): void;
    // setListener: (listener: () => void) => void;
    _listener?: () => void;
  } = () => {
    if (onUpdate._listener) {
      onUpdate._listener();
    }
  };

  const runner = Runner.create({});
  const wind = new NoisyWind();
  const run = (time: number) => {
    Body.applyForce(balloon, balloon.position, BALLOON_FORCE);
    Body.applyForce(balloon, balloon.position, wind.blow(balloon.position));
    wind.tick();
    Runner.tick(runner, engine, time);
    setTimeout(onUpdate, 0);
    window.requestAnimationFrame(run);
  };
  stabilize(180, balloon, engine);
  run(performance.now());

  return {
    engine: engine,
    render: render,
    onUpdate,
  };
};

export default mountDemo;

export type Simulation = ReturnType<typeof mountDemo>;
