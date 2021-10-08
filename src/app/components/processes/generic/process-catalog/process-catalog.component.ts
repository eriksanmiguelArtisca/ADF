import { Component, OnInit } from '@angular/core';
import { BpmAppsService } from '../../../../services/bpm-apps.service';
import { MatDialog } from '@angular/material';
import { DialogProcessAction } from './dialogs/dialogs.component';
import { Router } from '@angular/router';
import { isUndefined } from 'util';

@Component({
  selector: 'app-process-catalog',
  templateUrl: './process-catalog.component.html',
  styleUrls: ['./process-catalog.component.scss']
})
export class ProcessCatalogComponent implements OnInit {

  constructor(private router : Router, private bpmAppsService : BpmAppsService,private dialog: MatDialog) { 

  }

  ngOnInit() {
	  //this.bpmAppsService.selected_app.name = "CSA";
  }

  abrirProceso(proceso,opciones){
    this.abrirDialog(proceso,opciones);
  }

  abrirDialog(proceso,opciones:Array<any> ){
    const appId = this.bpmAppsService.selected_app.id ? this.bpmAppsService.selected_app.id : 0;
    if(opciones.length > 0){
      const dialogRef = this.dialog.open(DialogProcessAction, {
        data: {
            options: opciones,
            selectedOption: null
        },
        minWidth: '250px'
      });
      dialogRef.afterClosed().subscribe((result) => {
        if( !isUndefined(result) ){
          this.navegarStartForm(result, appId);
        }
      });
    }else {
      this.navegarStartForm(proceso, appId);
    }
  }

  navegarStartForm(proceso: any, appId: any) {
    this.router.navigate([`apps/${appId}/processes/new/${proceso}` ] );
  }

  mostrarGrupoProcesos(grupo){
    let app = this.bpmAppsService.selected_app.name;
	//return true;
     if(app == grupo || app == "Tareas"){
       return true;
     }else {
       return false;
     }
  }

}
