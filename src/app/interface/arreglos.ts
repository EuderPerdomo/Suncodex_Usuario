export interface SolarPanel {
  voltage: number;
  current: number;
  vmpp:number;
}

export interface Group {
  panels: SolarPanel[][];
  totalVoltage?: number; // Propiedad opcional
  totalVmpp?: number; // Propiedad opcional
  totalPower?: number; // Propiedad opcional
  totalPanels?: number;
  totalCurrent?: number; // Propiedad opcional
  series?: number; // Propiedad opcional
  paralelos?: number; // Propiedad opcional
}