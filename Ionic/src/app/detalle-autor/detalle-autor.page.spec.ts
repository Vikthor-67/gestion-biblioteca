import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleAutorPage } from './detalle-autor.page';

describe('DetalleAutorPage', () => {
  let component: DetalleAutorPage;
  let fixture: ComponentFixture<DetalleAutorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleAutorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
