import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibroPage } from './libro.page';

describe('LibroPage', () => {
  let component: LibroPage;
  let fixture: ComponentFixture<LibroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LibroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
