import * as React from 'react';
import { render } from 'react-dom';

import Demo from './Demo';
import registerServiceWorker from './registerServiceWorker';

const App = () => <Demo />;

render(<App />, document.getElementById('root'));
registerServiceWorker();
