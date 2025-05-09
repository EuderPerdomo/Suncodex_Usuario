import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbCollapse, NgbCollapseModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-nav',
    imports: [RouterModule,NgbDropdownModule,NgbCollapseModule],
    templateUrl: './nav.component.html',
    styleUrl: './nav.component.css'
})
export class NavComponent {

    isCollapsed = true;

}
