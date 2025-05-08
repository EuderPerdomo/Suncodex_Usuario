import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InversorComponent } from './inversor.component';

describe('InversorComponent', () => {
  let component: InversorComponent;
  let fixture: ComponentFixture<InversorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InversorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InversorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
