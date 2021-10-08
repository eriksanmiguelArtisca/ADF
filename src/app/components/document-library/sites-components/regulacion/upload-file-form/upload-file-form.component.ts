import { Component } from "@angular/core";
import { NotificationService, AlfrescoApiService } from "@alfresco/adf-core";
import { ContentNodeDialogService } from "@alfresco/adf-content-services";
import { MinimalNode, NodeBodyUpdate} from "@alfresco/js-api";
import { ActivatedRoute, Router } from "@angular/router";
import {FormControl,Validators} from '@angular/forms';
import { Subscription } from "rxjs";
declare var $: any;
export const MY_FORMATS = {
  parse: {
    dateInput: "DD/MM/YYYY"
  },
  display: {
    dateInput: "DD/MM/YYYY",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY"
  }
};

@Component({
  selector: "upload-file-form",
  templateUrl: "./upload-file-form.component.html",
  styleUrls: ["./upload-file-form.component.scss"]
})
export class UploadFileForm {
  sub: Subscription;
  
  carpetaSubida: string = "";
  
  horaEntradaControl = new FormControl(null,{ validators :[ Validators.pattern('([01]?[0-9]|2[0-3]):[0-5][0-9]') ]/* , updateOn: 'blur' */ } );
  horaSalidaControl = new FormControl(null,{ validators :[ Validators.pattern('([01]?[0-9]|2[0-3]):[0-5][0-9]') ]/* , updateOn: 'blur' */ } );
  horaEscritoControl = new FormControl(null,{ validators :[ Validators.pattern('([01]?[0-9]|2[0-3]):[0-5][0-9]') ]/* , updateOn: 'blur' */ } );

  nodoRelacionados: MinimalNode[] = [];
  archivoRegulacion: MinimalNode = null;
  nodoRegulacion = {
    tipologia: "",
    revisado: "",
    tipoDocumento: "",
    numeroPaginas: "",
    organismoDestino: "",
    cargoEjecutivoDestino: "",
    destinatario: "",
    fechaEntrada: "",
    horaEntrada: "",
    remitente: "",
    modoEnvio: "",
    organismoOrigen: "",
    cargoEjecutivoOrigen: "",
    fechaEscrito: "",
    horaEscrito: "",
    fechaSalida: "",
    horaSalida: "",
    seguimiento: ""
  };
  ruta: Promise<void>;
  fecha: any = new Date();
  fecha1: any = new Date();
  fecha2: any = new Date();
  constructor(
    private apiService: AlfrescoApiService,
    private contentDialogService: ContentNodeDialogService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {

  }

  ngAfterContentInit() {
    //this.carpetaSubida = this.route.snapshot.paramMap.get("carpetaSubida");
    this.sub = this.route.params.subscribe(params => {
      this.carpetaSubida = params['carpeta-subida'];
      this.ruta = params['path'];
    });
  }
  ngOnDestroy() {
    if (this.sub) {
        this.sub.unsubscribe();
    }

  }

  abrirBrowserDialog() {
    
    this.contentDialogService
      .openFileBrowseDialogBySite()
      .subscribe((selections: MinimalNode[]) => {
        let existe = false;
        this.nodoRelacionados.forEach(nodo => {
          if (nodo.id == selections[0].id) {
            existe = true;
          }
        });
        if (!existe) {
          this.nodoRelacionados.push(selections[0]);
        }
      });
  }

  quitarFicheroRegulacion(nodo: MinimalNode) {
    this.apiService.getInstance().nodes.deleteNodePermanent(nodo.id);
    this.archivoRegulacion = null;
  }

  quitarNodoRelacionado(nodo: MinimalNode) {
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
    let datos = this.nodoRegulacion;

    if (datos.fechaEntrada !== "") {
	var fechaentrada = $("#fechaentrada").val() + '';
		var fechaentradaaux = fechaentrada.split('/');

      if (datos.horaEntrada !== "") {
        this.fecha =fechaentradaaux[2]+'-'+fechaentradaaux[1]+'-'+fechaentradaaux[0]+ 'T' + datos.horaEntrada + ':00.000';
	
      } else {
        this.fecha =fechaentradaaux[2]+'-'+fechaentradaaux[1]+'-'+fechaentradaaux[0]+  "T00:00:00.000";
      }
    }

    if (datos.fechaEscrito !== "") {
 	var fechaescrito = $("#fechaescrito").val() + '';
		var fechaescritoaux = fechaescrito.split('/');
		
   if (datos.horaEscrito !== "") {
        this.fecha1 =fechaescritoaux[2]+'-'+fechaescritoaux[1]+'-'+fechaescritoaux[0]+ 'T' + datos.horaEscrito + ':00.000';
	
      } else {
        this.fecha1 =fechaescritoaux[2]+'-'+fechaescritoaux[1]+'-'+fechaescritoaux[0]+  "T00:00:00.000";
      }
      }
    

    if (datos.fechaSalida !== "") {
 	var fechasalida = $("#fechasalida").val() + '';
		var fechasalidaaux = fechasalida.split('/');
		
   if (datos.horaSalida !== "") {
        this.fecha2 =fechasalidaaux[2]+'-'+fechasalidaaux[1]+'-'+fechasalidaaux[0]+ 'T' + datos.horaSalida + ':00.000';
	
      } else {
        this.fecha2 =fechasalidaaux[2]+'-'+fechasalidaaux[1]+'-'+fechasalidaaux[0]+  "T00:00:00.000";
      }
      }

    let propiedades = [
      ["regu:cargo_ejec_destino", datos.cargoEjecutivoDestino ],
      ["regu:cargo_ejec_origen", datos.cargoEjecutivoOrigen],
      ["regu:destinatario", datos.destinatario], 
      ["regu:fecha_entrada", this.fecha], 
      ["regu:fecha_escrito", this.fecha1],
      ["regu:fecha_salida", this.fecha2],
      ["regu:modo_envio", datos.modoEnvio],
      ["regu:numero_paginas", datos.numeroPaginas ? datos.numeroPaginas : '0'],
      ["regu:org_destino", datos.organismoDestino],
      ["regu:org_origen", datos.organismoOrigen],
      ["regu:remitente", datos.remitente],
      ["regu:revisado", datos.revisado],
      ["regu:tipo_doc", datos.tipoDocumento],
      ["regu:tipologia_doc", datos.tipologia],
      ["regu:valoracion_inicial", datos.seguimiento]
    ];
    let propiedadesBody = {
      
    };
    propiedades.forEach(propiedad => {
      if (propiedad[1].length > 0) {
        propiedadesBody[propiedad[0]] = propiedad[1];
      }
    });
    let nodeBody = <NodeBodyUpdate>{
      properties: propiedadesBody
    };
    this.apiService
      .getInstance()
      .upload.updateNode(this.archivoRegulacion.id, nodeBody).then(success => {
        this.notificationService.openSnackMessage("El fichero se ha creado correctamente");
        this.nodoRelacionados.forEach(nodo => {
          this.apiService.getInstance()
            .upload.createAssociation(this.archivoRegulacion.id,{
              targetId: nodo.id,
              assocType: "regu:relatedDocuments"
            });
        });
        this.router.navigate(["content/documentlist"]);

      },error =>{
        this.notificationService.openSnackMessage("Se ha producido un error al crear el fichero",4000);
      }
    );
  }
  cancelarSubida() {
    if(this.archivoRegulacion){
      this.quitarFicheroRegulacion(this.archivoRegulacion);
    }
    this.router.navigate(["content/documentlist"]);
  }

  onUploadPermissionFailed($event) {
    this.notificationService.openSnackMessage(
      "No tienes el permiso de creacion necesario para subir el contenido",
      4000
    );
  }

  onUploadSuccess(event) {
    this.archivoRegulacion = event.value.entry;
  }

  
}
