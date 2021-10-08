import { Component, OnInit, OnDestroy } from '@angular/core';

import { FormService, PeopleProcessService, FormFieldEvent, PeopleWidgetComponent, FormFieldModel } from '@alfresco/adf-core';
import { isUndefined } from 'util';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';

@Component({
  selector: 'app-CustomPeopleWidgetComponent',
  templateUrl: './CustomPeopleWidgetComponent.component.html',
  styleUrls: ['./CustomPeopleWidgetComponent.component.scss']
})
export class CustomPeopleWidgetComponentComponent extends PeopleWidgetComponent  implements OnInit,OnDestroy {

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(public formService: FormService, public peopleProcessService: PeopleProcessService) {
    super(formService, peopleProcessService);
   }

  ngOnInit() {
    super.ngOnInit();
    this.changeValue();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }


  changeValue(){
    var _this = this;
    this.formService.formFieldValueChanged.pipe(takeUntil(this.destroyed$)).subscribe((e: FormFieldEvent) => {
      if( _this.field.id == 'widarb_des_representante_negocio' || _this.field.id == 'widarb_pcd_representante_negocio'){
        if (e.field.id == 'widarb_des_representante_negocio' || e.field.id == 'widarb_pcd_representante_negocio') {
          const fields: FormFieldModel[] = e.form.getFormFields();
          var des_representante =  fields.find(f => f.id ==  'widarb_des_representante_negocio');
          var pcd_representante =   fields.find(f => f.id ==  'widarb_pcd_representante_negocio');
    
          if(!isUndefined(pcd_representante) && des_representante.value !== null && this.field.id == pcd_representante.id){
            this.searchTerm.setValue(des_representante.value);
          }else if(!isUndefined(des_representante) && pcd_representante.value !== null && this.field.id == des_representante.id){
            pcd_representante.value = des_representante.value;
          }
        }
      }else{
        this.destroyed$.next(true);
      }
    });
  }

}
