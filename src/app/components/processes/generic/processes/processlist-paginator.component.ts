/*
 * Copyright 2005-2018 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    Component,
    EventEmitter,
    Input,
    Output,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    ChangeDetectorRef
} from '@angular/core';
import { ObjectDataTableAdapter, DataSorting, UserPreferencesService, UserPreferenceValues, CookieService, AuthenticationService, ObjectDataRow, DataColumn, DataTableComponent } from '@alfresco/adf-core';
import { ProcessInstanceListComponent, FilterProcessRepresentationModel } from '@alfresco/adf-process-services';
import { Pagination } from '@alfresco/js-api';
import { ApplicationContentStateService } from '../../../../services/application-content-state.service';
import { BpmAppsService } from '../../../../services';
import {  NotificationService } from '@alfresco/adf-core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'apw-processlist-paginator',
    templateUrl: './processlist-paginator.component.html',
    styleUrls: ['./processlist-paginator.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ProcessListPaginatorComponent implements OnInit {

    static RUNNING_PROCESS_FILTER_NAME = 'Running';
    static RUNNING_SCHEMA = 'running';
    static COMPLETED_SCHEMA = 'completed';

    @ViewChild('processInstanceList')
    processlistComponentInstance: ProcessInstanceListComponent;

    @Input()
    currentFilter: FilterProcessRepresentationModel;

    @Output()
    success: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    rowClick: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    rowDoubleClick: EventEmitter<any> = new EventEmitter<any>();

      
   @ViewChild('dataTable')
   dataTable: DataTableComponent;
   
    dataProcesses: ObjectDataTableAdapter;
    datasearch : ObjectDataRow[] = [];
    schemaColumns : DataColumn[] = [];
    paginationPageSize = 10;
    supportedPageSizes: any[];

    //variables filtro procesos 
    dataprocesos: any = [];
    dataprocesosaux: any = [];
    definicionProceso: string;
    nombreProceso: string;
    estadoProceso: string;
    clasificarProceso: string;
    selectedapp : string;
    mostrarBusqueda: boolean;
    sub: any;

    constructor(private userPreferenceService: UserPreferencesService, private cookiesService: CookieService, protected changeDetector: ChangeDetectorRef,private notificationService: NotificationService,
                private applicationContentStateService: ApplicationContentStateService,private authenticationService :AuthenticationService,public bpmUserService : BpmAppsService,private route: ActivatedRoute) {
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

    }

    private setSortOrder(): void {
        this.dataProcesses = new ObjectDataTableAdapter([], []);
        this.dataProcesses.setSorting(new DataSorting('started', 'desc'));
      
    }

    onSuccessProcessList(event: any): void {
        this.applicationContentStateService.hasProcessContent = this.hasProcessContent(event);
        const currentTaskId = this.processlistComponentInstance.getCurrentId();
        this.success.emit(currentTaskId);

    }

    onRowClick(id): void {
        this.rowClick.emit(id);
    }

 
    filtrar(){
        var this1 = this;
        let ticket = this.authenticationService.getTicketBpm();
        let token = this.cookiesService.getItem("CSRF-TOKEN");
    
        if(this.definicionProceso!=null /* && this.definicionProceso!="" */ ){
        this.dataTable.loading = true;

        var data = {size:500, filter: {sort:this.clasificarProceso, name: this.nombreProceso, state: this.estadoProceso, processDefinitionKey:this.definicionProceso }, appDefinitionId:''};
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
        xhr.open("POST", "/activiti-app/app/rest/filter/process-instances");
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
        let ticket = this.authenticationService.getTicketBpm();
        let token = this.cookiesService.getItem("CSRF-TOKEN");
        var cargando = this.notificationService.openSnackMessage('Cargando listado de procesos...');
        //carga de procesos segun permisos 
   
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("readystatechange", function () {
          if (this.readyState === 4) {
            if (this.responseText != "") {
                var resu = JSON.parse(this.responseText);
                if (resu != null) {
                    this1.dataprocesosaux = resu.data;
                    this1.dataprocesos.push({name:"Todos",key:""});
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
                   if(fila.id==params['processFilterId']){
                    this1.estadoProceso = fila.filter.state;
                       
                   }
                   });
                }
              }
            });
            xhr.open("GET", "/activiti-app/api/enterprise/filters/processes?appId="+params['appId']);
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
        this.estadoProceso='all';
        this.clasificarProceso=null;
        this.nombreProceso=null;
        this.filtrar();
    }

    onRowDoubleClick(id,visualizar): void {
	    if(visualizar == 'si'){
		   var date = new Date;
           date.setHours(date.getHours() + 1);
		   this.cookiesService.setItem('vertarea','si',date,null);
		}else{
			this.cookiesService.setItem('vertarea','no',date,null);
		}
        this.rowDoubleClick.emit(id);
    }

    reloadTask(): void {
        this.processlistComponentInstance.reload();
    }

    getProcessListSchema(): string {
        return this.isRunningFilter() ? ProcessListPaginatorComponent.RUNNING_SCHEMA : ProcessListPaginatorComponent.COMPLETED_SCHEMA;
    }

    isRunningFilter(): boolean {
        return this.currentFilter.name === ProcessListPaginatorComponent.RUNNING_PROCESS_FILTER_NAME;
    }

    onChangePageSize(pagination: Pagination): void {
        this.userPreferenceService.paginationSize = pagination.maxItems;
    }

   private hasProcessContent(event: any): boolean {
        if (event) {
            return event.data.length === 0 ? false : true;
        }
    }
}
