import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultadosEvaluacion } from './resultados-evaluacion';

describe('ResultadosEvaluacion', () => {
  let component: ResultadosEvaluacion;
  let fixture: ComponentFixture<ResultadosEvaluacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultadosEvaluacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultadosEvaluacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
