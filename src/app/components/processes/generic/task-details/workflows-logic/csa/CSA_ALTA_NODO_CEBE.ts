import { FormFieldModel, FormFieldEvent } from "@alfresco/adf-core";
import { isNullOrUndefined, isUndefined } from "util";

export const CSA_ALTA_NODO_CEBE = {
    formLoaded(e: FormFieldEvent, fields: FormFieldModel[])  {
        //formulario CEBE
        let required_fields = ['waancb_sociedad','waancb_area','waancb_codigo_cebe','waancb_descripcion','waancb_nodo_superior',
        'waancb_nodo','waancb_accion_solicitante'];
        fields.forEach(field => {
            if( required_fields.includes( field.id) ){
                field.required = true;
            }
        });

        let taskDefinitionKey = e.form.json.taskDefinitionKey;

        if( !isUndefined(taskDefinitionKey) ){
            if( taskDefinitionKey.includes('waancb_t1')  ){
                fields.forEach(field => {
                    if(  field.id == 'waancb_rechazo'  || field.id == 'waancb_datos_corregir'){
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
                var waancb_fichero = fields.find(f => f.id ===  'waancb_fichero');
                if( !isUndefined(waancb_fichero)){
                    waancb_fichero.readOnly = true;
                }
                var activitiwaancb_rechazo = fields.find(f => f.id ===  'waancb_rechazo' );
                if( !isUndefined(activitiwaancb_rechazo) && activitiwaancb_rechazo.type!== "readonly"){
                    activitiwaancb_rechazo.value ="";
                    activitiwaancb_rechazo.readOnly = false;
                }
                var waancb_datos_corregir = fields.find(f => f.id ===  'waancb_datos_corregir');
                if( !isUndefined(waancb_datos_corregir) && waancb_datos_corregir.type!== "readonly"){
                    waancb_datos_corregir.value ="";
                    waancb_datos_corregir.readOnly = false;
                }
            }
        }

        if( !isUndefined(taskDefinitionKey) ){
      /*       if( !taskDefinitionKey.includes('waancb_t1')  ){
                var waancb_fichero = fields.find(f => f.id ===  'waancb_fichero');
                if( !isUndefined(waancb_fichero) ){
                    waancb_fichero.readOnly = true;
                }
            } */
    
            var waancb_historico = fields.find(f => f.id ===  'waancb_historico');
            if( !isUndefined(waancb_historico) ){
                waancb_historico.readOnly = true;
                if(waancb_historico.value == null) waancb_historico.value = '';
                if( taskDefinitionKey.includes('waancb_t1')  ){
                    var waancb_comentarios_controller = fields.find(f => f.id ===  'waancb_comentarios_controller');
                    if(waancb_comentarios_controller.value){
                        waancb_historico.value += "\n- Controller : "+waancb_comentarios_controller.value;
                        waancb_comentarios_controller.value ="";
                    }
                    var waancb_comentarios_csa = fields.find(f => f.id ===  'waancb_comentarios_csa');
                    if(waancb_comentarios_csa.value ){
                        waancb_historico.value += "\n- CSA : "+waancb_comentarios_csa.value;
                        waancb_comentarios_csa.value = "";
                    }
                }else if( taskDefinitionKey.includes('waancb_t2')  ){
                    var waancb_comentarios_solicitante = fields.find(f => f.id ===  'waancb_comentarios_solicitante');
                    if(waancb_comentarios_solicitante.value ){
                        waancb_historico.value += "\n- Solicitante : "+waancb_comentarios_solicitante.value;
                        waancb_comentarios_solicitante.value = "";
                    }
                }else if( taskDefinitionKey.includes('waancb_t3')  ){
                    var waancb_comentarios_controller = fields.find(f => f.id ===  'waancb_comentarios_controller');
                    if(waancb_comentarios_controller.value ){
                        waancb_historico.value += "\n- Controller : "+waancb_comentarios_controller.value;
                        waancb_comentarios_controller.value = "";
                    }
                }else if( taskDefinitionKey.includes('waancb_t4')  ){
                    //cambiar comentario controller que no un mostrar valor sino un campo editable
                    var waancb_comentarios_csa = fields.find(f => f.id ===  'waancb_comentarios_csa');
                    if(waancb_comentarios_csa.value ){
                        waancb_historico.value += "\n- CSA : "+waancb_comentarios_csa.value;
                        waancb_comentarios_csa.value ="";
                    }
                }
            }
        }
        

        var fecha_solicitud = fields.find(f => f.id === 'waancb_fecha_solicitud');
        if (fecha_solicitud === null || !isUndefined(fecha_solicitud)) {
            fecha_solicitud.readOnly = true;
            if (isUndefined(taskDefinitionKey)) { //tarea start
                var date = new Date();
                fecha_solicitud.value = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
            }
        }
        
        var fecha_max = fields.find(f => f.id ===  'waancb_fecha_max');
        if(fecha_max === null ||  !isUndefined(fecha_max)){
            fecha_max.value = '01-01-2099';
            fecha_max.readOnly = true;
        }
    
        var grupo_tarea = fields.find(f => f.id ===  'waancb_grupo_tareas');
        if( !isUndefined(grupo_tarea)){
            grupo_tarea.value = 'Mantenimiento de estructuras de Control';
            grupo_tarea.readOnly = true; 
        }
        
        var tarea = fields.find(f => f.id === 'waancb_tarea');
        if( !isUndefined(tarea)){
            tarea.value = 'Alta Nodo de CeBe';
            tarea.readOnly = true; 
        }
        
        var activitiwaancb_tarea = fields.find(f => f.id ===  'waancb_grupo_tareas');
        if( !isUndefined(grupo_tarea)){
            activitiwaancb_tarea.readOnly = true;
        }
        
  /*       var activitiwaancb_rechazo = fields.find(f => f.id ===  'waancb_rechazo');
        if( !isUndefined(activitiwaancb_rechazo)){
            activitiwaancb_rechazo.value ="";
            activitiwaancb_rechazo.readOnly = false;
        }
        var waancb_datos_corregir = fields.find(f => f.id ===  'waancb_datos_corregir');
        if( !isUndefined(waancb_datos_corregir)){
            waancb_datos_corregir.value ="";
            waancb_datos_corregir.readOnly = false;
        } */

        var waancb_sociedad_co = fields.find(f => f.id ===  'waancb_sociedad_co');
        if(!isUndefined(waancb_sociedad_co)){
            waancb_sociedad_co.readOnly = true;   
        }

         // Corregir formato fecha en tareas completadas
         var fechadesolicitud = fields.find(f => f.id ===  'fechadesolicitud');
         formatFechasTareasCompletadas(fechadesolicitud);
        
    },
    
    formFieldValueChanged(e: FormFieldEvent, fields : FormFieldModel[]) {
            if(e.field.id === 'validacinsap'){
                var waancb_accion_controller = fields.find(f => f.id ===  'waancb_accion_controller');
                if(e.field.value === "NODO CEBE EXISTE" && !isUndefined(waancb_accion_controller)){
                    waancb_accion_controller.value = "RECHAZAR";
                    waancb_accion_controller.readOnly = true;
                }
            }
            if (e.field.id === 'waancb_area') {
			    var area = fields.find(f => f.id ===  'waancb_area');

			    var resp = fields.find(f => f.id === 'waancb_codigo_responsable');
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

        
		    if (e.field.id === 'waancb_sociedad') {
                if (fields.find(f => f.id ===  'waancb_sociedad')){
                    var soc = fields.find(f => f.id === 'waancb_sociedad');
                    var co = fields.find(f => f.id === 'waancb_sociedad_co');
                    var mascara = fields.find(f => f.id === 'waancb_codigo_cebe');
                    if(soc.value == '8700' || soc.value == '8704' || soc.value == '8712'){
                        co.value = '8700';
                        co.readOnly = true;
                        mascara.maxLength=7;
                        mascara.minLength=6; 
                    }else if(e.field.value == '0100' || e.field.value == '0101' || e.field.value == '0102' || e.field.value == '0103' || e.field.value == '0104' || e.field.value == '0262' || e.field.value == '0446' || e.field.value == '0568' || e.field.value == '0607'){
                        co.value = 'GV01'; 
                        co.readOnly = true;
                        mascara.maxLength=7;
                        mascara.minLength=4;
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