import { Component, OnInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { WidgetVisibilityService, LogService, FormService, DynamicTableRow, DynamicTableWidgetComponent, NotificationService } from '@alfresco/adf-core';
import { DynamicTableColumn } from '@alfresco/adf-core/form/components/widgets/dynamic-table/dynamic-table-column.model';
import { TreePepsService } from '../../../../services/tree-peps.service';




@Component({
  selector: 'custom-dynamic-table-widget',
  templateUrl: './CustomDynamicTableWidgetComponent.component.html',
  /* styleUrls: ['./CustomDynamicTableWidgetComponent.component.scss'] */
})




export class CustomDynamicTableWidgetComponentComponent extends DynamicTableWidgetComponent  implements OnInit {

 
  constructor(public formService: FormService,
    public elementRef: ElementRef,
    visibilityService: WidgetVisibilityService,
    logService: LogService,
    cd: ChangeDetectorRef,
    private treeService : TreePepsService,
    private notificationService :NotificationService
    ) {
      super(formService,elementRef,visibilityService,logService,cd);
      let arrayTablas = [ "waapy_tabla_proyecto","waapy_tabla_pep1","waapy_tabla_pep2","waapy_tabla_pep3","waapy_tabla_ordenes" ];
      this.treeService.deleteRow$.subscribe( deletedRow => {
        if( deletedRow.tabledId === "waapy_tabla_pep1" && this.field.id === "waapy_tabla_pep2"){
          this.deleteFromTable("waapy_tabla_pep1",deletedRow.row);
          
        }else {
          let currentTableIndex = arrayTablas.indexOf(deletedRow.tabledId);
          for (let i=currentTableIndex + 1; i<arrayTablas.length;i++){
            // if (deletedRow.tabledId === "waapy_tabla_proyecto"){i=0};
            if (this.field.id.includes(arrayTablas[i])){
            this.deleteFromTable(deletedRow.tabledId,deletedRow.row);
            }
          }
        }
        
      })

    }

  ngOnInit() {

    this.treeService.currentPep = null;
    if (this.field) {
      if(this.field.id == 'widarb_pre_inversion'  && this.field.json.value === null){
        this.field.json.value = new Array();
        let titles = ["Consultoría / Desarrollo de Sistemas","Infraestructura","Licencias","Otros","Inversión total"];
        titles.forEach(title => {
          this.field.json.value.push({"title":title,"total":0,"year1":0,"year2":0,"year3":0,"year4":0,"year5":0,"year6":0});
        });      
      }
      
      if(this.field.id == 'widarb_pre_costes_operacion_adicionales' && this.field.json.value === null ){
        this.field.json.value = new Array();
        let titles = ["Mantenimiento de aplicaciones","Operación de infraestructuras","Licencias","Otros","Costes de operación totales"];
        titles.forEach(title => {
          this.field.json.value.push({"title":title,"year1":0,"year2":0,"year3":0,"year4":0,"year5":0,"year6":0});
        }); 
      } 
      

      super.ngOnInit();
    }
    
  }

  disableCreate(){    
    // // solucion temporal conexion sap
    // return false;
    if(this.retornarEstadoProceso()==true){
      return true;
    }

    if((this.field.id.includes("waapy_tabla_pep") || this.field.id.includes("waapy_tabla_ordenes")) &&  this.treeService.currentPep ){
      if(this.field.id.includes("waapy_tabla_pep1")  ){
         let flag;

         if( (this.treeService.currentPep.tipoPep==0  && ( this.treeService.rootPep && this.treeService.rootPep[0] && (this.treeService.rootPep[0]["perfil_proyecto_code"] == "PVRG001" || this.treeService.rootPep[0]["perfil_proyecto_code"] =="PVRP000") ) )
            || (this.treeService.currentPep.tipoPep==0 &&  (this.field.value == null || this.field.value.length == 0) ) ){ 
            flag= false; //boton enabled
            //proyecto nuevo con cambio de sociedad calculada formFieldValueChanged & proyecto existente 8700
        }else{
          flag = true;
        }
        if( (this.treeService.currentPep.tipoPep==0  && ( this.treeService.rootPep && this.treeService.rootPep[0] && (this.treeService.rootPep[0]["perfil_proyecto_code"] !== "PVRG001" && this.treeService.rootPep[0]["perfil_proyecto_code"] !=="PVRP000") ) )
           && (this.treeService.currentPep.tipoPep==0 &&  (this.field.value == null || this.field.value.length == 0) ) && this.treeService.currentPep.children && this.treeService.currentPep.children.length>0){ //Si no existen pepsI en el proyecto existente, permitimos crear, sino no
           flag = true; //boton disabled
           //proyecto existente sociedades no 87**
        }
        
        return flag;
      }else if (this.field.id.includes("waapy_tabla_pep2")){
        if(this.treeService.currentPep["tipoPep"]==1){
          return false;
        }
          return true;
        
      }else if(this.field.id.includes("waapy_tabla_pep3")){
        if(this.treeService.currentPep["tipoPep"]==2){
          return false;
        }
          return true;
      }else if(this.field.id.includes("waapy_tabla_ordenes")){
        if(this.treeService.currentPep["tipoPep"]==3){
         return false;
        }    
          return true;
      }
    }else if(this.field.id.includes("waapy_tabla_pep") || this.field.id.includes("waapy_tabla_ordenes")){
      return true;
    }else if(this.field.id.includes("waapy_tabla_proyecto")){
      if(this.field.value && this.field.value.length==1 ){
        return true;
      }   
    } 

    if (this.field.id.includes("wascs_solicitudes")) {
      if (this.field.form.values.wascs_posiciones && this.field.value && this.field.value.length) {
        if (this.field.value.length >= this.field.form.values.wascs_posiciones) {
          return true;
        }else{
          return false;
        }
      }
    }

    if (this.field.id.includes("warpf_solicitudes")) {
      if (this.field.form.values.warpf_posiciones && this.field.value && this.field.value.length) {
        if (this.field.value.length >= this.field.form.values.warpf_posiciones) {
          return true;
        }else{
          return false;
        }
      }
    }

    if (this.field.id.includes("wasp_solicitudes")) {
      if (this.field.form.values.wasp_posiciones && this.field.value && this.field.value.length) {
        if (this.field.value.length >= this.field.form.values.wasp_posiciones) {
          return true;
        }else{
          return false;
        }
      }else if (this.field.form.json.taskDefinitionKey && (this.field.form.json.taskDefinitionKey === "wasp_t2")){
        return true;
      }
    }

    if (this.field.form.json.taskDefinitionKey && (this.field.form.json.taskDefinitionKey === "wascs_t2" || this.field.form.json.taskDefinitionKey === "wascs_t3"
     || this.field.form.json.taskDefinitionKey === "wascs_t4" || this.field.form.json.taskDefinitionKey === "wascs_t5")){
      return true;
    }

    if (this.field.form.json.taskDefinitionKey && (this.field.form.json.taskDefinitionKey === "warpf_t2" || this.field.form.json.taskDefinitionKey === "warpf_t3"
    || this.field.form.json.taskDefinitionKey === "warpf_t4" || this.field.form.json.taskDefinitionKey === "warpf_t5")){
     return true;
   }

    return this.field.readOnly;
  } 

  disableDelete() {
    if (this.retornarEstadoProceso() == true) {
      return true;
    } else if (this.field.id.includes("waapy_tabla") && this.content.selectedRow) {
      let taskDefinitionKey = this.field.form.json.taskDefinitionKey;
      let arrayFields = ["waapy_proyecto_correcto", "waapy_pep1_correcto", "waapy_pep2_correcto", "waapy_pep2_correcto"];
      let waapy;
      if (taskDefinitionKey.includes('waapy_t1_correction')) {
        for (waapy of arrayFields) {
          if (this.content.selectedRow.value[waapy]) {
            return true;
          }
        }
      }
      // if( taskDefinitionKey.includes('waapy_t1_correction') && (this.content.selectedRow.value.waapy_proyecto_correcto == true || this.content.selectedRow.value.waapy_pep1_correcto == true ||
      //   this.content.selectedRow.value.waapy_pep2_correcto == true || this.content.selectedRow.value.waapy_pep3_correcto == true )  ) {
      // return true;
    }


    if (this.field.id.includes("wascs_solicitudes") && this.field.form.json.taskDefinitionKey && (this.field.form.json.taskDefinitionKey === "wascs_t2" ||
     this.field.form.json.taskDefinitionKey === "wascs_t3" || this.field.form.json.taskDefinitionKey === "wascs_t4" || this.field.form.json.taskDefinitionKey === "wascs_t5")
      && this.content.selectedRow) {
      return true;
    }

    if (this.field.id.includes("wascs_solicitudes") && this.field.form.json.taskDefinitionKey &&
      this.field.form.json.taskDefinitionKey === "wascs_t1_correction" && this.content.selectedRow && this.content.selectedRow.value.wascs_correcto) {
      return true;
    }

    if (this.field.id.includes("warpf_solicitudes") && this.field.form.json.taskDefinitionKey && (this.field.form.json.taskDefinitionKey === "warpf_t2" ||
     this.field.form.json.taskDefinitionKey === "warpf_t3" || this.field.form.json.taskDefinitionKey === "warpf_t4" || this.field.form.json.taskDefinitionKey === "warpf_t5") 
     && this.content.selectedRow) {
      return true;
    }

    if (this.field.id.includes("warpf_solicitudes") && this.field.form.json.taskDefinitionKey &&
      this.field.form.json.taskDefinitionKey === "warpf_t1_correction" && this.content.selectedRow && this.content.selectedRow.value.warpf_correcto) {
      return true;
    }

    if (this.field.id.includes("wasp_solicitudes") && this.field.form.json.taskDefinitionKey === "wasp_t2") {
      return true;
    }

    if (this.field.form.json.taskDefinitionKey === "wsaf_t2") {
      return true;
    }
    
    return !this.hasSelection();
  }
    
  

  disableEdit(){   
    if( this.field.id.includes("waapy_tabla") && this.hasSelection() ){
      let taskDefinitionKey = this.field.form.json.taskDefinitionKey;
      let arrayFields=["waapy_proyecto_correcto","waapy_pep1_correcto","waapy_pep2_correcto","waapy_pep3_correcto","waapy_orden_correcto"];
      for (let field of arrayFields){
        if( taskDefinitionKey.includes('waapy_t1_correction') && (this.content.selectedRow.value[field])){
          return true;
        } 
      }
      // if( taskDefinitionKey.includes('waapy_t1_correction') && (this.content.selectedRow.value.waapy_proyecto_correcto == true || this.content.selectedRow.value.waapy_pep1_correcto == true ||
      //   this.content.selectedRow.value.waapy_pep2_correcto == true || this.content.selectedRow.value.waapy_pep3_correcto == true )  ) {
      //   return true;
      // }
    }
    if (this.content.selectedRow && this.content.selectedRow.value.wascs_correcto && this.field.form.json.taskDefinitionKey === "wascs_t1_correction"){
      return true;
    }

    if (this.content.selectedRow && this.content.selectedRow.value.warpf_correcto && this.field.form.json.taskDefinitionKey === "warpf_t1_correction"){
      return true;
    }

    return !this.hasSelection();  
  }

  retornarEstadoProceso(){    
    let taskDefinitionKey = this.field.form.json.taskDefinitionKey;
    let tasks=['waapy_t2','waapy_t3','waapy_t4'];
    for (let task of tasks){
    if (taskDefinitionKey && taskDefinitionKey.includes(task)){
      return true;
    }
    }
    // if( taskDefinitionKey.includes('waapy_t2')  ){
    //   return true;
    // }else if (taskDefinitionKey.includes('waapy_t3')){
    //   return true;
    // }else if (taskDefinitionKey.includes('waapy_t4')){
    //   return true;
    // }
  }

  deleteSelection(): boolean {
    if (this.content && !this.readOnly && this.content.id.includes("waapy")) {
        this.treeService.deleteRow$.next({ tabledId: this.content.id,row :this.content.selectedRow});
        let currentTable = this.content.id.replace("_tabla","");
        if(currentTable == "waapy_proyecto" && this.treeService.rootPep && this.treeService.rootPep[0].mascara == this.content.selectedRow.value[currentTable+'_mascara']){
          this.treeService.rootPep = [];
        }else if (this.treeService.rootPep){
          if (currentTable=="waapy_ordenes"){
            currentTable="waapy_orden";
          }
          this.treeService.deleteTreeElementByMask(this.treeService.rootPep[0],this.content.selectedRow.value[currentTable+'_mascara'] ,0);
        }
        this.content.deleteRow(this.content.selectedRow);//this.treeService.rootPep.splice(0,1);
        this.treeService.treeChanged$.next( this.treeService.rootPep );
        return true;
    }

    if (this.content && this.content.id.includes("wascs_solicitudes") && this.content.rows && this.content.rows.length) {
      this.content.deleteRow(this.content.selectedRow);
      for (let i = 0; i < this.content.rows.length; i++) {
        if (i == 0) {
          this.content.rows[i].value.wascs_posicion = 10;
        } else {
          this.content.rows[i].value.wascs_posicion = (i + 1) * 10;
        }
      }
      return true;
    }

    if (this.content && this.content.id.includes("warpf_solicitudes") && this.content.rows && this.content.rows.length) {
      this.content.deleteRow(this.content.selectedRow);
      for (let i = 0; i < this.content.rows.length; i++) {
        if (i == 0) {
          this.content.rows[i].value.warpf_posicion = 10;
        } else {
          this.content.rows[i].value.warpf_posicion = (i + 1) * 10;
        }
      }
      return true;
    }

    if (this.content && this.content.id.includes("wasp_solicitudes") && this.content.rows && this.content.rows.length) {
      this.content.deleteRow(this.content.selectedRow);
      for (let i = 0; i < this.content.rows.length; i++) {
        if (i == 0) {
          this.content.rows[i].value.wasp_posicion = 10;
        } else {
          this.content.rows[i].value.wasp_posicion = (i + 1) * 10;
        }
      }
      return true;
    }


    return false;
  }

  deleteFromTable(deletedRowTable :string,row: DynamicTableRow) {
    let currentTable = this.content.id.replace("_tabla","");
    deletedRowTable = deletedRowTable.replace("_tabla","");
    let deletedMask = row.value[deletedRowTable + '_mascara'];
    // if(deletedRowTable == "waapy_pep1" && (row.value[deletedRowTable + '_mascara'].length == 13 || row.value[deletedRowTable + '_mascara'].length == 17) ){
    //   deletedMask = deletedMask.substring(0,deletedMask.length-3);
    //   // si existe más de un pep I con el substring deja la máscara común
    // }
    let arrayAfterDeleted = [];
    this.content.rows.forEach( (tableRow, index) => {
/*       if (currentTable=="waapy_ordenes"){
        currentTable="waapy_orden";
      } */
      if (deletedRowTable === "waapy_pep1" && tableRow.value[ 'waapy_pep2_nodo_superior'] === deletedMask ){
        this.treeService.deleteRow$.next({ tabledId:  "waapy_tabla_pep2",row :tableRow});
      } else if(deletedRowTable === "waapy_pep1"){
        arrayAfterDeleted.push(tableRow); 
      }else if((currentTable=="waapy_ordenes") && (tableRow.value['waapy_orden_nodo_superior'].includes(deletedMask) == false) ||
         ( currentTable!="waapy_ordenes" && tableRow.value[currentTable+'_mascara'].includes(deletedMask) == false)){
        arrayAfterDeleted.push(tableRow); 
      }
      
    
    });
    this.content.rows = arrayAfterDeleted;
    this.content.flushValue();
  }

  addNewRow():boolean{
    if(this.field.id.includes("waapy_tabla_proyecto")){
      if(!this.field.form.values["waapy_sociedad"]["name"]){
        this.notificationService.openSnackMessageAction("Para crear un proyecto es necesario que selecciones la sociedad primero","Aceptar",{
          duration: 25000,
          horizontalPosition: "center",
          verticalPosition: "top"
        });
        return false;
      }
    } else if (this.field.id.includes("wascs_solicitudes")){
      if (!this.field.form.values.wascs_posiciones || !this.field.form.values.wascs_cif_proveedor  || !this.field.form.values.wascs_sociedad.id){
        this.notificationService.openSnackMessageAction("Para crear una solicitud es necesario que selecciones la sociedad, el cif del proveedor y el nº de posiciones primero","Aceptar",{
          duration: 25000,
          horizontalPosition: "center",
          verticalPosition: "top"
        });
        return false;
      }
    } else if (this.field.id.includes("warpf_solicitudes")){
        if (!this.field.form.values.warpf_posiciones || !this.field.form.values.warpf_cif || Object.keys(this.field.form.values.warpf_contrato).length === 0 ){
          this.notificationService.openSnackMessageAction("Para crear una solicitud es necesario que selecciones el cif, el contrato y el nº de posiciones primero","Aceptar",{
            duration: 25000,
            horizontalPosition: "center",
            verticalPosition: "top"
          });
          return false;
        } 
    }else if (this.field.id.includes("wasp_solicitudes")){
      if (!this.field.form.values.wasp_posiciones || !this.field.form.values.wasp_sociedad.id || !this.field.form.values.wasp_tipo_pedido.id){
        this.notificationService.openSnackMessageAction("Para crear una solicitud es necesario que selecciones la sociedad, el nº de posiciones y el tipo de pedido primero","Aceptar",{
          duration: 25000,
          horizontalPosition: "center",
          verticalPosition: "top"
        });
        return false;
      }
    }
    return super.addNewRow();
  }

  getCellValue(row: DynamicTableRow, column: DynamicTableColumn): any {
    if (this.content) {
        const cellValue = this.content.getCellValue(row, column);
        if (column.type === 'Amount') {
            return  (Number(cellValue).toLocaleString('es-ES') || 0) + ' ' + (column.amountCurrency || '$');
        }
        if (column.type === 'typehead' || column.type === 'dynamic-dropdown') {
          return  cellValue.name;
        }
        
        return cellValue;
    }
    return null;
  }

  getColor(row: DynamicTableRow) {
    let taskDefinitionKey = this.field.form.json.taskDefinitionKey;
    let accionT2Peps = this.field.form.values.waapy_accion_controller;
    let accionT2Wascs = this.field.form.values.wascs_accion_csa;
    let accionT2Warpf = this.field.form.values.warpf_accion_csa;
    let accionT2Wasp = this.field.form.values.wasp_accion_csa;
    let color = "";

    //VALIDACIONES PEPS
    if (row && row.value && (taskDefinitionKey && taskDefinitionKey !== 'waapy_t1' && taskDefinitionKey.includes('waapy_'))) {
      if ((row.value.waapy_proyecto_correcto !== true && row.value.waapy_pep1_correcto !== true &&
        row.value.waapy_pep2_correcto !== true && row.value.waapy_pep3_correcto !== true && row.value.waapy_orden_correcto !== true)) {
        color = "#ffbfaa"; //color red=>incorrecto
      } else {
        color = "lightgreen";
      }
      if (accionT2Peps && accionT2Peps.id === "RECHAZAR") {
        if (!row.value.waapy_proyecto_corregir && row.value.waapy_proyecto_correcto !== true && !row.value.waapy_pep1_corregir && row.value.waapy_pep1_correcto !== true
          && !row.value.waapy_pep2_corregir && row.value.waapy_pep2_correcto !== true && !row.value.waapy_pep3_corregir && row.value.waapy_pep3_correcto !== true
          && !row.value.waapy_orden_corregir && row.value.waapy_orden_correcto !== true) {
          color = "#ffc107"; //color orange =>rechazo 
        }
      }
      return color;
    } else if (row && row.value && (taskDefinitionKey && taskDefinitionKey !== 'wascs_t1' && taskDefinitionKey !== 'wascs_borrador' && taskDefinitionKey.includes('wascs_'))) { //VALIDACIONES WASCS
      if (row.value.wascs_correcto !== true) {
        color = "#ffbfaa"; //color red=>incorrecto
      } else {
        color = "lightgreen";
      }
      if (accionT2Wascs && accionT2Wascs.id === "RECHAZAR") {
        if (!row.value.wascs_corregir && row.value.wascs_correcto !== true) {
          color = "#ffc107"; //color orange =>rechazo 
        }
      }
      return color;
    } else if (row && row.value && (taskDefinitionKey && taskDefinitionKey !== 'warpf_t1' && taskDefinitionKey !== 'warpf_borrador' && taskDefinitionKey.includes('warpf_'))) { //VALIDACIONES WASCS
      if (row.value.warpf_correcto !== true) {
        color = "#ffbfaa"; //color red=>incorrecto
      } else {
        color = "lightgreen";
      }
      if (accionT2Warpf && accionT2Warpf.id === "RECHAZAR") {
        if (!row.value.warpf_corregir && row.value.warpf_correcto !== true) {
          color = "#ffc107"; //color orange =>rechazo 
        }
      }
      return color;
    } else if (row && row.value && (taskDefinitionKey && taskDefinitionKey !== 'wasp_t1' && taskDefinitionKey !== 'wasp_borrador' && taskDefinitionKey.includes('wasp_'))) { //VALIDACIONES WASP
      if (row.value.wasp_correcto !== true) {
        color = "#ffbfaa"; //color red=>incorrecto
      } else {
        color = "lightgreen";
      }
      if (accionT2Wasp && accionT2Wasp.id === "RECHAZAR") {
        if (!row.value.wasp_corregir && row.value.wasp_correcto !== true) {
          color = "#ffc107"; //color orange =>rechazo 
        }
      }
      return color;
    }else {
      return null;
    }
  }
}

