import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchageRateListComponent } from './exchage-rate-list.component';

describe('ExchageRateListComponent', () => {
  let component: ExchageRateListComponent;
  let fixture: ComponentFixture<ExchageRateListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExchageRateListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExchageRateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
