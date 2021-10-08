import { FormFieldModel, FormFieldEvent } from "@alfresco/adf-core";
import { HttpClient } from "@angular/common/http";
import { isNullOrUndefined, isUndefined } from "util";

export const CSA_WASAP = {
    formLoaded(e: FormFieldEvent, fields: FormFieldModel[], http:HttpClient)  {
        let taskDefinitionKey = e.form.json.taskDefinitionKey;
        //Control de campos requeridos
        let required_fields = ['wasap_sociedad','wasap_area','wasap_cif_proveedor','wasap_referencia','wasap_importe','wasap_moneda','wasap_ceco',
        'wasap_fecha_contabilizacion','wasap_fecha_doc','wasap_texto','wasap_accion_solicitante'];
        fields.forEach(field => {
            if( required_fields.includes( field.id) ){
                field.required = true;
            }
        });

        if( !isUndefined(taskDefinitionKey) ){
            if( taskDefinitionKey.includes('wasap_t1')  ){
                fields.forEach(field => {
                    if(  field.id == 'wasap_rechazo'  || field.id == 'wasap_datos_corregir'){
                        field.readOnly = true;
                        // Si son campos de rechazo y estamos en la tarea de correccion ponemos una condicion de visibilidad para que solo se muestren si son vacios
                        let visibility : any = {
                            leftFormFieldId : field.id,
                            leftType : "field",
                            leftValue : field.id,
                            operator : "!empty"
                        };
                        field.visibilityCondition = visibility;
                    }
                }); 
            }else {
                var wasap_fichero = fields.find(f => f.id ===  'wasap_fichero');
                if( !isUndefined(wasap_fichero)){
                    wasap_fichero.readOnly = true;
                }
                //Limpieza de campos de rechazo
                var activitiwasap_rechazo = fields.find(f => f.id ===  'wasap_rechazo' );
                if( !isUndefined(activitiwasap_rechazo) && activitiwasap_rechazo.type!== "readonly"){
                    activitiwasap_rechazo.value ="";
                    activitiwasap_rechazo.readOnly = false;
                }
                 //Limpieza de datos a corregir
                var wasap_datos_corregir = fields.find(f => f.id ===  'wasap_datos_corregir');
                if( !isUndefined(wasap_datos_corregir) && wasap_datos_corregir.type!== "readonly"){
                    wasap_datos_corregir.value ="";
                    wasap_datos_corregir.readOnly = false;
                }

                var controller_rechazo = fields.find(f => f.id ===  'wasap_accion_csa');
                if( !isUndefined(controller_rechazo)){
                    if(controller_rechazo.value=="RECHAZAR"){
                        activitiwasap_rechazo.readOnly = false;
                    /*     activitiwasap_rechazo.value=""; */
                    }
                }

                var controller_rechazo = fields.find(f => f.id ===  'wasap_accion_csa_sap');
                if( !isUndefined(controller_rechazo)){
                    if(controller_rechazo.value=="X"){
                        wasap_datos_corregir.readOnly = false;
/*                         wasap_datos_corregir.value=""; */
                    }
                }

 
            }
        } else {
            var wasap_texto_cabecera = fields.find(f => f.id === 'wasap_texto_cabecera');
            if( !isUndefined(wasap_texto_cabecera)  ){
                wasap_texto_cabecera.value = 'Anticipo proveedor';
            }
        }

        
             
/*         let estadoautorizacinwf = fields.find(f => f.id === 'estadoautorizacinwf');
        if( !isUndefined(estadoautorizacinwf)){
        let wasap_sap_ndoc = fields.find(f => f.id === 'nmerodedocumento');
        let ndoc = wasap_sap_ndoc.value.split("-");
        let sociedad = ndoc[0].trim();
        let documento = ndoc[1].trim();
        let ejercicio = ndoc[2].trim();
        //estadoautorizacinwf
            http.get(
            '/WS_BPM_REST/jcmouse/restapi/sap_pi/CONSULTA_ESTADO_ANTICIPO/ANTICIPOS_PROVEEDORES/SOCIEDAD,'
            +'N_DOC,EJERCICIO/'+sociedad+','+documento+','+ejercicio,{observe: 'response'})
                .subscribe(response => {
                    let estado = response.body["MT_HUBCOM_RES"]["RESULTADO"].item["TEXTO"];
                    estadoautorizacinwf.value = estado;
                    if (estado === "Aprobada" || estado === "Rechazada") {
                        let comentAutorizacion = fields.find(f => f.id === 'comentariosautorizacinwf');
                        if (!isNullOrUndefined(comentAutorizacion)) {
                            comentAutorizacion.value = "";
                        }
                    }
            });

        } */

        //Nombres tarea/grupo tareas
        var grupo_tarea = fields.find(f => f.id === 'wasap_grupo_tareas');
        if( !isUndefined(grupo_tarea)){
            grupo_tarea.value = 'Solicitud de documentos financieros';
            grupo_tarea.readOnly = true; 
        }

        var tarea = fields.find(f => f.id === 'wasap_tarea');
        if( !isUndefined(tarea)){
            tarea.value = 'Solicitud de Anticipo a Proveedores';
            tarea.readOnly = true;
        }
        
        

        var wasap_moneda = fields.find(f => f.id ===  'wasap_moneda');
        if( !isUndefined(wasap_moneda) ){
           if(wasap_moneda.value == 'empty') wasap_moneda.value = 'EUR';
        }

        //Fecha de solicitud
        var fecha_solicitud = fields.find(f => f.id === 'wasap_fecha_inicio_solicitud');
        if (fecha_solicitud === null || !isUndefined(fecha_solicitud)) {
            fecha_solicitud.readOnly = true;
            if (isUndefined(taskDefinitionKey)) { //Tarea start
                var date = new Date();
                fecha_solicitud.value = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
            }
        }

       

        

        var wasap_historico = fields.find(f => f.id ===  'wasap_historico');
        if( !isUndefined(wasap_historico) ){
            wasap_historico.readOnly = true;
            if(wasap_historico.value == null) wasap_historico.value = '';
            if( taskDefinitionKey.includes('wasap_t1')  ){
                var wasap_comentarios_csa = fields.find(f => f.id ===  'wasap_comentarios_csa');
                if(wasap_comentarios_csa.value && !wasap_historico.value.includes(wasap_comentarios_csa.value)){
                    wasap_historico.value += "\n- CSA : "+wasap_comentarios_csa.value;
                    wasap_comentarios_csa.value = "";
                }
            }else if( taskDefinitionKey.includes('wasap_t2')  ){
                var wasap_comentarios_iniciador = fields.find(f => f.id ===  'wasap_comentarios_iniciador');
                if(wasap_comentarios_iniciador.value && !wasap_historico.value.includes(wasap_comentarios_iniciador.value)){
                    wasap_historico.value += "\n- Solicitante : "+wasap_comentarios_iniciador.value;
                    wasap_comentarios_iniciador.value = "";
                }
            }else if( taskDefinitionKey.includes('wasap_t3')  ){
                var wasap_comentarios_csa = fields.find(f => f.id ===  'wasap_comentarios_csa');
                if(wasap_comentarios_csa.value && !wasap_historico.value.includes(wasap_comentarios_csa.value)){
                    wasap_historico.value += "\n- CSA : "+wasap_comentarios_csa.value;
                    wasap_comentarios_csa.value = "";
                }
            }
        }
        
        var wasap_sociedad_co = fields.find(f => f.id ===  'wasap_sociedad_co');
        if(!isUndefined(wasap_sociedad_co)){
            wasap_sociedad_co.readOnly = true;   
        }
        
        // Corregir formato fecha en tareas completadas
        var fechacontabilizacin = fields.find(f => f.id ===  'fechacontabilizacin');
        formatFechasTareasCompletadas(fechacontabilizacin);
        var fechadocumento = fields.find(f => f.id ===  'fechadocumento');
        formatFechasTareasCompletadas(fechadocumento);
        var fechadesolicitud = fields.find(f => f.id ===  'fechadeiniciodelasolicitud');
        formatFechasTareasCompletadas(fechadesolicitud);

    },
    formFieldValueChanged(e: FormFieldEvent, fields : FormFieldModel[]) {
        if (e.field.id === 'wasap_area') {
		    var area = fields.find(f => f.id === 'wasap_area');
            var resp = fields.find(f => f.id === 'wasap_responsable_area');
            if(area != undefined){
                switch(area.value){
                    case 'ADM':
                        resp.value = '900093ADM';
                        break;
                    case 'CON':
                        resp.value = '901889CON';
                        break;    
                    case 'COM':
                        resp.value= '902400COM';
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
        
        if (e.field.id === 'wasap_sociedad') {
            if (fields.find(f => f.id ===  'wasap_sociedad')){
                var mascara = fields.find(f => f.id === 'wasap_ceco');
                mascara.maxLength=10;
                mascara.minLength=6; 

                var sociedad_co = fields.find(f => f.id === 'wasap_sociedad_co');
                if(e.field.value == '8700' || e.field.value == '8704' || e.field.value == '8712'){
                    sociedad_co.value = '8700';
                }else if(e.field.value == '0100' || e.field.value == '0101' || e.field.value == '0102' || e.field.value == '0103' || e.field.value == '0104' || e.field.value == '0262' || e.field.value == '0446' || e.field.value == '0568' || e.field.value == '0607'){
                    sociedad_co.value = 'GV01'; 
                }
            }
        }

      /*   if (e.field.id === 'waacb_sociedad') {
            if (fields.find(f => f.id ===  'waacb_sociedad')){
                var soc = fields.find(f => f.id === 'waacb_sociedad');
                var co = fields.find(f => f.id === 'waacb_sociedad_co');
                if(soc.value == '8700' || soc.value == '8704' || soc.value == '8712'){
                    co.value = '8700';
                }else{
                co.value = 'GV01'; 
                }
                var activitiwaacb_sociedad_co = fields.find(f => f.id === 'waacb_sociedad_co');
                activitiwaacb_sociedad_co.readOnly = true;
            }
        } */
    }
}

function formatFechasTareasCompletadas(campoFecha: FormFieldModel) {
    if (!isNullOrUndefined(campoFecha)) {
        if(campoFecha.value.includes("CET") || campoFecha.value.includes("UTC") ){
            let fechaText = campoFecha.value.replace(" CET", "");
            fechaText = fechaText.replace(" UTC", "");
            var date = new Date(fechaText);
            campoFecha.value = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
        }
    }
}