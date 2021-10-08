import { FormFieldModel, FormFieldEvent } from "@alfresco/adf-core";
import { isNullOrUndefined, isUndefined } from "util";

export const CSA_MODIFICACION_CEBE = {
    formLoaded(e: FormFieldEvent, fields: FormFieldModel[])  {
        //formulario CEBE
        /* let required_fields = ['wamcb_sociedad','wamcb_area'];
        fields.forEach(field => {
            if( required_fields.includes( field.id) ){
                field.required = true;
            }
        }); */

        let taskDefinitionKey = e.form.json.taskDefinitionKey;

        var wamcb_area = fields.find(f => f.id ===  'wamcb_area');
        if(!isUndefined(wamcb_area)){
            wamcb_area.required = true;   
        }

        if( !isUndefined(taskDefinitionKey) ){
            if( taskDefinitionKey.includes('wamcb_t1')  ){
                let readOnly_fields = ['wamcb_sociedad','wamcb_cebe','wamcb_rechazo','wamcb_datos_corregir'];
                fields.forEach(field => {
                    if( readOnly_fields.includes( field.id) ){
                        field.readOnly = true; 
                    }
                    if(  field.id == 'wamcb_rechazo'  || field.id == 'wamcb_datos_corregir'){
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
                var wamcb_fichero = fields.find(f => f.id ===  'wamcb_fichero');
                if( !isUndefined(wamcb_fichero)){
                    wamcb_fichero.readOnly = true;
                }
                var activitiwamcb_rechazo = fields.find(f => f.id ===  'wamcb_rechazo');
                if( !isUndefined(activitiwamcb_rechazo) && activitiwamcb_rechazo.type!== "readonly"){
                    activitiwamcb_rechazo.value ="";
                    activitiwamcb_rechazo.readOnly = false;
                }
                var wamcb_area_jerarquia_nueva = fields.find(f => f.id ===  'wamcb_area_jerarquia_nueva');
                if( !isUndefined(wamcb_area_jerarquia_nueva)){
                    wamcb_area_jerarquia_nueva.readOnly = true;
                }
            }
        }

        var wamcb_historico = fields.find(f => f.id ===  'wamcb_historico');
        if( !isUndefined(wamcb_historico) ){
            wamcb_historico.readOnly = true;
            if(wamcb_historico.value == null) wamcb_historico.value = '';
            if( taskDefinitionKey.includes('wamcb_t1')  ){
                var wamcb_comentarios_controller = fields.find(f => f.id ===  'wamcb_comentarios_controller');
                if(wamcb_comentarios_controller.value){
                    wamcb_historico.value += "\n- Controller : "+wamcb_comentarios_controller.value;
                    wamcb_comentarios_controller.value ="";
                }
                var wamcb_comentarios_csa = fields.find(f => f.id ===  'wamcb_comentarios_csa');
                if(wamcb_comentarios_csa.value ){
                    wamcb_historico.value += "\n- CSA : "+wamcb_comentarios_csa.value;
                    wamcb_comentarios_csa.value = "";
                }
            }else if( taskDefinitionKey.includes('wamcb_t2')  ){
                var wamcb_comentarios_solicitante = fields.find(f => f.id ===  'wamcb_comentarios_solicitante');
                if(wamcb_comentarios_solicitante.value ){
                    wamcb_historico.value += "\n- Solicitante : "+wamcb_comentarios_solicitante.value;
                    wamcb_comentarios_solicitante.value = "";
                }
            }else if( taskDefinitionKey.includes('wamcb_t3')  ){
                var wamcb_comentarios_controller = fields.find(f => f.id ===  'wamcb_comentarios_controller');
                if(wamcb_comentarios_controller.value ){
                    wamcb_historico.value += "\n- Controller : "+wamcb_comentarios_controller.value;
                    wamcb_comentarios_controller.value = "";
                }
            }else if( taskDefinitionKey.includes('wamcb_t4')  ){
                //cambiar comentario controller que no un mostrar valor sino un campo editable
                var wamcb_comentarios_csa = fields.find(f => f.id ===  'wamcb_comentarios_csa');
                if(wamcb_comentarios_csa.value ){
                    wamcb_historico.value += "\n- CSA : "+wamcb_comentarios_csa.value;
                    wamcb_comentarios_csa.value ="";
                }
            }
        }

        var fecha_solicitud = fields.find(f => f.id === 'wamcb_fecha_solicitud');
        if (fecha_solicitud === null || !isUndefined(fecha_solicitud)) {
            fecha_solicitud.readOnly = true;
            if (isUndefined(taskDefinitionKey)) {
                var date = new Date();
                fecha_solicitud.value = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
            }
        }
        
        var fecha_max = fields.find(f => f.id ===  'wamcb_fecha_max');
        if(fecha_max === null ||  !isUndefined(fecha_max)){
            fecha_max.value = '01-01-2099';
            fecha_max.readOnly = true;
        }
    
        var grupo_tarea = fields.find(f => f.id ===  'wamcb_grupo_tareas');
        if( !isUndefined(grupo_tarea)){
            grupo_tarea.value = 'Mantenimiento de estructuras de Control';
            grupo_tarea.readOnly = true; 
        }
        
        var tarea = fields.find(f => f.id === 'wamcb_tarea');
        if( !isUndefined(tarea)){
            tarea.value = 'Modificación de CeBe';
            tarea.readOnly = true; 
        }
        
        var activitiwamcb_tarea = fields.find(f => f.id ===  'wamcb_grupo_tareas');
        if( !isUndefined(grupo_tarea)){
            activitiwamcb_tarea.readOnly = true;
        }
        
        
        var wamcb_inicio_validez = fields.find(f => f.id ===  'wamcb_inicio_validez');
        if(!isUndefined(wamcb_inicio_validez)){
            var date = new Date();
            wamcb_inicio_validez.value = date.getDate() +"-"+ (date.getMonth()+1) +"-"+date.getFullYear();
            wamcb_inicio_validez.maxValue = date.getDate() +"-"+ (date.getMonth()+1) +"-"+date.getFullYear();        
        }
        var wamcb_fin_validez = fields.find(f => f.id ===  'wamcb_fin_validez');
        if(!isUndefined(wamcb_fin_validez)){
            wamcb_fin_validez.value =  '31-12-9999';   
            wamcb_fin_validez.readOnly = true;   
        }
        // /* var wamcb_sociedad = fields.find(f => f.id ===  'wamcb_sociedad');
        // if(!isUndefined(wamcb_sociedad)){
        //     wamcb_sociedad.readOnly = true;   
        // } */
        // var wamcb_area = fields.find(f => f.id ===  'wamcb_area');
        // if(!isUndefined(wamcb_area)){   
        //     wamcb_area.readOnly = true;   
        // }
        var wamcb_denominacion = fields.find(f => f.id ===  'wamcb_denominacion');
        if(!isUndefined(wamcb_denominacion)){
            wamcb_denominacion.readOnly = true;   
        }
        var wamcb_descripcion = fields.find(f => f.id ===  'wamcb_descripcion');
        if(!isUndefined(wamcb_descripcion)){   
            wamcb_descripcion.readOnly = true;   
        }
        var wamcb_codigo_responsable = fields.find(f => f.id ===  'wamcb_codigo_responsable');
        if(!isUndefined(wamcb_codigo_responsable)){
            wamcb_codigo_responsable.readOnly = true;   
        }
        var wamcb_area_jerarquia = fields.find(f => f.id ===  'wamcb_area_jerarquia');
        if(!isUndefined(wamcb_area_jerarquia)){   
            wamcb_area_jerarquia.readOnly = true;   
        }
        var wamcb_sociedad_co = fields.find(f => f.id ===  'wamcb_sociedad_co');
        if(!isUndefined(wamcb_sociedad_co)){
            wamcb_sociedad_co.readOnly = true;   
        }

        // Corregir formato fecha en tareas completadas
        var fechainiciovalidez = fields.find(f => f.id ===  'fechadeiniciodevalidez');
        formatFechasTareasCompletadas(fechainiciovalidez);
        var fechafinvalidez = fields.find(f => f.id ===  'fechadefindevalidez');
        formatFechasTareasCompletadas(fechafinvalidez);
        var fechadesolicitud = fields.find(f => f.id ===  'fechadesolicitud');
        formatFechasTareasCompletadas(fechadesolicitud);

        var wamcb_responsable_area = fields.find(f => f.id ===  'wamcb_responsable_area');
        if( !isUndefined(wamcb_responsable_area)){
            wamcb_responsable_area.readOnly = true;
        }
    },

    formFieldValueChanged(e: FormFieldEvent, fields : FormFieldModel[]) {
        if(e.field.id === 'validacinsap'){
            var wamcb_accion_solicitante = fields.find(f => f.id ===  'wamcb_accion_solicitante');
            if(e.field.value === "CEBE NO EXISTE" && !isUndefined(wamcb_accion_solicitante)){
                wamcb_accion_solicitante.value = "CANCELAR";
                wamcb_accion_solicitante.readOnly = true;
            }
        }

        if (e.field.id === 'wamcb_sociedad' ){
            var sociedad_co = fields.find(f => f.id === 'wamcb_sociedad_co');
            if(!isUndefined(sociedad_co)){
                if(e.field.value == '8700' || e.field.value == '8704' || e.field.value == '8712'){
                    sociedad_co.value = '8700';
                }else if(e.field.value == '0100' || e.field.value == '0101' || e.field.value == '0102' || e.field.value == '0103' || e.field.value == '0104' || e.field.value == '0262' || e.field.value == '0446' || e.field.value == '0568' || e.field.value == '0607'){
                    sociedad_co.value = 'GV01'; 
                }
            }
            
        }

        if(e.field.id === 'wamcb_check_denominacion' || e.field.id === 'wamcb_check_descripcion') {
            var wamcb_check_denominacion = fields.find(f => f.id ===  'wamcb_check_denominacion');
            var wamcb_check_descripcion = fields.find(f => f.id ===  'wamcb_check_descripcion');

            if(wamcb_check_denominacion.value == false && wamcb_check_descripcion.value == false){
                var wamcb_denominacion_nueva = fields.find(f => f.id ===  'wamcb_denominacion_nueva');
                var wamcb_descripcion_nueva = fields.find(f => f.id ===  'wamcb_descripcion_nueva');
                wamcb_denominacion_nueva.value = "";
                wamcb_descripcion_nueva.value = "";
            }
               
        }

        if (e.field.id === 'wamcb_area') {
            var area = fields.find(f => f.id ===  'wamcb_area');
            // var areaaux = area.value.id;
            // var areaaux = areaaux.substr(-3,areaaux.length);
            var resp = fields.find(f => f.id === 'wamcb_responsable_area');
            if(area != undefined){
                switch(area.value){
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
            }
        } 

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