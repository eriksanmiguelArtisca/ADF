import { FormFieldModel, FormFieldEvent } from "@alfresco/adf-core";
import { isNullOrUndefined, isUndefined } from "util";

export const CSA_MOFICACION_NODO_CEBE = {
    formLoaded(e: FormFieldEvent, fields: FormFieldModel[])  {
        //formulario CEBE

        let taskDefinitionKey = e.form.json.taskDefinitionKey;

        var wamncb_area = fields.find(f => f.id ===  'wamncb_area');
        if(!isUndefined(wamncb_area)){
            wamncb_area.required = true;   
        }

         if( !isUndefined(taskDefinitionKey) ){
            if( taskDefinitionKey.includes('wamncb_t1')  ){
                var nodo = fields.find(f => f.id === 'wamncb_nodo');
                /* desc.value = nodo. */
                nodo.readOnly = true;
            }
         }
         
         if( !isUndefined(taskDefinitionKey) ){
            if( taskDefinitionKey.includes('wamncb_t1')  ){
                fields.forEach(field => {
                    if(  field.id == 'wamncb_rechazo'  || field.id == 'wamncb_datos_corregir'){
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
                var wamncb_fichero = fields.find(f => f.id ===  'wamncb_fichero');
                if( !isUndefined(wamncb_fichero)){
                    wamncb_fichero.readOnly = true;
                }
                var activitiwamncb_rechazo = fields.find(f => f.id ===  'wamncb_rechazo' );
                if( !isUndefined(activitiwamncb_rechazo) && activitiwamncb_rechazo.type!== "readonly"){
                    activitiwamncb_rechazo.value ="";
                    activitiwamncb_rechazo.readOnly = false;
                }
                var wamncb_datos_corregir = fields.find(f => f.id ===  'wamncb_datos_corregir');
                if( !isUndefined(wamncb_datos_corregir) && wamncb_datos_corregir.type!== "readonly"){
                    wamncb_datos_corregir.value ="";
                    wamncb_datos_corregir.readOnly = false;
                }
            }
        }

        var wamncb_historico = fields.find(f => f.id ===  'wamncb_historico');
        if( !isUndefined(wamncb_historico) ){
            wamncb_historico.readOnly = true;
            if(wamncb_historico.value == null) wamncb_historico.value = '';
            if( taskDefinitionKey.includes('wamncb_t1')  ){
                var wamncb_comentarios_controller = fields.find(f => f.id ===  'wamncb_comentarios_controller');
                if(wamncb_comentarios_controller.value){
                    wamncb_historico.value += "\n- Controller : "+wamncb_comentarios_controller.value;
                    wamncb_comentarios_controller.value ="";
                }
                var wamncb_comentarios_csa = fields.find(f => f.id ===  'wamncb_comentarios_csa');
                if(wamncb_comentarios_csa.value ){
                    wamncb_historico.value += "\n- CSA : "+wamncb_comentarios_csa.value;
                    wamncb_comentarios_csa.value = "";
                }
            }else if( taskDefinitionKey.includes('wamncb_t2')  ){
                var wamncb_comentarios_solicitante = fields.find(f => f.id ===  'wamncb_comentarios_solicitante');
                if(wamncb_comentarios_solicitante.value ){
                    wamncb_historico.value += "\n- Solicitante : "+wamncb_comentarios_solicitante.value;
                    wamncb_comentarios_solicitante.value = "";
                }
            }else if( taskDefinitionKey.includes('wamncb_t3')  ){
                var wamncb_comentarios_controller = fields.find(f => f.id ===  'wamncb_comentarios_controller');
                if(wamncb_comentarios_controller.value ){
                    wamncb_historico.value += "\n- Controller : "+wamncb_comentarios_controller.value;
                    wamncb_comentarios_controller.value = "";
                }
            }else if( taskDefinitionKey.includes('wamncb_t4')  ){
                //cambiar comentario controller que no un mostrar valor sino un campo editable
                var wamncb_comentarios_csa = fields.find(f => f.id ===  'wamncb_comentarios_csa');
                if(wamncb_comentarios_csa.value ){
                    wamncb_historico.value += "\n- CSA : "+wamncb_comentarios_csa.value;
                    wamncb_comentarios_csa.value ="";
                }
            }
        }

        var fecha_solicitud = fields.find(f => f.id === 'wamncb_fecha_solicitud');
        if (fecha_solicitud === null || !isUndefined(fecha_solicitud)) {
            fecha_solicitud.readOnly = true;
            if (isUndefined(taskDefinitionKey)) { //Tarea start
                var date = new Date();
                fecha_solicitud.value = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
            }
        }
        
       /* var fecha_max = fields.find(f => f.id ===  'wamncb_fecha_max');
        if(fecha_max === null ||  !isUndefined(fecha_max)){
            fecha_max.value = '01-01-2099';
            fecha_max.readOnly = true;
        } */
    
        var grupo_tarea = fields.find(f => f.id ===  'wamncb_grupo_tareas');
        if( !isUndefined(grupo_tarea)){
            grupo_tarea.value = 'Mantenimiento de estructuras de Control';
            grupo_tarea.readOnly = true; 
        }
        
        var tarea = fields.find(f => f.id === 'wamncb_tarea');
        if( !isUndefined(tarea)){
            tarea.value = 'Modificación Nodo de CeBe';
            tarea.readOnly = true; 
        }
        
        var activitiwamncb_tarea = fields.find(f => f.id ===  'wamncb_grupo_tareas');
        if( !isUndefined(grupo_tarea)){
            activitiwamncb_tarea.readOnly = true;
        }
        
        

        var sociedad = fields.find(f => f.id ===  'wamncb_sociedad');
        if( !isUndefined(sociedad)){
            sociedad.readOnly = true; 
        }
        var sociedad_co = fields.find(f => f.id ===  'wamncb_sociedad_co');
        if( !isUndefined(sociedad_co)){
            sociedad_co.readOnly = true; 
        }
        var nodo_desc = fields.find(f => f.id ===  'wamncb_nodo_descripcion');
        if( !isUndefined(nodo_desc)){
            nodo_desc.readOnly = true; 
        }

        // Corregir formato fecha en tareas completadas
        var fechadesolicitud = fields.find(f => f.id ===  'fechadesolicitud');
        formatFechasTareasCompletadas(fechadesolicitud);

    },
    
    formFieldValueChanged(e: FormFieldEvent, fields : FormFieldModel[]) {
            if (e.field.id === 'wamncb_area') {
			    var area = fields.find(f => f.id ===  'wamncb_area');

			    var resp = fields.find(f => f.id === 'wamncb_codigo_responsable');
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

		    if (e.field.id === 'wamncb_sociedad') {
                //var soc = fields.find(f => f.id === 'wamncb_sociedad');
                var co = fields.find(f => f.id === 'wamncb_sociedad_co');
                if(e.field.value == '8700' || e.field.value == '8704' || e.field.value == '8712'){
                    co.value = '8700';
                }else if(e.field.value == '0100' || e.field.value == '0101' || e.field.value == '0102' || e.field.value == '0103' || e.field.value == '0104' || e.field.value == '0262' || e.field.value == '0446' || e.field.value == '0568' || e.field.value == '0607'){
                    co.value = 'GV01'; 
                }
                /* var activitiwamncb_sociedad_co = fields.find(f => f.id === 'wamncb_sociedad_co');
                activitiwamncb_sociedad_co.readOnly = true; */
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