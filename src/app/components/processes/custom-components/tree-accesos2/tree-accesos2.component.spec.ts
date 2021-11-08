import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeAccesos2Component } from './tree-accesos2.component';

describe('TreeAccesos2Component', () => {
  let component: TreeAccesos2Component;
  let fixture: ComponentFixture<TreeAccesos2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeAccesos2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeAccesos2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
