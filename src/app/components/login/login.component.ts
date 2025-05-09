import { Component } from '@angular/core';
import { GuestServiceService } from '../../services/guest-service.service';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare var $: any;
declare var iziToast: any;

@Component({
  selector: 'app-login',
  imports: [NavComponent, FooterComponent, FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {


  public token: any = '';

  public admin = {
    email: '',
    password: ''
  }

  public empresa = {
    nombres: '',
    apellidos: '',
    dni: '',
    email: '',
    password: '',
    telefono: '',
    rol: '',
    nombre_empresa: '',
    direccion_empresa: '',
    nit_empresa: '',
  }

  public cliente = {
    nombres: '',
    apellidos: '',
    dni: '',
    email: '',
    password: '',
    telefono: '',
    rol: ''
  }

  //Cambio Opciones
  public op = 1;

  constructor(
    private _usuarioService: AdminService,
    private _guestService: GuestServiceService,
    private _router: Router
  ) {
    this.token = localStorage.getItem('token');
  }

  ngOnInit(): void {
    //$('body').addClass('align-items-center');
    if (this.token) {
      console.log('ya existe un token')
      this._router.navigate(['/usuario/perfil']);
    } else {
      //MANTENER EN EL COMPONENTE
    }
  }

  login(loginForm: any) {

    if (loginForm.valid) {
      let email = loginForm.value.email;
      let password = loginForm.value.password;

      if (email == '' && password == '') {
        iziToast.show({
          title: 'ERROR DATA',
          class: 'iziToast-danger',
          position: 'topRight',
          message: 'Todos los campos son requeridos, vuelva a intentar.'
        });
      } else {
        this._guestService.login_guest({ email, password }).subscribe(
          response => {


            if (response.data != null) {
              this.token = response.token;
              localStorage.setItem('token', response.token);
              localStorage.setItem('identity', response.data._id);
              localStorage.setItem('user_data', JSON.stringify(response.data));
              this._router.navigate(['/usuario/perfil']);


              console.log('Verificar si esxiste un calculo guardado en memoriaa')
              var obtenido = localStorage.getItem('calculo');
              if (obtenido != null) {
                let calculo = JSON.parse(obtenido);
                console.log('obtenido parseado', calculo)
                //TODO
                //Realizar guardado para el id de usuario

                this._guestService.registro_calculo_usuario(calculo, this.token).subscribe(
                  response => {

                    console.log(response.data)

                    iziToast.show({
                      title: 'SUCCESS',
                      titleColor: '#1DC74C',
                      color: '#FFF',
                      class: 'text-success',
                      position: 'topRight',
                      message: 'Se registro correctamente el Calculo.'
                    });

                    localStorage.removeItem('calculo')
                  },
                  error => {
                    console.log('Error', error)
                  }
                );

                //Finaliza el guardado



              } else {

              }



            } else {
              iziToast.show({
                title: 'ERROR USER',
                class: 'iziToast-danger',
                position: 'topRight',
                message: response.message
              });
            }

          },
          error => {
            iziToast.show({
              title: 'ERROR SERVER',
              class: 'iziToast-danger',
              position: 'topRight',
              message: 'Ocurrió un error en el servidor, intente mas nuevamente.'
            });
          }
        );
      }
    } else {
      iziToast.show({
        title: 'ERROR DATA',
        class: 'iziToast-danger',
        position: 'topRight',
        message: 'Complete correctamente el formulario.'
      });
    }
  }

  view_password() {
    let type = $('#password').attr('type');
    const ojo_icon = $('#ojo_icon')
    if (type == 'text') {
      $('#password').attr('type', 'password');
      ojo_icon.removeClass('fa-eye-slash').addClass('fa-eye')

    } else if (type == 'password') {
      $('#password').attr('type', 'text');
      ojo_icon.removeClass('fa-eye').addClass('fa-eye-slash')
    }
  }

  /*
  view_passwordd(fieldId: string) {
    let type = $('#' + fieldId).attr('type');

    if (type == 'text') {
      $('#' + fieldId).attr('type', 'password');
    } else if (type == 'password') {
      $('#' + fieldId).attr('type', 'text');
    }
  }
    */


  //Cambio de Opciones 
  changeOp(op: any) {
    this.op = op;

  }

}
