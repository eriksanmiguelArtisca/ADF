import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { ActivatedRoute, Router } from '@angular/router';
import { MetadataService, CustomDialogsService, TableActionsService } from '../../../../services';
import { Node, NodeBodyUpdate } from '@alfresco/js-api';
import { AlfrescoApiService, NotificationService, CookieService } from '@alfresco/adf-core';
import { MatSnackBar } from '@angular/material';
import { Location } from '@angular/common';
import moment from 'moment-es6';


interface FinancieroMetadata {
    display: string;
    value: string;
    metadata: string;
}

/*declare var $: any; */

@Component({
    selector: 'app-create-node',
    templateUrl: './create-node.component.html',
    styleUrls: ['./create-node.component.scss'],
})
export class CreateNodeComponent implements OnInit, AfterViewInit {


    title = "Nuevo Fichero"
    subtitle = "Ruta subida : "
    site: any;
    fields: any[] = [];
    fieldsaux: any[] = [];
    formValues: [] = [];
    timeFieldValues = [];
    association = {};

    sub: Subscription;
    carpetaSubida: string = '';
    ruta: string;

    nodoRelacionados: Node[] = [];
    uploadFile: Node = null;
    updateNode: Node = null;
    selectedOptions: any = '';

    financiero: FinancieroMetadata[] = [

        {
            display: 'Factura MM',
            value: 'fi_factura_mm',
            metadata: 'fi:factura_mm'
        },
        {
            display: 'Factura PDP',
            value: 'fi_factura_pdp',
            metadata: 'fi:factura_pdp'
        },
        {
            display: 'Factura SD',
            value: 'fi_factura_sd',
            metadata: 'fi:factura_sd'
        },
        {
            display: 'Avales Proveedores',
            value: 'fi_avales_proveedor',
            metadata: 'fi:avales_proveedor'
        },
        {
            display: 'Avales Deudores',
            value: 'fi_avales_deudor',
            metadata: 'fi:avales_deudor'
        },
        {
            display: 'Anticipos',
            value: 'fi_anticipos',
            metadata: 'fi:anticipos'
        }
    ];


    constructor(
        private route: ActivatedRoute,
        private metadataService: MetadataService,
        private customDialogService: CustomDialogsService,
        private apiService: AlfrescoApiService,
        private notificationService: NotificationService,
        private snackBar: MatSnackBar,
        private location: Location,
        private tableActionSerice: TableActionsService,
        private cookiesService: CookieService,
        public router: Router,
        private changeDetector: ChangeDetectorRef
    ) {

    }

    ngAfterViewInit(): void {
        this.fieldsaux = [];
        if (window.history.state['nodeChildAssociationEntry']) {
            if (window.history.state['nodeChildAssociationEntry'].entry) {
                this.updateNode = window.history.state['nodeChildAssociationEntry'].entry;
            } else {
                this.updateNode = window.history.state['nodeChildAssociationEntry'];
            }
        }


        if (this.updateNode) {

            Object.keys(this.updateNode.properties).map(key => {
                if (key !== "cm:lastThumbnailModification" &&
                    key !== "cm:versionLabel" &&
                    key !== "cm:versionType" &&
                    key !== "cm:taggable") {
                    this.formValues[key] = this.updateNode.properties[key];
                }
            })
            Object.keys(this.formValues).filter((key) => key.includes('fecha')).map(key => {
                this.timeFieldValues[key] = moment(this.formValues[key]).format('HH:mm');
            })

            this.apiService.nodesApi.getTargetAssociations(this.updateNode.id, { 'include': ['aspectNames', 'properties', 'isLink', 'path', 'allowableOperations'] }).then(nodeAssociation => {
                nodeAssociation.list.entries.map(node => {
                    this.nodoRelacionados.push(node.entry);
                })
            });
            this.changeDetector.detectChanges();
            this.title = "Editar fichero";
            this.subtitle = this.updateNode.name;
        } else {
            this.subtitle = "Ruta subida : " + this.ruta;
        }

        this.financiero.forEach(element => {
            let resultado = this.updateNode.aspectNames.indexOf(element.metadata);
            if (resultado != -1) {
                this.getSelectedOptions(element.value);
                this.selectedOptions = element.value;
            }
        });

    }

    ngOnInit() {

        this.site = this.cookiesService.getItem('site');
        this.sub = this.route.params.subscribe((params) => {
            this.carpetaSubida = params['carpeta-subida'];
            if (this.carpetaSubida == "1") {
                this.carpetaSubida = null;
            }
            this.ruta = params['path'];

        });

        this.metadataService.getMetadata(undefined).then((metadata) => {
            this.fields.push({ constrains: [], dataType: 'Titulo', name: '', title: "Documento Financiero" });
            this.fieldsaux.push({ constrains: [], dataType: 'Titulo', name: '', title: "Documento Financiero" });
         
            metadata[0].forEach(element1 => {
                this.fields.push(element1);
                this.fieldsaux.push(element1);
            });
            Object.keys(metadata[1]).forEach(association => {
                this.association = metadata[1][association];
            });

            this.snackBar.dismiss();
        });


    }
    validate(event){
      if(isNaN(this.formValues[event.name])==true) this.notificationService.openSnackMessage("El campo " + event.title + " debe ser tipo Númerico, Informar decimal con punto", 4000);
    }

    getSelectedOptions(selected) {
        this.selectedOptions = selected;
        var seletedaux = [];
        var nombre = "";
        this.financiero.forEach(element => {
            if (element.value == selected) nombre = element.display;

        });
        seletedaux.push(selected);
        seletedaux.forEach(element => {
            this.metadataService.getMetadata(element).then((metadata) => {
    
                this.fields = [];
                this.fields = this.fields.concat(this.fieldsaux);
                this.fields.push({ constrains: [], dataType: 'Titulo', name: '', title: nombre });
                metadata[0].forEach(element1 => {
                    this.fields.push(element1);
                });

                Object.keys(metadata[1]).forEach(association => {
                    this.association = metadata[1][association];
                });

                this.snackBar.dismiss();
            });
        });
    };

    abrirBrowserDialog() {
        this.customDialogService
            .openFileBrowseDialogBySite()
            .subscribe((selections: Node[]) => {
                let existe = false;
                this.nodoRelacionados.forEach((nodo) => {
                    if (nodo.id == selections[0].id) {
                        existe = true;
                    }
                });
                if (!existe) {
                    this.nodoRelacionados.push(selections[0]);
                }
            });
    }

    abrirTagsDialog() {
        if (this.uploadFile || this.updateNode) {
            this.tableActionSerice.openDialogTags({
                value: {
                    entry: this.uploadFile ? this.uploadFile : this.updateNode
                }
            });
        } else {
            this.notificationService.openSnackMessage("Es necesario subir un fichero", 4000);
        }
    }

    quitarFicheroSubida(nodo: Node) {
        this.apiService.getInstance().nodes.deleteNodePermanent(nodo.id);
        this.uploadFile = null;
    }

    quitarNodoRelacionado(nodo: Node) {
        this.borrarItem(this.nodoRelacionados, nodo);
    }

    borrarItem(array, item) {
        for (var i in array) {
            if (array[i] == item) {
                array.splice(i, 1);
                break;
            }
        }
    }

    crearNodo() {
        let propiedadesBody = {};
        let valoresactuales = ["cm:title","cm:description","cm:author"];
        for (var valores in this.fields){
            valoresactuales.push(this.fields[valores].name);
        }
     
        if ((this.formValues["polizas:sociedad"] != undefined && this.formValues["polizas:n_poliza"] != undefined) || this.cookiesService.getItem("site") != "polizas") {
            Object.keys(this.formValues).forEach((metadata) => {
             
                let resu = valoresactuales.indexOf(metadata);
                if(resu!=-1){
         
                if (metadata.includes('fecha')) {
                    var fecha = moment(this.formValues[metadata]).format('YYYY-MM-DD');

                    if (this.timeFieldValues[metadata]) {
                        fecha += 'T' + this.timeFieldValues[metadata] + ':00.000';
                    } else {
                        fecha += 'T00:00:00.000';
                    }
                    propiedadesBody[metadata] = fecha;
                } else {
                    propiedadesBody[metadata] = this.formValues[metadata];
                }
            }
            });

            let nodeBody = {};

            if (this.updateNode && this.site=="financiero") {
                let aspectaux = [];
                let metadata = "";
            
                this.financiero.forEach(element => {
                    if (element.value == this.selectedOptions) metadata = element.metadata;
                });

                this.updateNode.aspectNames.forEach(element => {
                    if (element.substr(0, 2) != 'fi') {
                        aspectaux.push(element);
                    }
                });

                aspectaux.push("fi:factura");

                if(metadata!='')aspectaux.push(metadata);
           
                nodeBody = <NodeBodyUpdate>{
                    properties: propiedadesBody,
                    aspectNames: aspectaux

                };
           
            } else {
                nodeBody = <NodeBodyUpdate>{
                    properties: propiedadesBody

                };
            }
          
            let nodeToUpdate = this.uploadFile ? this.uploadFile.id : this.updateNode.id;
            this.apiService
                .getInstance()
                .upload.updateNode
            this.apiService
                .getInstance()
                .upload.updateNode(nodeToUpdate, nodeBody).then(success => {
                    let message = this.uploadFile ? "El fichero se ha creado correctamente" : "El fichero se ha editado correctamente";
                    this.notificationService.openSnackMessage(message);
                    this.nodoRelacionados.forEach(nodo => {
                        this.apiService.getInstance()
                            .upload.createAssociation(nodeToUpdate, {
                                targetId: nodo.id,
                                assocType: this.association["name"]
                            });
                    });
                    this.location.back();

                }, error => {
                    this.notificationService.openSnackMessage("Se ha producido un error al crear el fichero", 4000);
                }
                );
        } else {
            this.notificationService.openSnackMessage("Campos obligatorios: Sociedad y Nº Póliza", 4000);
        }
    }
    cancelarSubida() {
        if (this.uploadFile) {
            this.quitarFicheroSubida(this.uploadFile);
        }
        this.location.back();
    }

    onUploadPermissionFailed($event) {
        this.notificationService.openSnackMessage(
            'No tienes el permiso de creacion necesario para subir el contenido',
            4000
        );
    }

    onUploadSuccess(event) {
      
        this.uploadFile = event.value.entry;
    }
}
