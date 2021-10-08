import {
    BreadcrumbComponent,
    ConfirmDialogComponent,
    DropdownSitesComponent,
    NodeActionsService,
    RowFilter,
    SearchFilterComponent,
    SearchQueryBuilderService,
    ShareDataRow,
} from '@alfresco/adf-content-services';
import {
    AlfrescoApiService,
    DataCellEvent,
    DataRowActionEvent,
    DataTableComponent,
    DownloadZipDialogComponent,
    NotificationService,
    CookieService,
    AuthenticationService,
    DataRow
} from '@alfresco/adf-core';
import { MinimalNodeEntity, NodeAssociationPagingList } from '@alfresco/js-api';
import { DatePipe } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    Input,
    ViewChild,
    OnDestroy,
    AfterContentInit,
    OnInit,
} from '@angular/core';
//Filters

import { MatDialog } from '@angular/material';
import { ActivatedRoute, /*  NavigationEnd, */ Router } from '@angular/router';
import { Subscription/* , ReplaySubject */ } from 'rxjs';
import { isNull, isUndefined, isNullOrUndefined } from 'util';
import { CustomDialogsService, MetadataService, TableActionsService } from './../../../../services';
import { DialogTags, DialogAssociatedFiles } from '../../dialogs';
import { HttpClient } from '@angular/common/http';


declare var $: any;

interface FinancieroMetadata {
    display: string;
    value: string;
    metadata:string;
}

@Component({
    selector: 'app-search-generic',
    templateUrl: './search-generic.component.html',
    //template: '', //  No template
    styleUrls: ['./search-generic.component.scss'] //'./documentlist.component.css',
})
export class SearchGeneric implements OnInit, AfterContentInit, OnDestroy {
    /* private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1); */

    subscription: Subscription;
    navigationSubscription: Subscription;
    previousUrl: string;
    // Condiciones que ocultan elementos del html
    mostrarMetadatos: boolean = false;
    mostrarFiltrosAvanzados: boolean = false;
    mostrarDocumenList: boolean = true;
    currentFolderId: string = '-me-';
    nodeId1: string = null;
    // Filtros de document list y de busqueda
    filtro: RowFilter = null;
    modificadoPorFiltro: string = '';
    nombreFicheroFiltro: string = '';
    vencimientoFiltro: string = '';
    sitenull : string = '';
    showResultadosBusqueda  : boolean = false;
    filteraux : any = [];

    limpiar: boolean = false;
    // Filtros de document list y de busqueda
    searchTerm: string;
    ultimoSearchTerm: string;
    data: any = [];
    etiquetas : any = [];
     etiselect : string = "";
    nodeId: string = null;
    siteActual: string = '-my-'; //'';
    includeFields = [
        'aspectNames',
        'properties',
        'isLink',
        'path',
        'allowableOperations',
    ];

    ficherosApiConRelacionados: string[] = [];
    ficherosRelacionados: NodeAssociationPagingList[] = [];

    searchCategories: any[];
    selectedOptions:any = '';

    financiero: FinancieroMetadata[] = [
    
        {
            display: 'Factura MM',
            value: 'fi_factura_mm',
            metadata : 'fi:factura_mm'
        },
        {
            display: 'Factura PDP',
            value: 'fi_factura_pdp',
            metadata :  'fi:factura_pdp'
        },
        {
            display: 'Factura SD',
            value: 'fi_factura_sd',
            metadata :  'fi:factura_sd'
        },
        {
            display: 'Avales Proveedores',
            value: 'fi_avales_proveedor',
            metadata : 'fi:avales_proveedor'
        },
        {
            display: 'Avales Deudores',
            value: 'fi_avales_deudor',
            metadata : 'fi:avales_deudor'
        },
        {
            display: 'Anticipos',
            value: 'fi_anticipos',
            metadata : 'fi:anticipos'
        }
    ];
    @Input()
    showViewer: boolean = false;

    @ViewChild('settings')
    searchFilter: SearchFilterComponent;

    @ViewChild('dataTable')
    dataTable: DataTableComponent;

    @ViewChild('sitesDropdown')
    sitesDropdown: DropdownSitesComponent;

    @ViewChild('breadcrumb')
    breadcrumb: BreadcrumbComponent;

    constructor(
        protected notificationService: NotificationService,
        protected router: Router,
        protected dialog: MatDialog,
        public queryBuilder: SearchQueryBuilderService,
        protected apiService: AlfrescoApiService,
        protected changeDetector: ChangeDetectorRef,
        protected nodeActionsService: NodeActionsService,
        protected route: ActivatedRoute,
        protected cookiesService: CookieService,
        protected customDialogsService: CustomDialogsService,
        protected metadataService: MetadataService,
        protected tableActionsService: TableActionsService,
        protected authenticationService :AuthenticationService,
        protected http: HttpClient
    ) {
        
    }
    ngOnInit() {
        this.dataTable.loading = null;
        let site = this.cookiesService.getItem('site');
        this.sitenull = site;
        this.queryBuilder.filterQueries =[
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

        if (!isNull(site) && site != 'null') {
       
            this.metadataService
                .generateSearchFilters(undefined)
                .then((successFilters: any) => {
                    this.filteraux = [];
                    this.filteraux = successFilters;
                    this.queryBuilder.categories = successFilters;
                    this.queryBuilder.config.categories = successFilters;
                    return this.searchFilter.queryBuilder;
                }).catch( rejected => {
                    this.queryBuilder.resetToDefaults();
                });

            let ticket = this.authenticationService.getTicketEcm();
            this.http.get("/alfresco/s/api/tagscopes/site/" + site + "/documentLibrary/tags?&topN=1000&alf_ticket=" + ticket)
                .subscribe(resp => {
                    this.etiquetas = resp['tags'];
                });
        } else {
            this.queryBuilder.resetToDefaults();
        }


    }

    getSelectedOptions(selection){
        this.selectedOptions = selection;
        let filter = [];
        this.metadataService
        .generateSearchFilters(selection)
        .then((successFilters: any) => {
            filter = filter.concat(this.filteraux);

            successFilters.forEach(element1 => {
             if(element1.name!="TIPO DE CONTENIDO") filter.push(element1);
            });
       
            successFilters = filter;
         
            this.queryBuilder.categories = successFilters;
            this.queryBuilder.config.categories = successFilters;
            return this.searchFilter.queryBuilder;
        }).catch( rejected => {
            this.queryBuilder.resetToDefaults();
        });
    }

    ngAfterContentInit() {

    }

    ngOnDestroy() {
        /* this.destroyed$.next(true);
        this.destroyed$.complete(); */
        /* if (this.subscription) {
      this.subscription.unsubscribe();
    }
    // avoid memory leaks here by cleaning up after ourselves. If we  
    // don't then we will continue to run our method  
    // on every navigationEnd event.
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    } */
    }

    ficherosEnlazados(rows: DataRow[]) {

          this.ficherosApiConRelacionados = [];
          this.ficherosRelacionados = [];
          let cont = 0;
          if (rows.length != 0) {
            this.notificationService.openSnackMessage('Buscando ficheros asociados');
          } else {
            this.dataTable.loading = false;
            //this.dataTable.loading = false;
          }
          rows.forEach(fila => {
            let id: string = fila.getValue('id');
            let isFile = fila.getValue('isFile');
    
            if (isFile) {
              this.apiService.nodesApi.getTargetAssociations(id, { 'include': ['aspectNames', 'properties', 'isLink', 'path', 'allowableOperations'] }).then(nodeAssociation => {
                if (nodeAssociation.list.pagination.totalItems > 0) {
                  this.ficherosRelacionados.push(nodeAssociation.list);
                  this.ficherosApiConRelacionados.push(id);
                  this.changeDetector.detectChanges();
                }
                
                cont++;
                if (rows.length == cont) {
                  
                  this.cerrarCargando();
                }
              });
            } else {
              cont++;
              if (rows.length == cont) {
                this.cerrarCargando();
              }
            }
          });

      }

/*     cerrarCargando() {
        this.dataTable.loading = false;
        this.changeDetector.detectChanges();
        this.notificationService.dismissSnackMessageAction();
    } */

    cerrarCargando() {
        this.dataTable.loading = false;
        this.changeDetector.detectChanges();
        this.ficherosApiConRelacionados.forEach(id => {
          let fila = document.getElementById(id);
          if (fila != null) {
            fila.hidden = false;
          }
        });
       
        this.notificationService.dismissSnackMessageAction();
      }

    onShowRowActionsMenu(event: DataCellEvent) {
        let visualizar = { title: 'Visualizar', icon: 'visibility' };
        let editar = { title: 'Editar', icon: 'edit' };
        let descargar = { title: 'Descargar', icon: 'archive' };
        let copiar = { title: 'Copiar', icon: 'content_copy' };
        let mover = { title: 'Mover', icon: 'redo' };
        let eliminar = { title: 'Eliminar', icon: 'delete' };
        let etiquetas = { title: 'Etiquetas', icon: 'label' };
        let metadatos = { title: 'Metadatos', icon: 'local_offer' };
        let enlace = { title: 'Crear Enlace', icon: "link" };

        let acciones = [];
        if(this.sitenull!='null'){
           acciones = [visualizar,editar,descargar,metadatos, etiquetas, copiar,enlace, mover, eliminar];
        }else{
           acciones = [visualizar,editar,descargar,metadatos, copiar,enlace, mover, eliminar];
        }
        event.value.actions = acciones;
    }

    show() {
        $('.mat-drawer-inner-container').show();  
        this.showViewer = false;
        this.nodeId1 = null;
    }

    onExecuteRowAction(event: DataRowActionEvent) {
        let args = event.value;
        let id = args.row.getValue('id');

        switch (args.action.title) {
            case 'Visualizar':
                this.showViewer = true;
                this.nodeId1 = id;
                $('.mat-drawer-inner-container').hide();
                break;
            case 'Editar':
                this.router.navigate(["content/upload-form/", '1', { 'path': "null"} ],{ state : {'nodeChildAssociationEntry': event.value.row.obj } } );
             break;
            case 'Descargar':
                this.apiService
                    .getInstance()
                    .nodes.getNode(id)
                    .then((success) => {
                        this.nodeActionsService.downloadNode(success);
                    });
                break;
            case 'Metadatos':
                this.showMetadatos(args.row);
                break;
            case 'Etiquetas':
                this.openDialogTags(args.row);
                break;
            case 'Asociados':
                this.openDialogEnlazados(args.row);
                break;
            case 'Crear Enlace':
                this.tableActionsService.crearEnlace(args.row.obj);
                break;
            case 'Eliminar':
                this.openConfirmDeleteDialog(args.row);
                break;
            case 'Copiar':
                this.copiarNodo(args.row);
                break;
            case 'Mover':
                this.moverNodo(args.row);
                break;
            default:
                break;
        }
    }
    /**
     * Accion que abre el dialog de ficheros Relacionado/Enlazados
     *
     * @param event - la fila del datatable o del documentlist seleccionada
     */
    openDialogEnlazados(event): void {
        this.subscription = this.tableActionsService
            .openDialogEnlazados(
                event,
                DialogAssociatedFiles,
                this.ficherosApiConRelacionados,
                this.ficherosRelacionados
            )
            .subscribe((result) => {
                this.actualizarTabla();
            });
    }

    /**
     * Accion que abre el dialog de mover nodo
     *
     * @param event - la fila del datatable o del documentlist seleccionada
     */
    openDialogTags(event): void {
    let id : any;
    if(!isUndefined(event.value))id = event.value.entry.id;
    if(!isUndefined(event.obj))id = event.obj.id;
      const dialogRef = this.dialog.open(DialogTags, {
        width: '500px',
        data: { id: id}
      });

      this.subscription = dialogRef.afterClosed().subscribe(result => {
        this.actualizarTabla();
        let site = this.cookiesService.getItem('site');
        let ticket = this.authenticationService.getTicketEcm();
        this.http.get("/alfresco/s/api/tagscopes/site/" + site + "/documentLibrary/tags?&topN=1000&alf_ticket=" + ticket)
            .subscribe(resp => {
                this.etiquetas = resp['tags'];
            });
      });
    }
  
    moverNodo(event) {
        this.tableActionsService.moverNodo(event).then(
            (success) => {
                this.notificationService.openSnackMessage(
                    'Se ha movido correctamente el fichero '
                );
            },
            (error) => {
                if (
                    error.status === 401  || error.status === 403
                  ) {
                      this.notificationService.openSnackMessage(
                          'Ha surgido un error al mover el fichero. Verifica que tienes los permisos para actualizar el fichero'
                      );
                  }
                  else if (
                      error.status === 409
                  ) {
                      this.notificationService.openSnackMessage(
                          'Ha surgido un error al mover el fichero. Ya hay un fichero con ese nombre en la ruta especificada'
                      );
                  }
            }
        );
    }

    /**
     * Accion que abre el dialog de mover nodo
     *
     * @param event - la fila del datatable o del documentlist seleccionada
     */
    copiarNodo(event) {
        this.tableActionsService.copiarNodo(event).then(
            (success) => {
                this.notificationService.openSnackMessage(
                    'Se ha copiado correctamente el fichero '
                );
            },
            (error) => {
                if (
                    error.status === 401  || error.status === 403
                  ) {
                      this.notificationService.openSnackMessage(
                          'Ha surgido un error al mover el fichero. Verifica que tienes los permisos para actualizar el fichero'
                      );
                  }
            }
        );
    }

    actualizarTabla() {
        this.queryBuilder.config.include = ['aspectNames', 'properties', 'isLink', 'path', 'allowableOperations'];
        this.showResultadosBusqueda = false;
        this.ficherosRelacionados = [];
        this.ficherosApiConRelacionados = [];
        this.dataTable.data = null;
        if (this.queryBuilder.queryFragments['queryType'] == '') {
            this.queryBuilder.queryFragments['queryType'] = "TYPE:'cm:content'";
        }
      
         this.searchFilter.queryBuilder.filterQueries =[
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
            if (data.list.entries.length == 0){
                this.dataTable.loading = false;
            }
            data.list.entries.forEach((element) => {
                this.data.push(element.entry);
            });
         
            this.changeDetector.detectChanges();
            this.subscription.unsubscribe();  
            this.cerrarCargando();
      });

        let numberOfFilters = Object.keys(this.queryBuilder.queryFragments).filter( queryKey => this.queryBuilder.queryFragments[queryKey] !== ''  );

        this.mostrarDocumenList = false;
        if ( (!isUndefined(this.searchTerm) && this.searchTerm!="") || this.etiselect!="" || numberOfFilters.length > 1) {
            this.showResultadosBusqueda = true;
            this.dataTable.loading = true;
            let search = '';
                if(!isUndefined(this.searchTerm) && this.searchTerm!=""){
              
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
            if (!isUndefined(this.searchTerm) && this.searchTerm!=='' && !isNullOrUndefined(this.etiselect) && this.etiselect !=='' ){
                search += ' AND ';
              } 

            if(this.etiselect!=""){
              search += "TAG:'" + this.etiselect + "'" ;
            }
           
            let site = this.cookiesService.getItem('site');
            if (  !isNull(site) && site!= 'null') {
                if ( (!isUndefined(this.searchTerm) && this.searchTerm!=='') || (!isNullOrUndefined(this.etiselect) && this.etiselect !=='') ){
                search += ' AND ';
                } 
                search += 'SITE:'+site;
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
        
    }else{
        this.notificationService.openSnackMessage("Selecciona un tag, un filtro o escribe una busqueda",4000);
      }
    }

    limpiarBusqueda() {
        this.dataTable.loading = null;
        this.searchFilter.queryBuilder.queryFragments = { queryType: "TYPE:'cm:content'" };
        this.searchFilter.queryBuilder.userQuery = "";
        this.selectedOptions=[];
        //this.queryBuilder.filterQueries = [];
        
        //this.searchFilter.queryBuilder.resetToDefaults();
        
        let site = this.cookiesService.getItem('site');
        this.sitenull = site;

        //this.queryBuilder.queryFragments = { queryType: "TYPE:'cm:content'" };
        if (!isNull(site) && site != 'null') {
        this.metadataService
        .generateSearchFilters(undefined)
        .then((successFilters: any) => {
            this.queryBuilder.categories = successFilters;
            this.queryBuilder.config.categories = successFilters;
            return this.searchFilter.queryBuilder;
        });
        }else{
            this.queryBuilder.resetToDefaults();
        }
        /* this.searchFilter.queryBuilder.queryFragments = {
            queryType: "TYPE:'cm:content'",
        }; */
        // this.searchFilter.queryBuilder.execute();
        this.searchTerm = '';
        this.mostrarDocumenList = true;
        this.mostrarFiltrosAvanzados = false;
        this.limpiar = true;
        this.etiselect = '';
        this.data = [];
    }

    limpiarTags() {
        this.dataTable.loading = null;
        this.etiselect = '';
        this.mostrarDocumenList = true;
        this.mostrarFiltrosAvanzados = false;
        this.limpiar = true;
        this.data = [];
       // this.nodata = false;
      }
      
    showPreview(event) {
        const entry = event.value.entry;
        if (entry && entry.isFile) {
            this.showViewer = true;
            this.nodeId1 = entry.id;
            $('.mat-drawer-inner-container').hide();
            // this.preview.showResource(entry.id);
        }
    }



    navigateBreadcrumb(node: any) {
        if (node && node.path && node.path.elements) {
            const elements = node.path.elements;
            if (elements.length > 1) {
                if (elements[1].name === 'Sites') {
                    elements.splice(0, 3);
                }
            }
        }
        return node;
    }

    showMetadatos(event) {
        let entry = event.obj;
        if (entry && entry.isFile) {
            this.nodeId = entry;
            this.mostrarMetadatos = true;
            this.mostrarFiltrosAvanzados = false;
            this.limpiar = true;
        }
    }

    filtrar(event) {
        this.filtro = (row: ShareDataRow) => {
            let node = row.node.entry;
            let nombreUsuarioTabla: string = node.createdByUser.displayName;
            let nombreFicheroTabla: string = node.name;
            let vencimientoTabla: any = '';
            let pipe = new DatePipe('en-US');
            if (
                !isUndefined(node.properties) &&
                !isUndefined(node.properties['regu:fecha_vencimiento'])
            ) {
                vencimientoTabla = node.properties['regu:fecha_vencimiento'];
                vencimientoTabla = pipe
                    .transform(vencimientoTabla, 'dd/MM/yyyy')
                    .toString();
            }

            if (
                !isNull(this.vencimientoFiltro) &&
                !isUndefined(this.vencimientoFiltro) &&
                this.vencimientoFiltro !== ''
            ) {
                if (
                    this.mostrarFilaTabla(
                        nombreUsuarioTabla,
                        this.modificadoPorFiltro
                    ) &&
                    this.mostrarFilaTabla(
                        nombreFicheroTabla,
                        this.nombreFicheroFiltro
                    ) &&
                    this.mostrarFilaTabla(
                        vencimientoTabla,
                        pipe
                            .transform(this.vencimientoFiltro, 'dd/MM/yyyy')
                            .toString()
                    )
                ) {
                    return true;
                } else {
                    return false;
                }
            } else {
                if (
                    this.mostrarFilaTabla(
                        nombreUsuarioTabla,
                        this.modificadoPorFiltro
                    ) &&
                    this.mostrarFilaTabla(
                        nombreFicheroTabla,
                        this.nombreFicheroFiltro
                    )
                ) {
                    return true;
                } else {
                    return false;
                }
            }
        };
    }

    mostrarFilaTabla(textoCeldaTabla: string, textoFiltro: string) {
        if (
            textoCeldaTabla.toLowerCase().includes(textoFiltro.toLowerCase()) ||
            textoFiltro == ''
        ) {
            return true;
        }
        return false;
    }

    onClick(item) {}

    mostrarFiltrosAvanzadosBusqueda() {
        //let documentlist = true;

        this.route.url.subscribe(
            (success) => {
                if (success[0].path == 'documentlist') {
                    this.router.navigate(['/content/home', { show: true }]);
                }
            },
            (rejected) => {}
        ); /* toPromise().then( url => {
    }) */
        if (this.mostrarFiltrosAvanzados) {
            this.mostrarFiltrosAvanzados = false;
        } else {
            this.mostrarFiltrosAvanzados = true;
            this.mostrarMetadatos = false;
        }
    }

    onDownloadAsZip(event: any) {
        const node: MinimalNodeEntity = event.value;

        this.downloadZip([node]);
    }

    myCustomActionAfterDelete(event) {
        let entry = event.value.entry;

        let item = '';

        if (entry.isFile) {
            item = 'file';
        } else if (entry.isFolder) {
            item = 'folder';
        }
        this.notificationService.openSnackMessage(
            `Eliminado ${item} "${entry.name}" `,
            20000
        );
    }

    onPermissionsFailed(event: any) {
        this.notificationService.openSnackMessage(
            'No tienes los permisos necesarios para realizar esta accion',
            4000
        );
    }

    borrarNodo(event: any) {}

    downloadZip(selection: Array<MinimalNodeEntity>) {
        if (selection && selection.length > 0) {
            const nodeIds = selection.map((node) => node.entry.id);

            const dialogRef = this.dialog.open(DownloadZipDialogComponent, {
                width: '600px',
                data: {
                    nodeIds: nodeIds,
                },
            });

            let sub = dialogRef.afterClosed().subscribe((result) => {});
            if (this.subscription == undefined) {
                this.subscription = sub;
            } else {
                this.subscription.add(sub);
            }
        }
    }

    abrirFormularioSubida() {
        //this.router.navigate(["/upload-form",{ 'carpeta-subida' :this.documentList.currentFolderId } ]);
    }
    openConfirmDeleteDialog(event): void {
        let name = null;
        let id = null;
        let file = null;
        let tipo = null;
        // Si event.value es null significa el valor viene de la busqueda y hay que usar otro metodo para acceder a las propiedades
        if (event.value == null) {
            name = event.getValue('name');
            id = event.getValue('id');
            file = event.getValue('isFile');
        } else {
            name = event.value.entry.name;
            id = event.value.entry.id;
            file = event.value.entry.isFile;
        }
        if (file == true) {
            tipo = 'el fichero';
        } else {
            tipo = 'la carpeta';
        }

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: `Eliminar Fichero`,
                htmlContent: `<div> <p>Estas seguro que deseas eliminar ${tipo}  <strong>${name}</strong> ?</p> </div>`,
                /* message: `Estas seguro que deseas eliminar el fichero  "${name}" ?` */
            },
            minWidth: '250px',
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
                this.apiService
                    .getInstance()
                    .nodes.deleteNode(id)
                    .then(
                        (success) => {
                            this.notificationService.openSnackMessage(
                                `Eliminado  "${name}" `,
                                1200
                            );
                            setTimeout(() => {
                                this.actualizarTabla();
                            }, 1200);
                        },
                        (error) => {
                            this.notificationService.openSnackMessage(
                                `Error al eliminar  "${name}" `,
                                20000
                            );
                        }
                    );
            }
        });
    }
}
