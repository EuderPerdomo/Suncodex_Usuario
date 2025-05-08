import { Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../../footer/footer.component';
import { NavComponent } from '../../nav/nav.component';

@Component({
  selector: 'app-padre-controlador',
  imports: [RouterModule,FooterComponent,NavComponent],
  templateUrl: './padre-controlador.component.html',
  styleUrl: './padre-controlador.component.css',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class PadreControladorComponent {

}
