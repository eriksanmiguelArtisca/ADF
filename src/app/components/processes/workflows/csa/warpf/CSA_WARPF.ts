import { FormFieldModel, FormFieldEvent, DynamicTableRow, ValidateDynamicTableRowEvent, FormService, FORM_FIELD_VALIDATORS,NotificationService } from "@alfresco/adf-core"; 
import { FieldValidatorWARPF } from "./fieldValidatorWARPF";
import { isNullOrUndefined, isUndefined } from "util";
import { FormValueRepresentation } from "@alfresco/js-api";
import { HttpClient } from "@angular/common/http";
import moment from "moment";

// declare var $: any;

export const CSA_WARPF = {

    formLoaded(e: FormFieldEvent, fields: FormFieldModel[], http:HttpClient) {

        e.form.fieldValidators = [
            ...FORM_FIELD_VALIDATORS,
            new FieldValidatorWARPF()
        ]

        let taskDefinitionKey = e.form.json.taskDefinitionKey;
        if (taskDefinitionKey === "warpf_t2" || taskDefinitionKey === "warpf_t3") {
            var warpf_motivo_rechazo = fields.find(f => f.id === 'warpf_rechazo');
            var warpf_correcto = fields.find(f => f.id === 'warpf_correcto');
            if (warpf_correcto) warpf_correcto.value = "SI";
            if (!isUndefined(warpf_motivo_rechazo)) {
                var warpf_accion_csa = fields.find(f => f.id === 'warpf_accion_csa');
                if (warpf_accion_csa) warpf_accion_csa.value = "ACEPTAR";
                warpf_motivo_rechazo.value = "";
            }
        }

        let required_fields = ["warpf_solicitudes", "warpf_accion_solicitante", "warpf_sociedad", "warpf_area", "warpf_cif", "warpf_solicitante", "warpf_posiciones",
            "warpf_contrato"]; //opcional segun contrato "warpf_numero_contrato"
        fields.forEach(field => {
            if ( required_fields.includes(field.id)  ) {
                field.required = true;
            }
            else if ( (taskDefinitionKey === "warpf_t1_correction" || taskDefinitionKey === "warpf_t2") &&  ["warpf_retencion" ,"warpf_pronto_pago"].includes(field.id) ){ 
                var warpf_clase_pedido = fields.find(f => f.id === 'warpf_clase_pedido');
                if (!isUndefined(warpf_clase_pedido) && warpf_clase_pedido.value === 'ZRET') {
                    field.required = true;
                }
            }
        });

        let fechaInicioSolicitud = fields.find(f => f.id === 'warpf_fecha_inicio_solicitud');
        if (fechaInicioSolicitud === null || !isNullOrUndefined(fechaInicioSolicitud)) {
            fechaInicioSolicitud.readOnly = true;
            if (isUndefined(taskDefinitionKey)) { //warpf_t1-> isUndefined = Tarea start
                let date = new Date();
                fechaInicioSolicitud.value = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
            }
        }

        let grupo_tarea = fields.find(f => f.id === 'warpf_grupo_tareas');
        if (!isNullOrUndefined(grupo_tarea)) {
            grupo_tarea.value = 'Cuentas a pagar y cobrar. Facturas emitidas y recibidas.';
            grupo_tarea.readOnly = true;
        }

        let tarea = fields.find(f => f.id === 'warpf_tarea');
        if (!isNullOrUndefined(tarea)) {
            tarea.value = 'Solicitud de pedido de ventas y emisión de facturas';
            tarea.readOnly = true;
        }

        // let razonSocial = fields.find(f => f.id === 'warpf_razon_social');
        // if (!isNullOrUndefined(razonSocial)) {
        //     razonSocial.readOnly = true;
        // }

        let orgVentas = fields.find(f => f.id === "warpf_organizacion_ventas");
        if (!isNullOrUndefined(orgVentas)) {
            orgVentas.readOnly = true;
        }

        let canalDistribucion = fields.find(f => f.id === "warpf_canal_distribucion");
        if (!isNullOrUndefined(canalDistribucion)) {
            canalDistribucion.readOnly = true;
        }

        let sector = fields.find(f => f.id === "warpf_sector");
        if (!isNullOrUndefined(sector)) {
            sector.readOnly = true;
        }


        let cifCliente = fields.find(f => f.id === 'warpf_cif');
        if (!isNullOrUndefined(cifCliente)) {
            if (isNullOrUndefined(taskDefinitionKey) || taskDefinitionKey == "warpf_t1_correction" || taskDefinitionKey == "warpf_borrador") { //editable solo en tStart y t1 correccion
                cifCliente.readOnly = false;
            } else {
                cifCliente.readOnly = true;
            }
        }

        if (!isNullOrUndefined(taskDefinitionKey) && taskDefinitionKey.includes('warpf_t1_correction')) {
            var warpf_rechazo = fields.find(f => f.id === 'warpf_rechazo');
            var warpf_datos_corregir = fields.find(f => f.id === 'warpf_datos_corregir');
            if (!isNullOrUndefined(warpf_rechazo) && !isNullOrUndefined(warpf_datos_corregir)) {
                if (warpf_rechazo.value && warpf_datos_corregir.value) {
                    warpf_datos_corregir.value = '';
                }
            }
            fields.forEach(field => {
                if (field.id == 'warpf_rechazo' || field.id == 'warpf_datos_corregir') {
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
            var warpf_rechazo = fields.find(f => f.id === 'warpf_rechazo');
            if (!isUndefined(warpf_rechazo)) {
                // Limpiamos los radio buttons que sirven para indicar es correcto y el campo de rechazo
                var warpf_accion_csa = fields.find(f => f.id === 'warpf_accion_csa');
                if (warpf_accion_csa) warpf_accion_csa.value = "ACEPTAR";
                warpf_motivo_rechazo.value = "";
            }
            var warpf_datos_corregir = fields.find(f => f.id === 'warpf_datos_corregir');
            if (!isUndefined(warpf_datos_corregir)) {
                var warpf_correcto = fields.find(f => f.id === 'warpf_correcto');
                var warpf_accion_correcto = fields.find(f => f.id === 'warpf_accion_correcto');
                warpf_correcto.value = "SI";
                warpf_accion_correcto.value = "VIABLE";
                warpf_datos_corregir.value = "";
            }
        }

        // if (!isNullOrUndefined(taskDefinitionKey) && !taskDefinitionKey.includes('warpf_t1_correction') && !taskDefinitionKey.includes('warpf_borrador')){ //Tstart ==undefined //documentacion contrato
        //     var warpf_fichero = fields.find(f => f.id ===  'warpf_doc_contrato');
        //     if( !isUndefined(warpf_fichero)){
        //         warpf_fichero.readOnly = true;
        //         // warpf_fichero.isVisible = false;
        //     }
        // }
        if (!isNullOrUndefined(taskDefinitionKey) && (taskDefinitionKey.includes('warpf_t4') || taskDefinitionKey.includes('warpf_t5')) ) {
            var warpf_fichero = fields.find(f => f.id === 'warpf_doc_contrato');
            if (!isUndefined(warpf_fichero)) {
                warpf_fichero.readOnly = true;
            }
        }

        if (!isNullOrUndefined(taskDefinitionKey) && !taskDefinitionKey.includes('warpf_t1_correction') && !taskDefinitionKey.includes('warpf_borrador')){ //Tstart ==undefined  //documentacion general
            var warpf_documentacion = fields.find(f => f.id ===  'warpf_documentacion');
            if( !isUndefined(warpf_documentacion)){
                warpf_documentacion.readOnly = true;
                // warpf_documentacion.isVisible = false;
            }
        }


        let warpf_historico = fields.find(f => f.id === 'warpf_historico');
        if (!isUndefined(warpf_historico)) {
            warpf_historico.readOnly = true;
            if (warpf_historico.value == null) warpf_historico.value = '';
            if (taskDefinitionKey.includes('warpf_t1') || taskDefinitionKey.includes('warpf_borrador') || (taskDefinitionKey.includes('warpf_t3')) || (taskDefinitionKey.includes('warpf_t4'))) {
                var warpf_comentarios_csa = fields.find(f => f.id === 'warpf_comentarios_csa');
                this.valueComentarios(warpf_comentarios_csa, warpf_historico, "\n- CSA : ");
            } else if (taskDefinitionKey.includes('warpf_t2')) {
                var comentariosSolicitante = fields.find(f => f.id === 'warpf_comentarios_solicitante');
                this.valueComentarios(comentariosSolicitante, warpf_historico, "\n- Solicitante : ");
            }
        }

          //check resultadoSAP
          let resultadoSap = fields.find(f => f.id === "warpf_sap_result");
          if(!isNullOrUndefined(resultadoSap)) resultadoSap.readOnly = true;
          if ((!isNullOrUndefined(resultadoSap) && (resultadoSap.value !== "CREACION CORRECTA"))) {
              let radioBtn = fields.find(f => f.id === "warpf_correcto");
              radioBtn.value = "NO";
              radioBtn.readOnly = true;
          }
  
        //estadoautorizacinwf
/*         let estadoAutorizacinwf = fields.find(f => f.id === 'estadoautorizacinwf');
        if (!isUndefined(estadoAutorizacinwf)) {
            let warpf_sap_ndoc = fields.find(f => f.id === 'nmerodedocumento');
            if (!isNullOrUndefined(warpf_sap_ndoc) && warpf_sap_ndoc.value !== "") {
                if (warpf_sap_ndoc.value.substring(0, 4) === "0089") {
                    var n_doc = warpf_sap_ndoc.value.substring(2,warpf_sap_ndoc.value.length);
                }
                http.get(
                    '/WS_BPM_REST/jcmouse/restapi/sap_pi/CONSULTA_ESTADO_VENTA/VENTA/N_DOC/' + n_doc, { observe: 'response' })
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

        if( !isUndefined(taskDefinitionKey)  && !taskDefinitionKey.includes('warpf_t1')  ){
            var warpf_tabla = fields.find(f => f.id ===  'warpf_solicitudes');
            loadTable(warpf_tabla);
    }

    
    function loadTable(warpf_tabla: FormFieldModel) {
        if (warpf_tabla.value) {
            warpf_tabla.value.forEach(venta => {
                // Limpiamos los campos de correccion de las tablas
                let corregir = warpf_tabla.id.replace("_solicitudes", "") + "_corregir";
                if (venta[corregir]) {
                    venta[corregir] = "";
                }
            });
        }
    }
        var fechadesolicitud = fields.find(f => f.id ===  'fechadesolicitud');
        formatFechasTareasCompletadas(fechadesolicitud);
    
    },

    formFieldValueChanged(e: FormFieldEvent, fields: FormFieldModel[], http:HttpClient, notificationService:NotificationService) {

        if (e.field.id === 'warpf_area') {
            var resp = fields.find(f => f.id === 'warpf_responsable_area');
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

        if (e.field.id === 'warpf_sociedad') {
            if (fields.find(f => f.id === 'warpf_sociedad')) {
                var co = fields.find(f => f.id === 'warpf_sociedad_co');
                if (e.field.value == '8700' || e.field.value == '8704' || e.field.value == '8712') {
                    co.value = '8700';
                } else if (e.field.value == '0100' || e.field.value == '0101' || e.field.value == '0102' || e.field.value == '0103' || e.field.value == '0104' || e.field.value == '0262' || e.field.value == '0446' || e.field.value == '0568' || e.field.value == '0607') {
                    co.value = 'GV01';
                }
                var activitiwarpf_sociedad_co = fields.find(f => f.id === 'warpf_sociedad_co');
                activitiwarpf_sociedad_co.readOnly = true;
            }
        }
        let taskDefinitionKey = e.form.json.taskDefinitionKey;


        if ( (taskDefinitionKey === "warpf_t1_correction" || taskDefinitionKey === "warpf_t2") && 
            e.field.id === 'warpf_clase_pedido' && !isUndefined(e.field.value)){ 
            var warpf_retencion = fields.find(f => f.id === 'warpf_retencion');
            var warpf_pronto_pago = fields.find(f => f.id === 'warpf_pronto_pago');
            if (warpf_retencion && e.field.value === 'ZRET') warpf_retencion.required =true; else if(warpf_retencion) warpf_retencion.required =false;
            if (warpf_pronto_pago && e.field.value === 'ZRET') warpf_pronto_pago.required =true;  else if(warpf_pronto_pago) warpf_pronto_pago.required =false;
        }

        if (e.field.id === 'warpf_numero_contrato') {
            var docContrato = fields.find(f => f.id === 'warpf_doc_contrato');
            // var numContrato = fields.find(f => f.id === 'warpf_numero_contrato');
            if (e.field.value && e.field.value.length === 6) { /*CONTRATO:SI, NºCONTRATO:SI, ADJUNTO: NO*/ // 
                docContrato.required = false;
                // numContrato.required = true;
            } else {
                if (e.field.value){
                    docContrato.required = true;
                    // numContrato.required = false;
                }
            }
        }
        
        if (e.field.id === 'warpf_contrato' && e.field.value !== "empty") {
            var docContrato = fields.find(f => f.id === 'warpf_doc_contrato');
            if (e.field.value === "NO") {
                docContrato.required = false;
            }else{
                docContrato.required = true;
            }
        }

        if (e.field.id === 'warpf_cif') {
            if (e.field.value instanceof FormValueRepresentation) {
                //razon social
                // let valueRazonSocial = e.field.value.name.split("]");
                // let razonSocial = fields.find(f => f.id === 'warpf_razon_social');
                // razonSocial.value = valueRazonSocial[0].substring(6,valueRazonSocial[0].length);
                //condicionesCobro
                http.get('/WS_BPM_REST/jcmouse/restapi/sap_pi/VALIDACION_PAGO_CLIENTE/VENTA/CIF_CLIENT/' +
                    e.field.value.id, { observe: 'response' }).toPromise()
                    .then(response => {
                        let correct = response.body["MT_HUBCOM_RES"]["CORRECTO"];
                        if (correct == "X") {
                            let condicionesDeCobro = response.body["MT_HUBCOM_RES"]["RESULTADO"].item;
                            let tablaSolicitud = fields.find(f => f.id === 'warpf_solicitudes');
                            if (!isNullOrUndefined(tablaSolicitud)) {
                                let campos = tablaSolicitud.json.columnDefinitions;
                                let rowCondCobro = campos.find(f => f.id === 'warpf_condiciones_cobro');
                                rowCondCobro.value = { id: condicionesDeCobro["VALOR"], name: condicionesDeCobro["TEXTO"] ? condicionesDeCobro["TEXTO"] : condicionesDeCobro["VALOR"]};
                                // rowCondCobro.editable = false;
                            }
                        } else {
                            notificationService.openSnackMessageAction(response.body["MT_HUBCOM_RES"]["MENSAJE"], "Aceptar", {
                                duration: 10000,
                                horizontalPosition: "center",
                                verticalPosition: "top"
                            });
                        }
                    }, error => notificationService.openSnackMessageAction("Error durante la consulta de las condiciones de cobro", "Aceptar", {
                        duration: 10000,
                        horizontalPosition: "center",
                        verticalPosition: "top"
                    })
                    );
            }
        }
    },
    validateDynamicTableRow(row: DynamicTableRow, e: ValidateDynamicTableRowEvent, fields: FormFieldModel[], formService: FormService, visibilityService) {
        let regex = null;
        if (!isNullOrUndefined(row.value.warpf_precio_unitario)) {
            let stringMascara = "^[0-9]{1,12}([,]{1}[0-9]{1,2})?$";  
            regex = new RegExp(stringMascara);
            if (!regex.test(row.value.warpf_precio_unitario)) {
                e.summary.isValid = false;
                e.summary.message = "El valor del precio unitario está formado por hasta 12 dígitos enteros y hasta 2 decimales separados por coma";
            }
        }
        //campos númericos
        if ( (!isNullOrUndefined(row.value.warpf_cantidad) && isNaN(row.value.warpf_cantidad) ) || (row.value.warpf_cantidad.includes(".") ) ) {
            e.summary.isValid = false;
            e.summary.message = "El campo Cantidad debe ser un número entero";
        }

        if (!isNullOrUndefined(row.value.warpf_unidad) && !(row.value.warpf_unidad instanceof Object)) {
            e.summary.isValid = false;
            e.summary.message = "El campo Unidad debe ser válido";
        }

        //campo fecha validación mismo día o día posterior
        /*if (!isNullOrUndefined(row.value.warpf_fecha_factura)) {
            let momentFechaIntroducida = moment(row.value.warpf_fecha_factura);
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
                e.summary.message = "La fecha de entrega debe ser la fecha actual o posterior";
            }
        }*/
        if (!isNullOrUndefined(row.value.warpf_fecha_factura)) {
            let momentFechaIntroducida = moment(row.value.warpf_fecha_factura);
            let momentFechaActual = moment();
            if (momentFechaIntroducida.format('YYYY-MM-DD') < momentFechaActual.format('YYYY-MM-DD')) {
                e.summary.isValid = false;
                e.summary.message = "La fecha de entrega debe ser la fecha actual o posterior";
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



