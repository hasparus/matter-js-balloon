import React from 'react';
import styled from 'styled-components';

import { fromPairs, toPairs, KeyValuePair } from 'ramda';
import { Simulation, BalloonBody } from './mountDemo';
import { Body, Vector, Composite } from 'matter-js';

/*
  Todo:
    [ ] Benchmark Rope renderng (performWorkOnRoot is 14ms on dev) on production build
        Rewrite it to native SVG attributes mutations
        Benchmark new version
        Choose more performant
*/

const enum Colors {
  Blue = '#1446a0',
  Cherry = '#db3069',
  Sandstorm = '#f5d547',
  Eggshell = '#ebebd3',
  BlackOlive = '#3c3c3b',
}

const Defs = () => (
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor={'#42E496'} />
      <stop offset="100%" stopColor={'#3BB4B7'} />
    </linearGradient>
  </defs>
);

const MouseBounds = styled.div`
  position: absolute;
`;

type CircleBody = {
  circleRadius: number;
} & Body;

type CircleProps = {
  fill?: string;
  onClick?: (event: React.MouseEvent<SVGCircleElement>) => void;
  body: CircleBody;
};
const Circle = ({
  onClick,
  body: { position, circleRadius },
  fill,
}: CircleProps) => (
  <circle
    onClick={onClick}
    cx={position.x}
    cy={position.y}
    r={circleRadius}
    fill={fill}
  />
);

const Rope = ({ constraints, bodies }: Partial<Composite>) => (
  <>
    {constraints.map(({ pointA, pointB, bodyA, bodyB }, index) => {
      if (bodyA && bodyB) {
        const positions = Object.assign.apply(
          null,
          [
            Vector.add(bodyA.position, pointA),
            Vector.add(bodyB.position, pointB),
          ].map((vec, i) =>
            fromPairs(toPairs(vec as any).map(([k, v]) => [
              `${k}${i + 1}`,
              v,
            ]) as any)
          )
        );

        return (
          <line
            key={`${bodyA.id}~${bodyB.id}`}
            {...positions}
            strokeWidth={2}
            stroke={Colors.Eggshell}
          />
        );
      }
      return null;
    })}
    {bodies.map(
      body =>
        (body as BalloonBody).isBalloon ? (
          <Circle
            key={body.id}
            body={body as CircleBody}
            fill={Colors.Cherry}
            onClick={() => console.log('balloon clicked!')}
          />
        ) : (
          <Circle
            key={body.id}
            body={body as CircleBody}
            fill={'transparent'}
          />
        )
    )}
  </>
);

const Svg = styled.svg`
  width: 100%;
  height: auto;
  user-select: none;
  shape-rendering: geometricPrecision;

  background: ${Colors.Blue};
`;

type SvgCanvasProps = {
  demo?: Simulation;
  worldSizeSensorRef: (element: SVGRectElement) => void;
};
class SvgCanvas extends React.PureComponent<SvgCanvasProps> {
  componentDidUpdate() {
    const { demo } = this.props;
    if (demo) {
      demo.onUpdate._listener = () => {
        this.forceUpdate();
      };
    }
  }

  render() {
    const { demo, worldSizeSensorRef } = this.props;
    if (!demo) {
      return null;
    }

    const {
      WORLD_SIZE,
      engine: {
        world: { composites },
      },
    } = demo;

    return (
      <>
        <Svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
          <Defs />
          <rect
            x={0}
            y={0}
            {...WORLD_SIZE}
            ref={worldSizeSensorRef}
            fill="transparent"
          />
          {composites.map(composite => (
            <Rope
              key={composite.id}
              constraints={composite.constraints}
              bodies={composite.bodies}
            />
          ))}
        </Svg>
      </>
    );
  }
}

export default SvgCanvas;
