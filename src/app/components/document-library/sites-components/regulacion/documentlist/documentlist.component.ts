import { BreadcrumbComponent, ConfirmDialogComponent, DocumentListComponent, DropdownSitesComponent, NodeActionsService, RowFilter, SearchFilterComponent, SearchQueryBuilderService, ShareDataRow } from '@alfresco/adf-content-services';
import { AlfrescoApiService, CookieService, DataCellEvent, DataRow, DataRowActionEvent, DataTableComponent, DownloadZipDialogComponent, NotificationService, AuthenticationService } from '@alfresco/adf-core';
import {  MinimalNodeEntity, NodeAssociationPagingList, SiteContainerEntry } from '@alfresco/js-api';
import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, Input, ViewChild, OnInit } from '@angular/core';
//Filters
import { MatDialog } from '@angular/material';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { isNull, isUndefined, isNullOrUndefined } from 'util';

import { DialogTags } from '../../../dialogs/dialog-tags/dialogs-tags.component';
import { DialogExport } from "../../../dialogs/dialog-export/dialogExport.component";
import { DialogAssociatedFiles } from "../../../dialogs/dialog-associated-files/dialogAssociatedFiles.component";
import { DialogReminder } from "../../../dialogs/dialog-reminder/dialogReminder.component";
import { DialogSendEmail } from "../../../dialogs/dialog-send-email/dialogSendEmail.component";
import { HttpClient } from '@angular/common/http';
import {  TableActionsService, MetadataService } from '../../../../../services';

/* import * as filterConfig from './filters.config.json'; */

declare var $: any;

@Component({
  selector: 'app-documentlist',
  templateUrl: './documentlist.component.html',
  styleUrls: ['./documentlist.component.scss'] 
})
export class DocumentlistComponent implements OnInit {
  subscription: Subscription;
  navigationSubscription: Subscription;
  previousUrl: string;
  // Condiciones que ocultan elementos del html
  mostrarMetadatos: boolean = false;
  mostrarFiltrosAvanzados: boolean = false;
  mostrarDocumenList: boolean = true;

  // Filtros de documentlist 
  filtro: RowFilter = null;
  modificadoPorFiltro: string = "";
  nombreFicheroFiltro: string = "";
  vencimientoFiltro: string = "";
  sitenull: string = "";
  // Busqueda
  searchTerm: string;
  etiselect : string = "";
  ultimoSearchTerm: string;
  data: any = [];
  limpiar: boolean = false;
  nodata: boolean;
 

  // Dialog de envio de fichero por email
  path: string
  vencimiento: string;
  name: string;
  // Documenlist
  nodeId: string = null;
  currentFolderId: string = "-me-";
  nodeId1: string = null;
  includeFields = ['aspectNames', 'properties', 'isLink', 'path', 'allowableOperations'];
  ficherosApiConRelacionados: string[] = [];
  ficherosRelacionados: NodeAssociationPagingList[] = [];
  etiquetas : any = [];

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

  constructor(private notificationService: NotificationService, public router: Router, private dialog: MatDialog, private http: HttpClient,
    private queryBuilder: SearchQueryBuilderService, private apiService: AlfrescoApiService, protected changeDetector: ChangeDetectorRef,
    private nodeActionsService: NodeActionsService, private route: ActivatedRoute,
    private cookiesService: CookieService, private authenticationService :AuthenticationService,protected tableActionsService: TableActionsService,
    protected metadataService: MetadataService) {

    // subscribe to the router events - storing the subscription so
    // we can unsubscribe later. 
    
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        if (e.url == '/content/home') {
          if (this.previousUrl == e.url) {
            this.limpiarBusqueda();
          }
        } else {
          let site = this.cookiesService.getItem('site');
          if (!isNull(site) && !e.url.includes("overlay:files")) {
            this.getSiteContent(site);
          }
        }
        this.previousUrl = e.url;
      }
    });

    this.tableActionsService.changeDetectionEmitter.subscribe( change => {
      this.changeDetector.detectChanges();
    })

  }

  
  ngOnInit() {
    let site = this.cookiesService.getItem('site');
    this.sitenull = site;
    
    let ticket = this.authenticationService.getTicketEcm();
    //this.queryBuilder.queryFragments = { queryType: "TYPE:'cm:content'" };
    if (!isNull(site) && site != 'null') {
      this.http.get("/alfresco/s/api/tagscopes/site/regulacion/documentLibrary/tags?&topN=1000&alf_ticket=" + ticket)
      .subscribe(resp => {
        this.etiquetas = resp['tags'];
      });
      /*  let searchCategories: any = filterConfig.categories;
      this.queryBuilder.config.categories = searchCategories;
      this.queryBuilder.categories = searchCategories;
      this.queryBuilder.config.filterWithContains = searchCategories.filterWithContains;
      this.queryBuilder.filterQueries = [];
      this.queryBuilder.sorting = []; */
      this.metadataService
      .generateSearchFilters(undefined)
      .then((successFilters: any) => {
        this.queryBuilder.categories = successFilters ;
        this.queryBuilder.config.categories = successFilters ;
        return this.searchFilter.queryBuilder;
      });
      
    }else {
      this.queryBuilder.resetToDefaults();
    }
    
  } 
  
  /** 
   * Evitamos fugas de memoria limpiando suscripciones
   */
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
  
  /** 
   * Comprueba si los nodos de la busqueda tienes algún fichero relacionado y guarda sus ficheros relacionados en arrays
   *
   * @param rows - las filas del datatable o del documentlist
   * @param componente - el componente que llama al metodo
   */
  ficherosEnlazados(rows: DataRow[], componente: string) {
    
    if ((this.mostrarDocumenList == false && this.router.url.search('home') !== -1) || this.router.url.search('home') == -1) {
      if (componente == 'documentlist') {
        this.documentList.loading = true;
      } else {
        this.dataTable.loading = true;
      }
      
      this.ficherosApiConRelacionados = [];
      this.ficherosRelacionados = [];
      let cont = 0;
      if (rows.length != 0) {
        this.notificationService.openSnackMessage('Buscando ficheros asociados');
      } else {
        this.dataTable.loading = false;
        this.documentList.loading = false;  	//this.dataTable.loading = false;
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
  }
  
  
  private cerrarCargando() {
    this.dataTable.loading = false;
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
  
  /**
   * Genera las acciones del datatable
   *
   * @param event - Evento del componente datatable que contiene las acciones y el nodo de la fila
   */
  onShowRowActionsMenu(event: DataCellEvent) {
    
    let visualizar = { title: 'Visualizar', icon: "visibility" };
    let editar = { title: 'Editar', icon: 'edit' };
    let asociados = { title: 'Asociados', icon: "link" };
    let recordatorios = { title: 'Recordatorio', icon: "notifications" };
    let metadatos = { title: 'Metadatos', icon: "local_offer" };
    let etiquetas = { title: 'Etiquetas', icon: "label" };
    let descargar = { title: 'Descargar', icon: "archive" };
    let aviso = { title: 'Enviar aviso', icon: "mail" };
    let copiar = { title: 'Copiar', icon: "content_copy" };
    let enlace = { title: 'Crear Enlace', icon: "link" };
    let mover = { title: 'Mover', icon: "redo" };
    let eliminar = { title: 'Eliminar', icon: "delete" };
    
    let acciones = [visualizar,editar, descargar];
    if (event.value.row.getValue('aspectNames').find(value => value == "regu:metadatos")) {
      acciones.push(aviso,recordatorios,metadatos,etiquetas, asociados);
    }
    acciones.push(copiar, enlace, mover, eliminar);
    event.value.actions = acciones;
  }
  
  show() {
    $('.mat-drawer-inner-container').show();
    this.showViewer = false;
    this.nodeId = null;
    this.nodeId1 = null;
  }
  
  onExecuteRowAction(event: DataRowActionEvent) {
    //this.documentList.
    let args = event.value;
    let id = args.row.getValue('id');

    switch (args.action.title) {
      case 'Visualizar':
        //let fileview = new FileViewComponent();
        this.showViewer = true;
        this.nodeId1 = id;
        $('.mat-drawer-inner-container').hide();
        break;
      case 'Editar':
        this.router.navigate(["content/upload-form/", '1', { 'path': "null"} ],{ state : {'nodeChildAssociationEntry': event.value.row.obj } } );
        break;
      case 'Asociados':
        this.openDialogEnlazados(args.row);
        break;
      case 'Metadatos':
        this.showMetadatos(args.row);
        break;
      case 'Etiquetas':
        this.openDialogTags(args.row);
        break;
      case 'Recordatorio':
        this.openDialogVencimiento(args.row);
        break;
      case 'Descargar':
        this.apiService.getInstance().nodes.getNode(id).then(success => {
          this.nodeActionsService.downloadNode(success);
        });
        /*       let url = this.apiService.contentApi.getContentUrl(id,true);
        if(url){
          window.location.href = url;
        } */
        break;
      case 'Eliminar':
        this.openConfirmDeleteDialog(args.row);
        /*   this.apiService.getInstance().nodes.deleteNode(id).then( success => {
          this.actualizarTabla();
        }); */
        break;
      case 'Enviar aviso':

        this.name = args.row.getValue('name');
        let path = args.row.getValue('path');
        let idmail = args.row.getValue('id');
        let pipe = new DatePipe('en-US');
        var auxvencimiento = args.row.getValue('properties')["regu:fecha_vencimiento"];

        if (auxvencimiento != undefined) this.vencimiento = pipe.transform(auxvencimiento, 'yyyy-MM-dd').toString();


        const dialogRef1 = this.dialog.open(DialogSendEmail, {
          width: '840px',
          height: '835px',
          data: { name: this.name, path: path.name + "/" + this.name, vencimiento: this.vencimiento, id: idmail }

        });

        this.subscription = dialogRef1.afterClosed().subscribe(result => {
          this.actualizarTabla();
        });
        break;
      case 'Copiar':
        this.copiarNodo(args.row);
        /* this.apiService.getInstance().nodes.getNodeInfo(id, { 'include': ["allowableOperations"] }).then(success => {
          this.nodeActionsService.copyContent(success, "update").subscribe(success => {
            this.notificationService.openSnackMessage("Se ha copiado correctamente el fichero ");
          }, error => {
            this.notificationService.openSnackMessage("Ha surgido un error al copiar el fichero. Verifica que tienes los permisos para actualizar el fichero");
})
}); */
        break;
      case 'Crear Enlace':
        // Si event.value es null significa el valor viene de la busqueda y hay que usar otro metodo para acceder a las propiedades
        this.tableActionsService.crearEnlace(args.row.obj);
        /* const node = args.row;
        this.customDialogsService.openCopyMoveDialog('SELECT_LOCATION', node.entry, 'update').toPromise()
        //this.contentDialogService.openFolderBrowseDialogBySite()
        .then((selections: MinimalNode[]) => {
          selections.forEach(selectionNode => {
            //this.apiService.getInstance().upload.
            
            this.apiService.getInstance().core.nodesApi.addNode(selectionNode.id,
              {
                name: "Enlace a " + node.getValue('name'),
                nodeType: "app:filelink",
                properties: {
                  'cm:destination': node.getValue('id')
                }
              }).then(success => {
                
                this.notificationService.openSnackMessage('Enlace creado correctamente', 2000);
              }, rejected => {
                this.notificationService.openSnackMessage('Error al crear el enlace', 4000);
              });
            });
          }); */
        break;

      case 'Mover':
        this.moverNodo(args.row);
        break;
      default:
        break;
    }

  }
            
  editar($event ){
    this.router.navigate(["content/upload-form/", this.documentList.currentFolderId, { 'path': "null"} ],{ state : {'nodeChildAssociationEntry': $event["value"] } } );
  }
    /** 
     * Accion que abre el dialog de mover nodo
     *
     * @param event - la fila del datatable o del documentlist seleccionada
     */
    moverNodo(event){
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
            copiarNodo(event){
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
    this.notificationService.openSnackMessage('File uploaded');
    this.documentList.reload();
  }
  
  /** 
   * Ejecuta la busqueda con el valor del input y busca los ficheros enlazados de los resultados
   */
  actualizarTabla() {

    if(!isUndefined(this.searchTerm) ){
      this.searchTerm = this.searchTerm.trim();
    }
    let search = '';
    this.dataTable.data = null;
    this.ficherosApiConRelacionados = [];
    this.ficherosRelacionados = [];
    this.queryBuilder.paging = { maxItems: 100, skipCount: 0 };
    this.queryBuilder.config.include = this.includeFields;
    this.searchFilter.queryBuilder.filterQueries = [
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
    this.subscription = this.queryBuilder.executed.subscribe(data => {
      this.data = [];
      this.subscription.unsubscribe();
      if (!this.mostrarDocumenList) {
        
        if (data.list.entries.length == 0){
          this.nodata = true; 
        }else{
          this.nodata = false; 
          this.dataTable.loading = true;
        }
        data.list.entries.forEach(element => {
          // Este if filtra que el nombre del site seleccionado en el desplegable este en la ruta de los ficheros de resultados de la busqueda
          /*         if(element.entry.path.name.includes(this.siteActual)){
                    this.data.push(element.entry);
                  } */
          this.data.push(element.entry);
        });
        this.changeDetector.detectChanges();
        this.ficherosEnlazados(this.dataTable.data.getRows(), 'datatable');
        
      }
      // data = this.data;
      //this.dataTable.data.getColumns.
    });
    this.mostrarDocumenList = false;
    //this.searchFilter.queryBuilder.queryFragments = {};
/*     if (!isUndefined(this.ultimoSearchTerm)) {
      this.searchFilter.queryBuilder.removeFilterQuery(this.ultimoSearchTerm);
    } */
  
    let searchSplit;
    let numberOfFilters = Object.keys(this.queryBuilder.queryFragments).filter( queryKey => this.queryBuilder.queryFragments[queryKey] !== ''  );

    if ( (!isUndefined(this.searchTerm) && this.searchTerm!="") || this.etiselect!="" || numberOfFilters.length > 1) {
     if(!isUndefined(this.searchTerm) && this.searchTerm!=""){
    
      searchSplit = this.searchTerm.split(" ");
     
      if(searchSplit.length >= 1 ){
        for (let index = 0; index <searchSplit.length; index++) { 
          search += "cm:name:'" + searchSplit[index] + "*'";
          if(index != searchSplit.length-1){
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
      }else{
        //this.searchFilter.queryBuilder.
      }
      this.searchFilter.queryBuilder.addFilterQuery(search);
/*       // Guardamos el ultimo filtro
      this.ultimoSearchTerm = search; */
   
      
      this.searchFilter.queryBuilder.execute();
    }else{
      if(this.subscription){
        this.subscription.unsubscribe();
      }
      this.notificationService.openSnackMessage("Selecciona un tag, un filtro o escribe una busqueda",4000);
    }
    //this.dataTable.loading = false;
  
  }

  limpiarBusqueda() {
    this.searchFilter.queryBuilder.queryFragments = { queryType: "TYPE:'cm:content'" };
    this.searchFilter.queryBuilder.userQuery = "";
    //this.searchFilter.queryBuilder.resetToDefaults();
    let site = this.cookiesService.getItem('site');
    this.sitenull = site;
    this.etiselect = '';

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
    //this.searchFilter.queryBuilder.buildQuery();
    this.searchTerm = '';
    this.mostrarDocumenList = true;
    this.mostrarFiltrosAvanzados = false;
    this.limpiar = true;
    this.nodata = false;
  }

  
  limpiarTags() {

    this.etiselect = '';
    this.mostrarDocumenList = true;
    this.mostrarFiltrosAvanzados = false;
    this.limpiar = true;
    this.nodata = false;
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

  isActionVisible(event): boolean{
    let enlace = event.entry;
    if (enlace.isLink) {
     
      return false;
    }
    return true;
  }

  onGoBack(event: any) {
    this.showViewer = false;
    this.nodeId = null;
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
    let entry:any;
    if(!isUndefined(event.value))entry = event.value.entry;
    if(!isUndefined(event.obj))entry = event.obj;
 
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

      let nombreUsuarioTabla: string = node.modifiedByUser.displayName;
      let nombreFicheroTabla: string = node.name;
      let vencimientoTabla: any = '';
      let pipe = new DatePipe('en-US');
      if (!isUndefined(node.properties) && !isUndefined(node.properties["regu:fecha_vencimiento"])) {
        vencimientoTabla = node.properties["regu:fecha_vencimiento"];
        vencimientoTabla = pipe.transform(vencimientoTabla, 'dd/MM/yyyy').toString();
      }
      if (!isNull(this.vencimientoFiltro) && !isUndefined(this.vencimientoFiltro) && this.vencimientoFiltro !== '') {
        if ((this.mostrarFilaTabla(nombreUsuarioTabla, this.modificadoPorFiltro) && this.mostrarFilaTabla(nombreFicheroTabla, this.nombreFicheroFiltro) && (this.mostrarFilaTabla(vencimientoTabla, (pipe.transform(this.vencimientoFiltro, 'dd/MM/yyyy').toString()))))) {
          return true;
        } else {
          return false;
        }
      } else {
        if ((this.mostrarFilaTabla(nombreUsuarioTabla, this.modificadoPorFiltro) && this.mostrarFilaTabla(nombreFicheroTabla, this.nombreFicheroFiltro))) {
          return true;
        } else {
          return false;
        }
      }

    };
  }

  mostrarFilaTabla(textoCeldaTabla: string, textoFiltro: string) {
    if (textoCeldaTabla.toLowerCase().includes(textoFiltro.toLowerCase()) || textoFiltro == "") {
      return true;
    }
    return false;
  }

  getSiteContent(site: string) {
    if (site != '-my-') {
      this.getDocumentLibrarySiteContainer(site);
    } else {
      this.documentList.navigateTo('-my-');
    }
    this.searchTerm = '';
    this.mostrarDocumenList = true;
    this.mostrarFiltrosAvanzados = false;
    this.limpiar = true;
  }

  private getDocumentLibrarySiteContainer(site: string): any {
    const include = ['properties'];
    const documentLibraryContainerId = 'documentLibrary';

    this.apiService.getInstance().core.sitesApi.getSiteContainer(
      site, documentLibraryContainerId, include).then((nodeEntity: SiteContainerEntry) => {
        this.documentList.navigateTo(nodeEntity.entry.id);
        this.documentList.noPermission = false;
      }).catch(
        error => {
          this.notificationService.openSnackMessage('No tienes permisos para acceder a la carpeta o se ha producido un error!');
        }
      );
  }

  mostrarFiltrosAvanzadosBusqueda() {
    this.route.url.subscribe(success => {
      if (success[0].path == 'documentlist') {
        this.router.navigate(["/content/home", { 'show': true }]);
      }
    }, rejected => {
    });
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

    let item = "";

    if (entry.isFile) {
      item = "file";
    } else if (entry.isFolder) {
      item = "folder"
    }
    this.documentList.reload();
    this.notificationService.openSnackMessage(`Eliminado ${item} "${entry.name}" `, 20000);
  }

  onPermissionsFailed(event: any) {
    this.notificationService.openSnackMessage('No tienes los permisos necesarios para realizar esta accion', 4000);
  }

  crearEnlace(event: any) {
    this.tableActionsService.crearEnlace(event,this.documentList);
    /* const node: MinimalNodeEntity = event.value;
    this.customDialogsService.openFolderBrowseDialogBySite()
      .subscribe((selections: MinimalNode[]) => {
        selections.forEach(selectionNode => {
          this.apiService.getInstance().core.nodesApi.addNode(selectionNode.id,
            {
              name: "Enlace a " + node.entry.name,
              nodeType: "app:filelink",
              properties: {
                'cm:destination': node.entry.id
              }
            }).then(success => {
              this.documentList.reload();
              this.notificationService.openSnackMessage('Enlace creado correctamente', 2000);
            }, rejected => {
              this.notificationService.openSnackMessage('Error al crear el enlace', 4000);
            });
        });
      }); */
  }

  downloadZip(selection: Array<MinimalNodeEntity>) {
    if (selection && selection.length > 0) {
      const nodeIds = selection.map(node => node.entry.id);

      const dialogRef = this.dialog.open(DownloadZipDialogComponent, {
        width: '600px',
        data: {
          nodeIds: nodeIds
        }
      });

      let sub = dialogRef.afterClosed().subscribe(result => {
      });
      if (this.subscription == undefined) {
        this.subscription = sub;
      } else {
        this.subscription.add(sub);
      }
    }
  }



  abrirFormularioSubida() {
    let path = '';
    this.breadcrumb.route.forEach(route => {
      path += route.name + "/";
    });
    this.router.navigate(["content/upload-form/", this.documentList.currentFolderId, { 'path': path }]);
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
      tipo = 'el fichero'
    } else {
      tipo = 'la carpeta'
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Eliminar Fichero`,
        htmlContent: `<div> <p>Estas seguro que deseas eliminar ${tipo}  <strong>${name}</strong> ?</p> </div>`
      },
      minWidth: '250px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.apiService.getInstance().nodes.deleteNode(id).then(success => {
          this.notificationService.openSnackMessage(`Eliminado  "${name}" `, 1200);
          setTimeout(() => {
            if (this.mostrarDocumenList) {
              this.documentList.reload();
            } else {
              this.actualizarTabla();
            }
          }, 1200);


        }, error => {
          this.notificationService.openSnackMessage(`Error al eliminar  "${name}" `, 20000);
        });
      }
    });
  }

  openDialog(event): void {

    this.name = event.value.entry.name;
    let path = event.value.entry.path;
	let idmail = event.value.entry.id;
    let pipe = new DatePipe('en-US');
    var auxvencimiento = event.value.entry.properties["regu:fecha_vencimiento"];
    if(auxvencimiento!=undefined)this.vencimiento = pipe.transform(auxvencimiento, 'yyyy-MM-dd').toString();
    const dialogRef = this.dialog.open(DialogSendEmail, {
      width: '840px',
	  height: '835px',
      data: { name: this.name, path: path.name + "/" + this.name, vencimiento: this.vencimiento, id:idmail }
    });

    let sub = dialogRef.afterClosed().subscribe(result => {
      this.documentList.reload();
    });
    if (this.subscription == undefined) {
      this.subscription = sub;
    } else {
      this.subscription.add(sub);
    }
  }

  openDialogEnlazados(event): void {
    let name = null;
    let id = null;
    // Si event.value es null significa el valor viene de la busqueda y hay que usar otro metodo para acceder a las propiedades
    if (event.value == null) {
      name = event.getValue('name');
      id = event.getValue('id');
    } else {
      name = event.value.entry.name;
      id = event.value.entry.id;
    }
    let posicionArray = this.ficherosApiConRelacionados.indexOf(id);
    let relacionados: NodeAssociationPagingList = { entries: [] };
    if (posicionArray != -1) {
      relacionados = this.ficherosRelacionados[posicionArray]
    }
    const dialogRef = this.dialog.open(DialogAssociatedFiles, {
      width: '640px',
      data: { nombreFichero: name, idNodoFichero: id, nodosAsociaciones: relacionados }
    });

    this.subscription = dialogRef.afterClosed().subscribe(result => {
      this.changeDetector.detectChanges();
      if(this.mostrarDocumenList==true)this.documentList.reload(); else this.actualizarTabla();
     
    });

  }

  
  openDialogTags(event): void {
    let id : any;
    if(!isUndefined(event.value))id = event.value.entry.id;
    if(!isUndefined(event.obj))id = event.obj.id;
      const dialogRef = this.dialog.open(DialogTags, {
        width: '500px',
        data: { id: id}
      });

      this.subscription = dialogRef.afterClosed().subscribe(result => {
        if(this.mostrarDocumenList==true){
          this.documentList.reload();
        } else {
          this.actualizarTabla();
          let site = this.cookiesService.getItem('site');
          let ticket = this.authenticationService.getTicketEcm();
          this.http.get("/alfresco/s/api/tagscopes/site/" + site + "/documentLibrary/tags?&topN=1000&alf_ticket=" + ticket)
              .subscribe(resp => {
                  this.etiquetas = resp['tags'];
              });
        }
        
      });
    }
  
  
  
  openDialogVencimiento(event): void {

    let id = null;
    let vencimiento = null;
    let recordatorio = '';
    let recordatorioArray = null;
    let dataRecordatorios = {
      idNodo: null,
      vencimiento: null,
      recordatorio10Dias: false,
      recordatorio5Dias: false,
      recordatorio1Dia: false,
      recordatorioVencido: false,
    }

    // Si event.value es null significa el valor viene de la busqueda y hay que usar otro metodo para acceder a las propiedades
    if (event.value == null) {
      id = event.getValue('id');
      recordatorio = event.getValue('properties')["regu:recordatorio"];
      vencimiento = event.getValue('properties')["regu:fecha_vencimiento"];
    } else {
      id = event.value.entry.id;
      recordatorio = event.value.entry.properties["regu:recordatorio"];
      vencimiento = event.value.entry.properties["regu:fecha_vencimiento"];
    }
    dataRecordatorios.vencimiento = vencimiento;
    if (id !== null && id !== undefined) {
      dataRecordatorios.idNodo = id;
      if (recordatorio !== undefined) {
        recordatorioArray = recordatorio.split('/');
        if (recordatorioArray.find(value => value == '10dias') !== undefined) {
          dataRecordatorios.recordatorio10Dias = true;
        } if (recordatorioArray.find(value => value == '5dias') !== undefined) {
          dataRecordatorios.recordatorio5Dias = true;
        } if (recordatorioArray.find(value => value == '1dia') !== undefined) {
          dataRecordatorios.recordatorio1Dia = true;
        } if (recordatorioArray.find(value => value == 'vencido') !== undefined) {
          dataRecordatorios.recordatorioVencido = true;
        }
      }
      const dialogRef = this.dialog.open(DialogReminder, {
        width: '340px',
        data: dataRecordatorios
      });

      this.subscription = dialogRef.afterClosed().subscribe(result => {
        if(this.mostrarDocumenList==true)this.documentList.reload(); else this.actualizarTabla();
       
      });
    }
  }

  openDialogExport(): void {
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
  }


}




