import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipientsComponent } from './recipients.component';

describe('RecipientsComponent', () => {
  let component: RecipientsComponent;
  let fixture: ComponentFixture<RecipientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipientsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
