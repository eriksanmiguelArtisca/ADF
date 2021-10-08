import { Component, ViewChild, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSelectionList } from '@angular/material';
import { DataRow } from '@alfresco/adf-core';

import * as XLSX from 'xlsx';
export interface DialogExport {
    rows : DataRow [];
}

@Component({
  selector: 'dialog-export',
  templateUrl: 'dialog-export.html',
})
export class DialogExport {
  @ViewChild('fields')
  selectCamposExport: MatSelectionList;
  camposExport = [
    "Tipologia",
    'Tipo de Documento',
    'Numero Paginas',
    'Organismo de Destino',
    'Cargo Ejecutivo de Destino',
    'Destinatario',
    'Fecha de Entrada',
    'Remitente',
    'Modo de Envio',
    'Organismo de Origen',
    'Cargo Ejecutivo de Origen',
    'Fecha Escrito',
    'Fecha de Salida',
    'Seguimiento'
  ];
  constructor(public dialogRef: MatDialogRef<DialogExport>,
    @Inject(MAT_DIALOG_DATA)
    public data: DialogExport) {
  }
  /*   exportart(){
      .forEach(datarow => {
        datarow.getValue('id')
      });
    } */
  obtenerMetadatos(campo) {
    let metadato = null;
    switch (String(campo)) {
      case "Tipologia":
        metadato = 'regu:tipologia_doc';
        break;
      case 'Tipo de Documento':
        metadato = 'regu:tipo_doc';
        break;
      case 'Numero Paginas':
        metadato = 'regu:numero_paginas';
        break;
      case 'Organismo de Destino':
        metadato = 'regu:org_destino';
        break;
      case 'Cargo Ejecutivo de Destino':
        metadato = 'regu:cargo_ejec_destino';
        break;
      case 'Destinatario':
        metadato = 'regu:destinatario';
        break;
      case 'Fecha de Entrada':
        metadato = 'regu:fecha_entrada';
        break;
      case 'Remitente':
        metadato = 'regu:remitente';
        break;
      case 'Modo de Envio':
        metadato = 'regu:modo_envio';
        break;
      case 'Organismo de Origen':
        metadato = 'regu:org_origen';
        break;
      case 'Cargo Ejecutivo de Origen':
        metadato = 'regu:cargo_ejec_origen';
        break;
      case 'Fecha Escrito':
        metadato = 'regu:fecha_escrito';
        break;
      case 'Fecha de Salida':
        metadato = 'regu:fecha_salida';
        break;
      case 'Seguimiento':
        metadato = 'regu:valoracion_inicial';
        break;
      case 'Nombre':
        metadato = 'name';
        break;
      case 'Tamaño (Bytes)':
        metadato = 'content.sizeInBytes';
        break;
      case 'Modificado':
        metadato = 'modifiedAt';
        break;
      case 'Ultimo Modificador':
        metadato = 'modifiedByUser.displayName';
        break;
      default:
        metadato = campo;
        break;
    }
    return metadato;
  }
  exportFile() {
    let valores = ['Nombre', 'Tamaño (Bytes)', 'Modificado', 'Ultimo Modificador'];
    this.selectCamposExport.selectedOptions.selected.forEach(campo => {
      valores.push(campo.getLabel().trim());
    });
    /* create new workbook */
    var workbook = XLSX.utils.book_new();
    let datos = [];
    var widths = [];
    /* create new worksheet with headers */
    var worksheet = XLSX.utils.aoa_to_sheet([valores]);
    worksheet['!cols'] = [];
    this.data.rows.forEach(fila => {
      let datosFila = [];
      var self = this;
      valores.forEach(function (campo, indice) {
        let metadato = self.obtenerMetadatos(campo);
        if (indice > 3) {
          metadato = 'properties.' + metadato;
        }
        let value = fila.getValue(metadato);
        datosFila.push(value);
        if (widths[indice] == undefined) {
          widths[indice] = { wch: campo.length + 2 };
        }
        else if (widths[indice] == undefined || widths[indice].wch < (String(value)).length + 2) {
          widths[indice] = { wch: (String(value)).length + 2 };
        }
      });
      datos.push(datosFila);
    });
    worksheet['!cols'] = widths;
    worksheet['!cols'][2].wch = 20;
    worksheet = XLSX.utils.sheet_add_aoa(worksheet, datos, { origin: -1 });
    /* add the worksheet to the workbook */
    XLSX.utils.book_append_sheet(workbook, worksheet, 'listado');
    XLSX.writeFile(workbook, 'exportacion.xlsx');
    this.dialogRef.close();
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}