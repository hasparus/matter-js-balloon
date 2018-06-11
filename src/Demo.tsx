import React from 'react';
import styled from 'styled-components';

import mountDemo from './mountDemo';

type Simulation = ReturnType<typeof mountDemo>;

const Svg = styled.svg`
  user-select: none;
`;

type SvgCanvasProps = { demo?: Simulation };
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
    const { demo } = this.props;
    return (
      <Svg width={'800px'} height={'600px'}>
        {demo &&
          demo.engine.world.composites[0].bodies.map(body => {
            return (
              <text {...body.position} key={body.id}>
                {body.id}
              </text>
            );
          })}
      </Svg>
    );
  }
}

type State = {
  demo?: Simulation;
  debugMode: boolean;
};
class Demo extends React.PureComponent<{}, State> {
  debugCanvasContainer: HTMLElement | null;
  state: State = {
    debugMode: true,
  };

  componentDidMount() {
    if (this.debugCanvasContainer) {
      this.setState({ demo: mountDemo(this.debugCanvasContainer) });
    }
    // Todo: [] Perlin noise gravityX for wind
  }

  render() {
    return (
      <>
        {this.state.debugMode && (
          <article
            style={{
              position: 'absolute',
              opacity: 0.5,
              zIndex: 1,
            }}
            ref={element => {
              this.debugCanvasContainer = element;
            }}
          />
        )}
        <SvgCanvas demo={this.state.demo} />
      </>
    );
  }
}

export default Demo;
