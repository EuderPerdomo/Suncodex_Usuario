import { CommonModule } from '@angular/common';
import { Component,Input } from '@angular/core';

@Component({
  selector: 'app-battery-display',
  imports: [CommonModule],
  templateUrl: './battery-display.component.html',
  styleUrl: './battery-display.component.css'
})
export class BatteryDisplayComponent {
  @Input() soc: number = 0;  // Estado de carga(0-100%)
  @Input() isCharging: boolean = false; //Esta cargando o SI / NO
}
