import React from 'react';
import styled from 'styled-components';

import { fromPairs, toPairs, KeyValuePair } from 'ramda';
import { Simulation, BalloonBody } from './mountDemo';
import { Body, Vector, Composite } from 'matter-js';

type CircleBody = {
  circleRadius: number;
} & Body;

type CircleProps = CircleBody & { fill?: string };
const Circle = (props: CircleProps) => (
  <g key={props.id}>
    {/* <text {...props.position} key={props.id}>
      {(props as CircleBody).circleRadius}
    </text> */}
    <circle
      cx={props.position.x}
      cy={props.position.y}
      r={props.circleRadius}
      fill={props.fill}
    />
  </g>
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
            stroke="black"
          />
        );
      }
      return null;
    })}
    {bodies.map(
      body =>
        (body as BalloonBody).isBalloon ? (
          <Circle {...body as CircleBody} fill="blue" />
        ) : (
          <Circle {...body as CircleBody} fill="hotpink" />
        )
    )}
  </>
);

const Svg = styled.svg`
  user-select: none;
  shape-rendering: geometricPrecision;
`;

type SvgCanvasProps = {
  demo?: Simulation;
  innerRef?: (element: SVGSVGElement) => void;
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
    const { demo, innerRef } = this.props;
    return (
      <Svg width={'800px'} height={'600px'} innerRef={innerRef}>
        {demo &&
          demo.engine.world.composites.map(composite => (
            <Rope
              key={composite.id}
              constraints={composite.constraints}
              bodies={composite.bodies}
            />
          ))}
      </Svg>
    );
  }
}

export default SvgCanvas;
