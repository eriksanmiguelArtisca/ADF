import { Component, OnInit, ViewChild } from '@angular/core';
import {UploadFileComponent } from '../upload-excel-filter/upload-file.component';
import { DownloadZipDialogComponent, SearchService, NotificationService } from '@alfresco/adf-core';
import { ResultSetRowEntry, DownloadBodyCreate, QueryBody } from '@alfresco/js-api';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material';
import { isUndefined } from 'util';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment-es6';

declare var $: any;

@Component({
  selector: 'app-dowload-files-panel',
  templateUrl: './dowload-files-panel.component.html',
  styleUrls: ['./dowload-files-panel.component.scss']
})
export class DowloadFilesPanelComponent implements OnInit {
  filterType: string;

  searchCategories:any[];
  searchCategories1:any[];
  excelQuery : string; 
  resultSetRowEntry:ResultSetRowEntry[];
  downloadId = "";
  observable : Subscription;
  buscando : boolean; 

  filters  : [] = [];
  

  @ViewChild('uploadFileComponent')
  uploadFileComponent: UploadFileComponent;
  
  constructor(private route: ActivatedRoute, private dialog: MatDialog,  private searchService:SearchService,private notificationService: NotificationService) {
    
   }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.filterType = params['filterType'];
      if(this.filterType == 'file'){
        $('#btn-export-filters').hide();
        $('#btn-reset-filters').hide();
        $('#btn-export-file').show();

        $('#fieldset-search').hide();
        $('#app-upload-file').show();
        
        let buttons_bar = $("#buttons-bar div").detach();
        buttons_bar.appendTo('#upload-file-container-bar');
      }else{
        $('#btn-export-filters').show();
        $('#btn-reset-filters').show();
        $('#btn-export-file').hide();
        
        $('#app-upload-file').hide();
        $('#fieldset-search').show();
        
        let buttons_bar = $("#upload-file-container-bar  div").detach();
        buttons_bar.appendTo('#buttons-bar'); 
      }
    });
  }
  
  limpiar(){
    this.filters = [];
  }

  
  /**
   * Genera una descaga en base a los resultados de una busqueda
   * @param entries Resultados de  una busqueda
   * @returns afterClosed observable
   */
  downloadZip(entries : ResultSetRowEntry[]) {
    var entriesIds : DownloadBodyCreate = { "nodeIds" : [] };  ;
    entries.forEach(entry => {
        entriesIds.nodeIds.push(entry.entry.id);
    });

      const dialogRef = this.dialog.open(DownloadZipDialogComponent, {
        width: '600px',
        data: {
          nodeIds: entriesIds.nodeIds
        }
      });

      return dialogRef.afterClosed();
  }
  /**
   * Genera los filtros con los datos introducidos y hacemos una busqueda
   */
  exportarFicheros(){
    this.buscando = true; 
   let result_filters = [];
     Object.keys(this.filters).forEach(metadataKey => {
      if(this.filters[metadataKey].length > 0 || (metadataKey == 'fi:fecha_contable_' && this.filters[metadataKey]!==null) ){
        let filter = this.generateFilter( metadataKey );
        if( filter )result_filters.push(filter);
        else return;
      }
    });  
    let search_query = result_filters.join(' AND ');
    /* let search_query = '( fi:sociedad >= "0446" AND fi:sociedad <= "8700" )' ; */
    this.searchQuery(search_query);
  }
  /**
   * Genera un filtro en base a un metadato
   */
  generateFilter(metadataKey : string ){
    let result_filter = '';
    let multi_aspect_metadata = [];
    let filterValue = moment.isMoment(this.filters[metadataKey]) ? moment(this.filters[metadataKey]).format('YYYY-MM-DDT00:00:00.000') : this.filters[metadataKey] ;
    let total_lenght = 10;
    let allowRanges = true;

    switch (metadataKey) {
      case 'fi:proveedor_sap_':
        multi_aspect_metadata = [ "pdp","an","mm","ap"];
        total_lenght = 10;
        break;
      case 'fi:fecha_contable_':
        multi_aspect_metadata = [ "mm","sd","ap","ad","an","pdp"];
        allowRanges = false;
        total_lenght = 0;
        break;
      case 'fi:numero_factura_':
        multi_aspect_metadata = [ "pdp","an","mm","sd"];
        break;
      case 'fi:sociedad':
      case 'fi:ejercicio':
        total_lenght = 4;
        break;
      default:
        break;
    }
    // Si tiene o no  valores multiples recorremos los filtros para comprobar si tiene rangos
    let multiple_filters = filterValue.split(',');
    multiple_filters.forEach(filter => {
      if(result_filter.length > 0) result_filter += ' OR '; 
      else  result_filter += '(';
      // comprobamos si tiene algun rango en el filtro y ese campo tiene permitido el filtro de rango o es una fecha
      let range_filter = filter.split('-');
      if (range_filter.length > 1 && allowRanges) {
        let filter_value_start = ''+this.addZerosLeft(range_filter[0],total_lenght);
        let filter_value_end = ''+this.addZerosLeft(range_filter[1],total_lenght);
        if(multi_aspect_metadata.length > 0 ){
            let variants_filter = [];
            // Si el campo existe en varios aspectos creamos el filtro con cada terminacion del metadato
            multi_aspect_metadata.forEach(metadataVariant=>{
              let variant_filter = metadataKey+metadataVariant+ ':[' + filter_value_start+ ' TO ' + filter_value_end + ']';
              variants_filter.push(variant_filter);
            });
            result_filter += variants_filter.join(' OR ');
          }else{
            result_filter += metadataKey+ ':[' + filter_value_start+ ' TO ' + filter_value_end + ']';
          }
      } else {
        let filter_value = ''+this.addZerosLeft(filter,total_lenght);
        if(multi_aspect_metadata.length > 0 ){
          let variants_filter = [];
          // Si el campo existe en varios aspectos creamos el filtro con cada terminacion del metadato
          multi_aspect_metadata.forEach(metadataVariant=>{
            let variant_filter = metadataKey+metadataVariant+ ':' + filter_value ;
            variants_filter.push(variant_filter);
          });
          result_filter += variants_filter.join(' OR ');
        }else{
          result_filter += metadataKey+ ':' + filter_value;
        }
        
      }
    },this);
    result_filter += ')';
    return result_filter;
  }
  /**
   * Rellena con zeros a la izquierda
   * @param value valor
   * @param numberOfDigits el numero de digitos totales
   */
  addZerosLeft(value , numberOfDigits){
    let retunValue = value.toString();
    while( retunValue.length < numberOfDigits ){
      retunValue = '0'+ retunValue; 
    }
    return retunValue;
  }
  /**
   * Genera los filtros con el fichero y hacemos una busqueda
   */
  exportarDeFichero(){
    this.buscando = true; 
    let query = "";

    this.uploadFileComponent.json.forEach(line => {
      if( !isUndefined(line[0]) && !isUndefined(line[1]) && !isUndefined(line[2]) ) {
        line[0] = line[0].toString();
        line[1] = line[1].toString();

        if( query.length>0 ) query +=" OR "; 
        line[0] = this.addZerosLeft(line[0],4);
        line[1] = this.addZerosLeft(line[1],10);
        query += "(fi:sociedad:'"+line[0]+"' AND fi:numero_documento_sap:'"+line[1]+"' AND fi:ejercicio:"+line[2]+")";
      }
    });
    this.searchQuery(query);
  }
  /**
   * Ejecuta una busqueda con la query recibida y genera una descarga de los resultados
   */
  private searchQuery(query) {
    if (query.length > 0) {
      this.searchService.searchByQueryBody(this.generateQueryBody(query, 6000, 0)).subscribe(success => {
        this.buscando = false;
        if (success.list.pagination.count > 0) {
          this.downloadZip(success.list.entries).subscribe(zip => {
            if (success.list.pagination.hasMoreItems) {
              this.notificationService.openSnackMessage("La búsqueda tiene " + success.list.pagination.totalItems + " por lo que se procedera a limitar los resultados a 6000");
              //this.nextZip(50);
            }
          });
        }
        else {
          if(this.filterType == 'file') this.notificationService.openSnackMessage("No se ha encontrado ningún fichero con los datos del excel");
          else this.notificationService.openSnackMessage("No se ha encontrado ningún resultado con esos filtros");
        }
      }, error => {
        this.buscando = false;
        this.notificationService.openSnackMessage("Ha surgido un error durante la busqueda");
      });
    }
    else {
      this.buscando = false;
      if(this.filterType == 'file') this.notificationService.openSnackMessage("No tienes ningún fichero seleccionado");
    }
  }
  /**
   * Genera un querybody
   */
  generateQueryBody(query, maxResults: number, skipCount: number): QueryBody {
    const defaultQueryBody: QueryBody = {
        query: {
            query: query
        },
        /* include: ['path', 'allowableOperations','properties'], */
        paging : {
          maxItems : maxResults,
          skipCount: skipCount
        },
        filterQueries: [
            { query: "TYPE:'cm:content'" },
            { query: "content.mimetype:'application/pdf'" }/* ,
            { query: 'NOT cm:creator:System' } */]
    };

    return defaultQueryBody;
}

  

}
