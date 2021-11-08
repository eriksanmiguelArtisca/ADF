import { Component, ViewEncapsulation, SimpleChanges, OnInit, OnDestroy, OnChanges} from '@angular/core';
import { EcmModelService, NodeService, WidgetVisibilityService,
    FormService,
    FormOutcomeEvent,
    FormOutcomeModel,
    FormBaseComponent,
    FormModel,
} from '@alfresco/adf-core';
import { FormComponent } from '@alfresco/adf-process-services';
import { ConfirmDialogComponent } from '@alfresco/adf-content-services';
import { MatDialog } from '@angular/material';
import { isUndefined } from 'util';



@Component({
    selector: 'custom-form',
    templateUrl: './custom-form.component.html',
    encapsulation: ViewEncapsulation.None
})
export class CustomFormComponent extends FormComponent implements OnInit, OnDestroy, OnChanges {

    debugMode: boolean = false;

    constructor(protected formService: FormService,
                protected visibilityService: WidgetVisibilityService,
                protected ecmModelService: EcmModelService,
                protected nodeService: NodeService,
                public dialog: MatDialog) {
        super(formService,visibilityService,ecmModelService,nodeService);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    /* getFormByTaskId(taskId: string): Promise<FormModel> {
      return super.getFormByTaskId(taskId);
    } */

    getFormByTaskId(taskId: string): Promise<FormModel> {
      return new Promise<FormModel>(resolve => {
          this.findProcessVariablesByTaskId(taskId).subscribe((variables:Array<Object>) => {
              this.formService
                  .getTaskForm(taskId)
                  .subscribe(
                      (form) => {
                          const parsedForm = this.parseForm(form);

                          
                          this.visibilityService.refreshVisibility(parsedForm);
                          parsedForm.validateForm();
                          this.form = parsedForm;
                          // Como la llamada de generacion del formulario no carga las variables las cargamos nosotros manualmente
                          let initiator_variable = variables.find(variable => variable["id"].includes("iniciador") && !variable["id"].includes("comentarios") );
                          let iniciador_field = this.form.getFieldById("solicitante");
                          if( !isUndefined(initiator_variable) && !isUndefined(iniciador_field) ){
                            iniciador_field.value = initiator_variable["value"];
                          }

                          /* let rechazo_variable = variables.find(variable => variable["id"].includes("rechazo") )
                          let rechazo_field = this.form.getFieldById(form.processDefinitionKey.split("_")[1]+"_rechazo");
                          if( !isUndefined(rechazo_variable) && !isUndefined(rechazo_field) ){
                            rechazo_field.value = rechazo_variable["value"];
                          }
                           */
                          let historico_variable = variables.find(variable => variable["id"].includes("historico") )
                          let historico_field = this.form.getFieldById(form.processDefinitionKey.split("_")[1]+"_historico");
                          if( !isUndefined(historico_variable) && !isUndefined(historico_field) ){
                            historico_field.value = historico_variable["value"];
                          }

                          let estado_variable = variables.find(variable => variable["id"].includes("status") )
                          let estado_field = this.form.getFieldById("estado");
                          if( !isUndefined(estado_variable) && !isUndefined(estado_field) ){
                            estado_field.value = estado_variable["value"];
                          }
           
                          let codigoformulario_variable = variables.find(variable => variable["id"].includes("docNumber") || variable["id"].includes("formNumber") )
                          let codigoformulario_field = this.form.getFieldById("cdigodeformulario");
                          if( !isUndefined(codigoformulario_variable) && !isUndefined(codigoformulario_field) ){
                            codigoformulario_field.value = codigoformulario_variable["value"];
                          }
                          
                          this.onFormLoaded(this.form);
                          resolve(this.form);
                      },
                      (error) => {
                          this.handleError(error);
                          resolve(null);
                      }
                  );
          });
      });
  }

    saveTaskForm() {
      if (this.form && this.form.taskId) {
          this.formService
              .saveTaskForm(this.form.taskId, this.form.values)
              .subscribe(
                  () => {
                      this.onTaskSaved(this.form);
                      this.storeFormAsMetadata();
                  },
                  (error) => this.onTaskSavedError(this.form, error)
              );
      }
    }

    completeTaskForm(outcome?: string) {
      console.log( this.form.values);
      if (this.form && this.form.taskId) {
          this.formService
              .completeTaskForm(this.form.taskId, this.form.values, outcome)
              .subscribe(
                  () => {
                      this.onTaskCompleted(this.form);
                      this.storeFormAsMetadata();
                  },
                  (error) => this.onTaskCompletedError(this.form, error)
              );
      }
    }

    protected onExecuteOutcome(outcome: FormOutcomeModel): boolean {
      const args = new FormOutcomeEvent(outcome);

      this.formService.executeOutcome.next(args);
      if (args.defaultPrevented) {
          return false;
      }

      this.executeOutcome.emit(args);
      return !args.defaultPrevented;
  }

  /**
     * Invoked when user clicks outcome button.
     * @param outcome Form outcome model
     */
     onOutcomeClicked(outcome: FormOutcomeModel): boolean {
      if (!this.readOnly && outcome && this.form) {
            let confirm = this.confirmation(outcome);
            confirm.then( (result) => {
              if(result === false){
                return false;
              }else if(result === true){
                if (!this.onExecuteOutcome(outcome)) {
                  return false;
                }
      
                if (outcome.isSystem) {
                  
                    if (outcome.id === FormBaseComponent.SAVE_OUTCOME_ID) {
                        this.saveTaskForm();
                        return true;
                    }
      
                    if (outcome.id === FormBaseComponent.COMPLETE_OUTCOME_ID) {
                      this.completeTaskForm();
                      return true;
                    }
      
                    if (outcome.id === FormBaseComponent.START_PROCESS_OUTCOME_ID) {
                        this.completeTaskForm();
                        return true;
                    }
      
                    if (outcome.id === FormBaseComponent.CUSTOM_OUTCOME_ID) {
                        this.onTaskSaved(this.form);
                        this.storeFormAsMetadata();
                        return true;
                    }
                } else {
                    // Note: Activiti is using NAME field rather than ID for outcomes
                    if (outcome.name) {
                        this.onTaskSaved(this.form);
                        this.completeTaskForm(outcome.name);
                        return true;
                    }
                }
              }
              return false;
          });     
      }else{
        return false;
      }

      
    }

    confirmation(formOutcomeModel){
      let taskDefinitionKey = formOutcomeModel.form.json.taskDefinitionKey;
      if ((formOutcomeModel.id === FormBaseComponent.SAVE_OUTCOME_ID || formOutcomeModel.id === FormBaseComponent.COMPLETE_OUTCOME_ID) &&
        (taskDefinitionKey.includes('waacb_t2') || taskDefinitionKey.includes('waacb_t3') ||
          taskDefinitionKey.includes('waacc_t2') || taskDefinitionKey.includes('waacc_t3') ||
          taskDefinitionKey.includes('wasap_t2') || taskDefinitionKey.includes('wasap_t3') ||
          taskDefinitionKey.includes('waancb_t2') || taskDefinitionKey.includes('waancb_t3') ||
          taskDefinitionKey.includes('waancc_t2') || taskDefinitionKey.includes('waancc_t3') ||
          taskDefinitionKey.includes('wamncb_t2') || taskDefinitionKey.includes('wamncb_t3') ||
          taskDefinitionKey.includes('wamncc_t2') || taskDefinitionKey.includes('wamncc_t3') ||
          taskDefinitionKey.includes('wamcc_t2') || taskDefinitionKey.includes('wamcc_t3') ||
          taskDefinitionKey.includes('wamcb_t2') || taskDefinitionKey.includes('wamcb_t3') ||
          taskDefinitionKey.includes('wascs_t2') || taskDefinitionKey.includes('wascs_t3') ||
          taskDefinitionKey.includes('warpf_t2') || taskDefinitionKey.includes('warpf_t3') ||
          taskDefinitionKey.includes('wampy_t2') || taskDefinitionKey.includes('wampy_t3') ||
          taskDefinitionKey.includes('wasp_t2') || taskDefinitionKey.includes('wasp_t3')
        )) {
                
            const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                data: {
                    title: 'Confirmación',
                    message: `¿Estás seguro de confirmar?`
                },
                minWidth: '250px'
            });
            let dialogResult =  dialogRef.beforeClosed().toPromise();
            return dialogResult;
        }else {
          return Promise.resolve(true);
        }
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
    }
}


