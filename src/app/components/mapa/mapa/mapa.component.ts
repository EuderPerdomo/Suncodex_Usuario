import { AfterViewInit, Component, Output,EventEmitter } from '@angular/core';
declare const L: any;

@Component({
  selector: 'app-mapa',
  imports: [],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.css'
})
export class MapaComponent implements AfterViewInit {

  public longitud = -74.220
  public latitud = 4.582
  public radio_busqueda = 30
  public circul: any

    @Output() CambioUbicacion = new EventEmitter<any>();//Emitir cuando se cambien los datos

  ngAfterViewInit(): void {
    //this.voltajeHijo=this.arreglos.pruebaViechild //Tomo el VALOR DE pruebaViechild DESDE EL hIJO QUE SE LLAMA aRRREGLOS

    // Mapa con País (Colombia) resaltado
    const map = L.map('map').setView([4.62111, -74.07317], 6);

    // Añadir una capa de mapas base
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    //Inicia nuevo
    var customIcon = L.icon({
      iconUrl: './assets/img/marker.png',
      iconSize: [52, 52]
    })

    var markerOptions = {
      icon: customIcon,
      draggable: true,
    }



    var mc: any
    //var circul: any
    //mc = new L.Marker([4.582, -74.22], markerOptions).addTo(map)

    map.on('click', (e: { latlng: { lat: number; lng: number; }; }) => {
      if (mc != undefined) {
        console.log('ya esta definido el Pin')
      } else {

        mc = new L.Marker([e.latlng.lat, e.latlng.lng], markerOptions).addTo(map)
        this.circul = L.circle([e.latlng.lat, e.latlng.lng], { radius: this.radio_busqueda * 1000 }).addTo(map)
        mc.circulo = this.circul;

        this.latitud = e.latlng.lat
        this.longitud = e.latlng.lng

        this.CambioUbicacion.emit({"latitud":this.latitud,"longitud":this.longitud})

        //this.ConsultarRadiacionDiaria()

        //Tomar en cuenta que al mover mc el circulo no se va a mover
        mc.on('dragend', (event: any) => {

          var latlng = event.target.getLatLng();
          mc.circulo.setLatLng(latlng);
          this.circul.setRadius(this.radio_busqueda * 1000);

          this.latitud = latlng.lat
          this.longitud = latlng.lng
          this.CambioUbicacion.emit({"latitud":this.latitud,"longitud":this.longitud})
          //this.calculo.latitud = latlng.lat
          //this.calculo.longitud = latlng.lng

        });

      }
      //var mc=new L.Marker([e.latlng.lat,e.latlng.lng],markerOptions).addTo(map)
    })



    // Archivo GeoJSON obtenido de https://geojson-maps.kyd.au/
    fetch('assets/colombia.json')
      .then(response => response.json())
      .then(data => {
        // Dibujar el polígono en el mapa
        var countryLayer = L.geoJSON(data, {
          style: {
            color: 'blue',
            weight: 2,
            fillOpacity: 0.1
          }
        }).addTo(map);

        // Opcional: Deshabilitar interacción fuera del polígono
        /*  map.on('click', function(e) {
            var inside = leafletPip.pointInLayer([e.latlng.lng, e.latlng.lat], countryLayer);
            if (!inside.length) {
              alert('Solo puedes interactuar dentro de los límites de Colombia');
            }
          });
          */
      });
  }

}
