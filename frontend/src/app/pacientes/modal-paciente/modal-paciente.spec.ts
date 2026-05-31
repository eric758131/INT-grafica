import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPaciente } from './modal-paciente';

describe('ModalPaciente', () => {
  let component: ModalPaciente;
  let fixture: ComponentFixture<ModalPaciente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalPaciente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalPaciente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
