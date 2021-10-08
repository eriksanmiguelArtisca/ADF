import { FormFieldModel, FormFieldEvent } from "@alfresco/adf-core";
import { isNullOrUndefined, isUndefined } from "util";

export const CSA_MODIFICACION_CECO = {
    formLoaded(e: FormFieldEvent, fields: FormFieldModel[])  {
        //formulario CEBE
        let taskDefinitionKey = e.form.json.taskDefinitionKey;
       /*  let required_fields = ['wamcc_area'];
        fields.forEach(field => {
            if( required_fields.includes( field.id) ){
                field.required = true;
            }
        }); */
        var wamcc_area = fields.find(f => f.id ===  'wamcc_area');
        if(!isUndefined(wamcc_area)){
            wamcc_area.required = true;   
        }

        
        if( !isUndefined(taskDefinitionKey) ){
            if( taskDefinitionKey.includes('wamcc_t1')  ){
                let readOnly_fields = ['wamcc_sociedad','wamcc_ceco','wamcc_rechazo','wamcc_datos_corregir'];
                fields.forEach(field => {
                    if( readOnly_fields.includes( field.id) ){
                        field.readOnly = true; 
                    }
                    if(  field.id == 'wamcc_rechazo'  || field.id == 'wamcc_datos_corregir'){
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

/* 
                var wamcc_sociedad = fields.find(f => f.id ===  'wamcc_sociedad');
                if(!isUndefined(wamcc_sociedad)){
                    wamcc_sociedad.readOnly = true;   
                }
                var wamcc_ceco = fields.find(f => f.id ===  'wamcc_ceco');
                if(!isUndefined(wamcc_ceco)){
                    wamcc_ceco.readOnly = true;   
                } */
            }else {
                var wamcc_fichero = fields.find(f => f.id ===  'wamcc_fichero');
                if( !isUndefined(wamcc_fichero)){
                    wamcc_fichero.readOnly = true;
                }
                var activitiwamcc_rechazo = fields.find(f => f.id ===  'wamcc_rechazo');
                if( !isUndefined(activitiwamcc_rechazo) && activitiwamcc_rechazo.type!== "readonly"){
                    activitiwamcc_rechazo.value ="";
                    activitiwamcc_rechazo.readOnly = false;
                }
                var wamcc_area_jerarquia_nueva = fields.find(f => f.id ===  'wamcc_area_jerarquia_nueva');
                if( !isUndefined(wamcc_area_jerarquia_nueva)){
                    wamcc_area_jerarquia_nueva.readOnly = true;
                }
                var wamcc_beneficio_nuevo = fields.find(f => f.id ===  'wamcc_beneficio_nuevo');
                if( !isUndefined(wamcc_beneficio_nuevo)){
                    wamcc_beneficio_nuevo.readOnly = true;
                }
                
            }
        }
        var wamcc_historico = fields.find(f => f.id ===  'wamcc_historico');
        if( !isUndefined(wamcc_historico) ){
            wamcc_historico.readOnly = true;
            if(wamcc_historico.value == null) wamcc_historico.value = '';
            if( taskDefinitionKey.includes('wamcc_t1')  ){
                var wamcc_comentarios_controller = fields.find(f => f.id ===  'wamcc_comentarios_controller');
                if(wamcc_comentarios_controller.value){
                    wamcc_historico.value += "\n- Controller : "+wamcc_comentarios_controller.value;
                    wamcc_comentarios_controller.value ="";
                }
                var wamcc_comentarios_csa = fields.find(f => f.id ===  'wamcc_comentarios_csa');
                if(wamcc_comentarios_csa.value ){
                    wamcc_historico.value += "\n- CSA : "+wamcc_comentarios_csa.value;
                    wamcc_comentarios_csa.value = "";
                }
            }else if( taskDefinitionKey.includes('wamcc_t2')  ){
                var wamcc_comentarios_solicitante = fields.find(f => f.id ===  'wamcc_comentarios_solicitante');
                if(wamcc_comentarios_solicitante.value ){
                    wamcc_historico.value += "\n- Solicitante : "+wamcc_comentarios_solicitante.value;
                    wamcc_comentarios_solicitante.value = "";
                }
            }else if( taskDefinitionKey.includes('wamcc_t3')  ){
                var wamcc_comentarios_controller = fields.find(f => f.id ===  'wamcc_comentarios_controller');
                if(wamcc_comentarios_controller.value ){
                    wamcc_historico.value += "\n- Controller : "+wamcc_comentarios_controller.value;
                    wamcc_comentarios_controller.value = "";
                }
            }else if( taskDefinitionKey.includes('wamcc_t4')  ){
                //cambiar comentario controller que no un mostrar valor sino un campo editable
                var wamcc_comentarios_csa = fields.find(f => f.id ===  'wamcc_comentarios_csa');
                if(wamcc_comentarios_csa.value ){
                    wamcc_historico.value += "\n- CSA : "+wamcc_comentarios_csa.value;
                    wamcc_comentarios_csa.value ="";
                }
            }
        }

        var fecha_solicitud = fields.find(f => f.id === 'wamcc_fecha_solicitud');
        if (fecha_solicitud === null || !isUndefined(fecha_solicitud)) {
            fecha_solicitud.readOnly = true;
            if (isUndefined(taskDefinitionKey)) { //tarea start
                var date = new Date();
                fecha_solicitud.value = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
            }
        }
        
        var fecha_max = fields.find(f => f.id ===  'wamcc_fecha_max');
        if(fecha_max === null ||  !isUndefined(fecha_max)){
            fecha_max.value = '01-01-2099';
            fecha_max.readOnly = true;
        }
    
        var grupo_tarea = fields.find(f => f.id ===  'wamcc_grupo_tareas');
        if( !isUndefined(grupo_tarea)){
            grupo_tarea.value = 'Mantenimiento de estructuras de Control';
            grupo_tarea.readOnly = true; 
        }
        
        var tarea = fields.find(f => f.id === 'wamcc_tarea');
        if( !isUndefined(tarea)){
            tarea.value = 'Modificación de CeCo';
            tarea.readOnly = true; 
        }
        
        var activitiwamcc_tarea = fields.find(f => f.id ===  'wamcc_grupo_tareas');
        if( !isUndefined(grupo_tarea)){
            activitiwamcc_tarea.readOnly = true;
        }
        
        var wamcc_inicio_validez = fields.find(f => f.id ===  'wamcc_inicio_validez');
        if(!isUndefined(wamcc_inicio_validez)){
            var date = new Date();
            wamcc_inicio_validez.value = date.getDate() +"-"+ (date.getMonth()+1) +"-"+date.getFullYear();
            wamcc_inicio_validez.maxValue = date.getDate() +"-"+ (date.getMonth()+1) +"-"+date.getFullYear();        
        }
        var wamcc_fin_validez = fields.find(f => f.id ===  'wamcc_fin_validez');
        if(!isUndefined(wamcc_fin_validez)){
            wamcc_fin_validez.value =  '31-12-9999';   
            wamcc_fin_validez.readOnly = true;   
        }
        
        var wamcc_denominacion = fields.find(f => f.id ===  'wamcc_denominacion');
        if(!isUndefined(wamcc_denominacion)){
            wamcc_denominacion.readOnly = true;   
        }
        var wamcc_descripcion = fields.find(f => f.id ===  'wamcc_descripcion');
        if(!isUndefined(wamcc_descripcion)){   
            wamcc_descripcion.readOnly = true;   
        }
        var wamcc_beneficio = fields.find(f => f.id ===  'wamcc_beneficio');
        if(!isUndefined(wamcc_beneficio)){   
            wamcc_beneficio.readOnly = true;   
        }
        var wamcc_area_jerarquia = fields.find(f => f.id ===  'wamcc_area_jerarquia');
        if(!isUndefined(wamcc_area_jerarquia)){   
            wamcc_area_jerarquia.readOnly = true;   
        }
        var wamcc_sociedad_co = fields.find(f => f.id ===  'wamcc_sociedad_co');
        if(!isUndefined(wamcc_sociedad_co)){
            wamcc_sociedad_co.readOnly = true;   
        }

        // Corregir formato fecha en tareas completadas
        var fechainiciovalidez = fields.find(f => f.id ===  'fechadeiniciodevalidez');
        formatFechasTareasCompletadas(fechainiciovalidez);
        var fechafinvalidez = fields.find(f => f.id ===  'fechadefindevalidez');
        formatFechasTareasCompletadas(fechafinvalidez);
        var fechadesolicitud = fields.find(f => f.id ===  'fechadesolicitud');
        formatFechasTareasCompletadas(fechadesolicitud);

        var wamcc_responsable_area = fields.find(f => f.id ===  'wamcc_responsable_area');
        if( !isUndefined(wamcc_responsable_area)){
            wamcc_responsable_area.readOnly = true;
        }
    },
    
    formFieldValueChanged(e: FormFieldEvent, fields : FormFieldModel[]) {
        if(e.field.id === 'validacinsap'){
            var wamcc_accion_solicitante = fields.find(f => f.id ===  'wamcc_accion_solicitante');
            if(e.field.value === "CECO NO EXISTE" && !isUndefined(wamcc_accion_solicitante)){
                wamcc_accion_solicitante.value = "CANCELAR";
                wamcc_accion_solicitante.readOnly = true;
            }
        }
        if (e.field.id === 'wamcc_sociedad'){
            var sociedad_co = fields.find(f => f.id === 'wamcc_sociedad_co');
            if(e.field.value == '8700' || e.field.value == '8704' || e.field.value == '8712'){
                sociedad_co.value = '8700';
            }else if(e.field.value == '0100' || e.field.value == '0101' || e.field.value == '0102' || e.field.value == '0103' || e.field.value == '0104' || e.field.value == '0262' || e.field.value == '0446' || e.field.value == '0568' || e.field.value == '0607'){
                sociedad_co.value = 'GV01'; 
            }
        }
  
        if(e.field.id === 'wamcc_check_denominacion' || e.field.id === 'wamcc_check_descripcion') {
            var wamcc_check_denominacion = fields.find(f => f.id ===  'wamcc_check_denominacion');
            var wamcc_check_descripcion = fields.find(f => f.id ===  'wamcc_check_descripcion');
            if(wamcc_check_denominacion.value == false && wamcc_check_descripcion.value == false ){
                var wamcc_denominacion_nueva = fields.find(f => f.id ===  'wamcc_denominacion_nueva');
                var wamcc_descripcion_nueva = fields.find(f => f.id ===  'wamcc_descripcion_nueva');
                wamcc_denominacion_nueva.value = "";
                wamcc_descripcion_nueva.value = "";
            }
               
        }

        if (e.field.id === 'wamcc_area') {
            var area = fields.find(f => f.id ===  'wamcc_area');
            // var areaaux = area.value.id;
            // var areaaux = areaaux.substr(-3,areaaux.length);
            var resp = fields.find(f => f.id === 'wamcc_responsable_area');
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