import { Component, ChangeDetectorRef, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { SearchGeneric } from '../../../generic/search-generic/search-generic.component';
import {
    NotificationService,
    AlfrescoApiService,
    CookieService,
    AuthenticationService,
    DataTableComponent,
    DataCellEvent
} from '@alfresco/adf-core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import {
    SearchQueryBuilderService,
    NodeActionsService,
    SearchFilterComponent
} from '@alfresco/adf-content-services';
import { CustomDialogsService, MetadataService, TableActionsService } from '../../../../../services';
import { HttpClient } from '@angular/common/http';
import { isUndefined, isNull, isNullOrUndefined } from 'util';

@Component({
    selector: 'app-polizas-search',
    templateUrl: './polizas-search.component.html',
    styleUrls: ['./polizas-search.component.scss'],
})
export class PolizasSearchComponent extends SearchGeneric implements OnInit, AfterViewInit {

    @ViewChild('settings')
    searchFilter: SearchFilterComponent;

    @ViewChild('dataTable')
    dataTable: DataTableComponent;

    constructor(
        public notificationService: NotificationService,
        public router: Router,
        public dialog: MatDialog,
        public queryBuilder: SearchQueryBuilderService,
        public apiService: AlfrescoApiService,
        public changeDetector: ChangeDetectorRef,
        public nodeActionsService: NodeActionsService,
        public route: ActivatedRoute,
        public cookiesService: CookieService,
        public customDialogsService: CustomDialogsService,
        protected metadataService: MetadataService,
        protected tableActionsService: TableActionsService,
        protected authenticationService: AuthenticationService,
        protected http: HttpClient
    ) {
        super(
            notificationService,
            router,
            dialog,
            queryBuilder,
            apiService,
            changeDetector,
            nodeActionsService,
            route,
            cookiesService,
            customDialogsService,
            metadataService,
            tableActionsService,
            authenticationService,
            http

        );

    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngAfterViewInit() {
        //this.queryBuilder.categories = [];
        //this.limpiarBusqueda();
    }

    onShowRowActionsMenu(event: DataCellEvent) {
        super.onShowRowActionsMenu(event);

        let asociados = { title: 'Asociados', icon: "link" };
        event.value.actions.splice(4, 0, asociados);

    }

    actualizarTabla() {
        this.queryBuilder.config.include = ['aspectNames', 'properties', 'isLink', 'path', 'allowableOperations'];
        this.showResultadosBusqueda = false;
        this.data = [];
        this.ficherosRelacionados = [];
        this.ficherosApiConRelacionados = [];
        this.dataTable.data = null;
        if (this.queryBuilder.queryFragments['queryType'] == '') {
            this.queryBuilder.queryFragments['queryType'] = "TYPE:'cm:content'";
        }
        this.queryBuilder.filterQueries = [
            {
              "query": "-TYPE:'cm:thumbnail' AND -TYPE:'cm:failedThumbnail' AND -TYPE:'cm:rating'"
            },
            { "query": "-cm:creator:System AND -QNAME:comment" },
            {
              "query": "-TYPE:'st:site' AND -ASPECT:'st:siteContainer' AND -ASPECT:'sys:hidden'"
            },
            {
              "query": "-TYPE:'dl:dataList' AND -TYPE:'dl:todoList' AND -TYPE:'dl:issue'"
            },
            { "query": "-TYPE:'fm:topic' AND -TYPE:'fm:post'" },
            { "query": "-TYPE:'lnk:link'" },
            { "query": "-PNAME:'0/wiki'" }
          ];
        this.changeDetector.detectChanges();
        this.subscription = this.queryBuilder.executed
            .subscribe((data) => {
                this.subscription.unsubscribe();
                this.data = [];
                if (data.list.entries.length == 0) {
                    this.dataTable.loading = false;
               
                }
                data.list.entries.forEach((element) => {
                    this.data.push(element.entry);
                });
                this.changeDetector.detectChanges();
                this.ficherosEnlazados(this.dataTable.data.getRows());
                
                this.cerrarCargando();
            });
            
        this.mostrarDocumenList = false;
        let numberOfFilters = Object.keys(this.queryBuilder.queryFragments).filter( queryKey => this.queryBuilder.queryFragments[queryKey] !== ''  );
        
        if ((!isUndefined(this.searchTerm) && this.searchTerm != "") || this.etiselect != "" || numberOfFilters.length > 1) {
            this.showResultadosBusqueda = true;
            this.dataTable.loading = true;
            let search = '';
            if (!isUndefined(this.searchTerm) && this.searchTerm != "") {

                let searchSplit = this.searchTerm.split(' ');
                if (searchSplit.length >= 1) {
                    for (let index = 0; index < searchSplit.length; index++) {
                        search += "cm:name:'" + searchSplit[index] + "*'";
                        if (index != searchSplit.length - 1) {
                            search += ' AND ';
                        }
                    }
                }
            }
            if (isUndefined(this.etiselect)) this.etiselect = "";
            if (!isUndefined(this.searchTerm) && this.searchTerm !== '' && !isNullOrUndefined(this.etiselect) && this.etiselect !== '') {
                search += ' AND ';
            }

            if (this.etiselect != "") {
                search += "TAG:'" + this.etiselect + "'";
            }

            let site = this.cookiesService.getItem('site');
            if (!isNull(site) && site != 'null') {
                if ((!isUndefined(this.searchTerm) && this.searchTerm !== '') || (!isNullOrUndefined(this.etiselect) && this.etiselect !== '')) {
                    search += ' AND ';
                }
                search += 'SITE:' + site;
            }
            let observable = this.searchFilter.queryBuilder.error.asObservable();
            observable.forEach((next) => {
                console.error(next);
            });
            this.searchFilter.queryBuilder.addFilterQuery(search);
            // Guardamos el ultimo filtro
            /*       this.ultimoSearchTerm = search;
                console.log(this.ultimoSearchTerm);
                console.log(this.searchFilter.queryBuilder); */
            try {
                this.searchFilter.queryBuilder.execute();
            } catch (error) {
                console.error(error);
            }

        } else {
            this.subscription.unsubscribe();
            this.notificationService.openSnackMessage("Selecciona un tag, un filtro o escribe una busqueda", 4000);
        }
    }




}

