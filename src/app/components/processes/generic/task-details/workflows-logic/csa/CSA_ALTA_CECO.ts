import { FormFieldModel, FormFieldEvent } from "@alfresco/adf-core";
import { isNullOrUndefined, isUndefined } from "util";

export const CSA_ALTA_CECO = {
    formLoaded(e: FormFieldEvent, fields: FormFieldModel[])  {
        let taskDefinitionKey = e.form.json.taskDefinitionKey;
        let required_fields = ['waacc_sociedad','waacc_area','waacc_mascara_ceco','waacc_descripcion','waacc_denominacion',
        'waacc_nodo','waacc_nodo_nuevo','waacc_descripcion_nuevo_nodo','waacc_cebe_asociado','waacc_inicio_validez','waacc_accion_solicitante'];
        fields.forEach(field => {
            if( required_fields.includes( field.id) ){
                field.required = true;
            }
          /*   if( taskDefinitionKey && !taskDefinitionKey.includes('waacc_t1') && field.id == "waac_fichero"){
                field.readOnly = true;
            } */
        });

        if( !isUndefined(taskDefinitionKey) ){
            if( taskDefinitionKey.includes('waacc_t1')  ){
                fields.forEach(field => {
                    if(  field.id == 'waacc_rechazo'  || field.id == 'waacc_datos_corregir'){
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
                var waacc_fichero = fields.find(f => f.id ===  'waacc_fichero');
                if( !isUndefined(waacc_fichero)){
                    waacc_fichero.readOnly = true;
                }
                var activitiwaacc_rechazo = fields.find(f => f.id ===  'waacc_rechazo');
                if( !isUndefined(activitiwaacc_rechazo) && activitiwaacc_rechazo.type !== "readonly"){
                    activitiwaacc_rechazo.value ="";
                    activitiwaacc_rechazo.readOnly = false;
                }
            }
        }

        var waacc_historico = fields.find(f => f.id ===  'waacc_historico');
        if( !isUndefined(waacc_historico) ){
            waacc_historico.readOnly = true;
            if(waacc_historico.value == null) waacc_historico.value = '';
            if( taskDefinitionKey.includes('waacc_t1')  ){
                var waacc_comentarios_controller = fields.find(f => f.id ===  'waacc_comentarios_controller');
                if(waacc_comentarios_controller.value && !waacc_historico.value.includes(waacc_comentarios_controller.value)){
                    waacc_historico.value += "\n- Controller : "+waacc_comentarios_controller.value;
                }
                var waacc_comentarios_csa = fields.find(f => f.id ===  'waacc_comentarios_csa');
                if(waacc_comentarios_csa.value && !waacc_historico.value.includes(waacc_comentarios_csa.value)){
                    waacc_historico.value += "\n- CSA : "+waacc_comentarios_csa.value;
                }
            }else if( taskDefinitionKey.includes('waacc_t2')  ){
                var waacc_comentarios_solicitante = fields.find(f => f.id ===  'waacc_comentarios_solicitante');
                if(waacc_comentarios_solicitante.value && !waacc_historico.value.includes(waacc_comentarios_solicitante.value)){
                    waacc_historico.value += "\n- Solicitante : "+waacc_comentarios_solicitante.value;
                }
            }else if( taskDefinitionKey.includes('waacc_t3')  ){
                var waacc_comentarios_controller = fields.find(f => f.id ===  'waacc_comentarios_controller');
                if(waacc_comentarios_controller.value && !waacc_historico.value.includes(waacc_comentarios_controller.value)){
                    waacc_historico.value += "\n- Controller : "+waacc_comentarios_controller.value;
                }
            }else if( taskDefinitionKey.includes('waacc_t4')  ){
                 //cambiar comentario controller que no un mostrar valor sino un campo editable
                var waacc_comentarios_csa = fields.find(f => f.id ===  'waacc_comentarios_csa');
                if(waacc_comentarios_csa.value && !waacc_historico.value.includes(waacc_comentarios_csa.value)){
                    waacc_historico.value += "\n- CSA : "+waacc_comentarios_csa.value;
                }
            }
        }

        
        var fecha_solicitud = fields.find(f => f.id === 'waacc_fecha_solicitud');
        if (fecha_solicitud === null || !isUndefined(fecha_solicitud)) {
            fecha_solicitud.readOnly = true;
            if (isUndefined(taskDefinitionKey)) { //tarea start
                var date = new Date();
                fecha_solicitud.value = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
            }
        }
        
        var fecha_max =  fields.find(f => f.id === 'waacc_fecha_max');
        if(fecha_max === null ||  !isUndefined(fecha_max)){
            fecha_max.value = '01-01-2099';
            fecha_max.readOnly = true;
        }

        var grupo_tarea = fields.find(f => f.id === 'waacc_grupo_tareas');
        if( !isUndefined(grupo_tarea)){
            grupo_tarea.value = 'Mantenimiento de estructuras de Control';
            grupo_tarea.readOnly = true; 
        }

        var tarea = fields.find(f => f.id === 'waacc_tarea');
        if( !isUndefined(tarea)){
            tarea.value = 'Alta de CeCo';
            tarea.readOnly = true;
        }
        
   /*      var activitiwaacb_rechazo = fields.find(f => f.id ===  'waacc_rechazo');
        if( !isUndefined(activitiwaacb_rechazo)){
            activitiwaacb_rechazo.value ="";
            activitiwaacb_rechazo
        } */

        var waacc_codigo_responsable = fields.find(f => f.id ===  'waacc_codigo_responsable');
        if( !isUndefined(waacc_codigo_responsable)){
            waacc_codigo_responsable.readOnly = true;
        }
        
        /* var controller_rechazo = fields.find(f => f.id ===  'waacc_accion_csa');
        if( !isUndefined(controller_rechazo)){
            if(controller_rechazo.value=="RECHAZAR"){
                activitiwaacb_rechazo.readOnly = false;
                activitiwaacb_rechazo.value="";
            }
        } */
        var waacc_inicio_validez = fields.find(f => f.id ===  'waacc_inicio_validez');
        if( !isUndefined(waacc_inicio_validez)){
            var date = new Date();
            waacc_inicio_validez.value = date.getDate() +"-"+ (date.getMonth()+1) +"-"+date.getFullYear();
            waacc_inicio_validez.maxValue = date.getDate() +"-"+ (date.getMonth()+1) +"-"+date.getFullYear();      
        }
        var waacc_fin_validez = fields.find(f => f.id ===  'waacc_fin_validez');
        if(!isUndefined(waacc_fin_validez)){
            waacc_fin_validez.value =  '31-12-9999';   
            waacc_fin_validez.readOnly = true;   
        }
       
        var waacc_comentarios_controller = fields.find(f => f.id === 'waacc_comentarios_controller');
        if(waacc_comentarios_controller === null || !isUndefined(waacc_comentarios_controller)){            
            waacc_comentarios_controller.value = "";          
        }
        var waacc_comentarios_csa = fields.find(f => f.id === 'waacc_comentarios_csa');
        if(waacc_comentarios_csa === null || !isUndefined(waacc_comentarios_csa)){          
            waacc_comentarios_csa.value = "";         
        }
        var waacc_comentarios_solicitante = fields.find(f => f.id === 'waacc_comentarios_solicitante');
        if(waacc_comentarios_solicitante === null || !isUndefined(waacc_comentarios_solicitante)){            
            waacc_comentarios_solicitante.value = "";          
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
                var waacc_accion_controller = fields.find(f => f.id ===  'waacc_accion_controller');
                if(e.field.value === "CECO EXISTE" && !isUndefined(waacc_accion_controller)){
                    waacc_accion_controller.value = "RECHAZAR";
                    waacc_accion_controller.readOnly = true;
                }
            }
		    if (e.field.id === 'waacc_area') {
		   
			    if(fields.find(f => f.id  == 'waacc_area')){
				    var area = fields.find(f => f.id === 'waacc_area');
                    var cc = fields.find(f => f.id === 'waacc_clase_centro_coste');
                    cc.readOnly = true;
			    }
	
				//areaaux = areaaux.substr(-3,areaaux.length);
				var resp = fields.find(f => f.id === 'waacc_codigo_responsable');
			    if(area != undefined){
                    switch(area.value){
                        case 'ADM':
                            cc.value = "S";
                            resp.value = '900093ADM';
                            break;
                        case 'CON':
                            cc.value = "S";
                            resp.value = '901889CON';
                            break;    
                        case 'COM':
                            cc.value = "S";
                            resp.value= '902400COM';
                            break;    
                        case 'TES':
                            cc.value = "S";
                            resp.value = '900031TES';
                            break;
                        case 'FIS':
                            cc.value = "S";
                            resp.value = '902156FIS';
                            break;
                        case 'BSC':
                            cc.value = "S";
                            resp.value = '902398BSC';
                            break;
                        case 'HSE':
                            cc.value = "S";
                            resp.value = '902398HSE';
                            break;
                        case 'LEG':
                            cc.value = "S";
                            resp.value = '900074LEG';
                            break;
                        case 'GDE':
                            cc.value = "F";
                            resp.value = '902036GDE';
                            break; 
                        default:
                            resp.value = 'VACIO';
                            break; 
                    }
			    }
            }
            
            if (e.field.id === 'waacc_sociedad') {
                var co = fields.find(f => f.id === 'waacc_sociedad_co');
                var mascara = fields.find(f => f.id === 'waacc_mascara_ceco');
                if( !isUndefined(mascara)){
                    if(e.field.value == '8700' || e.field.value == '8704' || e.field.value == '8712'){
                        co.value = '8700';
                    }else if(e.field.value == '0100' || e.field.value == '0101' || e.field.value == '0102' || e.field.value == '0103' || e.field.value == '0104' || e.field.value == '0262' || e.field.value == '0446' || e.field.value == '0568' || e.field.value == '0607'){
                        co.value = 'GV01'; 
                    }
                    co.readOnly = true;
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