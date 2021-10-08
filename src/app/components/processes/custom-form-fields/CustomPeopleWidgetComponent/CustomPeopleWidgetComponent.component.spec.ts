/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CustomPeopleWidgetComponentComponent } from './CustomPeopleWidgetComponent.component';

describe('CustomPeopleWidgetComponentComponent', () => {
  let component: CustomPeopleWidgetComponentComponent;
  let fixture: ComponentFixture<CustomPeopleWidgetComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomPeopleWidgetComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomPeopleWidgetComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
