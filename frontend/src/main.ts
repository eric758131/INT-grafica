import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';
import AOS from 'aos';

// Inicializar AOS después de que Angular cargue
setTimeout(() => {
  AOS.init({
    duration: 800,
    once: true,
    offset: 100,
    startEvent: 'load'
  });
}, 100);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));