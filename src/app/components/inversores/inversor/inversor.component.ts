import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavComponent } from '../../nav/nav.component';
import { FooterComponent } from '../../footer/footer.component';
import { SplineViewer } from '@splinetool/viewer';

@Component({
    selector: 'app-inversor',
    imports: [NavComponent, FooterComponent],
    templateUrl: './inversor.component.html',
    styleUrl: './inversor.component.css',
    schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class InversorComponent {

}
