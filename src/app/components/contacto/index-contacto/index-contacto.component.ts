import { Component } from '@angular/core';
import { NavComponent } from '../../nav/nav.component';
import { FooterComponent } from '../../footer/footer.component';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GuestServiceService } from '../../../services/guest-service.service';
import { FormsModule } from '@angular/forms';

declare var jQuery:any
declare var iziToast:any
declare var $:any
@Component({
  selector: 'app-index-contacto',
  imports: [NavComponent,FooterComponent,NgbPaginationModule,RouterModule,CommonModule,FormsModule],
  templateUrl: './index-contacto.component.html',
  styleUrl: './index-contacto.component.css'
})
export class IndexContactoComponent {
  public contacto: any={}
  public load_btn=false
    constructor(
      private _guestService:GuestServiceService
    ) { }
  
    ngOnInit(): void {
    }
  
  registro(registroForm:any){
    if(registroForm.valid){
  this.load_btn=true
  this._guestService.enviar_mensaje_contacto(this.contacto).subscribe(
    response=>{
      iziToast.show({
        title:'¡Listo!',
        titleColor:'#1DC74C',
        class:'text-success',
        position:'topRight',
        message:'✨ Tu mensaje ya está en camino. Nos comunicaremos contigo pronto. ✨'
      })
  
  this.contacto={}
  this.load_btn=false
    }
  )
    }else{
      iziToast.show({
        title:'¡Ups!',
        titleColor:'red',
        class:'text-danger',
        position:'topRight',
        message:'🔍 Algo no encaja. Por favor, revisa los datos antes de enviarlos. 😉' 
      })
    }
  }


}
