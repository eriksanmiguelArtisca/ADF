import { ConfirmDialogComponent, NodeActionsService,ContentNodeDialogService } from '@alfresco/adf-content-services';
import { NodeAssociationPagingList,MinimalNode } from '@alfresco/js-api';
import { DatePipe } from '@angular/common';
import { Component, AfterContentInit, OnDestroy} from '@angular/core';
import { AlfrescoApiService, DataCellEvent, DataRowActionEvent, NotificationService } from '@alfresco/adf-core';
import { DialogExport } from "../../../dialogs/dialog-export/dialogExport.component";

import { DialogReminder } from "../../../dialogs/dialog-reminder/dialogReminder.component";
import { DialogSendEmail } from "../../../dialogs/dialog-send-email/dialogSendEmail.component";
import { MatDialog } from '@angular/material';
import { CustomDialogsService } from '../../../../../services';
declare var $: any;
@Component({
  selector: 'app-remindersComponent',
  templateUrl: './reminders.component.html',
  styleUrls: ['./reminders.component.css']
})
export class RemindersComponent implements AfterContentInit,OnDestroy {


 showViewer: boolean = false;
 nodeId1: string = null;
 data : any = [];
   // Dialog de envio de fichero por email
  path: string
  vencimiento: string;
  name: string;
  nodeId: string = null;
  siteActual: string = '-my-';//'';
  ficherosApiConRelacionados: string[] = [];
  ficherosRelacionados: NodeAssociationPagingList[] = [];
 


    constructor( private dialog: MatDialog,
	  private notificationService: NotificationService,
    private apiService: AlfrescoApiService,
	  private contentDialogService: ContentNodeDialogService,	
    private nodeActionsService: NodeActionsService,
    private customDialogsService : CustomDialogsService){

  }
  CargarTabla():void {
      this.data = [];
    //let filtroFecha = ""
    this.apiService.searchApi.search(
      {
        "query": {
          "query": "regu:fecha_vencimiento:['NOW-365DAYS' TO 'NOW+365DAYS']"
        },
        "include": [
          "aspectNames",
          "properties",
		  "path",
          "isLink"
        ]
      }
    ).then( success => {
      //this.data.push(success.list.entries);
      success.list.entries.forEach(element => {
		if(element.entry.properties["regu:fecha_vencimiento"]!=null)this.data.push(element.entry);
      
      
      });
      /*if(success.list.entries.length != 0){
        data success.list.entries
      } */
    }).catch( error => {
 
    })
}
  
  
  ngAfterContentInit(): void {
  this.CargarTabla();
  }

  ngOnDestroy(): void {
    this.data = [];
  }

  // onShowRowActionsMenu(event: DataCellEvent) {
    // let visualizar = { title: 'Visualizar' , icon :"visibility" };
  //  let descargar = { title: 'Descargar' , icon :"archive" , handler:'download' }
// /*     let asociados = { title: 'Asociados' , icon :"link" }; */
    // event.value.actions = [
        // visualizar,
     //  descargar,
      // /*   asociados */
    // ];
// }
onShowRowActionsMenu(event: DataCellEvent) {

    let visualizar = { title: 'Visualizar', icon: "visibility" };
    //let asociados = { title: 'Asociados', icon: "link" };
    let recordatorios = { title: 'Recordatorio', icon: "notifications" };
    let descargar = { title: 'Descargar', icon: "archive" };
    let aviso = { title: 'Enviar aviso', icon: "mail" };
    let copiar = { title: 'Copiar', icon: "content_copy" };
    let enlace = { title: 'Crear Enlace', icon: "link" };
    let mover = { title: 'Mover', icon: "redo" };
    let eliminar = { title: 'Eliminar', icon: "delete" };

    let acciones = [visualizar, descargar, aviso];
    if (event.value.row.getValue('aspectNames').find(value => value == "regu:metadatos")) {
      acciones.push(recordatorios);
    }
    acciones.push(copiar, enlace, mover, eliminar);
    event.value.actions = acciones;
  }

  show() {
    $('.mat-drawer-inner-container').show();
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
        let pipe = new DatePipe('en-US');
        var auxvencimiento = args.row.getValue('properties')["regu:fecha_vencimiento"];
        this.vencimiento = pipe.transform(auxvencimiento, 'yyyy-MM-dd').toString();

        this.dialog.open(DialogSendEmail, {
          width: '840px',
          height: '835px',
          data: { name: this.name, path: path.name + "/" + this.name, vencimiento: this.vencimiento }

        });

        // let sub = dialogRef.afterClosed().subscribe(result => {
        //  this.asunto = result;
        // });
        // if(this.subscription == undefined){
        // this.subscription = sub;
        // }else{
        // this.subscription.add(sub);
        // }
        break;
      case 'Copiar':
      this.copiarNodo(args.row);
        break;
      case 'Crear Enlace':
        // Si event.value es null significa el valor viene de la busqueda y hay que usar otro metodo para acceder a las propiedades

        const node = args.row;

        this.contentDialogService.openFolderBrowseDialogBySite()
          .subscribe((selections: MinimalNode[]) => {
            selections.forEach(selectionNode => {
              //this.apiService.getInstance().upload.

              this.apiService.getInstance().core.nodesApi.addNode(selectionNode.id,
                {
                  name: "Enlace a " + node.getValue('name') + ".url",
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
          });
        break;

      case 'Mover':
        this.moverNodo(args.row);
        break;
      default:
        break;
    }

  }
  moverNodo(event){
    let id = null;
    // Si event.value es null significa el valor viene de la busqueda y hay que usar otro metodo para acceder a las propiedades
    if (event.value == null) {
      id = event.getValue('id');
    } else {
      id = event.value.entry.id;
    }
    this.apiService.getInstance().nodes.getNode(id,{ 'include': ["allowableOperations"] }).then(success => {
      this.customDialogsService.openCopyMoveDialog("Move",success.entry,"update").subscribe(success => {
        this.notificationService.openSnackMessage("Se ha movido correctamente el fichero ");
      }, error => {
        this.notificationService.openSnackMessage("Ha surgido un error al mover el fichero. Verifica que tienes los permisos para actualizar el fichero");
      })
    });
  }

  /** 
   * Accion que abre el dialog de mover nodo
   *
   * @param event - la fila del datatable o del documentlist seleccionada
   */
  copiarNodo(event){
    let id = null;
    // Si event.value es null significa el valor viene de la busqueda y hay que usar otro metodo para acceder a las propiedades
    if (event.value == null) {
      id = event.getValue('id');
    } else {
      id = event.value.entry.id;
    }
    this.apiService.getInstance().nodes.getNode(id,{ 'include': ["allowableOperations"] }).then(success => {
      this.customDialogsService.openCopyMoveDialog("Copy",success.entry,"update").subscribe(success => {
        this.notificationService.openSnackMessage("Se ha copiado correctamente el fichero ");
      }, error => {
        this.notificationService.openSnackMessage("Ha surgido un error al copiar el fichero. Verifica que tienes los permisos para actualizar el fichero");
      })
    });
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
        /* message: `Estas seguro que deseas eliminar el fichero  "${name}" ?` */
      },
      minWidth: '250px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.apiService.getInstance().nodes.deleteNode(id).then(success => {
          this.notificationService.openSnackMessage(`Eliminado  "${name}" `, 1200);
            setTimeout(() => {
              this.CargarTabla();
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
    let pipe = new DatePipe('en-US');
    var auxvencimiento = event.value.entry.properties["regu:fecha_vencimiento"];
    this.vencimiento = pipe.transform(auxvencimiento, 'yyyy-MM-dd').toString();
    this.dialog.open(DialogSendEmail, {
      width: '840px',
      data: { name: this.name, path: path.name + "/" + this.name, vencimiento: this.vencimiento }
    });

    // let sub = dialogRef.afterClosed().subscribe(result => {
     // this.asunto = result;
    // });

  }

  /*openDialogEnlazados(event): void {
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
     this.dialog.open(DialogAssociatedFiles, {
      width: '640px',
      data: { nombreFichero: name, idNodoFichero: id, nodosAsociaciones: relacionados }
    });

    // this.subscription = dialogRef.afterClosed().subscribe(result => {
      // this.documentList.reload();
    // });
    /*     }else{
          this.notificationService.openSnackMessage('El fichero no tiene ningun documento asociado');
        } 
  }*/

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
     var dialogRef = this.dialog.open(DialogReminder, {
        width: '340px',
        data: dataRecordatorios
      });
    
     dialogRef.afterClosed().subscribe(result => {
             setTimeout(() => {
              this.CargarTabla();
          }, 1000);
       });
    }
  }

  openDialogExport(): void {

    this.dialog.open(DialogExport, {
      width: '540px'
    });
  }

    // this.subscription = dialogRef.afterClosed().subscribe(result => {
    // });
  // }
// onExecuteRowAction(event: DataRowActionEvent) {
  // let args = event.value;
  // let id = args.row.getValue('id');

  // switch (args.action.title) {
    // case 'Visualizar':
         // this.showViewer = true;
         // this.nodeId1 = id;
         // $('.mat-drawer-inner-container').hide();
      // break;
    // case 'Asociados':
      //this.openDialogEnlazados(args.row);
      // break; 
    // default:
      // break;
  // }

// }




}
