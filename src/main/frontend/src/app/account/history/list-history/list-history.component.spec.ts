import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListHistoryComponent } from './list-history.component';

describe('ListHistoryComponent', () => {
  let component: ListHistoryComponent;
  let fixture: ComponentFixture<ListHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
