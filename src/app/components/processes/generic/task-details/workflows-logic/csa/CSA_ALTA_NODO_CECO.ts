import { FormFieldModel, FormFieldEvent } from "@alfresco/adf-core";
import { isNullOrUndefined, isUndefined } from "util";

export const CSA_ALTA_NODO_CECO = {
    formLoaded(e: FormFieldEvent, fields: FormFieldModel[])  {
        //formulario CECO
        let required_fields = ['waancc_sociedad','waancc_area','waancc_codigo_ceco','waancc_descripcion','waancc_nodo_superior',
        'waancc_nodo','waancc_inicio_validez','waancc_accion_solicitante'];
        fields.forEach(field => {
            if( required_fields.includes( field.id) ){
                field.required = true;
            }
        });

        let taskDefinitionKey = e.form.json.taskDefinitionKey;

        if( !isUndefined(taskDefinitionKey) ){
            if( taskDefinitionKey.includes('waancc_t1')  ){
                fields.forEach(field => {
                    if(  field.id == 'waancc_rechazo'  || field.id == 'waancc_datos_corregir'){
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
                var waancc_fichero = fields.find(f => f.id ===  'waancc_fichero');
                if( !isUndefined(waancc_fichero)){
                    waancc_fichero.readOnly = true;
                }
                var activitiwaancc_rechazo = fields.find(f => f.id ===  'waancc_rechazo');
                if( !isUndefined(activitiwaancc_rechazo) && activitiwaancc_rechazo.type!== "readonly"){
                    activitiwaancc_rechazo.value ="";
                    activitiwaancc_rechazo.readOnly = false;
                }
                var waancc_datos_corregir = fields.find(f => f.id ===  'waancc_datos_corregir');
                if( !isUndefined(waancc_datos_corregir) && waancc_datos_corregir.type!== "readonly"){
                    waancc_datos_corregir.value ="";
                    waancc_datos_corregir.readOnly = false;
                }
            }
        }


        

        var waancc_historico = fields.find(f => f.id ===  'waancc_historico');
        if( !isUndefined(waancc_historico) ){
            waancc_historico.readOnly = true;
            if(waancc_historico.value == null) waancc_historico.value = '';
            if( taskDefinitionKey.includes('waancc_t1')  ){
                var waancc_comentarios_controller = fields.find(f => f.id ===  'waancc_comentarios_controller');
                if(waancc_comentarios_controller.value){
                    waancc_historico.value += "\n- Controller : "+waancc_comentarios_controller.value;
                    waancc_comentarios_controller.value ="";
                }
                var waancc_comentarios_csa = fields.find(f => f.id ===  'waancc_comentarios_csa');
                if(waancc_comentarios_csa.value ){
                    waancc_historico.value += "\n- CSA : "+waancc_comentarios_csa.value;
                    waancc_comentarios_csa.value = "";
                }
            }else if( taskDefinitionKey.includes('waancc_t2')  ){
                var waancc_comentarios_solicitante = fields.find(f => f.id ===  'waancc_comentarios_solicitante');
                if(waancc_comentarios_solicitante.value ){
                    waancc_historico.value += "\n- Solicitante : "+waancc_comentarios_solicitante.value;
                    waancc_comentarios_solicitante.value = "";
                }
            }else if( taskDefinitionKey.includes('waancc_t3')  ){
                var waancc_comentarios_controller = fields.find(f => f.id ===  'waancc_comentarios_controller');
                if(waancc_comentarios_controller.value ){
                    waancc_historico.value += "\n- Controller : "+waancc_comentarios_controller.value;
                    waancc_comentarios_controller.value = "";
                }
            }else if( taskDefinitionKey.includes('waancc_t4')  ){
                //cambiar comentario controller que no un mostrar valor sino un campo editable
                var waancc_comentarios_csa = fields.find(f => f.id ===  'waancc_comentarios_csa');
                if(waancc_comentarios_csa.value ){
                    waancc_historico.value += "\n- CSA : "+waancc_comentarios_csa.value;
                    waancc_comentarios_csa.value ="";
                }
            }
        }

        var fecha_solicitud = fields.find(f => f.id === 'waancc_fecha_solicitud');
        if (fecha_solicitud === null || !isUndefined(fecha_solicitud)) {
            fecha_solicitud.readOnly = true;
            if (isUndefined(taskDefinitionKey)) { //tarea start
                var date = new Date();
                fecha_solicitud.value = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
            }
        }
        
        var fecha_max = fields.find(f => f.id ===  'waancc_fecha_max');
        if(fecha_max === null ||  !isUndefined(fecha_max)){
            fecha_max.value = '01-01-2099';
            fecha_max.readOnly = true;
        }
    
        var grupo_tarea = fields.find(f => f.id ===  'waancc_grupo_tareas');
        if( !isUndefined(grupo_tarea)){
            grupo_tarea.value = 'Mantenimiento de estructuras de Control';
            grupo_tarea.readOnly = true; 
        }
        
        var tarea = fields.find(f => f.id === 'waancc_tarea');
        if( !isUndefined(tarea)){
            tarea.value = 'Alta Nodo de CeCo';
            tarea.readOnly = true; 
        }
        
        var activitiwaancc_tarea = fields.find(f => f.id ===  'waancc_grupo_tareas');
        if( !isUndefined(grupo_tarea)){
            activitiwaancc_tarea.readOnly = true;
        }
        
        
        
        var waancc_inicio_validez = fields.find(f => f.id ===  'waancc_inicio_validez');
        if(!isUndefined(waancc_inicio_validez)){
            var date = new Date();
            waancc_inicio_validez.value = date.getDate() +"-"+ (date.getMonth()+1) +"-"+date.getFullYear();
            waancc_inicio_validez.maxValue = date.getDate() +"-"+ (date.getMonth()+1) +"-"+date.getFullYear();        
        }
        var waancc_fin_validez = fields.find(f => f.id ===  'waancc_fin_validez');
        if(!isUndefined(waancc_fin_validez)){
            waancc_fin_validez.value =  '31-12-9999';   
            waancc_fin_validez.readOnly = true;   
        }

        var waancc_sociedad_co = fields.find(f => f.id ===  'waancc_sociedad_co');
        if(!isUndefined(waancc_sociedad_co)){
            waancc_sociedad_co.readOnly = true;   
        }

         // Corregir formato fecha en tareas completadas
         var fechadesolicitud = fields.find(f => f.id ===  'fechadesolicitud');
         formatFechasTareasCompletadas(fechadesolicitud);

    },
    
    formFieldValueChanged(e: FormFieldEvent, fields : FormFieldModel[]) {
            if(e.field.id === 'validacinsap'){
                var waancc_accion_controller = fields.find(f => f.id ===  'waancc_accion_controller');
                if(e.field.value === "NODO CECO EXISTE" && !isUndefined(waancc_accion_controller)){
                    waancc_accion_controller.value = "RECHAZAR";
                    waancc_accion_controller.readOnly = true;
                }
            }
            if (e.field.id === 'waancc_area') {
			    var area = fields.find(f => f.id ===  'waancc_area');

			    var resp = fields.find(f => f.id === 'waancc_codigo_responsable');
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

        
		    if (e.field.id === 'waancc_sociedad') {
                var soc = fields.find(f => f.id === 'waancc_sociedad');
                var co = fields.find(f => f.id === 'waancc_sociedad_co');
                var mascara = fields.find(f => f.id === 'waancc_codigo_ceco');
                if(soc.value == '8700' || soc.value == '8704' || soc.value == '8712'){
                    co.value = '8700';
                    co.readOnly = true;
                    mascara.maxLength=7;
                    mascara.minLength=6;
                }else  if(e.field.value == '0100' || e.field.value == '0101' || e.field.value == '0102' || e.field.value == '0103' || e.field.value == '0104' || e.field.value == '0262' || e.field.value == '0446' || e.field.value == '0568' || e.field.value == '0607'){
                    co.value = 'GV01';
                    co.readOnly = true; 
                    mascara.maxLength=7;
                    mascara.minLength=4;
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