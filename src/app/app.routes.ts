import { Routes } from '@angular/router';
import { InicioComponent } from './components/inicio/inicio.component';
import { CreateCalculoComponent } from './components/calculadora/create-calculo/create-calculo.component';
import { SimularPanelSolarComponent } from './components/calculadora/panel_solar/simular-panel-solar/simular-panel-solar.component';
import { SummaryCalculoComponent } from './components/calculadora/summary-calculo/summary-calculo.component';
import { AboutMeComponent } from './components/aboutMe/about-me/about-me.component';
import { SimularPanelComponent } from './components/simulaciones/paneles/simular-panel/simular-panel.component';
import { SimularLamparaComponent } from './components/simulaciones/lamparas/simular-lampara/simular-lampara.component';
import { EstandarCalculoComponent } from './components/calculadora/estandar-calculo/estandar-calculo/estandar-calculo.component';
import { ArreglosComponent } from './components/simulaciones/paneles/arreglos/arreglos.component';
import { PostListComponent } from './components/blog/post-list/post-list.component';
import { PostSingleComponent } from './components/blog/post-single/post-single.component';
import { LoginComponent } from './components/login/login.component';
import { IndexLamparasComponent } from './components/lamparas/index-lamparas/index-lamparas.component';
import { ShowLamparaComponent } from './components/lamparas/show-lampara/show-lampara.component';
import { InversorComponent } from './components/inversores/inversor/inversor.component';
import { ControladorComponent } from './components/controladores/controlador/controlador.component';
import { BateriaComponent } from './components/baterias/bateria/bateria.component';
import { PanelSolarComponent } from './components/paneles/panel-solar/panel-solar.component';
import { PadreControladorComponent } from './components/controladores/padre-controlador/padre-controlador.component';
import { PwmControllerComponent } from './components/simulaciones/controladores/pwm-controller/pwm-controller.component';
import { IndexContactoComponent } from './components/contacto/index-contacto/index-contacto.component';
import { PerfilComponent } from './components/usuario/perfil/perfil.component';

//Guard
import { AuthGuard } from './guards/auth.guard';
import { IndexCalculoComponent } from './components/usuario/calculo/index-calculo/index-calculo.component';
import { DashboardUsuarioComponent } from './components/usuario/dashboard-usuario/dashboard-usuario.component';
import { EditCalculoComponent } from './components/usuario/calculo/edit-calculo/edit-calculo.component';


export const routes: Routes = [

  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: InicioComponent,
    //canActivate: [adminGuard],
    //data: { allowedRoles: ['user', 'admin']}  // Definiendo roles permitidos
  },

/*
  {
    path: 'usuario', children: [
      { path: 'perfil', component: PerfilComponent, 
        canActivate: [AuthGuard] },
    ]
  },
*/
// **************************************************Desde el perfil renderizo las funcionalidades inicia aqui las pruebas
{
  path: 'usuario', //perfilprueba
  component: DashboardUsuarioComponent,  // Este es el contenedor padre antes era perfil
  canActivate: [AuthGuard],
  children: [
    {
      path: 'indexCalculosFotovoltaicos',   // Ruta para comparación
      component: IndexCalculoComponent,
      canActivate: [AuthGuard] 
    },

    {
      path: 'editCalculo/:id',   // Ruta para comparación
      component: EditCalculoComponent,
      canActivate: [AuthGuard] 
      
    },

    { path: 'perfil', component: PerfilComponent, 
      canActivate: [AuthGuard] },
    
  ]
},


// **************************************************Finalizo perfil renderizo las funcionalidades finaliza aqui las pruebas



  {
    path: 'calculo', children: [
      // {
      //   path: 'crear',
      //   component: CreateCalculoComponent,
      //   //canActivate: [adminGuard],
      //   //data: { allowedRoles: ['user', 'admin'] }
      // },

      { path: 'crear/:tipo', component: CreateCalculoComponent },
      { path: 'interactiva', component: EstandarCalculoComponent },

      {
        path: 'summary/:id',
        component: SummaryCalculoComponent,
        // canActivate: [AuthGuard] 
      },

    ]
  },


  {
    path: 'panelSolar', children: [
      {
        path: 'paneles',
        component: PanelSolarComponent,
        //canActivate: [adminGuard],
        //data: { allowedRoles: ['user', 'admin'] }
      },

      {
        path: 'simular',
        component: SimularPanelSolarComponent,
        //canActivate: [adminGuard],
        //data: { allowedRoles: ['user', 'admin'] }
      },

      {
        path: 'simularPanelSolar',
        component: SimularPanelComponent,
        //canActivate: [adminGuard],
        //data: { allowedRoles: ['user', 'admin'] }
      },

      {
        path: 'arreglos',
        component: ArreglosComponent,
        //canActivate: [adminGuard],
        //data: { allowedRoles: ['user', 'admin'] }
      },

    ]
  },

  {
    path: 'lamparaSolar', children: [
      {
        path: 'simularLamparaSolar',
        component: SimularLamparaComponent,
        //canActivate: [adminGuard],
        //data: { allowedRoles: ['user', 'admin'] }
      },

      {
        path: 'lamparasSolares',
        component: IndexLamparasComponent,
        //canActivate: [adminGuard],
        //data: { allowedRoles: ['user', 'admin'] }
      },

      {
        path: 'lampara/:slug',
        component: ShowLamparaComponent,
        //canActivate: [adminGuard],
        //data: { allowedRoles: ['user', 'admin'] }
      },
    ]
  },

  {
    path: 'blog', children: [
      {
        path: 'post_list',
        component: PostListComponent,
        //canActivate: [adminGuard],
        //data: { allowedRoles: ['user', 'admin'] }
      },

      { path: 'categoria/:categoria', component: PostListComponent },
      {
        path: ':slug',
        component: PostSingleComponent,
        //canActivate: [adminGuard],
        //data: { allowedRoles: ['user', 'admin'] }
      },

    ]
  },

  {
    path: 'inversor', children: [
      {
        path: 'inversores',
        component: InversorComponent,
        //canActivate: [adminGuard],
        //data: { allowedRoles: ['user', 'admin'] }
      },

    ]
  },

  {

    path: 'controladores', //Dashboard
    component: ControladorComponent,
    //canActivate: [adminGuard],
    //data: { allowedRoles: ['user', 'admin'] }

  },

  /**
   *       {
    path:'controlador',children:[
      {
        path: 'controladores', //Dashboard
        component: ControladorComponent,
        //canActivate: [adminGuard],
        //data: { allowedRoles: ['user', 'admin'] }
      },
  
    ]
  },
   */



  /*
  {
    path: 'controlador',
    component: ControladorComponent,  // Dashboard que lista funcionalidades
    children: [
      {
        path: 'funcionalidades',  // Ruta contenedora (layout con menú lateral)
        component: PadreControladorComponent,
        children: [               // Hijos que se renderizan en el router-outlet del padre
          {
            path: 'pwmVSmppt',  // /controlador/funcionalidades/pwm-vs-mppt
            component: BateriaComponent,
          //  outlet:'prueba'
          },
      
        ]
      }
    ]
  },
  */
  ////////
  /*
  {
    path: 'controlador',
    component: ControladorComponent,  // Dashboard (ruta inicial) //Muestra un listado de funcionalidades y llevan a controladoresfuncionalidades
    children: [
      {
        path: 'controladoresfuncionalidades',  // tiene un menu lateral con las funcionalidades
        component: PadreControladorComponent,
      },
      {
        path: 'pwm-vs-mppt',   // Ruta para comparación
        component: PwmVsMpptComponent,
      },
      {
        path: 'mppt-curvas',    // Ruta para curvas
        component: MpptCurvasComponent,
      },
      // Ruta por defecto (opcional)
      { path: '', redirectTo: 'controladores', pathMatch: 'full' }
    ]
  }
  */
  ///////



  {
    path: 'controladorFuncionalidades',
    component: PadreControladorComponent,  // Este es el contenedor padre
    children: [
      {
        path: 'pwmVSmppt',   // Ruta para comparación
        component: PwmControllerComponent,
      },
    ]
  },



  {
    path: 'bateria', children: [
      {
        path: 'baterias',
        component: BateriaComponent,
        //canActivate: [adminGuard],
        //data: { allowedRoles: ['user', 'admin'] }
      },

    ]
  },

  /*
  { path: 'blog', component:BlogListComponent },
{ path: 'blog/categoria/:categoria', component:BlogListComponent},
{ path: 'blog/:slug', component:SingleBlogComponent }
  */


  {
    path: 'aboutMe',
    component: AboutMeComponent,
    //canActivate: [adminGuard],
    //data: { allowedRoles: ['user', 'admin'] }
  },

  {
    path: 'contactenos',
    component: IndexContactoComponent,
    //canActivate: [adminGuard],
    //data: { allowedRoles: ['user', 'admin'] }
  },


  //Ruta Comodin
  {
    path: '**',
    redirectTo: ''
  }

];
