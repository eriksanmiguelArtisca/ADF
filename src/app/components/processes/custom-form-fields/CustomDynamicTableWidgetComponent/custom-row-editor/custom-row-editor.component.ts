import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { DynamicTableRow, RowEditorComponent, WidgetVisibilityService, ErrorMessageModel, NotificationService } from '@alfresco/adf-core';
import { TreePepsService } from '../../../../../services/tree-peps.service';
import { HttpClient } from '@angular/common/http';
import { CSA_WASCS_EDITOR } from '../../../workflows/csa/wascs/CSA_WASCS_row-editor';
import { CSA_WARPF_EDITOR } from '../../../workflows/csa/warpf/CSA_WARPF_row-editor';
import { CSA_WAAPY_EDITOR } from '../../../workflows/csa/waapy/CSA_WAAPY_row-editor';
import { CSA_WASP_EDITOR } from '../../../workflows/csa/wasp/CSA_WASP_row-editor';


/* import { HttpClient, HttpHeaders } from '@angular/common/http'; */


declare var $: any;
@Component({
  selector: 'custom-table-editor',
  templateUrl: './custom-row-editor.component.html',
  styleUrls: ['./custom-row-editor.component.scss']
})
export class CustomRowEditorComponent extends RowEditorComponent implements AfterViewInit, OnInit {

  aux: any;
  mostrarCentro:Boolean;
  mostrarActivoFijo:Boolean;
  mostrarAF:Boolean;
  constructor(public treeService: TreePepsService, public changeDetectorRef: ChangeDetectorRef, public http: HttpClient, public visibilityService: WidgetVisibilityService,private notificationService :NotificationService) {
    super();
    /* alfrescoApi.callApi */

  }
  ngOnInit(): void {
    //si en la tabla concreta se encuentra ese id, esa columna va a ser un campo de selección
    this.validationSummary.isValid = true;
    let Pep1valoresTypeHead = ["waapy_pep1_ceco_responsable", "waapy_pep1_ceco_solicitante", "waapy_pep1_cebe"];
    let Pep2valoresTypeHead = ["waapy_pep2_cebe", "waapy_pep2_responsable","waapy_pep2_ceco_solicitante", "waapy_pep2_ceco_responsable", 
                               "waapy_pep2_actividad", "waapy_pep2_destino_inversion","waapy_pep2_instalacion"];
    let Pep3valoresTypeHead = ["waapy_pep3_ceco_solicitante", "waapy_pep3_ceco_responsable","waapy_pep3_actividad","waapy_pep3_cebe","waapy_pep3_destino_inversion"];
    let OrdenesValoresTypeHead = ["waapy_orden_clase","waapy_orden_clase_af","waapy_orden_ceco_responsable", "waapy_orden_cebe", "waapy_orden_actividad", "waapy_orden_destino_inversion",
    "waapy_orden_criterio_clasificacion","waapy_orden_clase_activo","waapy_orden_supranumero","waapy_orden_desglose2","waapy_orden_unidad_negocio",
    "waapy_orden_desglose1"]; //waapy_orden_centro, 
    let wascsValoresTypeHead = ["wascs_unidad","wascs_indicativo_iva","wascs_grupo_articulos"];
    let warpfValoresTypehead = ["warpf_unidad","warpf_concepto_facturable"];
    let dynamicColumnsInversion : string[]  = this.table.json.params.customProperties && this.table.json.params.customProperties.columndynamic  ? JSON.parse(this.table.json.params.customProperties.columndynamic)[0].fields.map( dynamicColumns => {return dynamicColumns.name}) : [] ;
    let dynamicColumnsGasto : string[]  = this.table.json.params.customProperties && this.table.json.params.customProperties.columndynamic  ? JSON.parse(this.table.json.params.customProperties.columndynamic)[1].fields.map( dynamicColumns => {return dynamicColumns.name}) : [] ;
    for (let i = 0; i < this.table.columns.length; i++) {
     if ((this.table.id.includes("waapy_tabla_pep1") && (Pep1valoresTypeHead.includes(this.table.columns[i].id)))) {
          this.table.columns[i].type = "typehead";
      } else if ((this.table.id.includes("waapy_tabla_pep2") && (Pep2valoresTypeHead.includes(this.table.columns[i].id)))) {
          this.table.columns[i].type = "typehead";
      } else if ((this.table.id.includes("waapy_tabla_pep3") && (Pep3valoresTypeHead.includes(this.table.columns[i].id)))){
          this.table.columns[i].type = "typehead";
      } else if ((this.table.id.includes("waapy_tabla_ordenes") && (OrdenesValoresTypeHead.includes(this.table.columns[i].id)))) {
          this.table.columns[i].type = "typehead";
      }  else if ((this.table.id.includes("wascs_solicitudes") && (wascsValoresTypeHead.includes(this.table.columns[i].id)))) {
        this.table.columns[i].type = "typehead";
      } else if ((this.table.id.includes("warpf_solicitudes") && (warpfValoresTypehead.includes(this.table.columns[i].id)))) {
        this.table.columns[i].type = "typehead";
      }
      if (dynamicColumnsInversion.includes(this.table.columns[i].id) && (this.treeService && this.treeService.rootPep && this.treeService.rootPep[0] 
        && this.treeService.rootPep[0].clase_objeto === "Inversión")) {
        this.table.columns[i].type = "dynamic-dropdown";
      }
      if (dynamicColumnsGasto.includes(this.table.columns[i].id) && (this.treeService && this.treeService.rootPep && this.treeService.rootPep[0] 
        && this.treeService.rootPep[0].clase_objeto === "Gasto")) {
        this.table.columns[i].type = "dynamic-dropdown";
      }
      // solucion temporal conexion sap
      // this.table.columns[i].type = "dynamic-dropdown";
      
      if (this.table.type === "readonly") {
        this.table.columns[i].editable = false;
      }
    }

    

    var taskDef = this.table.form.json.taskDefinitionKey;


    if (!this.row.isNew) {
      // Sin es una edicion guardamos el valor de la fila en el servicio para saber que valores tenemos que guardar en cascada
      this.treeService.lastEditRow = this.copyRow(this.row);
      /*      var taskDef = this.table.form.json.taskDefinitionKey;
           if(taskDef.includes('waapy_t1_correction') && (this.row.value.waapy_proyecto_correcto == true || this.row.value.waapy_pep1_correcto== true || this.row.value.waapy_pep2_correcto== true || this.row.value.waapy_pep3_correcto== true ) ) {
             for(let i=0 ; i < this.table.columns.length ; i++){
               this.table.columns[i].editable = false;
             }
           }  */
      //   if (this.table.id === "warpf_solicitudes") {
      //   CSA_WARPF_EDITOR.heritage(this.row, this.table, this);
      // }
      if (this.table.id === "wascs_solicitudes"){
        CSA_WASCS_EDITOR.heritage(this.row,this.table, this,taskDef);
      }
    }

    if (this.row.isNew) {
      if (this.table.id === "wascs_solicitudes"){
        CSA_WASCS_EDITOR.heritage(this.row,this.table, this,taskDef);
      }
      if (this.table.id === "warpf_solicitudes") {
        CSA_WARPF_EDITOR.heritage(this.row, this.table, this);
      }
      if (this.table.id.includes("waapy")) {
        CSA_WAAPY_EDITOR.heritage(this);
      }
      if (this.table.id === "wasp_solicitudes"){
        CSA_WASP_EDITOR.heritage(this.row,this.table, this,taskDef);
      }
    }

  }

  @HostListener('keyup', ['$event.target']) onInput(event) {
    if (event.id.includes("waapy_")) {
      CSA_WAAPY_EDITOR.inputListener(event, this);
    }
    if (event.id.includes("wascs")) {
      CSA_WASCS_EDITOR.inputListener(event,this);
    }
    if (event.id.includes("warpf")) {
      CSA_WARPF_EDITOR.inputListener(event,this);
    }
    if ((event.id.includes("wasp")) || event.id.includes("")) {
      CSA_WASP_EDITOR.inputListener(event, this);
    }
  }    
    
//función que en base a unos campos del form rellena otros
  async onAutocompleteValueChange($event) {
    if($event.id.includes("waapy_") ){
      //CSA_WAAPY_EDITOR.fieldsConfig($event, this);
      CSA_WAAPY_EDITOR.onAutocompleteValueChange($event, this);
    }
  }

  ngAfterViewInit(): void {
    var taskDef = this.table.form.json.taskDefinitionKey;
   
    if (this.table.id === "wascs_solicitudes"){
      //CSA_WASCS_EDITOR.fieldsConfig(taskDef,this.row); El error sale aqui
    }

    if (this.table.id === "warpf_solicitudes"){
      CSA_WARPF_EDITOR.fieldsConfig(taskDef, this, this.table);
    }

    if(this.table.id.includes("waapy_") ){
      CSA_WAAPY_EDITOR.fieldsConfig(taskDef, this);
    }

    if(this.table.id.includes("wasp_") ){
      CSA_WASP_EDITOR.fieldsConfig(taskDef, this);
    }
  }

  copyRow(row: DynamicTableRow): DynamicTableRow {
    return <DynamicTableRow>{
      value: this.copyObject(row.value)
    };
  }

  private copyObject(obj: any): any {
    let result = obj;
    if (typeof obj === 'object' && obj !== null && obj !== undefined) {
      result = Object.assign({}, obj);
      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === 'object') {
          result[key] = this.copyObject(obj[key]);
        }
      });
    }
    return result;
  }

  onCancelChanges(){
    if(this.table.id.includes("waapy_")){
      CSA_WAAPY_EDITOR.onCancelChanges();
    }
    super.onCancelChanges();
  }

  //función que se ejecuta cuando el usuario da al botón de guardar comprobando datos duplicados
  async onSaveChanges() {
    let validColumns: any = this.validateRowColumnsValues();
    var taskDef = this.table.form.json.taskDefinitionKey;
    
    if (!validColumns || validColumns.isValid) {
      if (this.table.id === "warpf_solicitudes") {
        this.validateRow();
        if (this.isValidRow()) {
          await CSA_WARPF_EDITOR.validateSaveOrden(this, this.row, this.table, taskDef);
          // await CSA_WARPF_EDITOR.validateSaveEmisor(this);
        }
      }
      else if (this.table.id.includes("wascs_solicitudes")) {
        this.validateRow();
        if (this.isValidRow()) {
          await CSA_WASCS_EDITOR.validateSave(this);
        }
      }
      else if (this.table.id.includes("waapy_tabla")) {
        CSA_WAAPY_EDITOR.validateSave(this);
        }else if (this.table.id.includes("wasp_solicitudes")) {
          this.validateRow();
          if (this.isValidRow()) {
            await CSA_WASP_EDITOR.validateSave(this);
          }
        } else {
          this.validateRowAndSave();
        }
    } else {
      this.validationSummary = null;
      this.validationSummary = validColumns;
    }
  }

  validateRowAndSave(){
    this.validateRow();
    if (this.isValidRow()) {
      this.emitSaveEvent();
    }
  }

  //función que emite el evento de guardado
  emitSaveEvent() {
    this.save.emit({
      table: this.table,
      row: this.row,
      column: this.column
    });
  }

  //función que comprueba si la fila es válida
  protected isValidRow(): boolean {
    return this.validationSummary && this.validationSummary.isValid;
  }

  protected validateRow() {
    this.validationSummary = this.table.validateRow(this.row);
  }

  // función para validar los campos requeridos
  validateRowColumnsValues() {
    let summary = new ErrorMessageModel({
      isValid: true,
      message: null
    });
    this.table["_validators"][0].supportedTypes.push("typehead");
    if (this.row) {
      for (const col of this.table.columns) {
        for (const validator of this.table["_validators"]) {
          if (!validator.validate(this.row, col, summary)) {
            summary.message = summary.message.replace("Field", "Campo");
            summary.message = summary.message.replace("is required", "es obligatorio");
            summary.message = summary.message.replace("Invalid 'Fecha", "Formato 'Fecha");
            summary.message = summary.message.replace(" format.", " inválido.");
            return summary;
          }
        }
      }
    }
  }
  
  errorValidacion(message){
    let validationOrden: any = new ErrorMessageModel({
      message: message
    });
    validationOrden.isValid = false;
    this.validationSummary = validationOrden;
  }

  notificacionOrdenes(){
    this.notificationService.openSnackMessageAction("La clase de orden seleccionada no necesita máscara de orden. Se asignará una máscara temporal","Aceptar",{
      duration: 10000,
      horizontalPosition: "center",
      verticalPosition: "bottom"
    });
    $(".cdk-global-overlay-wrapper").css("height","45%");
  }

//función que recibe un array de ids, los recorre y esconde ciertos divs
  hideDivs(ids){
    for (let id of ids){
      $(id).parents(".row-editor > div").hide();
    }
  }


  //función para ocultar los campos a corregir
//   ocultarDatosCorregir(row,idOcultar){
//     if (row.value && row.value.waapy_pep1_correcto){
//       $(idOcultar).hide();
//   }else{
//     $(idOcultar).show();
//   }
// }

asignarAyudaUsuario(array,id){
  let cadena="";
  for (let item of array){
    cadena+= item;
  }
  // $(id).parent().parent().parent().parent().parent().parent().parent().attr("data-tip",cadena);
  //accedemos al padre de nivel 7, (eq 0 based indice)
  $(id).parents().eq(6).attr("data-tip",cadena);

}

/*Functions to move elements in DOM*/

//función para aumentar el ancho del dropdown 
  getWidthOfDropDown(column) {
    return null;
  }

  //función para aumentar el ancho de los div padres del formulario
  getWidthOfDivs(column) {
    if ((column) &&
      (column.id.includes("comentarios")) || (column.id.includes("corregir")) ||
      (column.id.includes("validacion")) || (column.id === "wascs_mensaje_sap") || 
      (column.id === "warpf_mensaje_sap") ) {
      return { "flex": "1 1 100%" };
    } else if (column.type === "Boolean") {
      return { "margin-top": "0", "margin-bottom": ".5em", "width": "100%" };
    } else {
      return { "width": "50%" };
    }
  }

  //función para aumentar el ancho de los input pertenecientes al div hijo
  getWidthOfInput(column) {
    if ((column) && (column.id.includes("comentarios")) || (column.id.includes("corregir")) || (column.id.includes("sap")) ) {
      return { "width": "96.75%" };
    } else if (column.type === "String" || column.type === "Dropdown" ) {
      return { "width": "92.75%" };
    }
    else {
      return { "width": "45.5%" };
    }
  }
  
}