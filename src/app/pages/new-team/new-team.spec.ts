import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTeam } from './new-team';

describe('NewTeam', () => {
  let component: NewTeam;
  let fixture: ComponentFixture<NewTeam>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewTeam]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewTeam);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
