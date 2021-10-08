// import { DynamicTableRow} from "@alfresco/adf-core";
// import * as moment from "moment";
import { isNullOrUndefined } from "util";
import { CustomRowEditorComponent } from "../../../custom-form-fields/CustomDynamicTableWidgetComponent/custom-row-editor/custom-row-editor.component";

declare var $: any;
let flagOrdenEmisoraCorrecta:boolean;
let flagOrdenReceptoraCorrecta:boolean;

export const CSA_WARPF_EDITOR = {
    /** 
     * Configura las limitaciones
     * @param taskDef - taskDefinitionKey identificador de la tarea actual
     * @param rowEditor - Componente customRowEditor, con acceso a todos los valores
     * @param table - Acceso a la tabla actual y sus valores para comprobar el número de posiciones que se han creado
     */
    fieldsConfig(taskDef, rowEditor : CustomRowEditorComponent, table) {
        //MaxLength
         $("#warpf_cantidad").attr('maxlength', 17);
         $("#warpf_texto_factura").attr('maxlength', 40);
         $("#warpf_orden_imputacion_emisora").attr('maxlength',12);
         $("#warpf_orden_imputacion_receptora").attr('maxlength',12);
         $("#warpf_precio_unitario").attr('maxlength', 15); //maxLength 12, con 2 decimales y "," 15

        //checkCorrecto
        if (taskDef == "warpf_t2" || taskDef == "warpf_t3" || taskDef == "warpf_t4") {
            if ($("#warpf_correcto-input").is(":checked") == true) {
                $("#warpf_corregir").parents(".row-editor > div").hide();
            } else {
                $("#warpf_corregir").parents(".row-editor > div").show();
            }
            $("#warpf_correcto").click(function () {
                $("#warpf_corregir").val("");
                if ($("#warpf_correcto-input").is(":checked") !== true) { //comprobar distinto true porque tarda en asignar el valor
                    $("#warpf_corregir").parents(".row-editor > div").hide();
                } else {
                    $("#warpf_corregir").parents(".row-editor > div").show();
                }
            });
            this.comentariosPaymentConditions(rowEditor, taskDef);
        }

        let cifIntroducido = rowEditor.table.form.values.warpf_cif; //Va a existir porque no se puede crear la solicitud sin rellenarlo
        if (!isNullOrUndefined(cifIntroducido)) {
            let ordenReceptoraRequerida = rowEditor.table.columns.find(f => f.id === 'warpf_orden_imputacion_receptora');
            if (cifIntroducido["name"].includes("INTERCOMP")) {  //Si cif pertenece a sociedad grupo viesgo -> necesario warpf_orden_imputacion_receptora, sino no aparece
/*                 $("#warpf_orden_imputacion_receptora").parents(".row-editor > div").show(); */
                ordenReceptoraRequerida.required = true;
            } else {
                $("#warpf_orden_imputacion_receptora").parents(".row-editor > div").hide();
                ordenReceptoraRequerida.required = false;
            }
        }
        this.disabledMoreOneRow(rowEditor.row, table, taskDef);
    },

     /** 
     * Configura las herencia de los campos
     * @param row - Recibe el customRowEditor.row para acceder a la fila y poner automaticamente el valor de la posición y otros valores heredados de la 1º posición
     * @param table - Acceso a la tabla actual y sus valores para comprobar el número de posiciones que se han creado
     * @param rowEditor - Componente customRowEditor, con acceso a todos los valores
     */
    heritage(row, table, rowEditor : CustomRowEditorComponent) {
        let numeroFilas = table.rows.length;
        if (isNullOrUndefined(numeroFilas) || numeroFilas === 0) {
            row.value.warpf_posicion = 10;
            let cif_cliente  = table.form.values.warpf_cif.id;
            this.calculatePaymentConditions(rowEditor, cif_cliente);
            row.value.warpf_moneda = { id: "EUR", name: "[EUR] Euro" };
        } else {
            if (row.isNew) { //Si es una creación
                row.value.warpf_posicion = (numeroFilas + 1) * 10;
                row.value.warpf_moneda = table.rows[0].value.warpf_moneda;
                row.value.warpf_fecha_factura = table.rows[0].value.warpf_fecha_factura;
                row.value.warpf_condiciones_cobro = table.rows[0].value.warpf_condiciones_cobro;
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
        if (isNullOrUndefined(taskDef) || taskDef === "warpf_t1_correction" || taskDef === "warpf_borrador" || taskDef === "warpf_t2" || taskDef === "warpf_t3") { 
            if (table.rows && table.rows.length >= 0 && !isNullOrUndefined(table.rows[0]) && JSON.stringify(row.value) === JSON.stringify(table.rows[0].value)) {
                esPrimeraPosicion = true; // Si es la 1º posicion se puede editar
            } else if (table.rows && table.rows.length > 0) {
                esPrimeraPosicion = false; //No es la primera posición, no se puede editar
            }
            for (let columna of table.columns) {
                if (isNullOrUndefined(taskDef) || taskDef === "warpf_borrador") {
                    if (columna.id === "warpf_moneda" || columna.id === "warpf_fecha_factura") {
                        //|| columna.id === "warpf_condiciones_cobro" Las cond cobro se calculan online con sap, no es editable para el cumplimentador por lo que para la 1º pos tampoco.
                        columna.editable = esPrimeraPosicion;
                    }
                } else if (taskDef !== "warpf_t1_correction" && (columna.id === "warpf_condiciones_cobro" || columna.id === "warpf_concepto_facturable")) { // t2 or t3
                    columna.editable = esPrimeraPosicion;
                }
                if (taskDef === "warpf_t1_correction") {
                    if (columna.id === "warpf_moneda" || columna.id === "warpf_fecha_factura") {
                        columna.editable = esPrimeraPosicion;
                    }
                    if (columna.id === "warpf_condiciones_cobro") {
                        columna.editable = false;
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
                arrayValidator.push(row.value.warpf_moneda,row.value.warpf_fecha_factura,row.value.warpf_condiciones_cobro,row.value.warpf_concepto_facturable);
                editarFilas(arrayValidator, table, taskDef);
            }
        }
    },

    visibility(tarea, id, rowEditor: CustomRowEditorComponent) {
        // if (isNullOrUndefined(tarea) || tarea == "warpf_t2" || tarea == "warpf_t3" || tarea == "warpf_t4" || tarea == "warpf_t1_correction") { //nullOrUndefined = Tarea Start
        //     $(id).parents(".row-editor > div").hide();
        // }
    },
    /** 
     * Método para calcular el importe total (precio_unitario * cantidad)
     * @param table - Acceso a la tabla actual y sus valores (ej: el número de posiciones que se han creado)
     * @param taskDef - taskDefinitionKey identificador de la tarea actual
     * @return {number} totalImport
     */
    calculateTotalImportReceptor(table,orden_imputacion_receptora){
        let total = 0;
        table.rows.forEach(row => {
            if( row.value["warpf_orden_imputacion_receptora"] === orden_imputacion_receptora ){
                total += parseFloat(row.value["warpf_precio_unitario"].replace(",",".")) * parseInt(row.value["warpf_cantidad"]);
            }
        });
        return total; 
    },
     /** 
     * Método que realiza una llamada y rellena automaticamente las concidiciones de cobro en base al cif del cliente seleccionado
     * @param rowEditor - Componente customRowEditor, con acceso a todos los valores
     * @param cif_prov - Cif del cliente seleccionado
     */
     calculatePaymentConditions(rowEditor : CustomRowEditorComponent,cif_prov){          
        rowEditor.http.get('/WS_BPM_REST/jcmouse/restapi/sap_pi/VALIDACION_PAGO_CLIENTE/VENTA/CIF_CLIENT/'+
            cif_prov, { observe: 'response' }).toPromise()
            .then(response => {
              let correct = response.body["MT_HUBCOM_RES"]["CORRECTO"];
              if (correct == "X") {
                  let condicionesDeCobro = response.body["MT_HUBCOM_RES"]["RESULTADO"].item;
                  rowEditor.row.value["warpf_condiciones_cobro"] = { id: condicionesDeCobro["VALOR"], name: condicionesDeCobro["TEXTO"] };
                  let columnas = rowEditor.table.columns;
                  var paymentConditions = columnas.find(f => f.id === 'warpf_condiciones_cobro');
                  if (!isNullOrUndefined(paymentConditions)) paymentConditions.editable = false;
              }else {
                rowEditor.errorValidacion(response.body["MT_HUBCOM_RES"]["MENSAJE"]);
              }
            },error =>   rowEditor.errorValidacion("Error durante la consulta de las condiciones de cobro" ) 
        )
    },
     /** 
     * Método asíncrono -> Comprueba la orden receptora o la orden emisora contra SAP y llama a "validarOrden" para comprobar si su valor es correcto
     * @param rowEditor - Componente customRowEditor, con acceso a todos los valores
     * @param row - Recibe el customRowEditor.row para acceder a la fila
     * @param table - Acceso a la tabla actual y sus valores (ej: el número de posiciones que se han creado)
     * @param taskDef - taskDefinitionKey identificador de la tarea actual
     */
    async validateSaveOrden(rowEditor: CustomRowEditorComponent, row, table, taskDef) {
        flagOrdenReceptoraCorrecta = false;
        this.comprobarPrimeraPosicion(row, table, taskDef);
        let url = '/WS_BPM_REST/jcmouse/restapi/sap_pi/VALIDACION_ORDEN/VENTA/N_ORDEN';
        //Si warpf_orden_imputacion_receptora es vacio es porque no se muestra en la visual al usuario porque no corresponde a ninguna sociedad viesgo 
        if (!isNullOrUndefined(rowEditor.row.value["warpf_orden_imputacion_receptora"])) {
            let totalImport = this.calculateTotalImportReceptor(rowEditor.table, rowEditor.row.value["warpf_orden_imputacion_receptora"]);
            totalImport += parseFloat(rowEditor.row.value["warpf_precio_unitario"].replace(",",".")) * parseInt(rowEditor.row.value["warpf_cantidad"]);
            // Quitamos el importe de la fila seleccionada en caso de que sea una modificacion
            // Ya se ha sumado el nuevo valor de la fila correspondiente 
            if (!rowEditor.row.isNew) totalImport -= parseFloat(rowEditor.table.selectedRow.value["warpf_precio_unitario"].replace(",",".")) * parseInt(rowEditor.table.selectedRow.value["warpf_cantidad"]);
            totalImport = totalImport.toFixed(2);
            //triple verificación OrdenReceptora
            this.validarOrden(rowEditor, url, ',' + totalImport, ',IMPORTE,EMISOR_FLAG/', 'warpf_orden_imputacion_receptora', ',' + 'X');
        } else {
            flagOrdenReceptoraCorrecta = true; //flag = true si no es requerido para poder emitir el evento de guardado
        }
        //doble verificacion OrdenEmisora
        flagOrdenEmisoraCorrecta = false;
        this.validarOrden(rowEditor, url, '', '/', 'warpf_orden_imputacion_emisora', '');
    },
     /** 
     * Método asíncrono -> Recibe los parametros de la llamada a realizar según el tipo de orden, realiza la llamada y en base al resultado emite el evento de guardado
     * @param rowEditor - Componente customRowEditor, con acceso a todos los valores
     * @param url - Url de la llamada
     * @param totalImport - Importe total
     * @param params - parametros para añadir a la url de la llamada
     * @param tipoOrden - Cadena que informa si la orden es emisora o receptora
     * @param flag - Cadena 'X' o ''
     */
    async validarOrden(rowEditor: CustomRowEditorComponent, url, totalImport, params, tipoOrden, flag) {
        await rowEditor.http.get(url + params +
            rowEditor.row.value[tipoOrden] + totalImport + flag, { observe: 'response' }).toPromise()
            .then(response => {
                let correct = response.body["MT_HUBCOM_RES"]["CORRECTO"];
                if (correct == "X") {
                    if (tipoOrden.includes("receptora")) {
                        flagOrdenReceptoraCorrecta = true;
                    } else {
                        flagOrdenEmisoraCorrecta = true;
                        if (flagOrdenReceptoraCorrecta && flagOrdenEmisoraCorrecta) {
                            rowEditor.emitSaveEvent();
                        }
                    }
                } else {
                    rowEditor.errorValidacion(response.body["MT_HUBCOM_RES"]["MENSAJE"]);
                    if (tipoOrden.includes("receptora")) {
                        flagOrdenReceptoraCorrecta = false;
                    } else {
                        flagOrdenEmisoraCorrecta = false;
                    }
                }
            }, error => rowEditor.errorValidacion("Error durante la consulta del presupuesto de la orden"));
    },
    /** 
     * Método que resalta u oculta el campo 'comentarios_cobro' en base a si en T1 se ha rellenado el campo 'comentarios_cobro' para actualizar campos en t2 o t3
     * @param rowEditor - Componente customRowEditor, con acceso a todos los valores
     * @param taskDef - taskDefinitionKey identificador de la tarea actual
     */
    comentariosPaymentConditions(rowEditor: CustomRowEditorComponent, taskDefinitionKey) {
        if (!isNullOrUndefined(rowEditor.row.value.warpf_comentarios_cobro) && rowEditor.row.value.warpf_comentarios_cobro != ""
            && !isNullOrUndefined(taskDefinitionKey)) { //null or undefined tStart
            $("#warpf_comentarios_cobro").parent().css("font-weight", "bold");
        } else {
            $("#warpf_comentarios_cobro").parents(".row-editor > div").hide();
        }
    },
     /** 
     * Detector de eventos de campos de texto. Controla decimales o pone las máscaras en mayúsculas.
     * @param event - El evento que se ha detectado
     * @param rowEditor - Componente customRowEditor, con acceso a todos los valores
     */
    inputListener(event,rowEditor) {
        if (event.id == "warpf_precio_unitario" && (event.value.includes(",") || event.value.includes(".") ) ) {
            this.quitarDecimales(event,rowEditor);
        }else if(event.id == "warpf_orden_imputacion_emisora" || event.id == "warpf_orden_imputacion_receptora") {
            let maskUppercase = event.value.toUpperCase();
            $("#"+event.id).val(maskUppercase);
        } else if (event.id === "warpf_cantidad" && (event.value.includes(",") || event.value.includes(".") ) ){
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
        if (event.id === "warpf_precio_unitario") {
            // let decimales = event.value.split(",");
            // let ultPosicion = decimales[decimales.length - 1];
            // if (ultPosicion.length > 2) {
            //     ultPosicion = ultPosicion.substring(0, 2);
            //     rowEditor.row.value[event.id] = decimales[0] + "," + ultPosicion;
            //     $("#" + event.id).val(decimales[0] + "," + ultPosicion);
            // }
            // let precioUnitario = event.value.replace(mascaraDecimales, event.value );
            // rowEditor.row.value[event.id] = precioUnitario;
            // $("#" + event.id).val(precioUnitario);
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
    let fechaDistinta = false;
    let cobroDistinto = false;
    let conceptoDistinto = false;
    if (JSON.stringify(array[0]) !== JSON.stringify(table.rows[0].value.warpf_moneda)) {
        monedaDistinta = true;
    }
    if (JSON.stringify(array[1]) !== JSON.stringify(table.rows[0].value.warpf_fecha_factura)) {
        fechaDistinta = true;
    }
    if (JSON.stringify(array[2]) !== JSON.stringify(table.rows[0].value.warpf_condiciones_cobro)) {
        cobroDistinto = true;
    }
    if (JSON.stringify(array[3]) !== JSON.stringify(table.rows[0].value.warpf_concepto_facturable)) {
        conceptoDistinto = true;
    }
    for (let i = 1; i < numeroFilas; i++) {
        if (monedaDistinta) {
            table.rows[i].value.warpf_moneda = array[0];
        }
        if (fechaDistinta) {
            table.rows[i].value.warpf_fecha_factura = array[1];
        }
        if (cobroDistinto && (taskDef === "warpf_t2" || taskDef === "warpf_t3")) {
            table.rows[i].value.warpf_condiciones_cobro = array[2];
        }
        if (conceptoDistinto && (taskDef === "warpf_t2" || taskDef === "warpf_t3")) {
            table.rows[i].value.warpf_concepto_facturable = array[3];
        }
    }
}








