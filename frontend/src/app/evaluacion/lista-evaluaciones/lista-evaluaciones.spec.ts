import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaEvaluaciones } from './lista-evaluaciones';

describe('ListaEvaluaciones', () => {
  let component: ListaEvaluaciones;
  let fixture: ComponentFixture<ListaEvaluaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaEvaluaciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaEvaluaciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
