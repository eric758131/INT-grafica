import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';
// Importar AOS
import AOS from 'aos';
import 'aos/dist/aos.css';

// Inicializar AOS
AOS.init();

AOS.init();
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));