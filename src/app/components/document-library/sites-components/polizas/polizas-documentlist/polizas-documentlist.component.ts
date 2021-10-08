import { Component, OnInit, ChangeDetectorRef, AfterContentInit } from '@angular/core';
import { DocumentlistComponentGeneric } from '../../../generic/documentlist-generic/documentlist-generic.component';
import { NotificationService, AlfrescoApiService, CookieService } from '@alfresco/adf-core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { NodeActionsService, ContentNodeDialogService, ShareDataRow } from '@alfresco/adf-content-services';
import { CustomDialogsService, TableActionsService } from '../../../../../services';
import { /* MinimalNode, MinimalNodeEntity, */ NodeAssociationPagingList } from '@alfresco/js-api';


@Component({
    selector: 'app-polizas-documentlist',
    templateUrl: './polizas-documentlist.component.html',
    styleUrls: ['./polizas-documentlist.component.scss'],
})
export class PolizasDocumentlistComponent extends DocumentlistComponentGeneric
    implements OnInit, AfterContentInit {

        nombreFicheroFiltro: string = '';
        vencimientoFiltro: string = '';
        fecha : string = '';
        poliza : string = '';
        suplemento : string = '';
        compromiso : string = '';
        descripcion : string = '';
        aseguradora : string = '';
        sociedad : string = '';


        ficherosApiConRelacionados: string[] = [];
        ficherosRelacionados: NodeAssociationPagingList[] = [];
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
        super(
            notificationService,
            router,
            dialog,
            apiService,
            nodeActionsService,
            route,
            contentDialogService,
            cookiesService,
            customDialogsService,
            tableActionsService,
            changeDetector
        );

    }

    ngOnInit() {}

    ngAfterContentInit(){
    this.filtro = (row: ShareDataRow) => {
        let node = row.node.entry;
        if(node.isFolder && node.name == "Carpeta entrada inicial docs") return false; else return true;

      };
    }
 /*    ficherosEnlazados(rows: DataRow[]) {
        super.ficherosEnlazados(rows);
        //this.changeDetector.detectChanges();
    }

    cerrarCargando(){
        super.cerrarCargando();
        //console.log("entra");
        //this.changeDetector.detectChanges();
    } */
     

   /* filtrar(event) {
        this.filtro = (row: ShareDataRow) => {
            let node = row.node.entry;
            
            let vencimientoTabla: any = '';
            let pipe = new DatePipe('en-US');
            if (!isUndefined(node.properties) && !isUndefined(node.properties["polizas:fecha"])) {
              vencimientoTabla = node.properties["polizas:fecha"];
              vencimientoTabla = pipe.transform(vencimientoTabla, 'dd/MM/yyyy').toString();
            }
      
            let nombreUsuarioTabla: string = node.createdByUser.displayName;
            let nombreFicheroTabla: string = node.name;

            let suplemento : string = node.properties['polizas:n_suplemento'] ? node.properties['polizas:n_suplemento'] : ''; 
            let compromiso : string = node.properties['polizas:compromiso'] ? node.properties['polizas:compromiso'] : ''; 
            let descripcion : string = node.properties['polizas:descripcion'] ? node.properties['polizas:descripcion'] : '';  
            let aseguradora : string = node.properties['polizas:aseguradora'] ? node.properties['polizas:aseguradora'] : ''; 
            let sociedad : string = node.properties['polizas:sociedad'] ? node.properties['polizas:sociedad'] : ''; 
            let poliza : string = node.properties['polizas:n_poliza'] ? node.properties['polizas:n_poliza'] : ''; 
  
        

                if (
                    this.mostrarFilaTabla(
                        nombreUsuarioTabla,
                        this.modificadoPorFiltro
                    ) &&
                    this.mostrarFilaTabla(
                        nombreFicheroTabla,
                        this.nombreFicheroFiltro
                    )&&
                    this.mostrarFilaTabla(
                        vencimientoTabla,
                        this.fecha
                    )&&
                    this.mostrarFilaTabla(
                        suplemento,
                        this.suplemento
                    )&&
                    this.mostrarFilaTabla(
                        compromiso,
                        this.compromiso
                    )&&
                    this.mostrarFilaTabla(
                        descripcion,
                        this.descripcion
                    )&&
                    this.mostrarFilaTabla(
                        aseguradora,
                        this.aseguradora
                    )&&
                    this.mostrarFilaTabla(
                        sociedad,
                        this.sociedad
                    )&&
                    this.mostrarFilaTabla(
                        poliza,
                        this.poliza
                    )

                ) {
                    return true;
                } else {
                    return false;
                }
        };
    }*/
}
