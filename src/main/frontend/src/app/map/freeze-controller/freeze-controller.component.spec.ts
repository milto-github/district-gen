import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FreezeControllerComponent } from './freeze-controller.component';

describe('FreezeControllerComponent', () => {
  let component: FreezeControllerComponent;
  let fixture: ComponentFixture<FreezeControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FreezeControllerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FreezeControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
