import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRequerimiento } from './modal-requerimiento';

describe('ModalRequerimiento', () => {
  let component: ModalRequerimiento;
  let fixture: ComponentFixture<ModalRequerimiento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalRequerimiento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalRequerimiento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
