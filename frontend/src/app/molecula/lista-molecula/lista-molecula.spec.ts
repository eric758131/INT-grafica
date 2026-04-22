import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaMolecula } from './lista-molecula';

describe('ListaMolecula', () => {
  let component: ListaMolecula;
  let fixture: ComponentFixture<ListaMolecula>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaMolecula]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaMolecula);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
