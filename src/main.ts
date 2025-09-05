import './app.css';
import App from './App.svelte';
import { initLocale } from './lib/i18n';

initLocale();

const app = new App({
  target: document.getElementById('app') as HTMLElement
});

export default app; 