/*
 * Copyright 2005-2018 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, ViewEncapsulation, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material';
import { Subscription,Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, /* , Router */ 
Router} from '@angular/router';
import {
    LogService,
    AppsProcessService,
    NotificationService,
    TranslationService,
    FormService,
	FormFieldModel,
    FormFieldEvent,
    ValidateDynamicTableRowEvent,
    DynamicTableRow,
    WidgetVisibilityService} from '@alfresco/adf-core';
import {
TaskDetailsModel, TaskListService, TaskFilterService, 
} from '@alfresco/adf-process-services';

import { LightUserRepresentation } from '@alfresco/js-api';
import { APWProperties} from '../../../../models';

import {  CSA_ALTA_CEBE ,CSA_ALTA_CECO ,CSA_ALTA_NODO_CEBE ,CSA_ALTA_NODO_CECO ,CSA_MOFICACION_NODO_CEBE,CSA_MOFICACION_NODO_CECO ,CSA_WASAP ,CSA_MODIFICACION_CEBE, CSA_MODIFICACION_CECO,CSA_WAAPY,
    IT_DARB,CSA_WASCS,CSA_WARPF, CSA_WAMPY, WSAF} from '../task-details/workflows-logic/index';
import { HttpClient } from '@angular/common/http';
import { PreviewService } from '../../../../services/preview.service';
import { TreePepsService } from '../../../../services/tree-peps.service';

@Component({
    selector: 'apw-task-details-container',
    templateUrl: './task-details-container.component.html',
    styleUrls: ['./task-details-container.component.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class TaskDetailsContainerComponent implements OnInit, OnDestroy {

    static DEFAULT_TASK_FILTER = 'My Tasks';
    static SIDEBAR_DETAILS_TAB = 0;
    static SAVE_OUTCOME_ID = '$save';

    sub: Subscription;
    appId: number;
    taskDetails: TaskDetailsModel;
    showInfoDrawer = false;
    readOnlyForm = false;
    taskFormName: string;

    activeTab = TaskDetailsContainerComponent.SIDEBAR_DETAILS_TAB;
    selectedTab: number;

    appName: string;
    isformChanged: any;

    formOutcomeModels: any[];
    private onDestroy$ = new Subject<boolean>();

    constructor(
        private logService: LogService,
        private route: ActivatedRoute,
        /*  private router: Router, */
        private location: Location,
        private taskListService: TaskListService,
        private appService: AppsProcessService,
        private taskFilterService: TaskFilterService,
        private preview: PreviewService,
        private notificationService: NotificationService,
        private translateService: TranslationService,
        public dialog: MatDialog,
        formService: FormService,
        protected changeDetector: ChangeDetectorRef,
        public router: Router,
        public treeService : TreePepsService,
        public visibilityService : WidgetVisibilityService,
        public http: HttpClient
    ) {

        formService.formLoaded.pipe(takeUntil(this.onDestroy$)).subscribe((e: FormFieldEvent) => {
            if (e.form.outcomes[0].id !== '$nochanges') {
                this.formOutcomeModels = e.form.outcomes;
                let processDefinitionKey = e.form.json.processDefinitionKey;
                if (processDefinitionKey.includes('csa_')) {
                    // Si es un proceso de CSA los nombre tienen esta denominacion
                    this.formOutcomeModels[0].name = 'RETENER';
                    this.formOutcomeModels[1].name = 'GRABAR';
                } else {
                    this.formOutcomeModels[0].name = 'GUARDAR';
                    this.formOutcomeModels[1].name = 'GUARDAR Y AVANZAR ';
                }
                this.formOutcomeModels.unshift({
                    name: 'SALIR SIN CAMBIOS',
                    isSystem: true,
                    isSelected: true,
                    fieldType: undefined,
                    id: '$nochanges',
                    type: undefined,
                    tab: undefined,
                    form: e.form,
                    json: {
                        id: '$nochanges',
                        name: 'SALIR SIN CAMBIOS',
                        isSystem: true,
                    },
                });
                e.form.outcomes = this.formOutcomeModels;
            }
            const fields: FormFieldModel[] = e.form.getFormFields();
            // formulario CECO
            if (e.form.json.processDefinitionKey == 'csa_waacc') {
                CSA_ALTA_CECO.formLoaded(e, fields);
            }
            //formulario CEBE
            if (e.form.json.processDefinitionKey == 'csa_waacb') {
                CSA_ALTA_CEBE.formLoaded(e, fields);
            }
            //formulario Modificacion CEBE 
            if(e.form.json.processDefinitionKey== "csa_wamcb"){
                CSA_MODIFICACION_CEBE.formLoaded(e,fields);		
            }
            //formulario Modificacion CECO 
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
            
            //formulario WASAP
            if (e.form.json.processDefinitionKey == 'csa_wasap') {
                CSA_WASAP.formLoaded(e, fields,http);
            }

            //formulario WAAPY
            if (e.form.json.processDefinitionKey == 'csa_waapy_') {
                CSA_WAAPY.formLoaded(e, fields, this.treeService);
            }

            //formulario compra simplificada
            if (e.form.json.processDefinitionKey == 'csa_wascs') {
                CSA_WASCS.formLoaded(e, fields,http);
            }

            //formulario DARB
            if (e.form.json.processDefinitionKey == 'it_widarb') {
                IT_DARB.formLoaded(fields);
            }

            //formulario WARPF
            if (e.form.json.processDefinitionKey == "csa_warpf") {
                CSA_WARPF.formLoaded(e, fields, http);
            }

            //formulario WAMPY
            if (e.form.json.processDefinitionKey == 'csa_wampy') {
                CSA_WAMPY.formLoaded(e, fields, this.treeService);
            }

            //formulario ACCESOS
            if(e.form.json.processDefinitionKey== "wsaf"){	
                WSAF.formLoaded(e,fields,http);
            }


            // Una vez carga el formulario ya podemos suscribirnos a los cambios del formulario
            formService.formFieldValueChanged.pipe(takeUntil(this.onDestroy$)).subscribe(
	            (e: FormFieldEvent) => {
                    try {
                        const fields: FormFieldModel[] = e.form.getFormFields();
                        //formulario CECO
                        if (e.form.json.processDefinitionKey == 'csa_waacc') {
                            CSA_ALTA_CECO.formFieldValueChanged(e, fields);
                        }
                        ////formulario CEBE
                        if (e.form.json.processDefinitionKey == 'csa_waacb') {
                            CSA_ALTA_CEBE.formFieldValueChanged(e, fields);
                        }
                        //formulario Modificacion CEBE 
                        if(e.form.json.processDefinitionKey== "csa_wamcb"){	
                            CSA_MODIFICACION_CEBE.formFieldValueChanged(e,fields);	
                        }
                        //formulario Modificacion CEBE 
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
                        //formulario Modificacion Nodo CEBE 
                        if(e.form.json.processDefinitionKey== "csa_wamncb"){
                            CSA_MOFICACION_NODO_CEBE.formFieldValueChanged(e,fields);
                        }
                        //formulario Modificacion Nodo CECO 
                        if(e.form.json.processDefinitionKey== "csa_wamncc"){
                            CSA_MOFICACION_NODO_CECO.formFieldValueChanged(e,fields);
                        }
                        ////formulario WASAP
                        if (e.form.json.processDefinitionKey == 'csa_wasap') {
                            CSA_WASAP.formFieldValueChanged(e, fields);
                        }
                         ////formulario WAAPY
                        if (e.form.json.processDefinitionKey == 'csa_waapy_') {
                            CSA_WAAPY.formFieldValueChanged(e, fields,this.treeService);
                        }
                        ////formulario compra simplificada
                        if (e.form.json.processDefinitionKey == 'csa_wascs') {
                            CSA_WASCS.formFieldValueChanged(e, fields,http, this.notificationService);
                        }
                        ////formulario DARB
                        if (e.form.json.processDefinitionKey == 'it_widarb') {
                            IT_DARB.formFieldValueChanged(e, fields);
                        }
                        //formulario WARPF
                        if (e.form.json.processDefinitionKey == "csa_warpf") {
                            CSA_WARPF.formFieldValueChanged(e, fields, http, this.notificationService);
                        }
                        //formulario Modificacion WAMPY
                        if (e.form.json.processDefinitionKey == 'csa_wampy') {
                            CSA_WAMPY.formFieldValueChanged(e, fields, this.treeService,visibilityService );
                        }

                        //formulario ACCESOS
                        if(e.form.json.processDefinitionKey== "wsaf"){	
                            WSAF.formFieldValueChanged(e,fields,http);
                        }
                    } catch (error) {
                        console.error(error);
                    }
	                
	            }
	        );
        });
		 
           /*  this.sub.add(subFieldValueChanged);
		}); */ 
        /* this.sub.add(formEvents); */

        formService.validateDynamicTableRow.pipe(takeUntil(this.onDestroy$)).subscribe(
            (e: ValidateDynamicTableRowEvent) => {
                const fields: FormFieldModel[] = e.form.getFormFields();
                const row: DynamicTableRow = e.row;
                if (
                    e.field.id == 'widarb_pre_inversion' ||
                    e.field.id == 'widarb_pre_costes_operacion_adicionales'
                ) {
                    IT_DARB.validateDynamicTableRow(row, e, fields);
                }/* else if(e.form.json.processDefinitionKey == 'csa_waapy_'){
                    CSA_WAAPY.validateDynamicTableRow(row , e, fields,this.treeService, this.formService , this.visibilityService);
                } */
                if (e.field.id === "wascs_solicitudes"){
                    CSA_WASCS.validateDynamicTableRow(row , e, fields,this.treeService, formService , this.visibilityService);
                }
                if (e.field.id === "warpf_solicitudes"){
                    CSA_WARPF.validateDynamicTableRow(row , e, fields, formService , this.visibilityService);
                }
                if (e.field.id === "csa_wampy"){
                    CSA_WAMPY.validateDynamicTableRow(row , e, fields, this.treeService, formService , this.visibilityService);
                }


            }
        );

        /* this.sub.add(validateDynamicTableRow); */
    }

    ngOnInit() {
        this.route.params.subscribe((params) => {
            this.appId = +params['appId'];
            const taskId = params['taskId'];
            this.getAppName(this.appId);
            this.loadTaskDetails(taskId);
        });
        //new Angular HttpClient service
        
       /*  http://172.22.1.74:8080/ */
        
    }

    private loadTaskDetails(taskId: string) {
        if (taskId) {
            this.taskListService.getTaskDetails(taskId).subscribe(
                (res: TaskDetailsModel) => {
                    this.taskDetails = res;

                    if (!this.taskDetails.name) {
                        this.taskDetails.name = 'No name';
                    }

                    const endDate: any = res.endDate;
                    this.readOnlyForm = !!(endDate && !isNaN(endDate.getTime()));
                });
        }
    }

    onCompleteTaskForm(processInfo) {
        if (processInfo.processInstanceId || processInfo.processDefinitionId) {
            this.notify('DW-TASK-FORM.OPERATIONS.FORM-COMPLETED');
            this.navigateToTaskList();
        } else {
            this.notify('DW-TASK-FORM.OPERATIONS.FORM-COMPLETED');
            this.navigateToTaskList();
        }
    }

    onNoFormOutCome(event: any): void {
        this.notify('DW-TASK-FORM.OPERATIONS.FORM-COMPLETED');
    }

    /**
     * Retrieve the next open task
     * @param processInstanceId
     * @param processDefinitionId
     */
    /*   private loadNextTask(processInstanceId: string, processDefinitionId: string) {
        const requestNode = new TaskQueryRequestRepresentationModel(
            {
                processInstanceId: processInstanceId,
                processDefinitionId: processDefinitionId
            }
        );
        this.taskListService.getTasks(requestNode).subscribe(
            (response) => {
                if (response && response.size > 0) {
                    this.taskDetails = new TaskDetailsModel(response.data[0]);
                } else {
                    this.reset();
                }
            },
            (error) => {
                this.logService.error(error);
            });
    }

    private reset() {
        this.taskDetails = null;
        this.navigateToTaskList();
    } */

    onUpdatedTask() {
        this.loadTaskDetails(this.taskDetails.id);
    }

    onFormAttach(): void {
        this.loadTaskDetails(this.taskDetails.id);
    }

    onFormEdit() {
        this.loadTaskDetails(this.taskDetails.id);
    }

    getAppName(appId: number) {
        if (this.appId === 0) {
            this.appName = APWProperties.TASK_APP_NAME;
        } else {
            this.appService.getApplicationDetailsById(appId).subscribe(
                (res) => {
                    this.appName = res.name;
                }
            );
        }
    }

    hasTaskDetails(): boolean {
        return this.taskDetails && this.taskDetails.id !== undefined && this.taskDetails.id !== null;
    }

    onSelectedTab(tabIndex: number) {
        this.activeTab = tabIndex;
        this.selectedTab = tabIndex;
    }

    isDetailsTabActive() {
        return this.activeTab === TaskDetailsContainerComponent.SIDEBAR_DETAILS_TAB;
    }

    toggleInfoDrawer(): void {
        this.showInfoDrawer = !this.showInfoDrawer;
    }

    getToolBarActionName(): string {
        return this.showInfoDrawer ? 'info' : '';
    }

    oncloseIconClick(): void {
        /* if (this.isformChanged) {
            this.openDialog(ToolbarIconEvent.ACTION_CLOSE_TYPE);
        } else {
            this.navigateToTaskList();
        } */
        this.navigateToTaskList();
    }

    onTaskFormName(formName: any): void {
        this.taskFormName = formName;
    }

    onBackButtonClick(): void {
        /* if (this.isformChanged) {
            this.openDialog(ToolbarIconEvent.ACTION_BACK_TYPE);
        } else {
            this.navigateByHistory();
        } */
        this.navigateByHistory();
    }

    onCancelForm() {
        this.navigateByHistory();
    }

    onClaim(): void {
        this.location.back();
    }

    onContentClick(content: any): void {
        this.showContentPreview(content);
    }

    private showContentPreview(content: any) {
        if (content.contentBlob) {
            this.preview.showBlob(content);
        }
    }

    private navigateByHistory(): void {
        this.navigateToTaskList();
        /* this.location.back(); */
    }

    onNavigate(event) {
        this.navigateToTaskList();
    }

    navigateToTaskList(): void {
        this.taskFilterService.getTaskListFilters(this.appId).subscribe(async success =>{
            let filters = [];
            if(success.length > 0){
                 filters = success;
            }else if( success.length == 0) {
                await this.taskFilterService.createDefaultFilters(this.appId).toPromise().then( successCreated => {
                    filters = successCreated;
                })
            }
            let filter = filters.filter(filter => filter.name === "Mis tareas" || filter.name === "My Tasks");
            this.router.navigate([`apps/${this.appId}/tasks/${filter[0].id}`]);  
        });
        /*    this.taskFilterService.getTaskFilterByName(TaskDetailsContainerComponent.DEFAULT_TASK_FILTER, +this.appId).subscribe(
            (res: FilterRepresentationModel) => {
                const filter = res;
                const navUrl: string = '/apps/' + this.appId + '/tasks/' + filter.id;
                this.router.navigateByUrl(navUrl);
            }); */
        /* this.navigateByHistory(); */
    }

    ngOnDestroy() {
        this.onDestroy$.next(true);
        this.onDestroy$.complete();
        if (this.sub) {
            this.sub.unsubscribe();
        }
    }

    assignTaskToUser(selectedUser: LightUserRepresentation) {
        this.taskListService.assignTask(this.taskDetails.id, selectedUser).subscribe(
            (res: any) => {
                this.logService.info('Task Assigned to ' + selectedUser.email);
                this.onNavigate({ route: 'tasks' });
            });
    }

    onFormOutcomeExecute(outcome: any) {
        if (outcome._outcome.id === '$nochanges') {
            this.onBackButtonClick();
        }
        else if ( outcome._outcome.id === TaskDetailsContainerComponent.SAVE_OUTCOME_ID ) {
            const message = this.translateService.instant('DW-TASK-FORM.OPERATIONS.FORM-SAVED');
            this.notificationService.openSnackMessage(message, 4000);
            this.isformChanged = null;
        }
    }

    onFormChanged(event: any) {
        this.isformChanged = event;
    }

   /*  private buildDialogContent(): DialogContentModel {
        const content = {
            'title': this.translateService.instant('DW-DIALOG.TASK-DIALOG.TITLE'),
            'actions': [
                {
                    'label': this.translateService.instant('DW-DIALOG.TASK-DIALOG.SAVE'),
                    'key': 'save',
                    'color': 'primary'
                },
                {
                    'label': this.translateService.instant('DW-DIALOG.TASK-DIALOG.DISCARD'),
                    'key': 'discard'
                }
            ]
        };
        return <DialogContentModel>content;
    } */

    /* openDialog(source: string): void {
        const dialogRef = this.dialog.open(DialogConfirmationComponent);
        dialogRef.componentInstance.dialogContent = this.buildDialogContent();
        dialogRef.afterClosed().subscribe(res => {
            if (res && res.action === DialogEvent.ACTION_SAVE) {
                this.formService.saveTaskForm(this.isformChanged.taskId, this.isformChanged.values);
                switch (source) {
                    case ToolbarIconEvent.ACTION_CLOSE_TYPE:
                    this.navigateToTaskList();
                    break;
                    case ToolbarIconEvent.ACTION_BACK_TYPE:
                    this.navigateByHistory();
                    break;
                }
                this.notify('DW-TASK-FORM.OPERATIONS.FORM-SAVED');
            } else if (res && res.action === DialogEvent.ACTION_DISCARD) {
                switch (source) {
                    case ToolbarIconEvent.ACTION_CLOSE_TYPE:
                    this.navigateToTaskList();
                    break;
                    case ToolbarIconEvent.ACTION_BACK_TYPE:
                    this.navigateByHistory();
                    break;
                }
            }
        });
    } */

    private notify(message: string): void {
        const translatedMessage = this.translateService.instant(message);
        this.notificationService.openSnackMessage(translatedMessage, 4000);
    }
}
