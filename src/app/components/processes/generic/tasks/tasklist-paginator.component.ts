/*
 * Copyright 2005-2018 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    Component,
    OnInit, Input, Output, ViewChild, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Pagination } from '@alfresco/js-api';
import { ObjectDataTableAdapter, DataSorting,AuthenticationService, UserPreferencesService, UserPreferenceValues,CookieService, DataTableComponent, ObjectDataRow } from '@alfresco/adf-core';
import { FilterRepresentationModel, TaskListComponent } from '@alfresco/adf-process-services';
import { Router, ActivatedRoute } from '@angular/router';
import { ApplicationContentStateService } from '../../../../services/application-content-state.service';
import { TaskListService } from '@alfresco/adf-process-services';
import { DialogAsignar } from './dialogs/dialogs.component';
import { MatDialog } from '@angular/material';
import { BpmAppsService } from '../../../../services';
import {  NotificationService } from '@alfresco/adf-core';

@Component({
    selector: 'apw-tasklist-paginator',
    templateUrl: './tasklist-paginator.component.html',
    styleUrls: ['./tasklist-paginator.component.scss'],
    encapsulation: ViewEncapsulation.None

})
export class TaskListPaginatorComponent implements OnInit {

    @ViewChild('taskList')
    taskList: TaskListComponent;

    @Input()
    currentFilter: FilterRepresentationModel;

    @Input()
    selectionMode = 'single'; // none|single|multiple

    @Output()
    success: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    rowClick: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    rowDoubleClick: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('dataTable')
    dataTable: DataTableComponent;
    datasearch : ObjectDataRow[] = [];
    
    dataTasks: ObjectDataTableAdapter;
    paginationPageSize = 10;
    supportedPageSizes: any[];

    presetColoum = 'dw-task-list';

       //variables filtro procesos 
       dataprocesos : any = [];
       dataprocesosaux : any = [];
       definicionProceso: string;
       nombreProceso: string;
       estadoProceso: string = 'open';
       clasificarProceso: string;
       participanteProceso: string;
       selectedapp : string;
       mostrarBusqueda: boolean;

    constructor(private userPreferenceService: UserPreferencesService, private taskListService : TaskListService,
                private applicationContentStateService: ApplicationContentStateService, private router: Router,
                private cookiesService: CookieService,private dialog: MatDialog,private authenticationService :AuthenticationService,
                public bpmUserService : BpmAppsService,private notificationService: NotificationService,private route: ActivatedRoute
			 ) {
                // sobrescribimos parte de la funcionalidad
                TaskListComponent.prototype.ngAfterContentInit = function() {
                    this.createDatatableSchema();
                    if (this.data && this.data.getColumns().length === 0) {
                        this.data.setColumns(this.columns);
                    }
                }
                TaskListComponent.prototype.ngOnChanges = function(changes) {
                    if (this.isPropertyChanged(changes)) {
                        if (this.isSortChanged(changes)) {
                            this.sorting = this.sort ? this.sort.split('-') : this.sorting;
                        }
                        // Asignamos un valor al requestNode para que mientras esta funcionando el mat-progress-spinner hasta que se recuperen los datos no salga el mensaje de que no hay filtros
                        this.isLoading = true;
                        this.requestNode = "cargando";
                        setTimeout(() => {  this.reload(); }, 1500);
                    }
                };
    }

    ngOnInit() {
        if ( this.userPreferenceService.get(UserPreferenceValues.PaginationSize)) {
            this.paginationPageSize = +this.userPreferenceService.get(UserPreferenceValues.PaginationSize);
        } else {
            this.userPreferenceService.select(UserPreferenceValues.PaginationSize).subscribe((pageSize) => {
                this.paginationPageSize = pageSize;
            });
        }
        this.userPreferenceService.select(UserPreferenceValues.SupportedPageSizes).subscribe((supportedPageSizes) => {
            if (typeof supportedPageSizes === 'string') {
                supportedPageSizes = JSON.parse(supportedPageSizes);
            }
            this.supportedPageSizes = supportedPageSizes;
        });
        this.setSortOrder();
        if('Aplicacion de tareas' == this.bpmUserService.selected_app.name){
           this.vistaFiltro();
        }else{
            this.mostrarBusqueda = false;
        }
        this.selectedapp = this.bpmUserService.selected_app.name;
        
    }
    
    filtrar(){
        var this1 = this;
     
        let ticket = "Bearer "+this.authenticationService.getToken();
        let token = this.cookiesService.getItem("CSRF-TOKEN");
    
        if(this.definicionProceso!=null /* && this.definicionProceso!="" */ ){
        this.dataTable.loading = true;
       
        var data = {size:500, filter: {sort:this.clasificarProceso, name: this.nombreProceso, assignment:this.participanteProceso, processDefinitionKey:this.definicionProceso, state: this.estadoProceso }, appDefinitionId:''};
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("readystatechange", function () {
          if (this.readyState === 4) {
            if (this.responseText != "") {
              var resu = JSON.parse(this.responseText);
              let auxrows: ObjectDataRow[] = [];
               resu.data.forEach(fila => {
                auxrows.push(fila);
               });
            
             this1.datasearch = auxrows;
             this1.dataTable.loading = false;
           
          
            }
          }
        });
        xhr.open("POST", "/activiti-app/app/rest/filter/tasks");
        xhr.setRequestHeader("Content-Type","application/json;charset=UTF-8" );
        xhr.setRequestHeader("Authorization",ticket );
        xhr.setRequestHeader("CSRF-TOKEN",token );
        xhr.setRequestHeader("Access-Control-Allow-Credentials","true" );
        xhr.setRequestHeader("Access-Control-Expose-Headers","Access-Control-Allow-Origin,Access-Control-Allow-Credentials" );
    
        xhr.send(JSON.stringify(data));
        }else{
            this1.datasearch = [];  
        }
    }

    vistaFiltro(){
        var this1 = this;
        this1.dataprocesosaux = [];
        this1.dataprocesos = [];
        this.selectedapp = this.bpmUserService.selected_app.name;
       
        let ticket = "Bearer "+this.authenticationService.getToken();
        let token = this.cookiesService.getItem("CSRF-TOKEN");
        var cargando = this.notificationService.openSnackMessage('Cargando listado de procesos...');
        //carga de procesos segun permisos 
   
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("readystatechange", function () {
          if (this.readyState === 4) {
            if (this.responseText != "") {
              var resu = JSON.parse(this.responseText);
              
              if (resu != null) {
                this1.dataprocesos.push({ name : "Todos" ,key : ""} );
                this1.dataprocesosaux = resu.data;
             
            if ( this1.dataprocesosaux.length > 1) {
                this1.dataprocesosaux.forEach(element => {
                let app = element.key;
                let selected = app.split("_");
        
                if( this1.selectedapp=='Aplicacion de tareas' && (selected[0]=="csa" || selected[0]=="it")) this1.dataprocesos.push(element);
                if( this1.selectedapp=='Centro de Servicios Administrativos (CSA)' && selected[0]=="csa") this1.dataprocesos.push(element);
                if( this1.selectedapp=='IT' && selected[0]=="it") this1.dataprocesos.push(element);
              });
            
            }
            else {
                let app = this1.dataprocesosaux.key;
                let selected = app.split("_");
                if( this1.selectedapp=='Aplicacion de tareas' && (selected[0]=="csa" || selected[0]=="it")) this1.dataprocesos.push(this1.dataprocesosaux);
                if( this1.selectedapp=='Centro de Servicios Administrativos (CSA)' && selected[0]=="csa") this1.dataprocesos.push(this1.dataprocesosaux);
                if( this1.selectedapp=='IT' && selected[0]=="it") this1.dataprocesos.push(this1.dataprocesosaux);
            }
              }
              else {
                this1.dataprocesos = [];
              }
              this1.route.params.subscribe(params =>{
                var xhr = new XMLHttpRequest();
                xhr.addEventListener("readystatechange", function () {
                  if (this.readyState === 4) {
                    if (this.responseText != "") {
                      var resu = JSON.parse(this.responseText);
                      resu.data.forEach(fila => {
                       if(fila.id==params['taskFilterId']){
                        this1.participanteProceso = fila.filter.assignment;
                        if(fila.filter.state=='completed'){
                        this1.estadoProceso = fila.filter.state;
                        }
                       }
                       });
                    }
                  }
                });
                xhr.open("GET", "/activiti-app/api/enterprise/filters/tasks?appId="+params['appId']);
                xhr.setRequestHeader("Content-Type","application/json;charset=UTF-8" );
                xhr.setRequestHeader("Authorization",ticket );
                xhr.setRequestHeader("CSRF-TOKEN",token );
                xhr.setRequestHeader("Access-Control-Allow-Credentials","true" );
                xhr.setRequestHeader("Access-Control-Expose-Headers","Access-Control-Allow-Origin,Access-Control-Allow-Credentials" );
            
                xhr.send();
            });


            }
            cargando.dismiss();
          }
        });
        xhr.open("GET", "/activiti-app/app/rest/process-definitions?latest=true");
        xhr.setRequestHeader("Content-Type","application/json;charset=UTF-8" );
        xhr.setRequestHeader("Authorization",ticket );
        xhr.setRequestHeader("CSRF-TOKEN",token );
        xhr.setRequestHeader("Access-Control-Allow-Credentials","true" );
        xhr.setRequestHeader("Access-Control-Expose-Headers","Access-Control-Allow-Origin,Access-Control-Allow-Credentials" );
    
        xhr.send();

        this.mostrarBusqueda = true;
    }

    vistaNormal(){
       this.mostrarBusqueda=false; 
    }

    limpiarFiltros(){
        this.estadoProceso='open';
        this.clasificarProceso=null;
        this.nombreProceso=null;
        this.participanteProceso='involved';
        this.filtrar();
    }

	asignarTarea(id){
	     let dialogRef = this.dialog.open(DialogAsignar, {
				width: '420px',
			    data: { id: id }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(this.taskList!=undefined)this.taskList.reload();else this.filtrar();
        });	 
				
    }
   
    ShowPedir(id){
        let tareas =    ['waacb_t1_correction','waacb_t1_borrador','waacb_t1',
                        'waacc_t1_correction','waacc_t1_borrador','waacc_t1',
                        'darb_t1','darb_t2','darb_t3','darb_t4','darb_t5',
                        'wasap_t1','wasap_t1_correction','wasap_borrador',
                        'waancb_t1_correction','waancb_t1_borrador',
                        'wamncb_t1_correction','wamncb_t1',
                        'waancc_t1_correction','waancc_t1_borrador',
                        'wamncc_t1_correction','wamncc_t1',
                        'wamcb_t1_correction','wamcb_t1',
                        'wamcc_t1_correction','wamcc_t1',
                        'waapy_t1','waapy_t1_correction',
                        'wampy_t1','wampy_t1_correction',
                        'wascs_borrador','wascs_t1_correction',
                        'warpf_borrador','warpf_t1_correction'];
      if(tareas.indexOf(id)==-1)return true; else return false;
 
   }

    private setSortOrder(): void {
        this.dataTasks = new ObjectDataTableAdapter([], []);
        this.dataTasks.setSorting(new DataSorting('created', 'desc'));
    }

    onSuccessTaskList(event: any) {
        this.applicationContentStateService.hasTaskContent = this.hasTaskContent(event);
        const currentTaskId = this.taskList && this.taskList.getCurrentId();
        this.success.emit(currentTaskId);
    }
	
	claimTask(id): void {
        this.taskListService.claimTask(id).subscribe(success =>{
            this.router.navigate(['/taskdetails/',this.currentFilter.appId,id]);
        });
	}
	
	viewTask(id): void {
	    this.router.navigate(['/taskdetails/',this.currentFilter.appId,id]);
	}
	
	unclaimTask(id): void {
        this.taskListService.unclaimTask(id).subscribe(success =>{
            if(this.taskList!=undefined)this.taskList.reload();else this.filtrar();
        })
	}

	VerProceso(appID,processID):void {
        var date = new Date;
        date.setHours(date.getHours() + 1);
        this.cookiesService.setItem('vertarea','no',date,null);
        this.router.navigate(['/processdetails/',appID,processID]);
	}
	
    onRowClick(event: any) {
        this.rowClick.emit(event);
    }

    onRowDoubleClick(event: any) {
        this.rowDoubleClick.emit(event);
    }

    reloadTask() {
        this.taskList.reload();
    }

    onChangePageSize(pagination: Pagination): void {
        this.userPreferenceService.paginationSize = pagination.maxItems;
    }

    private hasTaskContent(event: any): boolean {
        if (event) {
            return event.data.length === 0 ? false : true;
        }
    }
}
