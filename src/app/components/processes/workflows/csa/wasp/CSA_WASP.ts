import { FormFieldModel, FormFieldEvent, DynamicTableRow, ValidateDynamicTableRowEvent, FormService, FORM_FIELD_VALIDATORS, NotificationService} from "@alfresco/adf-core"; 
import { FieldValidatorWASP } from "./fieldValidatorWASP";
import { isUndefined, isNullOrUndefined } from "util"; 
//import { TreePepsService } from '../../../../../services/tree-peps.service';
import { HttpClient } from "@angular/common/http";
//import { FormValueRepresentation } from "@alfresco/js-api";
import moment from "moment";

export const CSA_WASP = {


    formLoaded(e: FormFieldEvent, fields: FormFieldModel[], http:HttpClient) {

        e.form.fieldValidators = [
            ...FORM_FIELD_VALIDATORS,
            new FieldValidatorWASP()
        ]

        let taskDefinitionKey = e.form.json.taskDefinitionKey;
        if (taskDefinitionKey === "wasp_t2" || taskDefinitionKey === "wasp_t3") {
            var wasp_motivo_rechazo = fields.find(f => f.id === 'wasp_rechazo');
            var wasp_correcto = fields.find(f => f.id === 'wasp_correcto');
            if (wasp_correcto) wasp_correcto.value = "SI";
            if (!isUndefined(wasp_motivo_rechazo)) {
                var wasp_accion_csa = fields.find(f => f.id === 'wasp_accion_csa');
                if (wasp_accion_csa) wasp_accion_csa.value = "ACEPTAR";
                wasp_motivo_rechazo.value = "";
            }
        }
        let required_fields = ["wasp_solicitudes", "wasp_accion_solicitante", "wasp_sociedad", "wasp_area", "wasp_num_solicitante", "wasp_posiciones",
            "wasp_posicion", "wasp_texto_breve", "wasp_cantidad", "wasp_unidad", "wasp_precio", "wasp_condiciones_pago", "wasp_fecha_entrega", 
            "wasp_orden_imputacion, wasp_tipo_compra"]; //wasp_tipo_compra -> calc automatico
        fields.forEach(field => { //"wasp_moneda", "wasp_indicativo_iva"
            if (required_fields.includes(field.id)) {
                field.required = true;
            }
        });

        /*let tipoMoneda = fields.find(f => f.id === 'wasp_moneda');
        if (tipoMoneda === null || !isNullOrUndefined(tipoMoneda)){
            console.log(tipoMoneda);

        }*/
        
        let fechaInicioSolicitud = fields.find(f => f.id === 'wasp_fecha_inicio_solicitud');
        if (fechaInicioSolicitud === null || !isNullOrUndefined(fechaInicioSolicitud)) {
            fechaInicioSolicitud.readOnly = true;
            if (isUndefined(taskDefinitionKey)) { //Tarea start
                let date = new Date();
                fechaInicioSolicitud.value = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
            }
        }
        

        let grupo_tarea = fields.find(f => f.id === 'wasp_grupo_tareas');
        if (!isNullOrUndefined(grupo_tarea)) {
            grupo_tarea.value = 'Solicitud de documentos de compra';
            grupo_tarea.readOnly = true;
        }

        let tarea = fields.find(f => f.id === 'wasp_tarea');
        if (!isNullOrUndefined(tarea)) {
            tarea.value = 'Solicitud de Pedido';
            tarea.readOnly = true;
        }

        let clasePedido = fields.find(f => f.id === 'wasp_clase_pedido');
        if (!isNullOrUndefined(clasePedido)) {
            if (clasePedido.value == 'empty') clasePedido.value = 'ZSIM';
            clasePedido.readOnly = true;
        }

        let grupoCompras = fields.find(f => f.id === 'wasp_grupo_compras');
        if (!isNullOrUndefined(grupoCompras)) {
            if (grupoCompras.value == 'empty') grupoCompras.value = 'VVS';
            grupoCompras.readOnly = true;
        }

        let orgCompras = fields.find(f => f.id === 'wasp_organizacion_compras');
        if (!isNullOrUndefined(orgCompras)) {
            if (orgCompras.value == 'empty') orgCompras.value = 'VD01';
            orgCompras.readOnly = true;
        }

        if (!isNullOrUndefined(taskDefinitionKey) && taskDefinitionKey.includes('wasp_t1_correction')) {
            var wasp_rechazo = fields.find(f => f.id === 'wasp_rechazo');
            var wasp_datos_corregir = fields.find(f => f.id === 'wasp_datos_corregir');
            if (!isNullOrUndefined(wasp_rechazo) && !isNullOrUndefined(wasp_datos_corregir)) {
                if (wasp_rechazo.value && wasp_datos_corregir.value) {
                    // wasp_datos_corregir.isVisible = false;
                    wasp_datos_corregir.value = '';
                }
            }
            fields.forEach(field => {
                if (field.id == 'wasp_rechazo' || field.id == 'wasp_datos_corregir') {
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

            var wasp_rechazo = fields.find(f => f.id === 'wasp_rechazo');
            if (!isUndefined(wasp_rechazo)) {
                // Limpiamos los radio buttons que sirven para indicar es correcto y el campo de rechazo
                var wasp_accion_csa = fields.find(f => f.id === 'wasp_accion_csa');
                if (wasp_accion_csa) wasp_accion_csa.value = "ACEPTAR";
                wasp_motivo_rechazo.value = "";
            }

            var wasp_datos_corregir = fields.find(f => f.id === 'wasp_datos_corregir');
            if (!isUndefined(wasp_datos_corregir)) {
                var wasp_correcto = fields.find(f => f.id === 'wasp_correcto');
                var wasp_accion_correcto = fields.find(f => f.id === 'wasp_accion_correcto');
                wasp_correcto.value = "SI";
                wasp_accion_correcto.value = "VIABLE";
                wasp_datos_corregir.value = "";
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

        if (!isNullOrUndefined(taskDefinitionKey) && !taskDefinitionKey.includes('wasp_t1_correction') && !taskDefinitionKey.includes('wasp_borrador')){ //Tstart ==undefined 
            var wasp_fichero = fields.find(f => f.id ===  'wasp_documentacion');
            if( !isUndefined(wasp_fichero)){
                wasp_fichero.readOnly = true;
            }
        }

        let wasp_historico = fields.find(f => f.id ===  'wasp_historico');
        if( !isUndefined(wasp_historico) ){
            wasp_historico.readOnly = true;
            if(wasp_historico.value == null) wasp_historico.value = '';
                if (taskDefinitionKey.includes('wasp_t1') || taskDefinitionKey.includes('wasp_borrador')  || (taskDefinitionKey.includes('wasp_t3')) || (taskDefinitionKey.includes('wasp_t4'))  ) {
                    var wasp_comentarios_csa = fields.find(f => f.id === 'wasp_comentarios_csa');
                    this.valueComentarios(wasp_comentarios_csa,wasp_historico,"\n- CSA : ");
                } else if (taskDefinitionKey.includes('wasp_t2')) {
                    var comentariosSolicitante = fields.find(f => f.id === 'wasp_comentarios_solicitante');
                    this.valueComentarios(comentariosSolicitante,wasp_historico,"\n- Solicitante : ");
                }
        }

        //textareaResultadoSap
        let respuestaSap = fields.find(f => f.id === "wasp_sap_result");
        if(!isNullOrUndefined(respuestaSap)) respuestaSap.readOnly = true;
        if ((!isNullOrUndefined(respuestaSap) && (respuestaSap.value !== "CREACION CORRECTA"))) {
            let radioBtn = fields.find(f => f.id === "wasp_correcto");
            radioBtn.value = "NO";
            radioBtn.readOnly = true;
        }

        // //check resultadoSAP
        // let resultadoSap = fields.find(f => f.id === "resultadodesap");
        // if ((!isNullOrUndefined(resultadoSap) && (resultadoSap.value !== "CREACION CORRECTA"))) {
        //     let radioBtn = fields.find(f => f.id === "wasp_correcto");
        //     radioBtn.value = "NO";
        //     radioBtn.readOnly = true;
        // }

        //estadoautorizacinwf
        /* let estadoAutorizacinwf = fields.find(f => f.id === 'estadoautorizacinwf');
        if (!isUndefined(estadoAutorizacinwf)) {
            let wasp_sap_ndoc = fields.find(f => f.id === 'nmerodedocumento');
            if (!isNullOrUndefined(wasp_sap_ndoc) && wasp_sap_ndoc.value !== "") {
                http.get(
                    '/WS_BPM_REST/jcmouse/restapi/sap_pi/CONSULTA_ESTADO_COMPRA/COMPRA_SIMPLIFICADA/N_DOC/' + wasp_sap_ndoc.value, { observe: 'response' })
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

        /*if (isUndefined(taskDefinitionKey)){
            var wasp_tipo_contrato = fields.find(f => f.id === 'wasp_tipo_contrato');
            console.log("entra en el undeufned");
            wasp_tipo_contrato.readOnly = true; 
        }*/

        if( !isUndefined(taskDefinitionKey)  && !taskDefinitionKey.includes('wasp_t1')  ){
                var wasp_tabla = fields.find(f => f.id ===  'wasp_solicitudes');
                loadTable(wasp_tabla);
        }

        
        function loadTable(wasp_tabla: FormFieldModel) {
            if (wasp_tabla.value) {
                wasp_tabla.value.forEach(compra => {
                    // Limpiamos los campos de correccion de las tablas
                    let corregir = wasp_tabla.id.replace("_solicitudes", "") + "_corregir";
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

        if (e.field.id === 'wasp_num_solicitante'){
            if(!e.field.isValid) e.field.validationSummary.message = "El campo solicitante tiene que ser un valor entre 900000 y 999999";
        }

        if (e.field.id === 'wasp_posiciones'){
            if(!e.field.isValid) e.field.validationSummary.message = "No introducir más de 3 carácteres";
        }
        
        if (e.field.id === 'wasp_area') {
            var resp = fields.find(f => f.id === 'wasp_responsable_area');
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

        if (e.field.id === 'wasp_sociedad') {
            if (fields.find(f => f.id === 'wasp_sociedad')) {
                var co = fields.find(f => f.id === 'wasp_sociedad_co');
                if (e.field.value == '8700' || e.field.value == '8704' || e.field.value == '8712') {
                    co.value = '8700';
                } else if (e.field.value == '0100' || e.field.value == '0101' || e.field.value == '0102' || e.field.value == '0103' || e.field.value == '0104' || e.field.value == '0262' || e.field.value == '0446' || e.field.value == '0568' || e.field.value == '0607') {
                    co.value = 'GV01';
                }
                var activitiwasp_sociedad_co = fields.find(f => f.id === 'wasp_sociedad_co');
                activitiwasp_sociedad_co.readOnly = true;
            }
        }

        if (e.field.id === 'wasp_tipo_pedido') {
            var estado = e.field.value;
            //var ceco = fields.find(f => f.id === "wasp_ceco");
            //var imputacion = fields.find(f => f.id === "wasp_orden_imputacion");
            if (estado === "abierto"){
                console.log("mostrar Ceco y ocultar orden");
                //ceco.isVisible = true;
                //imputacion.isVisible = false;
            }else if (estado === "cerrado"){
                console.log("mostrar orden y ocultar Ceco");
                //ceco.isVisible = false;
                //imputacion.isVisible = true;
            }else{
                console.log("ocultar los dos");
                //ceco.isVisible = false;
                //imputacion.isVisible = false;
            }
            //console.log(e);
        }
    },
    validateDynamicTableRow(row: DynamicTableRow, e: ValidateDynamicTableRowEvent, fields: FormFieldModel[], /*treeService: TreePepsService,*/ formService: FormService, visibilityService) {
        let regex = null;
        let taskDefinitionKey = e.form.json.taskDefinitionKey;
        console.log(taskDefinitionKey);
        if( !taskDefinitionKey || taskDefinitionKey.includes("wasp_t1") ||  taskDefinitionKey.includes("wasp_borrador") ){
            if (!isNullOrUndefined(row.value.wasp_precio)) {
                let stringMascara = "^[0-9]{1,12}([,]{1}[0-9]{1,2})?$";
                regex = new RegExp(stringMascara);
                if (!regex.test(row.value.wasp_precio)) {
                    e.summary.isValid = false;
                    e.summary.message = "El valor del precio unitario está formado por hasta 12 dígitos enteros y hasta 2 decimales separados por coma";
                }
            }
            //campos númericos
            if ( (!isNullOrUndefined(row.value.wasp_cantidad) && isNaN(row.value.wasp_cantidad) ) || (row.value.wasp_cantidad.includes(".") ) ){
                    e.summary.isValid = false;
                    e.summary.message = "El campo Cantidad debe ser un número entero";
            }

            //campo fecha validación mismo día o posterior
            /*if (!isNullOrUndefined(row.value.wasp_fecha_entrega)) {
                let momentFechaIntroducida = moment(row.value.wasp_fecha_entrega);
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
           //console.log(row.value.wasp_fecha_entrega);
            if (!isNullOrUndefined(row.value.wasp_fecha_entrega)) {
                let momentFechaIntroducida = moment(row.value.wasp_fecha_entrega);
                let momentFechaActual = moment();
                console.log(momentFechaIntroducida);
                if (momentFechaIntroducida.format('YYYY-MM-DD') < momentFechaActual.format('YYYY-MM-DD')) {
                    e.summary.isValid = false;
                    e.summary.message = "La fecha de entrega debe ser la fecha actual o posterior";
                }
            }
        }
        if (taskDefinitionKey === "wasp_t2"){
            if ( (!row.value.wasp_corregir || row.value.wasp_corregir) && row.value.wasp_correcto == true && !row.value.wasp_grupo_articulos){
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
