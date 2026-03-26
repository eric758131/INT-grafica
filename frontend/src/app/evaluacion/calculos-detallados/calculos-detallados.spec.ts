import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculosDetallados } from './calculos-detallados';

describe('CalculosDetallados', () => {
  let component: CalculosDetallados;
  let fixture: ComponentFixture<CalculosDetallados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculosDetallados]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculosDetallados);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
