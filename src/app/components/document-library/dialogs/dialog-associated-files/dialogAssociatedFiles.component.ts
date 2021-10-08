import { Component, Inject, OnDestroy } from '@angular/core';
import { DataRowActionEvent, DataCellEvent } from '@alfresco/adf-core';
import { TableActionsService} from '../../../../services/tableActions.service';
import { MetadataService } from '../../../../services/metadata.service';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { DialogAssociatedData } from '../models-interfaces/dialog-associated-files-model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'dialog-associated-files',
  templateUrl: 'dialog-associated-files.html',
})
export class DialogAssociatedFiles implements OnDestroy{
  nodeId: string;
  show: boolean = false;
  suscription: Subscription;

  constructor(public dialogRef: MatDialogRef<DialogAssociatedFiles>,
    @Inject(MAT_DIALOG_DATA)
    public data: DialogAssociatedData,
    /* private apiService:  AlfrescoApiService,private nodeActionsService: NodeActionsService,private notificationService: NotificationService,private dialog: MatDialog,
    private customDialogsService: CustomDialogsService, */
    public metadataService:MetadataService,
    public tableActionsService: TableActionsService) {

      this.suscription = this.tableActionsService.viewFileEmitter.subscribe( fileId => {
        this.nodeId = fileId;
        this.show = true;
      })
  }

  ngOnDestroy(): void {
    if(this.suscription){
      this.suscription.unsubscribe();
    }
  }
  showPreview(event) {
    const entry = event.detail.value.getValue('entry');
    this.nodeId = entry.id;
    this.show = true;
    /* if (entry && entry.isFile) {
      this.preview.showResource(entry.id);
      this.dialogRef.close();
    } */
  }
  anadirAsociados() {
    this.metadataService.getSiteAssociation().then( associations => {
      this.tableActionsService.anadirAsociados(this.data.idNodoFichero,associations[0] );
    })
    
    
    // this.customDialogsService.openFileBrowseDialogBySite()
    //   .subscribe((selections: MinimalNode[]) => {
    //     selections.forEach(selectionNode => {
    //       this.apiService.getInstance()
    //         .upload.createAssociation(this.data.idNodoFichero, {
    //           targetId: selectionNode.id,
    //           assocType: "regu:relatedDocuments"
    //       });
    //     });
    //   });
  }
  // eliminarAsociado(nodeId) {
  //   this.tableActionsService.eliminarAsociado(this.)
  //   // this.apiService.getInstance().core.changesApi.removeAssoc(this.data.idNodoFichero,nodeId).then(
  //   //   () => {
  //   //     let pos= this.data.nodosAsociaciones.entries.findIndex(node => node.entry.id == nodeId);
  //   //     this.data.nodosAsociaciones.entries.splice(pos,1);
  //   //   }
  //   // );
  // }
  onShowRowActionsMenu(event: DataCellEvent) {
    this.tableActionsService.onShowRowActionsMenu(event);

    let eliminarAsociado = { title: 'Quitar Asociado' , icon :"link" };
    event.value.actions.splice(2,0,eliminarAsociado);
  }
  vaciar() {
    this.nodeId = '';
    this.show = false;
  }
  onExecuteRowAction(event: DataRowActionEvent) {
    this.tableActionsService.initializeServiceDatatable(this.data);
    this.tableActionsService.onExecuteRowAction(event);
    //   let args = event.value;
    //   let id = args.row.getValue('entry.id');
    //   switch (args.action.title) {
    //     case 'Visualizar':
    //         this.nodeId = id;
    //         this.show = true;
    //       break;
    //      case 'Recordatorio':
    //       this.openDialogVencimiento(args.row);
    //       break;  
    //     case 'Descargar':
    //       this.apiService.getInstance().nodes.getNode(id).then( success => {
    //         this.nodeActionsService.downloadNode(success);
    //       });
    // /*       let url = this.apiService.contentApi.getContentUrl(id,true);
    //       if(url){
    //         window.location.href = url;
    //       } */
    //       break;
    //     case 'Eliminar':
    //         this.openConfirmDeleteDialog(args.row);
    //      /*  this.apiService.getInstance().nodes.deleteNode(id).then( success => {
    //         //this.data.nodosAsociaciones.entries.
    //       }); */
    //       break; 
    //     case 'Quitar Asociado':
    //       this.eliminarAsociado(id);
    //       break; 
    //     case 'Copiar':
    //       this.copiarNodo(id);
    //       break; 
    //     default:
    //       break;
    //   }
  }
  copiarNodo(event) {
    //this.tableActionsService.copiarNodo()
    // this.apiService.getInstance().nodes.getNode(id,{ 'include': ["allowableOperations"] }).then(success => {
    //   this.customDialogsService.openCopyMoveDialog("Copy",success.entry,"update").subscribe(success => {
    //     this.notificationService.openSnackMessage("Se ha copiado correctamente el fichero ");
    //   }, error => {
    //     this.notificationService.openSnackMessage("Ha surgido un error al copiar el fichero. Verifica que tienes los permisos para actualizar el fichero");
    //   })
    // });
  }
  openConfirmDeleteDialog(event): void {
    // /* let name = null;
    // let id = null;
    // let file = null;
    // let tipo = null;
    // name = event.getValue('entry.name');
    // id = event.getValue('entry.id');
    // file = event.getValue('entry.isFile');
    // if(file==true){
    //   tipo = 'el fichero'
    // }else{
    //   tipo = 'la carpeta'
    // }
    //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    //     data: {
    //         title: `Eliminar Fichero`,
    //         htmlContent: `<div> <p>Estas seguro que deseas eliminar ${tipo}  <strong>${name}</strong> ?</p> </div>`
    //         /* message: `Estas seguro que deseas eliminar el fichero  "${name}" ?` */
    //     },
    //     minWidth: '250px'
    // });
    // dialogRef.afterClosed().subscribe((result) => {
    //     if (result === true) {
    //       this.apiService.getInstance().nodes.deleteNode(id).then( () => {
    //         this.notificationService.openSnackMessage(`Eliminado  "${name}" `, 1200);
    //         setTimeout(() => {
    //           let pos= this.data.nodosAsociaciones.entries.findIndex(node => node.entry == event.getValue('entry'));
    //           this.data.nodosAsociaciones.entries.splice(pos,1);
    //         }, 1200);
    //       },() => {
    //         this.notificationService.openSnackMessage(`Error al eliminar  "${name}" `, 2000);
    //       });
    //     }
    // }); */
  }
  openDialogVencimiento(event): void {
    /* let id = null;
    let vencimiento = null;
    let recordatorio = '';
    let recordatorioArray = null ;
    let dataRecordatorios = {
      idNodo: null,
      vencimiento: null,
      recordatorio10Dias: false,
      recordatorio5Dias: false,
      recordatorio1Dia: false,
      recordatorioVencido: false,
    }
    id = event.getValue('entry.id');
    recordatorio = event.getValue('entry.properties')["regu:recordatorio"];
    vencimiento = event.getValue('entry.properties')["regu:fecha_vencimiento"];
    dataRecordatorios.vencimiento = vencimiento ;
    if(id !== null && id !== undefined ){
      dataRecordatorios.idNodo = id;
      if(recordatorio !== undefined){
        recordatorioArray = recordatorio.split('/');
        if(  recordatorioArray.find( value => value=='10dias') !== undefined ){
          dataRecordatorios.recordatorio10Dias = true;
        }if(  recordatorioArray.find( value => value=='5dias') !== undefined ){
          dataRecordatorios.recordatorio5Dias = true;
        }if(  recordatorioArray.find( value => value=='1dia') !== undefined ){
          dataRecordatorios.recordatorio1Dia = true;
        }if(  recordatorioArray.find( value => value=='vencido') !== undefined ){
          dataRecordatorios.recordatorioVencido = true;
        }
      }
      const dialogRef = this.dialog.open(DialogReminder, {
        width: '340px',
        data: dataRecordatorios
      });
  
      dialogRef.afterClosed().subscribe(() => {
      });
    } */
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}