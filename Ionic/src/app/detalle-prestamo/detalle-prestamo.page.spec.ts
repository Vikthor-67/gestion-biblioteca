import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallePrestamoPage } from './detalle-prestamo.page';

describe('DetallePrestamoPage', () => {
  let component: DetallePrestamoPage;
  let fixture: ComponentFixture<DetallePrestamoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallePrestamoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
