import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagesDisplayComponent } from './pages-display.component';

describe('PagesDisplayComponent', () => {
  let component: PagesDisplayComponent;
  let fixture: ComponentFixture<PagesDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagesDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagesDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
