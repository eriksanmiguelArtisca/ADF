import {
    BreadcrumbComponent,
    /* ConfirmDialogComponent, */ ContentNodeDialogService,
    DocumentListComponent,
    DropdownSitesComponent,
    NodeActionsService,
    RowFilter,
    SearchFilterComponent,
    ShareDataRow,
} from '@alfresco/adf-content-services';
import {
    AlfrescoApiService,
    CookieService,
    DataCellEvent,
    /* DataRowActionEvent, */ DataTableComponent,
    DownloadZipDialogComponent,
    NotificationService,
    DataRow,
} from '@alfresco/adf-core';
import {
    /* MinimalNode, */ MinimalNodeEntity,
    NodeAssociationPagingList,
    SiteContainerEntry,
} from '@alfresco/js-api';
/* import { DatePipe } from '@angular/common'; */
import { Component, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
//Filters
import { MatDialog } from '@angular/material';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { isNull, isUndefined } from 'util';
import {
    CustomDialogsService,
    TableActionsService,
} from './../../../../services';
import { DialogAssociatedFiles } from '../../dialogs';

declare var $: any;

@Component({
    selector: 'app-documentlist-generic',
    templateUrl: './documentlist-generic.component.html',
    styleUrls: ['./documentlist-generic.component.scss'], //'./documentlist.component.css',
})
export class DocumentlistComponentGeneric {
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

    // Dialog de envio de fichero por email
    path: string;
    vencimiento: string;
    name: string;

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

    @Input()
    showViewer: boolean = false;

    @ViewChild('documentList')
    documentList: DocumentListComponent;

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
        public router: Router,
        protected dialog: MatDialog,
        protected apiService: AlfrescoApiService,
        protected nodeActionsService: NodeActionsService,
        protected route: ActivatedRoute,
        protected contentDialogService: ContentNodeDialogService,
        protected cookiesService: CookieService,
        protected customDialogsService: CustomDialogsService,
        protected tableActionsService: TableActionsService,
        protected changeDetector:ChangeDetectorRef
    ) {
        // subscribe to the router events - storing the subscription so
        // we can unsubscribe later.

        this.navigationSubscription = this.router.events.subscribe((e: any) => {
            // If it is a NavigationEnd event re-initalise the component
            if (e instanceof NavigationEnd) {
                let site = this.cookiesService.getItem('site');
                if (!isNull(site) && !e.url.includes('overlay:files')) {
                    this.getSiteContent(site);
                    /*     this.documentList.reload(); */
                }
                this.previousUrl = e.url;
            }
        });
    }
    ngAfterContentInit() {}

    onUploadPermissionFailed($event) {
        this.notificationService.openSnackMessage(
            'No tienes el permiso de creacion necesario para subir el contenido',
            4000
        );
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        // avoid memory leaks here by cleaning up after ourselves. If we
        // don't then we will continue to run our method
        // on every navigationEnd event.
        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }
    }

    onShowRowActionsMenu(event: DataCellEvent) {
        let editar = { title: 'Editar', icon: 'edit' };
        this.tableActionsService.onShowRowActionsMenu(event);
        event.value.actions.push(editar);
    }

    show() {
        $('.mat-drawer-inner-container').show();
        this.showViewer = false;
        this.nodeId = null;
        this.nodeId1 = null;
    }

    editar($event ){
        this.router.navigate(["content/upload-form/", this.documentList.currentFolderId, { 'path': "null"} ],{ state : {'nodeChildAssociationEntry': $event["value"] } } );
    }

    /**
     * Accion que abre el dialog de mover nodo
     *
     * @param event - la fila del datatable o del documentlist seleccionada
     */
    moverNodo(event) {
        this.tableActionsService.moverNodo(event).then(
            (success) => {
                this.documentList.reload();
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
                this.documentList.reload();
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

    uploadSuccess(event: any) {
        this.notificationService.openSnackMessage(
            'Fichero subido correctamente'
        );
        this.documentList.reload();
    }

    showPreview(event) {
        const entry = event.value.entry;
        if (entry && entry.isFile) {
            this.showViewer = true;
            if(entry.isLink==true){
              this.nodeId1 = entry.properties["cm:destination"];
            }else{
              this.nodeId1 = entry.id;
            }
        
            $('.mat-drawer-inner-container').hide();
         // this.preview.showResource(entry.id);
        }
    }

    isActionVisible(event): boolean {
        let enlace = event.entry;
        if (enlace.isLink) {
            return false;
        }
        return true;
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
        let entry = event.value.entry;
        if (entry && entry.isFile) {
            this.nodeId = entry;
            this.mostrarMetadatos = true;
            this.mostrarFiltrosAvanzados = false;
        }
    }

    filtrar(event) {
        this.filtro = (row: ShareDataRow) => {
            let node = row.node.entry;
            let nombreUsuarioTabla: string = node.createdByUser.displayName;
            let nombreFicheroTabla: string = node.name;

            /* if (
                !isNull(this.vencimientoFiltro) &&
                !isUndefined(this.vencimientoFiltro) &&
                this.vencimientoFiltro !== ''
            ) { */
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
           /*  } else {
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
            } */
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

    getSiteContent(site: string) {
        //Evento que navega a la selecion del dropbox de los sites
        if (site != '-my-') {
            this.getDocumentLibrarySiteContainer(site);
        } else {
            this.documentList.navigateTo('-my-'); //site.entry.id);
        }
        this.mostrarDocumenList = true;
        this.mostrarFiltrosAvanzados = false;
    }

    protected getDocumentLibrarySiteContainer(site: string): any {
        const include = ['properties'];
        const documentLibraryContainerId = 'documentLibrary';

        this.apiService
            .getInstance()
            .core.sitesApi.getSiteContainer(
                site,
                documentLibraryContainerId,
                include
            )
            .then((nodeEntity: SiteContainerEntry) => {
                this.documentList.navigateTo(nodeEntity.entry.id);
                this.documentList.noPermission = false;
            })
            .catch((error) => {
                this.notificationService.openSnackMessage(
                    'No tienes permisos para acceder a la carpeta o se ha producido un error!'
                );
            });
    }

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
        this.documentList.reload();
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

    crearEnlace(event: any) {
        this.tableActionsService.crearEnlace(event, this.documentList);
    }

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

    ficherosEnlazados(rows: DataRow[]) {
        this.documentList.loading = true;
  
        this.ficherosApiConRelacionados = [];
        this.ficherosRelacionados = [];
        let cont = 0;
        if (rows.length != 0) {
          this.notificationService.openSnackMessage('Buscando ficheros asociados');
        } else {
        if(!isUndefined(this.dataTable)) this.dataTable.loading = false;
        if(!isUndefined(this.documentList)) this.documentList.loading = false; 
        
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

    cerrarCargando() {
      this.documentList.loading = false;
      this.changeDetector.detectChanges();
      this.ficherosApiConRelacionados.forEach(id => {
        let fila = document.getElementById(id);
        if (fila != null) {
          fila.hidden = false;
        }
      });
     
      this.notificationService.dismissSnackMessageAction();
    }
    

    abrirFormularioSubida() {
        let path = '';
        this.breadcrumb.route.forEach((route) => {
            path += route.name + '/';
        });
        this.router.navigate([
            'content/upload-form/',
            this.documentList.currentFolderId,
            { path: path },
        ]);
    }

    openDialogEnlazados(event): void {
        this.subscription = this.tableActionsService
            .openDialogEnlazados(
                event,
                DialogAssociatedFiles,
                this.ficherosApiConRelacionados,
                this.ficherosRelacionados
            )
            .subscribe((result) => {
                this.documentList.reload();
            });
    }

    openConfirmDeleteDialog(event): void {
        this.tableActionsService.openConfirmDeleteDialog(
            event,
            this.documentList
        );
    }

    openDialogTags(event, documentList?): void {
        this.tableActionsService.openDialogTags(event, documentList);
    }

    /*   openDialogExport(): void {
    var tableRows = this.documentList.data.getRows();
    if (!this.mostrarDocumenList) {
      tableRows = this.dataTable.data.getRows();
    }
    const dialogRef = this.dialog.open(DialogExport, {
      width: '540px',
      data: { rows: tableRows }
    });

    this.subscription = dialogRef.afterClosed().subscribe(result => {
    });
  } */
}
