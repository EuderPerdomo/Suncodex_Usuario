import { Component, OnInit,ViewChild,ElementRef } from '@angular/core';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { register, SwiperContainer } from 'swiper/element/bundle';
import { SwiperOptions } from 'swiper/types';
import { RouterModule } from '@angular/router';
// register Swiper custom elements
import { SplineViewer } from '@splinetool/viewer';

register();

@Component({
    selector: 'app-inicio',
    imports: [NavComponent, FooterComponent, RouterModule, CommonModule],
    templateUrl: './inicio.component.html',
    styleUrl: './inicio.component.css',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InicioComponent implements OnInit {

  // @ViewChild('splineContainer') splineContainer!: ElementRef;

  // ngAfterViewInit() {
  //   const app = new SplineViewer(this.splineContainer.nativeElement);
  //   app.load('https://prod.spline.design/8JcrspJ6ui5pOo9p/scene.splinecode');
  // }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    const swiperEl = document.querySelector('.swiperPrueba') as SwiperContainer;
    const swiperNewProducts = document.querySelector('.swipernewProducts') as SwiperContainer;
    const swiperParams: SwiperOptions = {
      slidesPerView: 3,
      pagination: {
        clickable: true,
      },
      navigation: true,
      spaceBetween: 30,
      breakpoints: {
        500: {
          slidesPerView: 2,
        },
        640: {
          slidesPerView: 3,
        },
        1024: {
          slidesPerView: 4,
        },
      },
      on: {
        init() {
          // ...
        },
      },
    };
    //Si el banner Fue encontrado
    if (swiperEl) {
      Object.assign(swiperEl, swiperParams);
      swiperEl.initialize()
      //this.swiperElement()?.initialize();
    }

    //Opciones para el swiper nuevosproductos
    const swiperParamsNewProducts: SwiperOptions = {
      slidesPerView: 3,
      pagination: {
        clickable: true,
      },
      navigation: true,
      spaceBetween: 30,
      breakpoints: {
        500: {
          slidesPerView: 2,
        },
        640: {
          slidesPerView: 3,
        },
        1024: {
          slidesPerView: 4,
        },
      },
      on: {
        init() {
          // ...
        },
      },
    };

    if (swiperNewProducts) {
      Object.assign(swiperNewProducts, swiperParamsNewProducts);
      swiperNewProducts.initialize()
    }

 

  }

}
