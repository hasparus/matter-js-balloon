import * as React from 'react';
import { render } from 'react-dom';
import { injectGlobal } from 'styled-components';

import Demo from './Demo';
import registerServiceWorker from './registerServiceWorker';

// tslint:disable-next-line:no-unused-expression
injectGlobal`
  body {
    margin: 0;
  }
  html, body, #root {
    height: 100%;
  }
`;

const App = () => <Demo />;

render(<App />, document.getElementById('root'));
registerServiceWorker();
