import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMolecula } from './modal-molecula';

describe('ModalMolecula', () => {
  let component: ModalMolecula;
  let fixture: ComponentFixture<ModalMolecula>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalMolecula]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalMolecula);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
