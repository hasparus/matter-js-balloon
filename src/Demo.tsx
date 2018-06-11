import React from 'react';

import mountDemo, { Simulation } from './mountDemo';
import SvgCanvas from './SvgCanvas';

type State = {
  demo?: Simulation;
  debugMode: boolean;
};
class Demo extends React.PureComponent<{}, State> {
  container: HTMLElement | null;
  svgCanvas: SVGSVGElement | null;
  debugCanvasContainer: HTMLElement | null;
  state: State = {
    debugMode: false,
  };

  componentDidMount() {
    this.setState({
      demo: this.debugCanvasContainer
        ? mountDemo(this.debugCanvasContainer, true)
        : mountDemo(this.container, false),
    });
  }

  render() {
    return (
      <section
        ref={element => {
          this.container = element;
        }}
      >
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
        <SvgCanvas
          demo={this.state.demo}
          innerRef={element => {
            this.svgCanvas = element;
          }}
        />
      </section>
    );
  }
}

export default Demo;
