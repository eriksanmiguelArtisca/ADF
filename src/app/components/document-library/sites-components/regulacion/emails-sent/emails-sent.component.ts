import { Component,ViewChild,ChangeDetectorRef,OnInit } from '@angular/core';
import { RowFilter, ShareDataRow } from '@alfresco/adf-content-services';
import { DataTableComponent,DataCellEvent,DataRowActionEvent,AlfrescoApiService}  from '@alfresco/adf-core';
import { DialogSendEmail } from "../../../dialogs/dialog-send-email/dialogSendEmail.component";
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material';
import { DatePipe } from '@angular/common';
import { isNull, isUndefined } from 'util';

import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MOMENT_DATE_FORMATS } from '@alfresco/adf-core';

  
declare var $: any;

@Component({
  selector: 'app-emails-sent',
  templateUrl: './emails-sent.component.html',
  styleUrls: ['./emails-sent.component.css'],
  	providers: [
		{ provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
		{ provide: MAT_DATE_FORMATS, useValue: MOMENT_DATE_FORMATS }
	]
})


  
export class EmailSentComponent implements OnInit{
  data: any = [];
  dataaux : any = [];
  schema: any;
  asunto: string;
  name: string;
  filtro:RowFilter = null;
  modificadoPorFiltro: string ="";
  nombreFicheroFiltro: string ="";
  vencimientoFiltro: string ="";
  subscription : Subscription;
  navigationSubscription: Subscription;
  usercorreo : string = "";
  fechadesdedocaux : string = "";
  fechahastadocaux : string = "";
  fechadesdevencidocaux : string = "";
  fechahastavencidocaux : string = "";
  
   @ViewChild('dataTable')
  dataTable: DataTableComponent;
  constructor(private dialog: MatDialog,private changeDetector: ChangeDetectorRef, private adapter: DateAdapter<any>,private apiService: AlfrescoApiService) {  
  	this.adapter.setLocale('es');
 this.schema =
          [
              {
                  type: 'text',
                  key: 'destinatario',
                  title: 'Destinatario',
                  sortable: true
              },
              {
                type: 'date',
                key: 'fechaenvio',
                title: 'Fecha envio',
                sortable: true,
                format:'dd/MM/yyyy HH:mm'
            },
             {
                type: 'text',
                key: 'docnombre',
                title: 'Doc. Asociado',
                sortable: true
            }, 
			{
                  type: 'date',
                  key: 'fechavencimiento',
                  title: 'Fecha venc doc',
                  sortable: true,
                  format:'dd/MM/yyyy'
              },
              {
                type: 'text',
                key: 'asunto',
                title: 'Asunto',
                sortable: true
            },
             {
                type: 'text',
                key: 'envio',
				title: 'Enviado',
                sortable: true
            }

          ];
	

      
}
	ngOnInit() {
  this.cargar();

		}


		resetFormdesde(){
			$("#fechadesde").val("");
			this.fechadesdedocaux="";
		}
		resetFormhasta(){
				$("#fechahasta").val("");	
				this.fechahastadocaux = "";
		}
				resetFormdesdevenci(){
			$("#fechadesdevenci").val("");
			this.fechadesdevencidocaux="";
		}
		resetFormhastavenci(){
				$("#fechahastavenci").val("");	
				this.fechahastavencidocaux="";
		}
		limpiar(){
					$("#fechadesde").val("");	
					$("#fechahasta").val("");
					$("#fechadesdevenci").val("");	
				    $("#fechahastavenci").val("");
					$("#nombre2").val("");
					this.fechadesdedocaux  = "";
				    this.fechahastadocaux  = "";
					this.fechadesdevencidocaux  = "";
					this.fechahastavencidocaux = "";
					this.cargar();
						
		}
cargar(){
			this.apiService.peopleApi.getPerson('-me-').then(result => {
					this.usercorreo = result.entry.email;
	  this.data = [];
	    this.dataaux = [];
	  this.dataTable.data = null;
		this.dataTable.loading = true;
		
		var busqueda = $("#nombre2").val() + "";
		if(busqueda == 'undefined' || busqueda == '')busqueda = null;
	 
            	var fechadesde = $("#fechadesde").val() + "";
                
				var fechadesdeEsp = fechadesde.substring(0, 2) + "-" + fechadesde.substring(3, 5) + "-" + fechadesde.substring(6, 10);

				if (fechadesde == 'undefined' || fechadesde == '') fechadesde = null; else fechadesde = fechadesdeEsp;

				var fechahasta = $("#fechahasta").val() + "";

				var fhastaEsp = fechahasta.substring(0, 2) + "-" + fechahasta.substring(3, 5) + "-" + fechahasta.substring(6, 10);

				if (fechahasta == 'undefined' || fechahasta == '') fechahasta = null; else fechahasta = fhastaEsp;
				
		    	var fechadesdevenci = $("#fechadesdevenci").val() + "";
                
				var fechadesdeEspvenci = fechadesdevenci.substring(0, 2) + "-" + fechadesdevenci.substring(3, 5) + "-" + fechadesdevenci.substring(6, 10);

				if (fechadesdevenci == 'undefined' || fechadesdevenci == '') fechadesdevenci = null; else fechadesdevenci = fechadesdeEspvenci;

				var fechahastavenci = $("#fechahastavenci").val() + "";

				var fhastaEspvenci = fechahastavenci.substring(0, 2) + "-" + fechahastavenci.substring(3, 5) + "-" + fechahastavenci.substring(6, 10);

				if (fechahastavenci == 'undefined' || fechahastavenci == '') fechahastavenci = null; else fechahastavenci = fhastaEspvenci;


		 
		var data = encodeURI('destinatario=' + busqueda + '&' + 'fechavencimientodesde=' + fechadesdevenci + '&' + 'fechavencimientohasta=' + fechahastavenci + '&' + 'fdesde=' + fechadesde + '&' + 'fhasta=' + fechahasta+ '&' + 'usuario=' + this.usercorreo +'');
		var xhr = new XMLHttpRequest();
		var this1 = this;
		xhr.addEventListener("readystatechange", function () {
			if (this.readyState === 4) {
				if (this.responseText != "") {
					var data1 = JSON.parse(this.responseText);
			if(data1!=undefined){
					this1.dataaux = data1;
			
		
	      if(this1.dataaux.EV.length != 0)this1.dataTable.loading=false;
		  if(this1.dataaux.EV.length >1){
		              this1.dataaux.EV.forEach(element => {

            this1.data.push(element);
		  });
		  }else
		  {
			this1.data.push( this1.dataaux.EV);  
		  }
			
		   this1.changeDetector.detectChanges();

					}else{
						this1.dataTable.loading=false;
					}
				  
			
				}else{
					this1.dataTable.loading=false;
				}
			}

		});

		xhr.open("POST", "./WSRegulacionRest/jcmouse/restapi/rest/");
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.send(data);
		
		
	});
		 

}
  
onShowRowActionsMenu(event: DataCellEvent) {

	let aviso = { title: 'Visualizar / Enviar aviso' , icon :"mail" };
    let acciones = [aviso];
	 event.value.actions = acciones;

}



onExecuteRowAction(event: DataRowActionEvent) {
  //this.documentList.
  let args = event.value;
 // let id = args.row.getValue('id');
  switch (args.action.title) {

    case 'Visualizar / Enviar aviso':
    const dialogRef = this.dialog.open(DialogSendEmail, {
      width: '840px',
      height: '835px',
      data: {name:args.row.getValue('docnombre'), path:"//"+args.row.getValue('docpath'),vencimiento:args.row.getValue('fechavencimiento'), asunto : args.row.getValue('asunto'),cuerpo : args.row.getValue('cuerpo')}
    });

    let sub = dialogRef.afterClosed().subscribe(result => {
      this.asunto = result;
    });
    if(this.subscription == undefined){
      this.subscription = sub;
    }else{
      this.subscription.add(sub);
    }
      break; 
    
    default:
      break;
  }

}


  filtrar(event){
      this.filtro = (row: ShareDataRow) => {
      let node = row.node.entry;
        let nombreUsuarioTabla : string = node.createdByUser.displayName;
        let nombreFicheroTabla : string = node.name;
        let vencimientoTabla : any = '';
        let pipe = new DatePipe('en-US');
        if( !isUndefined(node.properties) && !isUndefined(node.properties["regu:fecha_vencimiento"])){
          vencimientoTabla = node.properties["regu:fecha_vencimiento"];
          vencimientoTabla = pipe.transform(vencimientoTabla,'dd/MM/yyyy').toString();
        }

        
        if( !isNull(this.vencimientoFiltro) && !isUndefined(this.vencimientoFiltro) && this.vencimientoFiltro !=='' ){
          if ( ( this.mostrarFilaTabla(nombreUsuarioTabla,this.modificadoPorFiltro) && this.mostrarFilaTabla(nombreFicheroTabla,this.nombreFicheroFiltro) && (this.mostrarFilaTabla(vencimientoTabla,(pipe.transform(this.vencimientoFiltro,'dd/MM/yyyy').toString()) )  )) ) {
            return true;
          } else{
            return false;
          }
        }else{
          if ( ( this.mostrarFilaTabla(nombreUsuarioTabla,this.modificadoPorFiltro) && this.mostrarFilaTabla(nombreFicheroTabla,this.nombreFicheroFiltro) ) ) {
            return true;
          }else{
            return false;
          } 
        }         

    };
  }

  mostrarFilaTabla(textoCeldaTabla : string , textoFiltro : string  ){
      if(textoCeldaTabla.toLowerCase().includes(textoFiltro.toLowerCase()) || textoFiltro == "" ){
        return true;
      }
      return false;  
  } 
}
