import { FormFieldModel, FormFieldEvent } from "@alfresco/adf-core";
import { isNullOrUndefined, isUndefined } from "util";

export const CSA_ALTA_CEBE = {
    formLoaded(e: FormFieldEvent, fields: FormFieldModel[])  {
        //formulario CEBE
        let taskDefinitionKey = e.form.json.taskDefinitionKey;

        let required_fields = ['waacb_sociedad','waacb_area','waacb_mascara_cebe','waacb_descripcion','waacb_denominacion',
        'waacb_nodo','waacb_nodo_nuevo','waacb_descripcion_nuevo_nodo','waacb_inicio_validez','waacb_accion_solicitante'];

        fields.forEach(field => {
            if( required_fields.includes( field.id) ){
                field.required = true;
            }
           /*  if( taskDefinitionKey && !taskDefinitionKey.includes('waacb_t1') && field.id == "waacb_fichero"){
                field.readOnly = true;
            } */
        });

        if( !isUndefined(taskDefinitionKey) ){
            if( taskDefinitionKey.includes('waacb_t1')  ){
                fields.forEach(field => {
                    if(  field.id == 'waacb_rechazo'  || field.id == 'waacb_datos_corregir'){
                        // Si son campos de rechazo y estamos en la tarea de correccion ponemos una condicion de visibilidad para que solo se muestren si son vacios
                        field.readOnly = true;
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
                var waacb_fichero = fields.find(f => f.id ===  'waacb_fichero');
                if( !isUndefined(waacb_fichero)){
                    waacb_fichero.readOnly = true;
                }
                var activitiwaacb_rechazo = fields.find(f => f.id ===  'waacb_rechazo');
                if( !isUndefined(activitiwaacb_rechazo) && activitiwaacb_rechazo.type!== "readonly"){
                    activitiwaacb_rechazo.value ="";
                    activitiwaacb_rechazo.readOnly = false;
                }
            }
        }

        

        var waacb_historico = fields.find(f => f.id ===  'waacb_historico');
        if( !isUndefined(waacb_historico) ){
            waacb_historico.readOnly = true;
            if(waacb_historico.value == null) waacb_historico.value = '';
            if( taskDefinitionKey.includes('waacb_t1')  ){
                var waacb_comentarios_controller = fields.find(f => f.id ===  'waacb_comentarios_controller');
                if(waacb_comentarios_controller.value && !waacb_historico.value.includes(waacb_comentarios_controller.value)){
                    waacb_historico.value += "\n- Controller : "+waacb_comentarios_controller.value;
                    waacb_comentarios_controller.value = "";
                }
                var waacb_comentarios_csa = fields.find(f => f.id ===  'waacb_comentarios_csa');
                if(waacb_comentarios_csa.value && !waacb_historico.value.includes(waacb_comentarios_csa.value)){
                    waacb_historico.value += "\n- CSA : "+waacb_comentarios_csa.value;
                    waacb_comentarios_csa.value = "";
                }
            }else if( taskDefinitionKey.includes('waacb_t2')  ){
                var waacb_comentarios_solicitante = fields.find(f => f.id ===  'waacb_comentarios_solicitante');
                if(waacb_comentarios_solicitante.value && !waacb_historico.value.includes(waacb_comentarios_solicitante.value)){
                    waacb_historico.value += "\n- Solicitante : "+waacb_comentarios_solicitante.value;
                    waacb_comentarios_solicitante.value = "";
                }
            }else if( taskDefinitionKey.includes('waacb_t3')  ){
                var waacb_comentarios_controller = fields.find(f => f.id ===  'waacb_comentarios_controller');
                if(waacb_comentarios_controller.value && !waacb_historico.value.includes(waacb_comentarios_controller.value)){
                    waacb_historico.value += "\n- Controller : "+waacb_comentarios_controller.value;
                    waacb_comentarios_controller.value = "";
                }
            }else if( taskDefinitionKey.includes('waacb_t4')  ){
                //cambiar comentario controller que no un mostrar valor sino un campo editable
                var waacb_comentarios_csa = fields.find(f => f.id ===  'waacb_comentarios_csa');
                if(waacb_comentarios_csa.value && !waacb_historico.value.includes(waacb_comentarios_csa.value)){
                    waacb_historico.value += "\n- CSA : "+waacb_comentarios_csa.value;
                    waacb_comentarios_csa.value = "";
                }
            }
        }

        
        

        var fecha_solicitud = fields.find(f => f.id === 'waacb_fecha_solicitud');
        if (fecha_solicitud === null || !isUndefined(fecha_solicitud)) {
            fecha_solicitud.readOnly = true;
            if (isUndefined(taskDefinitionKey)) { //tarea start
                var date = new Date();
                fecha_solicitud.value = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
            }
        }
        
        var fecha_max = fields.find(f => f.id ===  'waacb_fecha_max');
        if(fecha_max === null ||  !isUndefined(fecha_max)){
            fecha_max.value = '01-01-2099';
            fecha_max.readOnly = true;
        }
    
        var grupo_tarea = fields.find(f => f.id ===  'waacb_grupo_tareas');
        if( !isUndefined(grupo_tarea)){
            grupo_tarea.value = 'Mantenimiento de estructuras de Control';
            grupo_tarea.readOnly = true; 
        }
        
        var tarea = fields.find(f => f.id === 'waacb_tarea');
        if( !isUndefined(tarea)){
            tarea.value = 'Alta de CeBe';
            tarea.readOnly = true; 
            
        }
        
        var activitiwaacb_tarea = fields.find(f => f.id ===  'waacb_grupo_tareas');
        if( !isUndefined(grupo_tarea)){
            activitiwaacb_tarea.readOnly = true;
        }

        var waacb_codigo_responsable = fields.find(f => f.id ===  'waacb_codigo_responsable');
        if( !isUndefined(waacb_codigo_responsable)){
            waacb_codigo_responsable.readOnly = true;
        }
        
/*         var activitiwaacb_rechazo = fields.find(f => f.id ===  'waacb_rechazo');
        if( !isUndefined(activitiwaacb_rechazo)){
            activitiwaacb_rechazo.value ="";
            activitiwaacb_rechazo.readOnly = false;
        } */
        var waacb_inicio_validez = fields.find(f => f.id ===  'waacb_inicio_validez');
        if(!isUndefined(waacb_inicio_validez)){
            var date = new Date();
            waacb_inicio_validez.value = date.getDate() +"-"+ (date.getMonth()+1) +"-"+date.getFullYear();
            waacb_inicio_validez.maxValue = date.getDate() +"-"+ (date.getMonth()+1) +"-"+date.getFullYear();        
        }
        var waacb_fin_validez = fields.find(f => f.id ===  'waacb_fin_validez');
        if(!isUndefined(waacb_fin_validez)){
            waacb_fin_validez.value =  '31-12-9999';   
            waacb_fin_validez.readOnly = true;   
        }

        // Corregir formato fecha en tareas completadas
        var fechainiciovalidez = fields.find(f => f.id ===  'fechainiciovalidez');
        formatFechasTareasCompletadas(fechainiciovalidez);
        var fechafinvalidez = fields.find(f => f.id ===  'fechafinvalidez');
        formatFechasTareasCompletadas(fechafinvalidez);
        var fechadesolicitud = fields.find(f => f.id ===  'fechadesolicitud');
        formatFechasTareasCompletadas(fechadesolicitud);

    },
    
    formFieldValueChanged(e: FormFieldEvent, fields : FormFieldModel[]) {
            if(e.field.id === 'validacinsap'){
                var waacb_accion_controller = fields.find(f => f.id ===  'waacb_accion_controller');
                if(e.field.value === "CEBE EXISTE" && !isUndefined(waacb_accion_controller)){
                    waacb_accion_controller.value = "RECHAZAR";
                    waacb_accion_controller.readOnly = true;
                }
            }
        

            if (e.field.id === 'waacb_area') {
			    var area = fields.find(f => f.id ===  'waacb_area');
			    // var areaaux = area.value.id;
                // var areaaux = areaaux.substr(-3,areaaux.length);
			    var resp = fields.find(f => f.id === 'waacb_codigo_responsable');
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

            // if (e.field.id === 'waacb_descripcion') {
            // if (fields.find(f => f.id === 'waacb_descripcion')){
                // var denom =fields.find(f => f.id === 'waacb_denominacion');
                // var desc = fields.find(f => f.id ==='waacb_descripcion');
                // desc = desc.value;
                // denom.value = desc;
            // }
            // }


        
		    if (e.field.id === 'waacb_sociedad') {
                if (fields.find(f => f.id ===  'waacb_sociedad')){
                    //var soc = fields.find(f => f.id === 'waacb_sociedad');
                    var co = fields.find(f => f.id === 'waacb_sociedad_co');
                    /* var mascara = fields.find(f => f.id === 'waacb_mascara_cebe'); */
                    if(e.field.value == '8700' || e.field.value == '8704' || e.field.value == '8712'){
                        co.value = '8700';
                    }else if(e.field.value == '0100' || e.field.value == '0101' || e.field.value == '0102' || e.field.value == '0103' || e.field.value == '0104' || e.field.value == '0262' || e.field.value == '0446' || e.field.value == '0568' || e.field.value == '0607'){
                        co.value = 'GV01'; 
                    }
                    var activitiwaacb_sociedad_co = fields.find(f => f.id === 'waacb_sociedad_co');
                    activitiwaacb_sociedad_co.readOnly = true;
                }
		    }   
            
            //var activitiwaacb_rechazo = fields.find(f => f.id ===  'waacb_rechazo');

		    // if( !isUndefined(activitiwaacb_rechazo)){
			// activitiwaacb_rechazo.readOnly = false;
			// }
			// if (e.field.id === 'waacb_accion_controller') {
				// var controller_rechazo = fields.find(f => f.id ===  'waacb_accion_controller');

			    // if( !isUndefined(controller_rechazo)){
		        
				// if(controller_rechazo.value=="RECHAZAR")activitiwaacb_rechazo.readOnly = false;
				//if(controller_rechazo.value=="RECHAZAR" && 	!isNull(activitiwaacb_rechazo.value))activitiwaacb_rechazo.readOnly = false;
			
				// }
				// }
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
