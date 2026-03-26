import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionCamas } from './seleccion-camas';

describe('SeleccionCamas', () => {
  let component: SeleccionCamas;
  let fixture: ComponentFixture<SeleccionCamas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionCamas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionCamas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
