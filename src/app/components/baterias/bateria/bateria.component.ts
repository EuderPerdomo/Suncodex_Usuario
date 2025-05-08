import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavComponent } from '../../nav/nav.component';
import { FooterComponent } from '../../footer/footer.component';

@Component({
    selector: 'app-bateria',
    imports: [NavComponent,FooterComponent],
    templateUrl: './bateria.component.html',
    styleUrl: './bateria.component.css',
    schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class BateriaComponent {

}
