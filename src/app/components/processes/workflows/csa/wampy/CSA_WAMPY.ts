/* tslint:disable:component-selector  */
import { FormFieldModel, FormFieldEvent, DynamicTableRow, ValidateDynamicTableRowEvent, FormService, WidgetVisibilityService } from "@alfresco/adf-core";
import { WidgetVisibilityModel } from "../../../../../models/widget-visibility.model";


import { isNullOrUndefined, isNumber, isString, isUndefined } from "util"; //isUndefined
import { TreePepsService } from '../../../../../services/tree-peps.service';



// import * as moment from "moment";

declare var $: any; 

export const CSA_WAMPY = {

    

    formLoaded(e: FormFieldEvent, fields: FormFieldModel[], treeService: TreePepsService) {

        let taskDefinitionKey = e.form.json.taskDefinitionKey;
        // vaciamos el pep actual
        treeService.currentPep = null;

        let required_fields = ["wampy_proyecto","wampy_accion_solicitante", "wampy_sociedad", "wampy_area","wampy_descripcion_nueva"];
        let no_editables = ["wampy_descripcion","wampy_pep1","wampy_pep2","wampy_pep3","wampy_orden"];
        fields.forEach(field => {
            if (required_fields.includes(field.id)) {
                field.required = true;
            }
            // Si son campos en los que se cargan valores actuales no son editables
            if( !field.id.includes("nuevo") &&  !field.id.includes("nueva") && no_editables.find( field_id => field.id.includes(field_id) ) ){
                field.readOnly = true;
            }
            //Si no es una tarea de solicitante ponemos los checks de solo lectura
            if(!isUndefined(taskDefinitionKey) && !taskDefinitionKey.includes('wampy_t1') && field.id.includes("check") ){
                field.readOnly = true;
            }
        });

        if (!isUndefined(taskDefinitionKey)) {
            if (taskDefinitionKey.includes('wampy_t1')) {
                fields.forEach(field => {
                    if (field.id == 'wampy_motivo_rechazo' || field.id == 'wampy_datos_corregir') {
                        field.readOnly = true;
                        // Si son campos de rechazo y estamos en la tarea de correccion ponemos una condicion de visibilidad para que solo se muestren si son vacios
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
                var wampy_motivo_rechazo = fields.find(f => f.id === 'wampy_motivo_rechazo');
                if (!isUndefined(wampy_motivo_rechazo)) {
                    // Limpiamos los radio buttons que sirven para indicar es correcto y el campo de rechazo
                    var wampy_accion_controller = fields.find(f => f.id === 'wampy_accion_controller');
                    var wampy_accion_csa = fields.find(f => f.id === 'wampy_accion_csa');
                    if (wampy_accion_controller) wampy_accion_controller.value = "ACEPTAR";
                    if (wampy_accion_csa) wampy_accion_csa.value = "ACEPTAR";
                    wampy_motivo_rechazo.value = "";
                }
                var wampy_datos_corregir = fields.find(f => f.id === 'wampy_datos_corregir');
                if (!isUndefined(wampy_datos_corregir)) {
                    // Limpiamos los radio buttons que sirven para indicar si se ha realizado correctamente y el campo de datos a corregir
                    var wampy_correcto = fields.find(f => f.id === 'wampy_correcto');
                    var wampy_accion_correcto = fields.find(f => f.id === 'wampy_accion_correcto');
                    wampy_correcto.value = "SI";
                    wampy_accion_correcto.value = "VIABLE";
                    wampy_datos_corregir.value = "";
                }

                let resultadoSap = fields.find(f => f.id === "resultadodesap");
                if ((!isUndefined(resultadoSap) && (resultadoSap.value !== "MODIFICACIÓN DE PEP'S CORRECTA"))) {
                    let radioBtn = fields.find(f => f.id === "wampy_correcto");
                    radioBtn.value = "NO";
                    radioBtn.readOnly = true;
                }
            }
        }
        
        

        let grupo_tarea = fields.find(f => f.id === 'wampy_grupo_tareas');
        if (!isNullOrUndefined(grupo_tarea)) {
            grupo_tarea.value = 'Mantenimiento de estructuras de Control';
            grupo_tarea.readOnly = true;
        }

        let tarea = fields.find(f => f.id === 'wampy_tarea');
        if (!isNullOrUndefined(tarea)) {
            tarea.value = 'Modificación de proyecto/PEP\'s';
            tarea.readOnly = true;
        }

        let wampyProyecto = fields.find(f => f.id === 'wampy_proyecto');
        if (!isNullOrUndefined(wampyProyecto) && !isNullOrUndefined(taskDefinitionKey)) {
            wampyProyecto.readOnly = true;
        }

        let fechaInicioSolicitud = fields.find(f => f.id === 'wampy_fecha_solicitud');
        if (fechaInicioSolicitud === null || !isNullOrUndefined(fechaInicioSolicitud)) {
            fechaInicioSolicitud.readOnly = true;
            if (taskDefinitionKey == "wampy_t1") {
                let date = new Date();
                fechaInicioSolicitud.value = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
                // fechaInicioSolicitud.readOnly = true;
            }
        }
        var fechadesolicitud = fields.find(f => f.id ===  'fechadesolicitud');
        formatFechasTareasCompletadas(fechadesolicitud);

        let wampyTree = fields.find(f => f.id === 'wampy_tree');
        if (!isNullOrUndefined(wampyTree) && wampyTree.value) {
            let tree = JSON.parse(wampyTree.value);
            let wampy_sociedad = fields.find(f => f.id === 'wampy_sociedad');
            if (!isNullOrUndefined(wampy_sociedad) && (isNullOrUndefined(wampy_sociedad.value) || wampy_sociedad.value === "empty")) {
                wampy_sociedad.value = tree["SOCIEDAD"];
                wampy_sociedad.readOnly = true;
            }
        }

     
   
        var wampy_historico = fields.find(f => f.id === 'wampy_historico');
        if (!isUndefined(wampy_historico)) {
            wampy_historico.readOnly = true;
            if (wampy_historico.value == null) wampy_historico.value = '';
            if (taskDefinitionKey.includes('wampy_t1') || (taskDefinitionKey.includes('wampy_t3'))) {
                var wampy_comentarios_controller = fields.find(f => f.id === 'wampy_comentarios_controller');
                this.valueComentarios(wampy_comentarios_controller, wampy_historico, "\n- Controller : ");
                var wampy_comentarios_csa = fields.find(f => f.id === 'wampy_comentarios_csa');
                this.valueComentarios(wampy_comentarios_csa, wampy_historico, "\n- CSA : ");
            } else if (taskDefinitionKey.includes('wampy_t2')) {
                var comentariossolicitante = fields.find(f => f.id === 'wampy_comentarios_solicitante');
                this.valueComentarios(comentariossolicitante, wampy_historico, "\n- Solicitante : ");
            } else if (taskDefinitionKey.includes('wampy_t4')) {
                var wampy_comentarios_csa = fields.find(f => f.id === 'wampy_comentarios_csa');
                this.valueComentarios(wampy_comentarios_csa, wampy_historico, "\n- CSA : ");
            }
        }

        //textareaResultadoSap
        let respuestaSap = fields.find(f => f.id === "wampy_sap_result");
        if(!isNullOrUndefined(respuestaSap)) respuestaSap.readOnly = true;
        
        //Visibilidad de campos readOnly en t2,t3,t4
        if (!isNullOrUndefined(taskDefinitionKey) && (taskDefinitionKey == "wampy_t2" || taskDefinitionKey == "wampy_t3" || taskDefinitionKey == "wampy_t4")){
            fields.forEach(field => {
                if (field.type === "typeahead" || field.type === "dropdown") {
                    field.readOnly = true;
                }
            });
        }

        
    },

    formFieldValueChanged(e: FormFieldEvent, fields: FormFieldModel[],  treeService: TreePepsService, visibilityService : WidgetVisibilityService) {
        let taskDefinitionKey = e.form.json.taskDefinitionKey;

        if (e.field.id === 'wampy_tree' || (e.field.id === 'wampy_tipo_elemento' && taskDefinitionKey && taskDefinitionKey !== "wampy_t1")) {
            let esProyectoGasto = false;
            //logica para obtener la mascara del elemento seleccionado en otra tarea
            let identificadorElemento = fields.find(f => f.id === "identificadordelelemento");
            if (!isNullOrUndefined(identificadorElemento)) {
                let mask = identificadorElemento.value;
                if (isString(mask) && (mask.charAt(9) === "G" || mask.charAt(9) === "E") ) {
                    esProyectoGasto = true;
                }
            }
            // Logica para ocultar campos de niveles que no corresponden al elemento seleccionado
            // Si no tienen current pep pero tiene el campo tipo elemento significa que ya ha seleccionado el elemento en otra tarea
            let wampy_tipo_elemento = fields.find(f => f.id === 'wampy_tipo_elemento');            
            let tipoPep =  treeService.currentPep ? treeService.currentPep.tipoPep : wampy_tipo_elemento ? wampy_tipo_elemento.value : "";
            let grupo_visible;
            // Si es numero el tipo de pep esta sacado del currentPep y estamos en la tarea de usuario en la que selecciona el pep
            if(!isNumber(tipoPep) ) grupo_visible = tipoPep === "proyecto" ? "set_proyecto"  : tipoPep;
            else grupo_visible = tipoPep === 0 ?  'set_proyecto': tipoPep === 4 ? 'orden' : 'pep'+tipoPep ;

            let field_sets = ["set_proyecto","pep1","pep2","pep3","orden"];
    
            // Eliminamos el set del set selecionado del array a ocultar
            const index = field_sets.indexOf(grupo_visible);
            // Hay que hacer NO VISIBLE el campo de wampy_descripcion_nueva si es un proyecto, no vale con solo ocultar el set_proyecto porque falla la validacion
            // Si no es t1 hay que ocultar los mostrar valores que no aplican
            if(index !== 0) field_sets.push("wampy_descripcion_nueva");
            if(index !== 1) field_sets.push("descripcinbreve");
            if(index !== 2 || esProyectoGasto) field_sets.push("destinoinversin","inversinproteccinmedioambiente"); 
            if(index !== 4) field_sets.push("textobreve");

            if (index > -1) {
                field_sets.splice(index, 1);
            } 
            
            
    
            fields.forEach(field => {
                if(field.id.includes(grupo_visible) || (grupo_visible === 'set_proyecto' && field.id === "wampy_descripcion_nueva" ) ){
                    // vaciamos la condicion de visivilidad para que el campo sea !!! visible ¡¡¡
                    let original_fields = e.form.getFormFields();
                    let field_original  =  original_fields.find(f => f.id.includes(field.id) ); //original_fields.find(f => f.id.includes(field.id) ); //field.form.fields.find(f => f.id === grupo_visible);
   
                    let visibilityCondition : any = field_original.json.visibilityCondition ? new WidgetVisibilityModel(field_original.json.visibilityCondition) : undefined;
                    field.visibilityCondition = visibilityCondition;

                }else{

                    field_sets.forEach(field_hide => {
                        if(field.id.includes(field_hide) ){
                            // Establecemos una condicion de visivilidad para que el campo sea !!! NO visible ¡¡¡
                            hideField(field);
                        }
                    });
                }
            });
            if (index == 2 && esProyectoGasto) {
                //si es un pep2 quitamos la los checks de campos de inversion
                let checkDestino = fields.find(f => f.id === 'wampy_check_pep2_destino'); if (!isNullOrUndefined(checkDestino)) hideField(checkDestino);//checkDestino.readOnly = true;
                let checkProtect = fields.find(f => f.id === 'wampy_check_pep2_protect'); if (!isNullOrUndefined(checkProtect)) hideField(checkProtect);//checkProtect.readOnly = true;

            }
            if(treeService.currentPep && !isNullOrUndefined(treeService.currentPep.tipoPep) ){
                // Cargamos los valores del elemento seleccionado en sus respectivos campos
                this.showEditableForm(treeService.currentPep.tipoPep, treeService.currentPep, fields);
            }
            visibilityService.refreshVisibility(e.form);
            
            
        }
        if (e.field.id === 'wampy_area') {
               
            var resp = fields.find(f => f.id === 'wampy_responsable_area');
            if (!isNullOrUndefined(e.field.value)) {
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
   
        if (e.field.id === 'wampy_sociedad') {
            if (fields.find(f => f.id === 'wampy_sociedad')) {
                var co = fields.find(f => f.id === 'wampy_sociedad_co');
                if (e.field.value == '8700' || e.field.value == '8704' || e.field.value == '8712') {
                    co.value = '8700';
                } else if (e.field.value == '0100' || e.field.value == '0101' || e.field.value == '0102' || e.field.value == '0103' ||
                    e.field.value == '0104' || e.field.value == '0262' || e.field.value == '0446' || e.field.value == '0568' || e.field.value == '0607') {
                    co.value = 'GV01';
                }
                var sociedad_co = fields.find(f => f.id === 'wampy_sociedad_co');
                sociedad_co.readOnly = true;
            }
        }

        if (e.field.id.includes("comentarios")) {
            $("#" + e.field.id).attr("maxlength", 300);
        }


    },
    validateDynamicTableRow(row: DynamicTableRow, e: ValidateDynamicTableRowEvent, fields: FormFieldModel[], treeService: TreePepsService, formService: FormService, visibilityService) {
       
    },
    valueComentarios(fieldComentario,fieldHistorico,texto){
        if (fieldComentario && fieldComentario.value && !fieldHistorico.value.includes(fieldComentario.value)){
        fieldHistorico.value +=  texto + fieldComentario.value;
        fieldComentario.value = "";
    }
},


    showEditableForm(tipoPep, selectedNode, fields: FormFieldModel[]) {
        let pepSeleccionado = "";
        if (tipoPep == 0) {
            pepSeleccionado = "proyecto";
        } else if (tipoPep == 1) {
            pepSeleccionado = "pep1";
        } else if (tipoPep == 2) {
            pepSeleccionado = "pep2";
        } else if (tipoPep == 3) {
            pepSeleccionado = "pep3";
        } else {
            pepSeleccionado = "orden";
        }
        let tipoNodo = fields.find(f => f.id === 'wampy_tipo_elemento');
        let idElemento = fields.find(f => f.id === "wampy_id_elemento");
        let descElemento = fields.find(f => f.id === "wampy_desc_elemento");

        if (!isNullOrUndefined(tipoNodo)) { tipoNodo.value = pepSeleccionado };
        if (!isNullOrUndefined(idElemento)) { idElemento.value = selectedNode["mascara"] };
        if (!isNullOrUndefined(descElemento)) { descElemento.value = selectedNode["desc"]  };

        switch (tipoPep) {
            case 0:
                //$("#wampy_descripcion").val(selectedNode["desc"]);
                let wampy_descripcion = fields.find(f => f.id === 'wampy_descripcion');
                wampy_descripcion.value = selectedNode["desc"];
                break;
            case 1:
            case 2:
            case 3:
            case 4:
                if (tipoPep == 2) { //si es proyecto de gasto
                    let fields_inversion_ids = [ ["wampy_check_pep2_destino","destino_inversion"],["wampy_check_pep2_protect","inversion_prot"],["wampy_pep2_destino","destino_inversion"],["wampy_pep2_protect","inversion_prot"] ];
                    // Filtramos los campos para extraer los de inversion
                    let fields_inversion =  fields.filter(f => fields_inversion_ids.map( (fieldsForm)=>{return fieldsForm[0] }).includes(f.id) );
                    if (selectedNode["mascara"].charAt(9) === "G" || selectedNode["mascara"].charAt(9) === "E") { // Si es proyecto de G ocultamos los campos de I
                        fields_inversion.forEach( field => {
                            hideField(field);
                        }) ;
                    } else { //Si es de inversion
                        // Recorremos los campos de inversion y buscamos el id asignado para ese campo en el arbol
                        fields_inversion.forEach( field => {
                            if( !field.id.includes("check")){
                                let field_tree_id = fields_inversion_ids.find(field_inversion => field_inversion[0] === field.id ) 
                                field.value = selectedNode[field_tree_id[1]];
                            }
                        }) ;
                    }
                }
                if (tipoPep === 1) {
                    let wampy_pep1_descripcion = fields.find(f => f.id === 'wampy_pep1_descripcion');
                    wampy_pep1_descripcion.value = selectedNode["desc"];
                    let wampy_pep1_ceco = fields.find(f => f.id === 'wampy_pep1_ceco');
                    wampy_pep1_ceco.value = selectedNode["ceco_responsable"];

                }
                else if (tipoPep === 2 || tipoPep === 3) {
                    let wampy_pep_descripcion = fields.find(f => f.id === 'wampy_pep'+tipoPep+'_desc');
                    wampy_pep_descripcion.value = selectedNode["desc"];
                    let wampy_pep_ceco = fields.find(f => f.id === 'wampy_pep'+tipoPep+'_ceco');
                    wampy_pep_ceco.value = selectedNode["ceco_responsable"];
                }
                else if (tipoPep === 4) {
                    let wampy_orden_descripcion = fields.find(f => f.id === 'wampy_orden_texto');
                    wampy_orden_descripcion.value = selectedNode["desc"];
                    let wampy_pep2_ceco = fields.find(f => f.id === 'wampy_orden_ceco');
                    wampy_pep2_ceco.value = selectedNode["ceco_responsable"];
                }
               
  
                break;
                
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

function hideField(field: FormFieldModel) {
    // Establecemos una condicion de visivilidad para que el campo sea !!! NO visible ¡¡¡
    let visibility : any = {
        leftFormFieldId : field.id,
        leftType : "field",
        operator : "==" ,
        rightValue: "NUNCA"
    };
    let visibilityCondition : any = new WidgetVisibilityModel(visibility) ;
    field.visibilityCondition = visibilityCondition;

}






