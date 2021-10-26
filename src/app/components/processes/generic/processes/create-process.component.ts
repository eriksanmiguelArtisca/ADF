/*
 * Copyright 2005-2018 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input, OnInit, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { ProcessFilterService, FilterProcessRepresentationModel, StartProcessInstanceComponent, ProcessService, TaskDetailsModel, ProcessFormRenderingService } from '@alfresco/adf-process-services';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription,Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppConfigService, FormFieldModel, FormService,FormFieldEvent, NotificationService, FormOutcomeModel, ValidateDynamicTableRowEvent, DynamicTableRow, WidgetVisibilityService } from '@alfresco/adf-core';
import { BpmAppsService } from '../../../../services/bpm-apps.service';
import {  isNullOrUndefined, isUndefined } from 'util';

import {  CSA_ALTA_CEBE ,CSA_ALTA_NODO_CEBE ,CSA_ALTA_NODO_CECO ,CSA_MOFICACION_NODO_CEBE,CSA_MOFICACION_NODO_CECO ,CSA_ALTA_CECO ,CSA_WASAP ,CSA_MODIFICACION_CEBE, CSA_MODIFICACION_CECO,CSA_WAAPY,
	IT_DARB,CSA_WASCS,CSA_WARPF,CSA_WAMPY, WSAF } from '../task-details/workflows-logic/index';
import { HttpClient } from '@angular/common/http';
import { TreePepsService } from '../../../../services/tree-peps.service';
import { CustomProcessFormRenderingService } from '../../../../services/custom-process-form-rendering.service';


@Component({
    selector: 'apw-create-process',
    templateUrl: './create-process.component.html',
    styleUrls: ['./create-process.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers : [  { provide: ProcessFormRenderingService, useClass: CustomProcessFormRenderingService }]
})
export class CreateProcessComponent implements OnInit, OnDestroy {

    @Input()
    appId: string = null;

    sub: Subscription;
    defaultFilterId = '';

    defaultProcessDefinitionName: string;
    defaultProcessName: string;
    showSelectProcessDropdown : boolean;
    processFilterSelector : boolean;
    processId: any;
	processDefinitionName: string;
	flagProcessDefinition: boolean;
	
	
	@ViewChild('startProcess')
	startProcess: StartProcessInstanceComponent;
	loading: boolean;
	formOutcomeModels: any[];

	private onDestroy$ = new Subject<boolean>();

    constructor(private route: ActivatedRoute,
        private router: Router,
        private appConfig: AppConfigService,
        private processFilterService: ProcessFilterService,
		private bpmAppsService : BpmAppsService,
		private processService : ProcessService,
		formService: FormService,
		private notificationService : NotificationService,
		public http: HttpClient,
		private treeService : TreePepsService,
		visibilityService : WidgetVisibilityService){
		 

			
		//evento al cargar formulario	
		/* try { */
			formService.formLoaded.pipe(takeUntil(this.onDestroy$)).subscribe((e: FormFieldEvent) => {
				if( !isUndefined(this.startProcess.startForm) ){
					this.overrideOutcomes();
				}
				
				const fields: FormFieldModel[] = e.form.getFormFields();
				// formulario CECO 
				if(e.form.json.processDefinitionKey== "csa_waacc"){
					CSA_ALTA_CECO.formLoaded(e,fields);	
				}
				
				//formulario Alta CEBE 
				if(e.form.json.processDefinitionKey== "csa_waacb"){
					CSA_ALTA_CEBE.formLoaded(e,fields);		
				}
				//formulario Modificacion CEBE 
				if(e.form.json.processDefinitionKey== "csa_wamcb"){
					CSA_MODIFICACION_CEBE.formLoaded(e,fields);		
				}
				//formulario Modificacion CECO
				if(e.form.json.processDefinitionKey== "csa_wamc"){
					CSA_MODIFICACION_CECO.formLoaded(e,fields);		
				}
				//formulario Modificacion CEBE 
				if(e.form.json.processDefinitionKey== "csa_wamcc"){
					CSA_MODIFICACION_CECO.formLoaded(e,fields);		
				}
				//formulario Alta Nodo CEBE 
				if(e.form.json.processDefinitionKey== "csa_waancb"){
					CSA_ALTA_NODO_CEBE.formLoaded(e,fields);		
				}
				//formulario Alta Nodo CECO
				if(e.form.json.processDefinitionKey== "csa_waancc"){
					CSA_ALTA_NODO_CECO.formLoaded(e,fields);		
				}
				//formulario Modificacion Nodo CEBE 
				if(e.form.json.processDefinitionKey== "csa_wamncb"){
					CSA_MOFICACION_NODO_CEBE.formLoaded(e,fields);		
				}
				//formulario Modificacion Nodo CECO
				if(e.form.json.processDefinitionKey== "csa_wamncc"){
					CSA_MOFICACION_NODO_CECO.formLoaded(e,fields);		
				}
	
				//formulario WASAP (anticipo proveedores) 
				if(e.form.json.processDefinitionKey== "csa_wasap"){	
					CSA_WASAP.formLoaded(e,fields,http);
				}
	
				//formulario WAAPY (proyectos PEPs) 
				if(e.form.json.processDefinitionKey== "csa_waapy_"){	
					CSA_WAAPY.formLoaded(e,fields,this.treeService);
				}
	
				//formulario DARB 
				if(e.form.json.processDefinitionKey== "it_widarb"){            
					IT_DARB.formLoaded(fields);
				}

				//formulario compra simplificada
				if(e.form.json.processDefinitionKey== "csa_wascs"){	
					CSA_WASCS.formLoaded(e,fields,http);
				}

				//formulario WARPF
				if(e.form.json.processDefinitionKey== "csa_warpf"){	
					CSA_WARPF.formLoaded(e,fields,http);
				}

				//formulario WAMPY
				if(e.form.json.processDefinitionKey== "csa_wampy"){	
					CSA_WAMPY.formLoaded(e,fields,this.treeService);
				}

				//formulario ACCESOS
				if(e.form.json.processDefinitionKey== "wsaf"){	
					WSAF.formLoaded(e,fields,http);
				}

				
				// Una vez carga el formulario ya podemos suscribirnos a los cambios del formulario
				formService.formFieldValueChanged.pipe(takeUntil(this.onDestroy$)).subscribe((e: FormFieldEvent) => {

					const fields: FormFieldModel[] = e.form.getFormFields();
					//formulario CECO 
					if(e.form.json.processDefinitionKey== "csa_waacc"){
						CSA_ALTA_CECO.formFieldValueChanged(e,fields);	
					}
					//formulario CEBE 
					if(e.form.json.processDefinitionKey== "csa_waacb"){	
						CSA_ALTA_CEBE.formFieldValueChanged(e,fields);	
					}
					//formulario Modificacion CEBE 
					//creo que no hace falta este evento en este proceso durante el create proces
					if(e.form.json.processDefinitionKey== "csa_wamcb"){	
						CSA_MODIFICACION_CEBE.formFieldValueChanged(e,fields);	
					}
					//formulario Modificacion CECO 
					if(e.form.json.processDefinitionKey== "csa_wamcc"){
						CSA_MODIFICACION_CECO.formFieldValueChanged(e,fields);		
					}
	
					//formulario Alta Nodo CEBE 
					if(e.form.json.processDefinitionKey== "csa_waancb"){
						CSA_ALTA_NODO_CEBE.formFieldValueChanged(e,fields);
					}
					//formulario Alta Nodo CECO
					if(e.form.json.processDefinitionKey== "csa_waancc"){
						CSA_ALTA_NODO_CECO.formFieldValueChanged(e,fields);
					}
	
					//Formulario WASAP
					if(e.form.json.processDefinitionKey== "csa_wasap"){
						CSA_WASAP.formFieldValueChanged(e,fields);
					}
	
					//Formulario WAAPY
					if(e.form.json.processDefinitionKey== "csa_waapy_"){
						CSA_WAAPY.formFieldValueChanged(e,fields,this.treeService);
					}

					//formulario compra simplificada
					if (e.form.json.processDefinitionKey == "csa_wascs") {
						CSA_WASCS.formFieldValueChanged(e, fields, http, this.notificationService);
					}

					//formulario WARPF
					if (e.form.json.processDefinitionKey == "csa_warpf") {
						CSA_WARPF.formFieldValueChanged(e, fields, http, this.notificationService);
					}

					//formulario WAMPY
					if(e.form.json.processDefinitionKey== "csa_wampy"){	
						CSA_WAMPY.formFieldValueChanged(e,fields,this.treeService, visibilityService);
					}

					//formulario ACCESOS
					if(e.form.json.processDefinitionKey== "wsaf"){	
						WSAF.formFieldValueChanged(e,fields,http);
					}

				});
				// Una vez carga el formulario ya podemos suscribirnos a los cambios de las tablas
				formService.validateDynamicTableRow.pipe(takeUntil(this.onDestroy$)).subscribe((e: ValidateDynamicTableRowEvent) => {
					const fields: FormFieldModel[] = e.form.getFormFields();
					const row: DynamicTableRow = e.row;
					if(e.field.id == "widarb_pre_inversion" || e.field.id == "widarb_pre_costes_operacion_adicionales"){
						IT_DARB.validateDynamicTableRow(row,e,fields);
					}
					if (e.field.id === "wascs_solicitudes"){
					CSA_WASCS.validateDynamicTableRow(row , e, fields,this.treeService, formService , "");
					}
					if (e.field.id === "warpf_solicitudes") {
						CSA_WARPF.validateDynamicTableRow(row, e, fields, formService, "");
					}
				});
				
			});
	/* 	} catch (error) {
			console.log(error);
		} */
		
		}


	overrideOutcomes(){
		
		this.startProcess.startProcess = function startProcess(outcome?: string) {
			
			if (this.selectedProcessDef && this.selectedProcessDef.id && this.name) {
				this.resetErrorMessage();
				const formValues = this.startForm ? this.startForm.form.values : undefined;
				this.activitiProcess.startProcess(this.selectedProcessDef.id, this.name, outcome, formValues, this.variables).subscribe(
					(res) => {
						this.name = '';
						this.start.emit(res);
					},
					(err) => {
						this.errorMessageId = 'ADF_PROCESS_LIST.START_PROCESS.ERROR.START';
						this.error.error(err);
					}
				);
			}
		}
		this.startProcess.startForm.outcomeClick.subscribe( outcome => {
			this.loading= true;
		});
		this.startProcess.startForm.error.subscribe( error => {
			this.loading= false;
		})
		this.startProcess.startForm.isOutcomeButtonEnabled =  function isOutcomeButtonEnabled(outcome: FormOutcomeModel){

            if (this.form.readOnly) {
                return false;
            }
    
            if (outcome) {
                if (outcome.name === "RETENER") {
                    return true;
                }
                if (outcome.name === FormOutcomeModel.SAVE_ACTION) {
                    return this.disableSaveButton ? false : this.form.isValid;
                }
                if (outcome.name === FormOutcomeModel.COMPLETE_ACTION) {
                    return this.disableCompleteButton ? false : this.form.isValid;
                }
                if (outcome.name === FormOutcomeModel.START_PROCESS_ACTION) {
                    return this.disableStartProcessButton ? false : this.form.isValid;
                }
                return this.form.isValid;
            }
            return false;
        }
    }




    ngOnInit() {
		this.flagProcessDefinition = false;
		this.defaultProcessName = this.appConfig.get<string>('adf-start-process.name');
		this.defaultProcessDefinitionName = this.appConfig.get<string>('adf-start-process.processDefinitionName');
			//this.processDefinitionName = this.bpmAppsService.get_processName();
	/*         this.sub = this.route.parent.params.subscribe(params => {
				this.appId = params['appId'];
			}); */
			this.route.params.subscribe(params => {
				this.appId = params['appId'];
				let processId = params['processId'];
				let _this = this;
				this.processService.getProcessDefinitions().subscribe(success => {
					let process = success.find(f => f.key === processId);
					if (!isNullOrUndefined(process)) {
					  let processName = process.name;
					  _this.processDefinitionName = processName;
					  _this.bpmAppsService.set_processName(processName);
					  _this.startProcess.processNameInput.setValue(processName);
					}
				  });
			});
			this.showSelectProcessDropdown = false;
			this.processFilterSelector = false;
	}
	
	comprobarStartProcess():boolean{
		if(this.startProcess && this.startProcess.isProcessDefinitionEmpty() == true){
			this.flagProcessDefinition = true;
			return this.flagProcessDefinition;
		}
	}
	

    ngOnDestroy() {
		this.onDestroy$.next(true);
        this.onDestroy$.complete();
        if (this.sub) {
            this.sub.unsubscribe();
        }
    }

    backFromProcessCreation($event): void {
		this.loading= false;
		if( isNullOrUndefined($event) ){
			this.router.navigateByUrl('apps/' + this.appId + '/processes-catalog');
		}
		else if($event.processDefinitionKey =="wvdd" || $event.processDefinitionKey =="it_widarb" || $event.processDefinitionKey =="csa_wamncb" ||
				$event.processDefinitionKey =="csa_wamncc" || $event.processDefinitionKey =="csa_wamcc" || $event.processDefinitionKey =="csa_wamcb" ||
				$event.processDefinitionKey =="csa_waapy_" || $event.processDefinitionKey == "csa_wampy" ){
			var resultado = $event.variables.find(f => f.name ===  "wamcc_accion_solicitante" || f.name ===  "wamncb_accion_solicitante" || f.name ===  "wamncc_accion_solicitante" || f.name ===  "wamcb_accion_solicitante"  );
			if(isNullOrUndefined(resultado) || resultado.value !="CANCELAR"){
				this.waitAndShow($event.id,0);
			}else {
				this.router.navigateByUrl('apps/' + this.appId + '/processes-catalog');
			}
		
			/* this.processService.getProcessTasks($event.id).subscribe( task => {
				//task
				this.router.navigateByUrl('taskdetails/' + this.appId + '/'+task[0].id);
				//this.router.navigateByUrl('apps/' + this.appId + '/processes-catalog');
			}); */
		}else{
			this.router.navigateByUrl('apps/' + this.appId + '/processes-catalog');
		}
	}
	
	waitAndShow(processId :string,numberOfTries: number) {

		this.processService.getProcessTasks(processId).subscribe( (tasks :TaskDetailsModel []) => {
			if(tasks.length > 0 ){
				this.router.navigateByUrl('taskdetails/' + this.appId + '/'+tasks[0].id);
			}else if(numberOfTries > 3){
				this.notificationService.openSnackMessage("No se ha podido abrir la primera tarea del proceso. Busque la tarea en la lista de tareas");
			}else {
				setTimeout(() => {
					this.waitAndShow(processId,numberOfTries+1)
				}, 1000);
			}
			
			//this.router.navigateByUrl('apps/' + this.appId + '/processes-catalog');
		});
	}

    

    getDefaultProcessFilter(appId: string): void {
        this.processFilterService.getProcessFilterByName('Running', +appId).subscribe(
            (res: FilterProcessRepresentationModel) => {
                this.defaultFilterId = res.id.toString();
            }
        );
    }

    getAppId(): string {
        return +this.appId === 0 ? null : this.appId;
    }
}


