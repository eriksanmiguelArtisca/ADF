// import { DynamicTableRow} from "@alfresco/adf-core";
// import * as moment from "moment";

import { isNullOrUndefined } from "util";
import { CustomRowEditorComponent } from "../../../custom-form-fields/CustomDynamicTableWidgetComponent/custom-row-editor/custom-row-editor.component";

declare var $: any;

export const CSA_WASCS_EDITOR = {
    /** 
     * Configura las limitaciones
     * @param taskDef - taskDefinitionKey identificador de la tarea actual
     * @param rowEditor - Componente customRowEditor, con acceso a todos los valores
     */
    fieldsConfig(taskDef, rowEditor : CustomRowEditorComponent) {
        //MaxLength
        $("#wascs_texto_breve").attr('maxlength', 40);
        $("#wascs_cantidad").attr('maxlength', 17);
        $("#wascs_orden_imputacion").attr('maxlength', 12);
        $("#wascs_precio_unitario").attr('maxlength', 15); //maxLength 12, con 2 decimales y "," 15
        $("#wascs_comentarios_pago").attr('maxlength', 300);
        //Visibilidad campos correccion tablas
        if (taskDef == "wascs_t2" || taskDef == "wascs_t3" || taskDef == "wascs_t4") {
            if ($("#wascs_correcto-input").is(":checked") == true) {
                $("#wascs_corregir").parents(".row-editor > div").hide();
            } else {
                $("#wascs_corregir").parents(".row-editor > div").show();
            }
            $("#wascs_correcto").click(function () {
                $("#wascs_corregir").val("");
                //comprobar distinto true porque tarda en asignar el valor
                if ($("#wascs_correcto-input").is(":checked") !== true) {
                    $("#wascs_corregir").parents(".row-editor > div").hide();
                } else {
                    $("#wascs_corregir").parents(".row-editor > div").show();
                }
            });
            this.comentariosPaymentConditions(rowEditor.row, taskDef);
        }
        this.visibility(taskDef, ["#wascs_tipo_imputacion", "#wascs_centro_logistico", "#wascs_grupo_articulos"]);
        this.disabledMoreOneRow(rowEditor.row, rowEditor.table, taskDef);
    },
    
    /** 
     * Configura las herencia de los campos
     * @param row - Recibe el customRowEditor.row para acceder a la fila y poner automaticamente el valor de la posición y otros valores heredados de la 1º posición
     * @param table - Acceso a la tabla actual y sus valores para comprobar el número de posiciones que se han creado
     * @param rowEditor - Componente customRowEditor, con acceso a todos los valores
     * @param taskDef - taskDef identificador de la tarea actual
     */
    heritage(row, table, rowEditor: CustomRowEditorComponent, taskDefinitionKey) {
        if (!row.isNew) {
            if (taskDefinitionKey === "wascs_t2" || taskDefinitionKey === "wascs_t3") {
                let columnPaymentConditions = table.columns.find(f => f.id === 'wascs_condiciones_pago');
                if (isNullOrUndefined(row.value.wascs_comentarios_pago) || row.value.wascs_comentarios_pago == "") {
                    if (!isNullOrUndefined(columnPaymentConditions)) columnPaymentConditions.editable = false;
                } else {
                    if (!isNullOrUndefined(columnPaymentConditions)) columnPaymentConditions.editable = true;
                }
            }
        } else {
            let numeroFilas = table.rows.length;
            row.value.wascs_moneda = { id: "EUR", name: "[EUR] Euro" };
            if (isNullOrUndefined(numeroFilas) || numeroFilas === 0) {
                row.value.wascs_posicion = 10;
                let cif_prov = table.form.values.wascs_cif_proveedor.id;
                let sociedad = table.form.values.wascs_sociedad.id;
                this.calculatePaymentConditions(rowEditor, cif_prov, sociedad);
            } else {
                row.value.wascs_posicion = (numeroFilas + 1) * 10;
                row.value.wascs_condiciones_pago = table.rows[0].value.wascs_condiciones_pago;
                row.value.wascs_moneda = table.rows[0].value.wascs_moneda;
            }
            
        }
    },

    /** 
     * Configura los campos editables o no según la posición de la solicitud
     * @param row - Recibe el customRowEditor.row para acceder a la fila y poner automaticamente el valor de la posición y otros valores heredados de la 1º posición
     * @param table - Acceso a la tabla actual y sus valores (ej: el número de posiciones que se han creado)
     * @param taskDef - taskDefinitionKey identificador de la tarea actual
     */
    disabledMoreOneRow(row, table, taskDef) {
        let esPrimeraPosicion = true;
        if (isNullOrUndefined(taskDef) || taskDef === "wascs_t1_correction" || taskDef === "wascs_borrador" || taskDef === "wascs_t2" || taskDef === "wascs_t3") { 
            if (table.rows && table.rows.length >= 0 && !isNullOrUndefined(table.rows[0]) && JSON.stringify(row.value) === JSON.stringify(table.rows[0].value)) {
                esPrimeraPosicion = true; // Si es la 1º posicion se puede editar
            } else if (table.rows && table.rows.length > 0) {
                esPrimeraPosicion = false; //No es la primera posición, no se puede editar
            }
            for (let columna of table.columns) {
                if (isNullOrUndefined(taskDef) || taskDef === "wascs_borrador" || taskDef === "wascs_t1_correction") {
                    if (columna.id === "wascs_moneda" ) {
                        columna.editable = esPrimeraPosicion;
                    }
                } 
            }
        }
    },
    /** 
     * Método para comprobar si se ha editado la 1º posición y modificar los valores que se heredan automaticamente en el resto de posiciones
     * @param row - Recibe el customRowEditor.row para acceder a la fila y poner automaticamente el valor de la posición y otros valores heredados de la 1º posición
     * @param table - Acceso a la tabla actual y sus valores (ej: el número de posiciones que se han creado)
     * @param taskDef - taskDefinitionKey identificador de la tarea actual
     */
    comprobarPrimeraPosicion(row, table, taskDef){ 
        let arrayValidator = [];
        if (!row.isNew) {
            if (table.rows && table.rows.length >= 0 && !isNullOrUndefined(table.rows[0]) &&
                 JSON.stringify(row.value) !== JSON.stringify(table.rows[0].value)) { //si se ha editado la 1º fila
                arrayValidator.push(row.value.wascs_moneda);
                editarFilas(arrayValidator, table, taskDef);
            }
        }
    },
    /** 
     * Método que oculta campos en función de la tarea.
     * @param tarea - tarea identificador de la tarea actual
     * @param ids - ids de los campos necesarios de ocultar
     */
    visibility(tarea, ids) {
        if (isNullOrUndefined(tarea) || tarea === "wascs_borrador" || tarea === "wascs_t1_correction") { //null or undefined = tarea WASCS start. // t2,t3,t4 se visualizan.
            for (let id of ids) {
                $(id).parents(".row-editor > div").hide();
            }
        }
    },
    /** 
     * Método asíncrono -> Comprueba la orden de imputación contra SAP y si el importe total es inferior a 1000 y la respuesta es correcta emite el evento de guardado
     * @param rowEditor - Componente customRowEditor, con acceso a todos los valores
     */
    async validateSave(rowEditor : CustomRowEditorComponent){
        let taskDefinitionKey = rowEditor.table.form.json.taskDefinitionKey;
        this.comprobarPrimeraPosicion(rowEditor.row, rowEditor.table, taskDefinitionKey);
        if( !taskDefinitionKey ||taskDefinitionKey.includes("wascs_t1") ||  taskDefinitionKey.includes("wascs_borrador") ){
            let resultCalculate =  this.calculateTotalImport(rowEditor.table,rowEditor.row.value["wascs_orden_imputacion"]);
            let totalImport = resultCalculate[0];
            let totalImportOrden = resultCalculate[1];
            // sumamos la fila actual al importe total total
            let currenImport = parseFloat(rowEditor.row.value["wascs_precio_unitario"].replace(",",".")) * parseInt(rowEditor.row.value["wascs_cantidad"]);
            totalImport += currenImport ;
            totalImportOrden += currenImport;
            // Quitamos el importe de la fila seleccionada en caso de que sea una modificacion
            // Ya se ha sumado el nuevo valor de la fila correspondiente 
            if( !rowEditor.row.isNew ) {
                let selectedRowImport =parseFloat(rowEditor.table.selectedRow.value["wascs_precio_unitario"].replace(",",".")) * parseInt(rowEditor.table.selectedRow.value["wascs_cantidad"]);
                totalImport -= selectedRowImport;
                totalImportOrden -= selectedRowImport;
            }
            totalImport = totalImport.toFixed(2);
            totalImportOrden = totalImportOrden.toFixed(2);
            if(totalImport > 1000){
                rowEditor.errorValidacion("El importe total de todas las lineas del pedido  es superior a 1.000")  ;
            }else {
                await rowEditor.http.get('/WS_BPM_REST/jcmouse/restapi/sap_pi/VALIDACION_ORDEN/COMPRA_SIMPLIFICADA/N_ORDEN,IMPORTE/' +
                rowEditor.row.value["wascs_orden_imputacion"] + ',' + totalImportOrden, { observe: 'response' }).toPromise()
                .then(response => {
                    let correct = response.body["MT_HUBCOM_RES"]["CORRECTO"];
                    if (correct == "X") {
                        rowEditor.row.value["wascs_tipo_imputacion"] = response.body["MT_HUBCOM_RES"]["RESULTADO"].item["VALOR"];
                        rowEditor.emitSaveEvent();
                    } else {
                        rowEditor.errorValidacion(response.body["MT_HUBCOM_RES"]["MENSAJE"]);
                    }
                }, error => rowEditor.errorValidacion("Error durante la consulta del presupuesto de la orden"));
            }
        }else {
            rowEditor.emitSaveEvent();
        }
    },
     /** 
     * Método para calcular el importe total (precio_unitario * cantidad)
     * @param table - Acceso a la tabla actual y sus valores (ej: el número de posiciones que se han creado)
     * @param orden_imputacion - Valor del campo "wascs_orden_imputacion"
     * @returns {array} Importe total, importe total de la orden
     */
    calculateTotalImport(table,orden_imputacion){
        let total = 0;
        let totalOrden = 0;
        table.rows.forEach(row => {
            let calculate = parseFloat(row.value["wascs_precio_unitario"].replace(",",".")) * parseInt(row.value["wascs_cantidad"]);
            total += calculate;
            if( row.value["wascs_orden_imputacion"] === orden_imputacion ){
                totalOrden += calculate;
            }
        });
        return [total,totalOrden];
    },
    /** 
     * Método que realiza una llamada y rellena automaticamente las concidiciones de pago en base al cif del cliente seleccionado
     * @param rowEditor - Componente customRowEditor, con acceso a todos los valores
     * @param cif_prov - Cif del prov seleccionado
     * @param sociedad - Sociedad rellenada por el usuario en el formulario
     */
     calculatePaymentConditions(rowEditor : CustomRowEditorComponent,cif_prov,sociedad){          
        rowEditor.http.get('/WS_BPM_REST/jcmouse/restapi/sap_pi/VALIDACION_PAGO_PROV/COMPRA_SIMPLIFICADA/CIF_PROV,SOCIEDAD/'+
            cif_prov+ ',' +sociedad, { observe: 'response' }).toPromise()
            .then(response => {
              let correct = response.body["MT_HUBCOM_RES"]["CORRECTO"];
              if (correct == "X") {
                let condicionesDePago = response.body["MT_HUBCOM_RES"]["RESULTADO"].item;
                rowEditor.row.value["wascs_condiciones_pago"] = { id: condicionesDePago["VALOR"] , name: condicionesDePago["TEXTO"] };
                let columnas = rowEditor.table.columns;
                var paymentConditions = columnas.find(f => f.id === 'wascs_condiciones_pago');
                paymentConditions.editable = false;
              }else {
                rowEditor.errorValidacion(response.body["MT_HUBCOM_RES"]["MENSAJE"]);
              }
            },error =>   rowEditor.errorValidacion("Error durante la consulta de las condiciones de pago" ) 
        )
    },
    /** 
     * Método que resalta u oculta el campo 'comentarios_pago' en base a si en T1 se ha rellenado el campo 'comentarios_pago' para actualizar campos en t2 o t3
     * @param row - Recibe el customRowEditor.row para acceder a la fila
     * @param taskDefinitionKey - taskDefinitionKey identificador de la tarea actual
     */
    comentariosPaymentConditions(row, taskDefinitionKey) {
        if (!isNullOrUndefined(row.value.wascs_comentarios_pago) && row.value.wascs_comentarios_pago != "" && !isNullOrUndefined(taskDefinitionKey) ) { //null or undefined tStart
            $("#wascs_comentarios_pago").parent().css("font-weight", "bold");
        } else {
            $("#wascs_comentarios_pago").parents(".row-editor > div").hide();
        }
    },
     /** 
     * Detector de eventos de campos de texto. Controla decimales o pone las máscaras en mayúsculas.
     * @param event - El evento que se ha detectado
     * @param rowEditor - Componente customRowEditor, con acceso a todos los valores
     */
    inputListener(event,rowEditor) {
        if (event.id == "wascs_precio_unitario" && (event.value.includes(",") || event.value.includes(".") ) ) {
            this.quitarDecimales(event,rowEditor);
        } else if(event.id == "wascs_orden_imputacion") {
            let maskUppercase = event.value.toUpperCase();
            $("#"+event.id).val(maskUppercase);
        } else if (event.id == "wascs_cantidad" && (event.value.includes(",") || event.value.includes(".") ) ){
            this.quitarDecimales(event,rowEditor);
        }
    },
    /** 
     * Método con reg Exp para controlar los valores del precio unitario y la cantidad. Es llamado desde 'inputListener'
     * @param event - El evento que se ha detectado
     * @param rowEditor - Componente customRowEditor, con acceso a todos los valores
     */
    quitarDecimales(event, rowEditor: CustomRowEditorComponent) {
        let mascaraQuitarDecimales = /([,|.]{1})/; 
        let mascara3Decimales = /([,|.]{1}[0-9]{3})/;
        if (event.id === "wascs_precio_unitario") {
            // let decimales = event.value.split(",");
            // let ultPosicion = decimales[decimales.length - 1];
            // if (ultPosicion.length > 2) {
            //     ultPosicion = ultPosicion.substring(0, 2);
            //     rowEditor.row.value[event.id] = decimales[0] + "," + ultPosicion;
            //     $("#" + event.id).val(decimales[0] + "," + ultPosicion);
            // }
            let regex = new RegExp(mascara3Decimales);
            if (regex.test(event.value)) {
                let precioUnitario = event.value.substring(0, event.value.length - 1);
                rowEditor.row.value[event.id] = precioUnitario;
                $("#" + event.id).val(precioUnitario);
            }
        } else {
            let cantidad = event.value.replace(mascaraQuitarDecimales, "");
            rowEditor.row.value[event.id] = cantidad;
            $("#" + event.id).val(cantidad);
        }
    },
}

/**
 * Método que comprueba los campos automáticos. Recorre desde la 2º hasta la última posición y si los valores automáticos no son los de la primera posición los edita. Se llama desde 'comprobarPrimeraPosicion'
 * @param array - Array que contiene los valores automáticos
 * @param table - Acceso a la tabla actual y sus valores (ej: el número de posiciones que se han creado)
 * @param taskDef - taskDefinitionKey identificador de la tarea actual
 */
function editarFilas(array, table, taskDef) {
    console.log(taskDef);
    let numeroFilas = table.rows.length;
    let monedaDistinta = false;

    if (JSON.stringify(array[0]) !== JSON.stringify(table.rows[0].value.wascs_moneda)) {
        monedaDistinta = true;
    }
    for (let i = 1; i < numeroFilas; i++) {
        if (monedaDistinta) {
            table.rows[i].value.wascs_moneda = array[0];
        }
    }
}






