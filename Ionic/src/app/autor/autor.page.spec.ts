import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutorPage } from './autor.page';

describe('AutorPage', () => {
  let component: AutorPage;
  let fixture: ComponentFixture<AutorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AutorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
