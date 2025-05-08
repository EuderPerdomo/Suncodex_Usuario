export interface Calculo {

    "usuario": boolean,
    "latitud": boolean,
    "longitud": boolean,
    "autoriza_correccion": boolean,
    "descripcion": boolean,
    "tipo": boolean,
    "nombre": boolean,//Nombre que se le quiere dar al calculo
    "panel": boolean,
    "inversor": boolean,
    "bateria": boolean,
    "controlador": boolean,
    "simultaneo": boolean,
    "total_dia": boolean,
    "tension_sistema": boolean, //Tensiondefinida

    "filtro": boolean,
    "radio_busqueda": boolean,
    //Potencias
    "potencias": boolean,

    //Del Controlador
    "controlador_tension": boolean,
    "controlador_max_input_power": boolean,
    "controlador_max_pv_input_voltaje": boolean,
    "controlador_cantidad_paralelo": boolean,
    "minVoltageControlador": boolean,
    "minCorrienteControlador": boolean,


    //DeL panel Solar
    "potencia_arreglo_fv": boolean,
    "cantidad_paneles": boolean,
    "paneles_serie": boolean,
    "paneles_paralelo": boolean,
    "voltaje_array_fv": boolean,
    "amperaje_array_fv": boolean,

    //De Las baterias
    "baterias_serie": boolean,
    "baterias_paralelo": boolean,
    "total_baterias": boolean,
    "batterysize": boolean,
    "cuttoff": boolean,


    //Del inversor
    "voltaje_in_inversor": boolean,
    "voltaje_out_inversor": boolean,
    "potencia_inversor": boolean,
    "potencia_pico_inversor": boolean,
  
}
