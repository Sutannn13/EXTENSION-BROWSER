import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import OptionsPage from './OptionsPage';
import './options.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OptionsPage />
  </StrictMode>
);