import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavComponent } from '../../nav/nav.component';
import { FooterComponent } from '../../footer/footer.component';
import { RouterModule } from '@angular/router';
import { PwmControllerComponent } from '../../simulaciones/controladores/pwm-controller/pwm-controller.component';

@Component({
  selector: 'app-controlador',
  standalone: true,
  imports: [NavComponent, FooterComponent,RouterModule],
  templateUrl: './controlador.component.html',
  styleUrl: './controlador.component.css',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class ControladorComponent {

}
