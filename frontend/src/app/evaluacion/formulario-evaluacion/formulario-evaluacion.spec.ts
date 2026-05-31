import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioEvaluacion } from './formulario-evaluacion';

describe('FormularioEvaluacion', () => {
  let component: FormularioEvaluacion;
  let fixture: ComponentFixture<FormularioEvaluacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioEvaluacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioEvaluacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
