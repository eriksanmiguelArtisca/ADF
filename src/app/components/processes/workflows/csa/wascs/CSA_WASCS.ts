import { FormFieldModel, FormFieldEvent, DynamicTableRow, ValidateDynamicTableRowEvent, FormService, FORM_FIELD_VALIDATORS, NotificationService} from "@alfresco/adf-core"; 
import { FieldValidatorWASCS } from "./fieldValidatorWASCS";
import { isUndefined, isNullOrUndefined } from "util"; 
import { TreePepsService } from '../../../../../services/tree-peps.service';
import { HttpClient } from "@angular/common/http";
import { FormValueRepresentation } from "@alfresco/js-api";
import * as moment from "moment";

export const CSA_WASCS = {


    formLoaded(e: FormFieldEvent, fields: FormFieldModel[], http:HttpClient) {

        e.form.fieldValidators = [
            ...FORM_FIELD_VALIDATORS,
            new FieldValidatorWASCS()
        ]

        let taskDefinitionKey = e.form.json.taskDefinitionKey;
        if (taskDefinitionKey === "wascs_t2" || taskDefinitionKey === "wascs_t3") {
            var wascs_motivo_rechazo = fields.find(f => f.id === 'wascs_rechazo');
            var wascs_correcto = fields.find(f => f.id === 'wascs_correcto');
            if (wascs_correcto) wascs_correcto.value = "SI";
            if (!isUndefined(wascs_motivo_rechazo)) {
                var wascs_accion_csa = fields.find(f => f.id === 'wascs_accion_csa');
                if (wascs_accion_csa) wascs_accion_csa.value = "ACEPTAR";
                wascs_motivo_rechazo.value = "";
            }
        }
        let required_fields = ["wascs_solicitudes", "wascs_accion_solicitante", "wascs_sociedad", "wascs_area", "wascs_cif_proveedor", "wascs_solicitante", "wascs_posiciones",
            "wascs_posicion", "wascs_texto_breve", "wascs_cantidad", "wascs_unidad", "wascs_precio_unitario", "wascs_condiciones_pago", "wascs_fecha_entrega", 
            "wascs_orden_imputacion"]; //wascs_tipo_compra -> calc automatico
        fields.forEach(field => { //"wascs_moneda", "wascs_indicativo_iva"
            if (required_fields.includes(field.id)) {
                field.required = true;
            }
        });
        

        let fechaInicioSolicitud = fields.find(f => f.id === 'wascs_fecha_inicio_solicitud');
        if (fechaInicioSolicitud === null || !isNullOrUndefined(fechaInicioSolicitud)) {
            fechaInicioSolicitud.readOnly = true;
            if (isUndefined(taskDefinitionKey)) { //Tarea start
                let date = new Date();
                fechaInicioSolicitud.value = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
            }
        }
        

        let grupo_tarea = fields.find(f => f.id === 'wascs_grupo_tareas');
        if (!isNullOrUndefined(grupo_tarea)) {
            grupo_tarea.value = 'Solicitud de documentos de compra';
            grupo_tarea.readOnly = true;
        }

        let tarea = fields.find(f => f.id === 'wascs_tarea');
        if (!isNullOrUndefined(tarea)) {
            tarea.value = 'Solicitud de Compra simplificada';
            tarea.readOnly = true;
        }

        let clasePedido = fields.find(f => f.id === 'wascs_clase_pedido');
        if (!isNullOrUndefined(clasePedido)) {
            if (clasePedido.value == 'empty') clasePedido.value = 'ZSIM';
            clasePedido.readOnly = true;
        }

        let grupoCompras = fields.find(f => f.id === 'wascs_grupo_compras');
        if (!isNullOrUndefined(grupoCompras)) {
            if (grupoCompras.value == 'empty') grupoCompras.value = 'VVS';
            grupoCompras.readOnly = true;
        }

        let orgCompras = fields.find(f => f.id === 'wascs_organizacion_compras');
        if (!isNullOrUndefined(orgCompras)) {
            if (orgCompras.value == 'empty') orgCompras.value = 'VD01';
            orgCompras.readOnly = true;
        }

        if (!isNullOrUndefined(taskDefinitionKey) && taskDefinitionKey.includes('wascs_t1_correction')) {
            var wascs_rechazo = fields.find(f => f.id === 'wascs_rechazo');
            var wascs_datos_corregir = fields.find(f => f.id === 'wascs_datos_corregir');
            if (!isNullOrUndefined(wascs_rechazo) && !isNullOrUndefined(wascs_datos_corregir)) {
                if (wascs_rechazo.value && wascs_datos_corregir.value) {
                    // wascs_datos_corregir.isVisible = false;
                    wascs_datos_corregir.value = '';
                }
            }
            fields.forEach(field => {
                if (field.id == 'wascs_rechazo' || field.id == 'wascs_datos_corregir') {
                    // Si son campos de rechazo y estamos en la tarea de correccion ponemos una condicion de visibilidad para que solo se muestren si son vacios
                    field.readOnly = true;
                    let visibility: any = {
                        leftFormFieldId: field.id,
                        leftType: "field",
                        leftValue: field.id,
                        operator: "!empty"
                    };
                    field.visibilityCondition = visibility;
                }
            });
        } else {

            var wascs_rechazo = fields.find(f => f.id === 'wascs_rechazo');
            if (!isUndefined(wascs_rechazo)) {
                // Limpiamos los radio buttons que sirven para indicar es correcto y el campo de rechazo
                var wascs_accion_csa = fields.find(f => f.id === 'wascs_accion_csa');
                if (wascs_accion_csa) wascs_accion_csa.value = "ACEPTAR";
                wascs_motivo_rechazo.value = "";
            }

            var wascs_datos_corregir = fields.find(f => f.id === 'wascs_datos_corregir');
            if (!isUndefined(wascs_datos_corregir)) {
                var wascs_correcto = fields.find(f => f.id === 'wascs_correcto');
                var wascs_accion_correcto = fields.find(f => f.id === 'wascs_accion_correcto');
                wascs_correcto.value = "SI";
                wascs_accion_correcto.value = "VIABLE";
                wascs_datos_corregir.value = "";
            }
        }
        // var waapy_motivo_rechazo = fields.find(f => f.id ===  'waapy_motivo_rechazo');
        // if( !isUndefined(waapy_motivo_rechazo) ){
        //     // Limpiamos los radio buttons que sirven para indicar es correcto y el campo de rechazo
        //     var waapy_accion_controller = fields.find(f => f.id ===  'waapy_accion_controller');
        //     var waapy_accion_csa = fields.find(f => f.id ===  'waapy_accion_csa');
        //     if(waapy_accion_controller) waapy_accion_controller.value =  "ACEPTAR";
        //     if(waapy_accion_csa) waapy_accion_csa.value =  "ACEPTAR";
        //     waapy_motivo_rechazo.value ="";
        
        // }
        // var waapy_datos_corregir = fields.find(f => f.id ===  'waapy_datos_corregir');
        // if( !isUndefined(waapy_datos_corregir) ){
        //     // Limpiamos los radio buttons que sirven para indicar si se ha realizado correctamente y el campo de datos a corregir
        //     var waapy_correcto = fields.find(f => f.id ===  'waapy_correcto');
        //     var waapy_accion_correcto = fields.find(f => f.id ===  'waapy_accion_correcto');
        //     waapy_correcto.value = "SI";
        //     waapy_accion_correcto.value = "VIABLE";
        //     waapy_datos_corregir.value ="";
        // }

        if (!isNullOrUndefined(taskDefinitionKey) && !taskDefinitionKey.includes('wascs_t1_correction') && !taskDefinitionKey.includes('wascs_borrador')){ //Tstart ==undefined 
            var wascs_fichero = fields.find(f => f.id ===  'wascs_documentacion');
            if( !isUndefined(wascs_fichero)){
                wascs_fichero.readOnly = true;
            }
        }

        let wascs_historico = fields.find(f => f.id ===  'wascs_historico');
        if( !isUndefined(wascs_historico) ){
            wascs_historico.readOnly = true;
            if(wascs_historico.value == null) wascs_historico.value = '';
                if (taskDefinitionKey.includes('wascs_t1') || taskDefinitionKey.includes('wascs_borrador')  || (taskDefinitionKey.includes('wascs_t3')) || (taskDefinitionKey.includes('wascs_t4'))  ) {
                    var wascs_comentarios_csa = fields.find(f => f.id === 'wascs_comentarios_csa');
                    this.valueComentarios(wascs_comentarios_csa,wascs_historico,"\n- CSA : ");
                } else if (taskDefinitionKey.includes('wascs_t2')) {
                    var comentariosSolicitante = fields.find(f => f.id === 'wascs_comentarios_solicitante');
                    this.valueComentarios(comentariosSolicitante,wascs_historico,"\n- Solicitante : ");
                }
        }

        //textareaResultadoSap
        let respuestaSap = fields.find(f => f.id === "wascs_sap_result");
        if(!isNullOrUndefined(respuestaSap)) respuestaSap.readOnly = true;
        if ((!isNullOrUndefined(respuestaSap) && (respuestaSap.value !== "CREACION CORRECTA"))) {
            let radioBtn = fields.find(f => f.id === "wascs_correcto");
            radioBtn.value = "NO";
            radioBtn.readOnly = true;
        }

        // //check resultadoSAP
        // let resultadoSap = fields.find(f => f.id === "resultadodesap");
        // if ((!isNullOrUndefined(resultadoSap) && (resultadoSap.value !== "CREACION CORRECTA"))) {
        //     let radioBtn = fields.find(f => f.id === "wascs_correcto");
        //     radioBtn.value = "NO";
        //     radioBtn.readOnly = true;
        // }

        //estadoautorizacinwf
        /* let estadoAutorizacinwf = fields.find(f => f.id === 'estadoautorizacinwf');
        if (!isUndefined(estadoAutorizacinwf)) {
            let wascs_sap_ndoc = fields.find(f => f.id === 'nmerodedocumento');
            if (!isNullOrUndefined(wascs_sap_ndoc) && wascs_sap_ndoc.value !== "") {
                http.get(
                    '/WS_BPM_REST/jcmouse/restapi/sap_pi/CONSULTA_ESTADO_COMPRA/COMPRA_SIMPLIFICADA/N_DOC/' + wascs_sap_ndoc.value, { observe: 'response' })
                    .subscribe(response => {
                        let resultado = response.body["MT_HUBCOM_RES"]["RESULTADO"].item["TEXTO"];
                        estadoAutorizacinwf.value = resultado;
                        if (resultado === "Aprobada" || resultado === "Rechazada") {
                            let comentAutorizacion = fields.find(f => f.id === 'comentariosautorizacinwf');
                            if (!isNullOrUndefined(comentAutorizacion)) {
                                comentAutorizacion.value = "";
                            }
                        }
                    });
            }
        } */

        if( !isUndefined(taskDefinitionKey)  && !taskDefinitionKey.includes('wascs_t1')  ){
                var wascs_tabla = fields.find(f => f.id ===  'wascs_solicitudes');
                loadTable(wascs_tabla);
        }

        
        function loadTable(wascs_tabla: FormFieldModel) {
            if (wascs_tabla.value) {
                wascs_tabla.value.forEach(compra => {
                    // Limpiamos los campos de correccion de las tablas
                    let corregir = wascs_tabla.id.replace("_solicitudes", "") + "_corregir";
                    if (compra[corregir]) {
                        compra[corregir] = "";
                    }
                });
            }
        }


        var fechadesolicitud = fields.find(f => f.id ===  'fechadesolicitud');
        formatFechasTareasCompletadas(fechadesolicitud);

    },

    formFieldValueChanged(e: FormFieldEvent, fields: FormFieldModel[], http:HttpClient, notificationService:NotificationService ) {

        if (e.field.id === 'wascs_solicitante') {
            if(!e.field.isValid) e.field.validationSummary.message = "El campo solicitante tiene que ser un valor entre 900000 y 999999";
        }

        if (e.field.id === 'wascs_area') {
            var resp = fields.find(f => f.id === 'wascs_responsable_area');
            if (!isUndefined(e.field.value)) {
                switch (e.field.value) {
                    case 'ADM':
                        resp.value = '900093ADM';
                        break;
                    case 'CON':
                        resp.value = '901889CON';
                        break;
                    case 'COM':
                        resp.value = '902400COM';
                        break;
                    case 'TES':
                        resp.value = '900031TES';
                        break;
                    case 'FIS':
                        resp.value = '902156FIS';
                        break;
                    case 'BSC':
                        resp.value = '902398BSC';
                        break;
                    case 'HSE':
                        resp.value = '902398HSE';
                        break;
                    case 'LEG':
                        resp.value = '900074LEG';
                        break;
                    case 'GDE':
                        resp.value = '902036GDE';
                        break;
                    default:
                        resp.value = 'VACIO';
                        break;
                }
                resp.readOnly = true;
            }
        }

        if (e.field.id === 'wascs_sociedad') {
            if (fields.find(f => f.id === 'wascs_sociedad')) {
                var co = fields.find(f => f.id === 'wascs_sociedad_co');
                if (e.field.value == '8700' || e.field.value == '8704' || e.field.value == '8712') {
                    co.value = '8700';
                } else if (e.field.value == '0100' || e.field.value == '0101' || e.field.value == '0102' || e.field.value == '0103' || e.field.value == '0104' || e.field.value == '0262' || e.field.value == '0446' || e.field.value == '0568' || e.field.value == '0607') {
                    co.value = 'GV01';
                }
                var activitiwascs_sociedad_co = fields.find(f => f.id === 'wascs_sociedad_co');
                activitiwascs_sociedad_co.readOnly = true;
            }
        }

        if (e.field.id === 'wascs_cif_proveedor') {
            if (e.field.value instanceof FormValueRepresentation) {
                http.get('/WS_BPM_REST/jcmouse/restapi/sap_pi/VALIDACION_PAGO_PROV/COMPRA_SIMPLIFICADA/CIF_PROV/' +
                    e.field.value.id, { observe: 'response' }).toPromise()
                    .then(response => {
                        let correct = response.body["MT_HUBCOM_RES"]["CORRECTO"];
                        if (correct == "X") {
                            let condicionesDePago = response.body["MT_HUBCOM_RES"]["RESULTADO"].item;
                            let tablaSolicitud = fields.find(f => f.id === 'wascs_solicitudes');
                            if (!isNullOrUndefined(tablaSolicitud)) {
                                let campos = tablaSolicitud.json.columnDefinitions;
                                let rowCondPago = campos.find(f => f.id === 'wascs_condiciones_pago');
                                rowCondPago.value = { id: condicionesDePago["VALOR"], name: condicionesDePago["TEXTO"] };
                                rowCondPago.editable = false;
                            }
                        } else {
                            notificationService.openSnackMessageAction(response.body["MT_HUBCOM_RES"]["MENSAJE"], "Aceptar", {
                                duration: 10000,
                                horizontalPosition: "center",
                                verticalPosition: "top"
                            });
                        }
                    }, error => notificationService.openSnackMessageAction("Error durante la consulta de las condiciones de pago", "Aceptar", {
                        duration: 10000,
                        horizontalPosition: "center",
                        verticalPosition: "top"
                    })
                    );
            }
        }
    },
    validateDynamicTableRow(row: DynamicTableRow, e: ValidateDynamicTableRowEvent, fields: FormFieldModel[], treeService: TreePepsService, formService: FormService, visibilityService) {
        let regex = null;
        let taskDefinitionKey = e.form.json.taskDefinitionKey;
        if( !taskDefinitionKey || taskDefinitionKey.includes("wascs_t1") ||  taskDefinitionKey.includes("wascs_borrador") ){
            if (!isNullOrUndefined(row.value.wascs_precio_unitario)) {
                let stringMascara = "^[0-9]{1,12}([,]{1}[0-9]{1,2})?$";
                regex = new RegExp(stringMascara);
                if (!regex.test(row.value.wascs_precio_unitario)) {
                    e.summary.isValid = false;
                    e.summary.message = "El valor del precio unitario está formado por hasta 12 dígitos enteros y hasta 2 decimales separados por coma";
                }
            }
            //campos númericos
            if ( (!isNullOrUndefined(row.value.wascs_cantidad) && isNaN(row.value.wascs_cantidad) ) || (row.value.wascs_cantidad.includes(".") ) ){
                    e.summary.isValid = false;
                    e.summary.message = "El campo Cantidad debe ser un número entero";
            }

            //campo fecha validación mismo día o posterior
            /*if (!isNullOrUndefined(row.value.wascs_fecha_entrega)) {
                let momentFechaIntroducida = moment(row.value.wascs_fecha_entrega);
                let momentFechaActual = moment();
                let momentFechaActualMasUno = moment().add(1,'days');
                let flagDiaActual = false;
                let flagDiaPosterior = false;
    
                if (momentFechaIntroducida.format('YYYY-MM-DD') !== momentFechaActual.format('YYYY-MM-DD')) {
                    flagDiaActual = true;
                }
                if (flagDiaActual) {
                    flagDiaActual = false;
                    if (momentFechaIntroducida.format('YYYY-MM-DD') !== momentFechaActualMasUno.format('YYYY-MM-DD')) {
                        flagDiaPosterior = true;
                    }
                }
                if (flagDiaActual || flagDiaPosterior) {
                    e.summary.isValid = false;
                    e.summary.message = "La fecha de entrega debe ser el día actual o posterior";
                }
            }
            */
            if (!isNullOrUndefined(row.value.wascs_fecha_entrega)) {
                let momentFechaIntroducida = moment(row.value.wascs_fecha_entrega);
                let momentFechaActual = moment();
                if (momentFechaIntroducida.format('YYYY-MM-DD') < momentFechaActual.format('YYYY-MM-DD')) {
                    e.summary.isValid = false;
                    e.summary.message = "La fecha de entrega debe ser la fecha actual o posterior";
                }
            }
        }
        if (taskDefinitionKey === "wascs_t2"){
            if ( (!row.value.wascs_corregir || row.value.wascs_corregir) && row.value.wascs_correcto == true && !row.value.wascs_grupo_articulos){
                e.summary.isValid = false;
                e.summary.message = "Campo \'Grupo de artículos\' es obligatorio.";
            }
        }
    },
    valueComentarios(fieldComentario, fieldHistorico, texto) {
        if (fieldComentario.value && !fieldHistorico.value.includes(fieldComentario.value)) {
            fieldHistorico.value += texto + fieldComentario.value;
            fieldComentario.value = "";
        }
    },
}

function formatFechasTareasCompletadas(campoFecha: FormFieldModel) {
    if (!isNullOrUndefined(campoFecha)) {
        if (campoFecha.value.includes("CET") || campoFecha.value.includes("UTC")) {
            let fechaText = campoFecha.value.replace(" CET", "");
            fechaText = fechaText.replace(" UTC", "");
            var date = new Date(fechaText);
            campoFecha.value = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
        }
    }
}


// function asignarAyudaUsuario(array,id){
//     let cadena="";
//     for (let item of array){
//       cadena+= item;
//     }
//     $(id).parents().eq(6).attr("data-tip",cadena);
  
//   }
