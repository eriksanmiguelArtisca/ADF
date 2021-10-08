/*
 * Copyright 2005-2018 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    Component,
    Input,
    OnInit,
    OnDestroy,
    Output,
    EventEmitter,
    TemplateRef,
    ViewEncapsulation,
    ViewChild,
} from '@angular/core';
import {
    FormOutcomeEvent,
    FormModel,
    BpmUserService,
    ContentLinkModel,
    FormRenderingService,
    NotificationService,
    TranslationService,
    LogService,
    FormOutcomeModel
} from '@alfresco/adf-core';
import {
    TaskDetailsModel,
    TaskListService,
    FormComponent
} from '@alfresco/adf-process-services';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FormService, FormFieldEvent } from '@alfresco/adf-core';
import { MatDialog } from '@angular/material';
import { TaskFormDialogComponent } from './task-form-dialog/task-form-dialog.component';

import { isNullOrUndefined } from 'util';
import { CustomProcessFormRenderingService } from '../../../../services/custom-process-form-rendering.service';

@Component({
    selector: 'apw-task-form',
    templateUrl: './task-form.component.html',
    styleUrls: ['./task-form.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers : [  { provide: FormRenderingService, useClass: CustomProcessFormRenderingService } ]
})

export class TaskFromComponent implements OnInit, OnDestroy {

    @Input()
    taskDetails: TaskDetailsModel;

    @Input()
    readOnlyForm = false;

    @Output()
    navigate: EventEmitter<any> = new EventEmitter<any>();


    @Output()
    cancel: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    complete: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    executeNoFormOutcome: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    taskFormName: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    contentClicked: EventEmitter<ContentLinkModel> = new EventEmitter<ContentLinkModel>();

    @Output()
    formOutcomeExecute: EventEmitter<FormOutcomeEvent> = new EventEmitter<FormOutcomeEvent>();

    @Output()
    formChange: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    formAttached: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('activitiForm')
    formComponent: FormComponent;

    appId;
    taskId: string;

    showInfoDrawer: boolean;
    attachmentDetails: any = {};
    cargando: boolean = true;
    taskFormValues: string;

    noTaskDetailsTemplateComponent: TemplateRef<any>;

    sub: Subscription;
    private currentUserId: number;

    constructor(
        private taskListService: TaskListService,
        private logService: LogService,
        private route: ActivatedRoute,
        private bpmUserService: BpmUserService,
        private formService: FormService,
        public dialog: MatDialog,
        private notificationService: NotificationService,
        private translateService: TranslationService) {
        
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.appId = params['appId'];
            this.taskId = params['taskId'];
        });
        this.loadCurrentUser();
    }

    hasFormKey() {
        return !!this.taskDetails.formKey;
    }

    isTaskLoaded(): boolean {
        return !!this.taskDetails;
    }

    onFormCompleted() {
        const processInfo = {
            processInstanceId: this.taskDetails.processInstanceId,
            processDefinitionId: this.taskDetails.processDefinitionId
        };
        this.complete.emit(processInfo);
    }

    onFormLoaded(form: FormModel): void {
        this.overrideOutcomes();
		this.cargando = false; 
        this.taskFormValues = JSON.stringify(form.values);
        const formName = (form && form.name ? form.name : null);
        this.taskFormName.emit(formName);
        this.onFormChange();
    }

    onFormContentClick(content: ContentLinkModel): void {
        this.contentClicked.emit(content);
    }

    isCompletedTask(): boolean {
        return this.taskDetails && this.taskDetails.endDate !== undefined && this.taskDetails.endDate !== null;
    }

    hasCompleteButton(): boolean {
        return !this.isCompletedTask() && this.isAssignedToCurrentUser();
    }

    onCompleteTask(): void {
        this.taskListService.completeTask(this.taskDetails.id)
            .subscribe(
                (res) => {
                    this.navigate.emit();
                    this.executeNoFormOutcome.emit();
                },
                error => {
                    this.logService.error('Task form' + error);
                }
        );
    }

    private loadCurrentUser(): void {
        this.bpmUserService.getCurrentUserInfo().subscribe((res) => {
            this.currentUserId = res && res.id;
        });
    }

    isAssignedToCurrentUser(): boolean {
        return +this.currentUserId === (this.taskDetails.assignee && this.taskDetails.assignee.id);
    }

    canInitiatorComplete(): boolean {
        return this.taskDetails.initiatorCanCompleteTask;
    }

    isReadOnlyForm(): boolean {
        return this.readOnlyForm || !(this.isAssignedToCurrentUser() || this.canInitiatorComplete());
    }

    isProcessInitiator(): boolean {
        return this.currentUserId === +this.taskDetails.processInstanceStartUserId;
    }

    isSaveButtonVisible(): boolean {
        return this.isAssignedToCurrentUser() || (!this.canInitiatorComplete() && !this.isProcessInitiator());
    }

    getTaskName(): any {
        return { taskName: this.taskDetails.name };
    }

    onCancelButtonClick() {
        this.cancel.emit();
    }

    onFormOutcomeExecute(formOutcomeEvent: FormOutcomeEvent) {
        
        // let taskDefinitionKey = formOutcomeEvent.outcome.form.json.taskDefinitionKey;
        // if( taskDefinitionKey.includes('waacb_t2' )|| taskDefinitionKey.includes('waacb_t3') ||
        //     taskDefinitionKey.includes('waacc_t2') || taskDefinitionKey.includes('waacc_t3') ||
        //     taskDefinitionKey.includes('wasap_t2') || taskDefinitionKey.includes('wasap_t3') ||
        //     taskDefinitionKey.includes('waancb_t2' )|| taskDefinitionKey.includes('waancb_t3') ||
        //     taskDefinitionKey.includes('waancc_t2' )|| taskDefinitionKey.includes('waancc_t3') ||
        //     taskDefinitionKey.includes('wamncb_t2' )|| taskDefinitionKey.includes('wamncb_t3') ||
        //     taskDefinitionKey.includes('wamncc_t2' )|| taskDefinitionKey.includes('wamncc_t3')  ||
        //     taskDefinitionKey.includes('wamcc_t2' )|| taskDefinitionKey.includes('wamcc_t3')  ||
        //     taskDefinitionKey.includes('wamcb_t2' )|| taskDefinitionKey.includes('wamcb_t3')){
                
        //     const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        //         data: {
        //             title: 'Confirmación',
        //             message: `¿Estás seguro de confirmar?`
        //         },
        //         minWidth: '250px'
        //     });
            
        //     let sub : Subscription= dialogRef.afterClosed().subscribe((result) => {
        //         sub.unsubscribe();
        //         if (result === false) {
        //             event.preventDefault();
        //         }else if(result === true){
        //             this.formOutcomeExecute.emit(formOutcomeEvent);
        //             this.onFormCompleted();
        //         }
        //     });
        // }else {
        //     this.formOutcomeExecute.emit(formOutcomeEvent);
        //     this.onFormCompleted();
        // }
        this.formOutcomeExecute.emit(formOutcomeEvent);
        this.onFormCompleted();
        
    }

    ngOnDestroy() {
        if (this.sub) {
            this.sub.unsubscribe();
        }
    }

    onFormChange() {
        this.formService.formFieldValueChanged.subscribe(
            (e: FormFieldEvent) => {
                const eventChanges = JSON.stringify(e.form.values);
                if (eventChanges !== this.taskFormValues) {
                    this.formChange.emit(e.form);
                }
            
            }
        );
    }

    overrideOutcomes(){

        this.formComponent.isOutcomeButtonEnabled = function isOutcomeButtonEnabled(outcome: FormOutcomeModel){
            
            if (this.form.readOnly) {
                return false;
            }
    
            if (outcome) {

                if (outcome.name === "SALIR SIN CAMBIOS" || outcome.name === 'RETENER') {
                    return true;
                }
                if ( (outcome.name === "GRABAR" || outcome.name === "FINALIZAR") &&   
                        outcome.form.taskName.includes('BORRADOR') &&
                        (
                            (outcome.form.values['waacb_accion_solicitante'] && outcome.form.values.waacb_accion_solicitante.id ==='CANCELAR') ||
                            (outcome.form.values['waacc_accion_solicitante'] && outcome.form.values.waacc_accion_solicitante.id ==='CANCELAR') ||
                            (outcome.form.values['wasap_accion_solicitante'] && outcome.form.values.wasap_accion_solicitante.id ==='FINALIZAR')||
                            (outcome.form.values['waancb_accion_solicitante'] && outcome.form.values.waancb_accion_solicitante.id ==='CANCELAR')  ||
                            (outcome.form.values['waancc_accion_solicitante'] && outcome.form.values.waancc_accion_solicitante.id ==='CANCELAR')  ||
                            (outcome.form.values['wamcb_accion_solicitante'] && outcome.form.values.wamcb_accion_solicitante.id ==='CANCELAR')  
                        )  ) {
                    return true;
                }
                if (outcome.name === FormOutcomeModel.SAVE_ACTION ) {
                    return this.disableSaveButton ? false : this.form.isValid;
                }
                if ( outcome.name === "GRABAR" ) {
                    //si no se escoge una opcion se desabilita el boton 
                    if(outcome.form.json.processDefinitionKey == 'csa_wamcb' ){
                        var check_denominacion = outcome.form.values.wamcb_check_denominacion;
                        var check_descripcion = outcome.form.values.wamcb_check_descripcion;
                        var check_responsable = outcome.form.values.wamcb_check_responsable;
                        var check_area_jerarquia = outcome.form.values.wamcb_check_area_jerarquia;
                        var accion_solicitante = outcome.form.values.wamcb_accion_solicitante;
                            if( (!isNullOrUndefined(accion_solicitante) && accion_solicitante.id == "CANCELAR") ){
                                return true;
                            }
                            else if(  check_denominacion == false && check_descripcion == false && check_responsable==false && check_area_jerarquia==false){
                                return false;
                            }else return this.form.isValid;
                    }
                    if(outcome.form.json.processDefinitionKey == 'csa_wamcc' ){
                        var check_denominacion = outcome.form.values.wamcc_check_denominacion;
                        var check_descripcion = outcome.form.values.wamcc_check_descripcion;
                        var check_responsable = outcome.form.values.wamcc_check_responsable;
                        var check_area_jerarquia = outcome.form.values.wamcc_check_area_jerarquia;
                        var check_beneficio = outcome.form.values.wamcc_check_beneficio;
                        var accion_solicitante = outcome.form.values.wamcc_accion_solicitante;
                            if( (!isNullOrUndefined(accion_solicitante) && accion_solicitante.id == "CANCELAR") ){
                                return true;
                            }
                            else if (  check_denominacion == false && check_descripcion == false && check_responsable==false && check_area_jerarquia==false && check_beneficio==false){
                                return false;
                            }else return this.form.isValid;
                    }

                    if (outcome.form.json.processDefinitionKey == 'csa_waapy_') {
                        var accion_solicitante = outcome.form.values.waapy_accion_solicitante;
                        let pep1 : [] = outcome.form.values.waapy_tabla_pep1;
                        let pep2 : [] = outcome.form.values.waapy_tabla_pep2;
                        let pep3 : [] = outcome.form.values.waapy_tabla_pep3;
                        let ordenes : [] = outcome.form.values.waapy_tabla_ordenes;

                        if ((!isNullOrUndefined(accion_solicitante) && accion_solicitante.id == "CONTINUAR") &&
                            ( (!pep1 || !pep1.length) && (!pep2 || !pep2.length) && (!pep3 || !pep3.length) && (!ordenes || !ordenes.length)  ) ) {
                            return false;
                        }

                        if ((!isNullOrUndefined(accion_solicitante) && accion_solicitante.id == "CANCELAR")) {
                            return true;
                        } else return this.form.isValid;

                    }

                    if (outcome.form.json.processDefinitionKey == 'csa_wampy') {
                        var accion_solicitante = outcome.form.values.wampy_accion_solicitante;
                        let id_elemento = outcome.form.values.wampy_tipo_elemento;
                        let changeChecks = outcome.form.getFormFields().find( field => field.id.includes("check_"+id_elemento) && field.value== true);
                        // Si no tiene ningun check de modificacion seleccionado no puede avanzar
                        if( !isNullOrUndefined(accion_solicitante) && accion_solicitante.id == "CONTINUAR" && id_elemento!= "proyecto" && !changeChecks ) 
                            return false;
                        
                        if ((!isNullOrUndefined(accion_solicitante) && accion_solicitante.id == "CANCELAR")) {
                            return true;
                        } else return this.form.isValid;
                    }


                if(outcome.form.json.processDefinitionKey == 'csa_wamncb' ){
                        var wamncb_nodo_descripcion = outcome.form.values.wamncb_nodo_descripcion;
                        var wamncb_nodo_descripcion_nueva = outcome.form.values.wamncb_nodo_descripcion_nueva; 
                        if(!isNullOrUndefined(wamncb_nodo_descripcion) && !isNullOrUndefined(wamncb_nodo_descripcion_nueva)){
                            if(wamncb_nodo_descripcion == wamncb_nodo_descripcion_nueva){
                            
                                return false;
                            }else return this.form.isValid;
                        }
                    }
                    if(outcome.form.json.processDefinitionKey == 'csa_wamncc' ){
                        var wamncc_nodo_descripcion = outcome.form.values.wamncc_nodo_descripcion;
                        var wamncc_nodo_descripcion_nueva = outcome.form.values.wamncc_nodo_descripcion_nueva; 
                        if(!isNullOrUndefined(wamncc_nodo_descripcion) && !isNullOrUndefined(wamncc_nodo_descripcion_nueva)){
                            if(wamncc_nodo_descripcion == wamncc_nodo_descripcion_nueva){
                            
                                return false;
                            }else return this.form.isValid;
                        }
                    }
                    //CSA_WAMCB
                    if(outcome.form.json.processDefinitionKey == 'csa_wamcb' ){
                        var wamcb_denominacion = outcome.form.values.wamcb_denominacion;
                        var wamcb_denominacion_nueva = outcome.form.values.wamcb_denominacion_nueva; 
                        if(!isNullOrUndefined(wamcb_denominacion) && !isNullOrUndefined(wamcb_denominacion_nueva)){
                            if(wamcb_denominacion == wamcb_denominacion_nueva){
                            
                                return false;
                            }
                        }
                    }
                    if(outcome.form.json.processDefinitionKey == 'csa_wamcb' ){
                        var wamcb_descripcion = outcome.form.values.wamcb_descripcion;
                        var wamcb_descripcion_nueva = outcome.form.values.wamcb_descripcion_nueva; 
                        if(!isNullOrUndefined(wamcb_descripcion) && !isNullOrUndefined(wamcb_descripcion_nueva)){
                            if(wamcb_descripcion == wamcb_descripcion_nueva){
                            
                                return false;
                            }
                        }
                    }
                    if(outcome.form.json.processDefinitionKey == 'csa_wamcb' ){
                        var wamcb_codigo_responsable = outcome.form.values.wamcb_codigo_responsable;
                        var wamcb_codigo_responsable_nuevo = outcome.form.values.wamcb_codigo_responsable_nuevo; 
                        if(!isNullOrUndefined(wamcb_codigo_responsable) && !isNullOrUndefined(wamcb_codigo_responsable_nuevo)){
                            if(wamcb_codigo_responsable.name == wamcb_codigo_responsable_nuevo.name){
                            
                                return false;
                            }
                        }
                    }
                    if(outcome.form.json.processDefinitionKey == 'csa_wamcb' ){
                        var wamcb_area_jerarquia = outcome.form.values.wamcb_area_jerarquia;
                        var wamcb_area_jerarquia_nueva = outcome.form.values.wamcb_area_jerarquia_nueva; 
                        if(!isNullOrUndefined(wamcb_area_jerarquia) && !isNullOrUndefined(wamcb_area_jerarquia_nueva)){
                            if(wamcb_area_jerarquia == wamcb_area_jerarquia_nueva.id){
                            
                                return false;
                            }
                        }
                    }
                    //CSA_WAMCC
                    if(outcome.form.json.processDefinitionKey == 'csa_wamcc' ){
                        var wamcc_denominacion = outcome.form.values.wamcc_denominacion;
                        var wamcc_denominacion_nueva = outcome.form.values.wamcc_denominacion_nueva; 
                        if(!isNullOrUndefined(wamcc_denominacion) && !isNullOrUndefined(wamcc_denominacion_nueva)){
                            if(wamcc_denominacion == wamcc_denominacion_nueva){
                            
                                return false;
                            }
                        }
                    }
                    if(outcome.form.json.processDefinitionKey == 'csa_wamcc' ){
                        var wamcc_descripcion = outcome.form.values.wamcc_descripcion;
                        var wamcc_descripcion_nueva = outcome.form.values.wamcc_descripcion_nueva; 
                        if(!isNullOrUndefined(wamcc_descripcion) && !isNullOrUndefined(wamcc_descripcion_nueva)){
                            if(wamcc_descripcion == wamcc_descripcion_nueva){
                        
                                return false;
                            }
                        }
                    }
                    if(outcome.form.json.processDefinitionKey == 'csa_wamcc' ){
                        var wamcc_codigo_responsable = outcome.form.values.wamcc_codigo_responsable;
                        var wamcc_codigo_responsable_nuevo = outcome.form.values.wamcc_codigo_responsable_nuevo; 
                        if(!isNullOrUndefined(wamcc_codigo_responsable) && !isNullOrUndefined(wamcc_codigo_responsable_nuevo)){
                    
                            if(wamcc_codigo_responsable.name == wamcc_codigo_responsable_nuevo.name){
                            
                                return false;
                            }
                        }
                    }
                    if(outcome.form.json.processDefinitionKey == 'csa_wamcc' ){
                        var wamcc_area_jerarquia = outcome.form.values.wamcc_area_jerarquia;
                        var wamcc_area_jerarquia_nueva = outcome.form.values.wamcc_area_jerarquia_nueva; 
                        if(!isNullOrUndefined(wamcc_area_jerarquia) && !isNullOrUndefined(wamcc_area_jerarquia_nueva)){
                            if(wamcc_area_jerarquia == wamcc_area_jerarquia_nueva.id){
                            
                                return false;
                            }
                        }
                    }
                    if(outcome.form.json.processDefinitionKey == 'csa_wamcc' ){
                        var wamcc_beneficio = outcome.form.values.wamcc_beneficio;
                        var wamcc_beneficio_nuevo = outcome.form.values.wamcc_beneficio_nuevo; 
                        if(!isNullOrUndefined(wamcc_beneficio) && !isNullOrUndefined(wamcc_beneficio_nuevo)){
                            if(wamcc_beneficio == wamcc_beneficio_nuevo.id){
                            
                                return false;
                            }
                        }
                    }
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

    onShowAttachForm() {
        const dialogRef = this.dialog.open(TaskFormDialogComponent, {
            data: {
                taskId: this.taskDetails.id,
                formKey: this.taskDetails.formKey
            },
            width: '80%',
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result && result.isYes()) {
                this.formAttached.emit();
                this.notify('DW-TASK-FORM.OPERATIONS.FORM-ATTACH');
            } else if (result && result.isNo()) {
                this.dialog.closeAll();
            } else if (result && result.isError()) {
                this.notify('DW-TASK-FORM.OPERATIONS.FORM-ERROR');
            }
        });
    }

    private notify(message: string): void {
        const translatedMessage = this.translateService.instant(message);
        this.notificationService.openSnackMessage(translatedMessage, 4000);
    }

    hasProcessDefinitionId() {
        return !!this.taskDetails.processDefinitionId;
    }
}
