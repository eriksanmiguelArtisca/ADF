import { FormFieldModel, FormFieldEvent } from "@alfresco/adf-core";
import { isNullOrUndefined, isUndefined } from "util";

export const CSA_MOFICACION_NODO_CECO = {
    formLoaded(e: FormFieldEvent, fields: FormFieldModel[])  {
        //formulario CECO

         let taskDefinitionKey = e.form.json.taskDefinitionKey;

        var wamncc_area = fields.find(f => f.id ===  'wamncc_area');
        if(!isUndefined(wamncc_area)){
            wamncc_area.required = true;   
        }

         if( !isUndefined(taskDefinitionKey) ){
            if( taskDefinitionKey.includes('wamncc_t1')  ){
                var nodo = fields.find(f => f.id === 'wamncc_nodo');
                nodo.readOnly = true;
            }
         }
         if( !isUndefined(taskDefinitionKey) ){
            if( taskDefinitionKey.includes('wamncc_t1')  ){
                fields.forEach(field => {
                    if(  field.id == 'wamncc_rechazo'  || field.id == 'wamncc_datos_corregir'){
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
                var wamncc_fichero = fields.find(f => f.id ===  'wamncc_fichero');
                if( !isUndefined(wamncc_fichero)){
                    wamncc_fichero.readOnly = true;
                }
                var activitiwamncc_rechazo = fields.find(f => f.id ===  'wamncc_rechazo' );
                if( !isUndefined(activitiwamncc_rechazo) && activitiwamncc_rechazo.type!== "readonly"){
                    activitiwamncc_rechazo.value ="";
                    activitiwamncc_rechazo.readOnly = false;
                }
                var wamncc_datos_corregir = fields.find(f => f.id ===  'wamncc_datos_corregir');
                if( !isUndefined(wamncc_datos_corregir) && wamncc_datos_corregir.type!== "readonly"){
                    wamncc_datos_corregir.value ="";
                    wamncc_datos_corregir.readOnly = false;
                }
            }
        }

        var wamncc_historico = fields.find(f => f.id ===  'wamncc_historico');
        if( !isUndefined(wamncc_historico) ){
            wamncc_historico.readOnly = true;
            if(wamncc_historico.value == null) wamncc_historico.value = '';
            if( taskDefinitionKey.includes('wamncc_t1')  ){
                var wamncc_comentarios_controller = fields.find(f => f.id ===  'wamncc_comentarios_controller');
                if(wamncc_comentarios_controller.value){
                    wamncc_historico.value += "\n- Controller : "+wamncc_comentarios_controller.value;
                    wamncc_comentarios_controller.value ="";
                }
                var wamncc_comentarios_csa = fields.find(f => f.id ===  'wamncc_comentarios_csa');
                if(wamncc_comentarios_csa.value ){
                    wamncc_historico.value += "\n- CSA : "+wamncc_comentarios_csa.value;
                    wamncc_comentarios_csa.value = "";
                }
            }else if( taskDefinitionKey.includes('wamncc_t2')  ){
                var wamncc_comentarios_solicitante = fields.find(f => f.id ===  'wamncc_comentarios_solicitante');
                if(wamncc_comentarios_solicitante.value ){
                    wamncc_historico.value += "\n- Solicitante : "+wamncc_comentarios_solicitante.value;
                    wamncc_comentarios_solicitante.value = "";
                }
            }else if( taskDefinitionKey.includes('wamncc_t3')  ){
                var wamncc_comentarios_controller = fields.find(f => f.id ===  'wamncc_comentarios_controller');
                if(wamncc_comentarios_controller.value ){
                    wamncc_historico.value += "\n- Controller : "+wamncc_comentarios_controller.value;
                    wamncc_comentarios_controller.value = "";
                }
            }else if( taskDefinitionKey.includes('wamncc_t4')  ){
                //cambiar comentario controller que no un mostrar valor sino un campo editable
                var wamncc_comentarios_csa = fields.find(f => f.id ===  'wamncc_comentarios_csa');
                if(wamncc_comentarios_csa.value ){
                    wamncc_historico.value += "\n- CSA : "+wamncc_comentarios_csa.value;
                    wamncc_comentarios_csa.value ="";
                }
            }
        }

        var fecha_solicitud = fields.find(f => f.id === 'wamncc_fecha_solicitud');
        if (fecha_solicitud === null || !isUndefined(fecha_solicitud)) {
            fecha_solicitud.readOnly = true;
            if (isUndefined(taskDefinitionKey)) { //tarea start
                var date = new Date();
                fecha_solicitud.value = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
            }
        }

       /* var fecha_max = fields.find(f => f.id ===  'wamncc_fecha_max');
        if(fecha_max === null ||  !isUndefined(fecha_max)){
            fecha_max.value = '01-01-2099';
            fecha_max.readOnly = true;
        } */
    
        var grupo_tarea = fields.find(f => f.id ===  'wamncc_grupo_tareas');
        if( !isUndefined(grupo_tarea)){
            grupo_tarea.value = 'Mantenimiento de estructuras de Control';
            grupo_tarea.readOnly = true; 
        }
        
        var tarea = fields.find(f => f.id === 'wamncc_tarea');
        if( !isUndefined(tarea)){
            tarea.value = 'Modificación Nodo de CeCo';
            tarea.readOnly = true; 
        }
        
        var activitiwamncc_tarea = fields.find(f => f.id ===  'wamncc_grupo_tareas');
        if( !isUndefined(grupo_tarea)){
            activitiwamncc_tarea.readOnly = true;
        }
        
      
       var wamncc_inicio_validez = fields.find(f => f.id ===  'wamncc_inicio_validez');
        if(!isUndefined(wamncc_inicio_validez)){
            var date = new Date();
            wamncc_inicio_validez.value = date.getDate() +"-"+ (date.getMonth()+1) +"-"+date.getFullYear();
            wamncc_inicio_validez.maxValue = date.getDate() +"-"+ (date.getMonth()+1) +"-"+date.getFullYear();        
        }
        var wamncc_fin_validez = fields.find(f => f.id ===  'wamncc_fin_validez');
        if(!isUndefined(wamncc_fin_validez)){
            wamncc_fin_validez.value =  '31-12-9999';   
            wamncc_fin_validez.readOnly = true;   
        }

        var sociedad = fields.find(f => f.id ===  'wamncc_sociedad');
        if( !isUndefined(sociedad)){
            sociedad.readOnly = true; 
        }
        var sociedad_co = fields.find(f => f.id ===  'wamncc_sociedad_co');
        if( !isUndefined(sociedad_co)){
            sociedad_co.readOnly = true; 
        }

        var nodo_desc = fields.find(f => f.id ===  'wamncc_nodo_descripcion');
        if( !isUndefined(nodo_desc)){
            nodo_desc.readOnly = true; 
        }
        // Corregir formato fecha en tareas completadas
        var fechadesolicitud = fields.find(f => f.id ===  'fechadesolicitud');
        formatFechasTareasCompletadas(fechadesolicitud);
        

    },
    
    formFieldValueChanged(e: FormFieldEvent, fields : FormFieldModel[]) {
            if (e.field.id === 'wamncc_area') {
			    var area = fields.find(f => f.id ===  'wamncc_area');

			    var resp = fields.find(f => f.id === 'wamncc_codigo_responsable');
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
                    resp.readOnly = true;
                }
		    }

		    if (e.field.id === 'wamncc_sociedad') {
                if (fields.find(f => f.id ===  'wamncc_sociedad')){
                    //var soc = fields.find(f => f.id === 'wamncc_sociedad');
                    var co = fields.find(f => f.id === 'wamncc_sociedad_co');
                    if(e.field.value == '8700' || e.field.value == '8704' || e.field.value == '8712'){
                        co.value = '8700';
                    }else if(e.field.value == '0100' || e.field.value == '0101' || e.field.value == '0102' || e.field.value == '0103' || e.field.value == '0104' || e.field.value == '0262' || e.field.value == '0446' || e.field.value == '0568' || e.field.value == '0607'){
                        co.value = 'GV01'; 
                    }
                   /*  var activitiwamncc_sociedad_co = fields.find(f => f.id === 'wamncc_sociedad_co');
                    activitiwamncc_sociedad_co.readOnly = true; */
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