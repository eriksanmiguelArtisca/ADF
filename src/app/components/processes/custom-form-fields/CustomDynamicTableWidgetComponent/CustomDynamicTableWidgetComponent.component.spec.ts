/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CustomDynamicTableWidgetComponentComponent } from './CustomDynamicTableWidgetComponent.component';

describe('CustomDynamicTableWidgetComponentComponent', () => {
  let component: CustomDynamicTableWidgetComponentComponent;
  let fixture: ComponentFixture<CustomDynamicTableWidgetComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomDynamicTableWidgetComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomDynamicTableWidgetComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
