/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PolizasDocumentlistComponent } from './polizas-documentlist.component';

describe('PolizasDocumentlistComponent', () => {
  let component: PolizasDocumentlistComponent;
  let fixture: ComponentFixture<PolizasDocumentlistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolizasDocumentlistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolizasDocumentlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
