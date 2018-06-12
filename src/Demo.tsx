import React from 'react';
import debounce from 'debounce';

import mountDemo, { Simulation } from './mountDemo';
import SvgCanvas from './SvgCanvas';

type State = {
  demo?: Simulation;
  debugMode: boolean;
  mouseBounds?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
};
class Demo extends React.PureComponent<{}, State> {
  worldSizeSensor: SVGRectElement | null;
  mouseBoundsElement: HTMLDivElement | null;
  debugCanvasContainer: HTMLElement | null;
  state: State = {
    debugMode: false,
  };

  private handleResize = debounce(() => {
    console.log('resize!');
    if (this.worldSizeSensor) {
      const { demo } = this.state;
      const rect = this.worldSizeSensor.getBoundingClientRect();
      this.setState({
        mouseBounds: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        },
      });
      demo.handleResize(rect.width, rect.height);
    }
  }, 200);

  private mouseBoundsElementRef = (e: HTMLDivElement) => {
    console.log('mbr');
    this.mouseBoundsElement = e;
  };

  private worldSizeSensorRef = (e: SVGRectElement) => {
    this.worldSizeSensor = e;
    console.log('wsr');
    this.handleResize();
  };

  componentDidMount() {
    this.setState({
      demo: mountDemo(this.mouseBoundsElement, this.debugCanvasContainer),
    });
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  render() {
    const { mouseBounds } = this.state;
    return (
      <section
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          ref={this.mouseBoundsElementRef}
          style={{
            position: 'absolute',
            ...mouseBounds,
          }}
        />
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
          worldSizeSensorRef={this.worldSizeSensorRef}
        />
      </section>
    );
  }
}

export default Demo;
