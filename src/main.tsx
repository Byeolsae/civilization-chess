import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import DisplayHost from './DisplayHost';
import './styles.css';
import './draft.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>{window.frameElement?.getAttribute('data-game-viewport')==='true'?<App />:<DisplayHost />}</React.StrictMode>,
);
import './ai.css';

import './civilizationUi.css';

import './layoutScale.css';
