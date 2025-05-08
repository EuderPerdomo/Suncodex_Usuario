import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { CalculadoraService } from './services/calculadora.service';
import { ClienteService } from './services/cliente.service';
import { JwtHelperService,JWT_OPTIONS } from '@auth0/angular-jwt';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(),
    ClienteService,
    JwtHelperService, { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    //CalculadoraService,

  ]
};
