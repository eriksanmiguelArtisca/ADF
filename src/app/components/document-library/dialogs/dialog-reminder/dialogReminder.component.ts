import { Component, Inject, AfterViewInit } from '@angular/core';
import { AlfrescoApiService } from '@alfresco/adf-core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

declare var $: any;

export interface DialogRecordatorio {
  idNodo: string;
  vencimiento: string;
  recordatorio10Dias: boolean;
  recordatorio5Dias: boolean;
  recordatorio1Dia: boolean;
  recordatorioVencido: boolean;
}

@Component({
  selector: 'dialog-reminder',
  templateUrl: 'dialog-reminder.html',
})

export class DialogReminder implements AfterViewInit {
  fechavencimiento: any = new Date();
  constructor(public dialogRef: MatDialogRef<DialogReminder>,
    @Inject(MAT_DIALOG_DATA)
    public data: DialogRecordatorio, private apiService: AlfrescoApiService) {
  }
  ngAfterViewInit(): void {
    this.apiService.getInstance().nodes.getNodeInfo(this.data.idNodo).then(() => {
    });
  }
  limpiarVencimiento() {
    this.data.recordatorio10Dias = false;
    this.data.recordatorio5Dias = false;
    this.data.recordatorio1Dia = false;
    this.data.recordatorioVencido = false;
    this.data.vencimiento = null;
    $("#fechavencimiento").val("");
  }
  updateReminder() {
    let recordatorios = [];
    let updateBody = {
      "properties": {}
    };
    if (this.data.recordatorio10Dias) {
      recordatorios.push("10dias");
    }
    if (this.data.recordatorio5Dias) {
      recordatorios.push("5dias");
    }
    if (this.data.recordatorio1Dia) {
      recordatorios.push("1dia");
    }
    if (this.data.recordatorioVencido) {
      recordatorios.push("vencido");
    }
    let recordatorio = recordatorios.join('/');
    updateBody.properties["regu:recordatorio"] = recordatorio;
    if (this.data.vencimiento !== null) {
      var fechavenci = $("#fechavencimiento").val() + '';
      var fechavencimientoaux = fechavenci.split('/');
      this.fechavencimiento = fechavencimientoaux[2] + '-' + fechavencimientoaux[1] + '-' + fechavencimientoaux[0] + "T00:00:00.000";
      updateBody.properties["regu:fecha_vencimiento"] = this.fechavencimiento;
    }
    else {
      updateBody.properties["regu:fecha_vencimiento"] = null;
    }
    this.apiService.getInstance().nodes.updateNode(this.data.idNodo, updateBody);
    /*
   let body = new NodeBodyUpdate(updateBody )
   
   if(recordatorio.length > 0){
     this.apiService.getInstance().nodes.updateNode(this.data.idNodo,body);
   } */
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}