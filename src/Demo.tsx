import * as React from 'react';

import mountDemo from './mountDemo';

class Demo extends React.PureComponent {
  container: HTMLElement | null;

  componentDidMount() {
    if (this.container) {
      const demo = mountDemo(this.container);
      window.requestAnimationFrame(() => {
        console.log(demo.engine.world.composites);
      });
    }
    // Todo: [] Perlin noise gravityX for wind
  }

  render() {
    return (
      <>
        <article
          ref={element => {
            this.container = element;
          }}
        />
      </>
    );
  }
}

export default Demo;
