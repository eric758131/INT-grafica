import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaRequerimientos } from './lista-requerimientos';

describe('ListaRequerimientos', () => {
  let component: ListaRequerimientos;
  let fixture: ComponentFixture<ListaRequerimientos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaRequerimientos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaRequerimientos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
