import {
    ConfirmDialogComponent,
    NodeActionsService,
} from '@alfresco/adf-content-services';
import {
    AlfrescoApiService,
    DataCellEvent,
    DataRowActionEvent,
    NotificationService,
} from '@alfresco/adf-core';
import { MinimalNode, MinimalNodeEntity, NodeAssociationPagingList } from '@alfresco/js-api';
import { Injectable, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogReminder } from '../components/document-library/dialogs/dialog-reminder/dialogReminder.component';
import { CustomDialogsService } from './customDialogs.service';
import { DialogAssociatedData } from "../components/document-library/dialogs/models-interfaces/dialog-associated-files-model";


import { Observable } from 'rxjs/internal/Observable';
import { isUndefined } from 'util';
import { DialogTags } from '../components/document-library/dialogs/dialog-tags/dialogs-tags.component';
import { Router } from '@angular/router';

@Injectable()
export class TableActionsService  {
    
    protected data: DialogAssociatedData; 

    changeDetectionEmitter: EventEmitter<string> = new EventEmitter<string>();
    viewFileEmitter: EventEmitter<void> = new EventEmitter<void>();

    constructor(
        private customDialogsService: CustomDialogsService,
        private apiService: AlfrescoApiService,
        private nodeActionsService: NodeActionsService,
        private dialog: MatDialog,
        private notificationService: NotificationService,
        private router: Router,
    ) {}

    

    initializeServiceDatatable(  data?: DialogAssociatedData) {
        this.data = data;
    }

    onShowRowActionsMenu(event: DataCellEvent) {
        let visualizar = { title: 'Visualizar', icon: 'visibility' };
        let descargar = { title: 'Descargar', icon: 'archive' };
        let copiar = { title: 'Copiar', icon: 'content_copy' };
        let eliminar = { title: 'Eliminar', icon: 'delete' };

        let acciones = [visualizar, descargar];
        acciones.push( copiar, eliminar);
        event.value.actions = acciones;
    }

    onExecuteRowAction(event: DataRowActionEvent) {
        let args = event.value;
        let selectedId = args.row.getValue('entry.id');
        
        switch (args.action.title) {
            case 'Visualizar':
                this.viewFileEmitter.emit(selectedId);
                break;
            case 'Editar':
                this.router.navigate(["content/upload-form/", '1', { 'path': "null"} ],{ state : {'nodeChildAssociationEntry': event.value.row.obj } } );
                 break;
            case 'Recordatorio':
                this.openDialogVencimiento(args.row);
                break;
            case 'Descargar':
                this.apiService
                    .getInstance()
                    .nodes.getNode(selectedId)
                    .then((success) => {
                        this.nodeActionsService.downloadNode(success);
                    });
                break;
            case 'Eliminar':
                this.openConfirmDeleteDialog(args.row);
                break;
            case 'Quitar Asociado':
                this.eliminarAsociado(this.data.idNodoFichero, selectedId,this.data.nodosAsociaciones);
                break;
            case 'Copiar':
                this.copiarNodo(args.row).then(
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
                break;
            case 'Mover':
                this.moverNodo(args.row).then(
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
                break;
            default:
                break;
        }
    }

    anadirAsociados(nodeId, associationType) {
        this.customDialogsService
            .openFileBrowseDialogBySite()
            .subscribe((selections: MinimalNode[]) => {
                selections.forEach((selectionNode) => {
                    this.apiService
                        .getInstance()
                        .upload.createAssociation(nodeId, {
                            targetId: selectionNode.id,
                            assocType: associationType,
                        });
                });
            });
    }


    /**
     * Accion que abre el dialog de mover nodo
     *
     * @param event - la fila del datatable o del documentlist seleccionada
     */
    copiarNodo(event) {
        let id = null;
        let name = null;
        // Si event.value es null significa el valor viene de la busqueda y hay que usar otro metodo para acceder a las propiedades
        if (event.value == null) {
            id = event.getValue('id');
            name = event.getValue('name');
            if(id=== undefined || id === null){
                id = event.getValue('entry.id');
                name = event.getValue('entry.name');
            }
        } else {
            id = event.value.entry.id;
            name = event.value.entry.name;
        }
        return this.apiService
            .getInstance()
            .nodes.getNode(id, { include: ['allowableOperations'] })
            .then( (success) => {
                return  this.customDialogsService
                    .openCopyMoveDialog('Copy', success.entry, 'update').toPromise().then( selectedFolder => {
                        return this.apiService.getInstance().node.copyNode(id,{"name": name,"targetParentId":selectedFolder[0].id }); 
                    })
            });
    }

    /**
     * Accion que abre el dialog de mover nodo
     *
     * @param event - la fila del datatable o del documentlist seleccionada
     */
    moverNodo(event) {
        let id = null;
        let name = null;
        // Si event.value es null significa el valor viene de la busqueda y hay que usar otro metodo para acceder a las propiedades
        if (event.value == null) {
            id = event.getValue('id');
            name = event.getValue('name');
            if(id=== undefined || id === null){
                id = event.getValue('entry.id');
                name = event.getValue('entry.name');
            }
        } else {
            id = event.value.entry.id;
            name = event.value.entry.name;
        }
        return this.apiService
            .getInstance()
            .nodes.getNode(id, { include: ['allowableOperations'] })
            .then( async (success) => {
                return await this.customDialogsService
                    .openCopyMoveDialog('Move', success.entry, 'update').toPromise().then( selectedFolder => {
                        return this.apiService.getInstance().node.moveNode(id,{"name": name,"targetParentId":selectedFolder[0].id }); 
                    })   
            });
    }
    /**
     * Accion que abre el dialog de mover nodo
     *
     * @param event - la fila del datatable o del documentlist seleccionada
     * @param documentList - el documentlist a recargar al finalizar
     */
    crearEnlace(event: any, documentList?: any) {
        const node: MinimalNodeEntity = event.value ? event.value : { entry : event };
    
        this.customDialogsService
           .openCopyMoveDialog('SELECT_LOCATION', node.entry, 'update').toPromise()
           .then((selections: MinimalNode[]) => {
          /* .subscribe((selections: MinimalNode[]) => { */
            selections.forEach(selectionNode => {
              //this.apiService.getInstance().upload.
    
              this.apiService.getInstance().core.nodesApi.addNode(selectionNode.id,
                {
                  name: "Enlace a " + node.entry.name + ".url",
                  nodeType: "app:filelink",
                  properties: {
                    'cm:destination': node.entry.id
                  }
                }).then(success => {
                    this.notificationService.openSnackMessage('Enlace creado correctamente', 2000);
                    if(documentList){
                        documentList.reload();
                    }

                }, rejected => {
                  this.notificationService.openSnackMessage('Error al crear el enlace', 4000);
                });
            });
          });
        //this.apiService.getInstance().core.changesApi.addAssoc
        // propiedadesBody["cm:destination"] = "39ce00e5-9a48-4d8e-8756-8f27e5ffd1d5";
      }

    eliminarAsociado(nodeId, nodeIdDelte, nodosAsociaciones) {
        this.apiService
            .getInstance()
            .core.changesApi.removeAssoc(nodeId, nodeIdDelte)
            .then(() => {
                let pos = nodosAsociaciones.entries.findIndex(
                    (node) => node.entry.id == nodeId
                );
                nodosAsociaciones.entries.splice(pos, 1);
            });
    }

    openConfirmDeleteDialog(event,documentList?): void {
        let name = null;
        let id = null;
        let file = null;
        let tipo = null;
        // Si event.value es null significa el valor viene de la busqueda y hay que usar otro metodo para acceder a las propiedades
        if (event.value == null) {
            name = event.getValue('entry.name');
            id = event.getValue('entry.id');
            file = event.getValue('entry.isFile');
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
                        () => {
                            this.notificationService.openSnackMessage(
                                `Eliminado  "${name}" `,
                                1200
                            );

                            if (documentList) {
                                documentList.reload();
                            }else{
                                this.changeDetectionEmitter.emit();
                                let pos = this.data.nodosAsociaciones.entries.findIndex(
                                    (node) =>
                                        node.entry == event.getValue('entry')
                                );
                                this.data.nodosAsociaciones.entries.splice(
                                    pos,
                                    1
                                );

                            }
                            
                        },
                        () => {
                            this.notificationService.openSnackMessage(
                                `Error al eliminar  "${name}" `,
                                2000
                            );
                        }
                    );
            }
        });
    }

    openDialogEnlazados(event,DialogAssociatedFiles,ficherosApiConRelacionados?,ficherosRelacionados?): Observable<any> {
        let id = null;
        let name = null;
        // Si event.value es null significa el valor viene de la busqueda y hay que usar otro metodo para acceder a las propiedades
        if (event.value == null) {
          name = event.getValue('name');
          id = event.getValue('id');
        } else {
          name = event.value.entry.name;
          id = event.value.entry.id;
        }
        let posicionArray = ficherosApiConRelacionados.indexOf(id);
        let relacionados: NodeAssociationPagingList = { entries: [] };
        if (posicionArray != -1) {
          relacionados = ficherosRelacionados[posicionArray]
        }
        const dialogRef = this.dialog.open(DialogAssociatedFiles, {
          width: '640px',
          data: { nombreFichero: name, idNodoFichero: id, nodosAsociaciones: relacionados }
        });
    
        return dialogRef.afterClosed();
    
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
        };
        id = event.getValue('entry.id');
        recordatorio = event.getValue('entry.properties')['regu:recordatorio'];
        vencimiento = event.getValue('entry.properties')[
            'regu:fecha_vencimiento'
        ];
        dataRecordatorios.vencimiento = vencimiento;
        if (id !== null && id !== undefined) {
            dataRecordatorios.idNodo = id;
            if (recordatorio !== undefined) {
                recordatorioArray = recordatorio.split('/');
                if (
                    recordatorioArray.find((value) => value == '10dias') !==
                    undefined
                ) {
                    dataRecordatorios.recordatorio10Dias = true;
                }
                if (
                    recordatorioArray.find((value) => value == '5dias') !==
                    undefined
                ) {
                    dataRecordatorios.recordatorio5Dias = true;
                }
                if (
                    recordatorioArray.find((value) => value == '1dia') !==
                    undefined
                ) {
                    dataRecordatorios.recordatorio1Dia = true;
                }
                if (
                    recordatorioArray.find((value) => value == 'vencido') !==
                    undefined
                ) {
                    dataRecordatorios.recordatorioVencido = true;
                }
            }
            const dialogRef = this.dialog.open(DialogReminder, {
                width: '340px',
                data: dataRecordatorios,
            });

            dialogRef.afterClosed().subscribe(() => {});
        }
    }

    openDialogTags(event,documentList?): void {
        let id : any;
        if(!isUndefined(event.value))id = event.value.entry.id;
        if(!isUndefined(event.obj))id = event.obj.id;
          const dialogRef = this.dialog.open(DialogTags, {
            width: '500px',
            data: { id: id}
          });
    
          dialogRef.afterClosed().subscribe(result => {
            if(documentList)documentList.reload();
          });
        }
    }
