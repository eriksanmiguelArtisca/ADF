import { FormFieldModel, FormFieldEvent, DynamicTableRow, ValidateDynamicTableRowEvent, FormService, FORM_FIELD_VALIDATORS } from "@alfresco/adf-core";
import { FieldValidatorWAAPY } from "./fieldValidatorWAAPY";
import { isNullOrUndefined, isUndefined } from "util";
import { TreePepsService } from '../../../../../services/tree-peps.service';
// import * as moment from "moment";

declare var $: any;

export const CSA_WAAPY = {

    formLoaded(e: FormFieldEvent, fields: FormFieldModel[], treeService) {

        /*     fieldValidators : any ; */
        e.form.fieldValidators = [
            ...FORM_FIELD_VALIDATORS,
            new FieldValidatorWAAPY()
        ]
        let taskDefinitionKey = e.form.json.taskDefinitionKey;
        var waapy_solicitud = fields.find(f => f.id === 'waapy_solicitud');
        if (!isUndefined(waapy_solicitud) && taskDefinitionKey && taskDefinitionKey.includes('waapy_t')) {
            waapy_solicitud.readOnly = true;
           
            if (waapy_solicitud.value === "nuevo") {
                // var waapy_tabla_pep1 = fields.find(f => f.id === 'waapy_tabla_pep1');
                // waapy_tabla_pep1.required = true;

                let required_fields = ["waapy_tabla_proyecto", "waapy_tabla_pep1", "waapy_sociedad_co", "waapy_codigo_responsable", "waapy_sociedad", "waapy_area","waapy_accion_solicitante"];
                fields.forEach(field => {
                    if (required_fields.includes(field.id)) {
                        field.required = true;
                    }
                });

              
            }else if(waapy_solicitud.value == "existente"){
                let waapy_sociedad =  fields.find(f => f.id === 'waapy_sociedad'); 
                let tree = fields.find(f => f.id === 'waapy_tree');
                 let objTree= JSON.parse(tree.value);
                // console.log(objTree);
                // let perfilProyecto = objTree["PERFIL_PROYECTO_CODE"];
                if (!isUndefined(waapy_sociedad) && (isUndefined(waapy_sociedad.value) || waapy_sociedad.value === "empty") ){
                   waapy_sociedad.value = objTree["SOCIEDAD"];
                    waapy_sociedad.readOnly = true;
                }else if( !isUndefined(waapy_sociedad)){
                    waapy_sociedad.readOnly = true;
                }
               
            }
        }

        if( !isUndefined(taskDefinitionKey) ){
            var waapy_proyecto = fields.find(f => f.id === 'waapy_proyecto');
            if (!isUndefined(waapy_proyecto)) {
                waapy_proyecto.readOnly = true;
            }
            if( taskDefinitionKey.includes('waapy_t1')  ){
                fields.forEach(field => {
                    if(  field.id == 'waapy_datos_corregir'  || field.id == 'waapy_motivo_rechazo'){
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


                var waapy_motivo_rechazo = fields.find(f => f.id ===  'waapy_motivo_rechazo');
                if( !isUndefined(waapy_motivo_rechazo) ){
                    // Limpiamos los radio buttons que sirven para indicar es correcto y el campo de rechazo
                    var waapy_accion_controller = fields.find(f => f.id ===  'waapy_accion_controller');
                    var waapy_accion_csa = fields.find(f => f.id ===  'waapy_accion_csa');
                    if(waapy_accion_controller) waapy_accion_controller.value =  "ACEPTAR";
                    if(waapy_accion_csa) waapy_accion_csa.value =  "ACEPTAR";
                    waapy_motivo_rechazo.value ="";
                
                }
                var waapy_datos_corregir = fields.find(f => f.id ===  'waapy_datos_corregir');
                if( !isUndefined(waapy_datos_corregir) ){
                    // Limpiamos los radio buttons que sirven para indicar si se ha realizado correctamente y el campo de datos a corregir
                    var waapy_correcto = fields.find(f => f.id ===  'waapy_correcto');
                    var waapy_accion_correcto = fields.find(f => f.id ===  'waapy_accion_correcto');
                    waapy_correcto.value = "SI";
                    waapy_accion_correcto.value = "VIABLE";
                    waapy_datos_corregir.value ="";
                }
                //check resultadoSAP
                let resultadoSap= fields.find(f => f.id === "resultadodesap");
                if ((!isUndefined(resultadoSap) && (resultadoSap.value == "CREACION DE PEP'S INCORRECTA"))){
                    let radioBtn= fields.find(f => f.id === "waapy_correcto");
                    radioBtn.value = "NO";
                    radioBtn.readOnly = true;
                }

            }
        } 
        

        if( !isUndefined(taskDefinitionKey)  && !taskDefinitionKey.includes('waapy_t1')  ){
            var resultadodesap = fields.find(f => f.id ===  'resultadodesap');
            let pepsCreadoCorrecto = false;
            if (!isUndefined(resultadodesap) && resultadodesap.value === "CREACION DE PEP'S CORRECTA") {
                pepsCreadoCorrecto = true;
            }
            let arrayTables=["waapy_tabla_proyecto","waapy_tabla_pep1","waapy_tabla_pep2","waapy_tabla_pep3","waapy_tabla_ordenes"]; 
            //incidencia datos a corregir no se vacía, no se le pasaba al método la tabla de ordenes
            for (let table of arrayTables){
                var waapy_tabla = fields.find(f => f.id ===  table);
                loadTable(waapy_tabla,pepsCreadoCorrecto, fields,taskDefinitionKey);
            }
        }

       

    /*     var waapy_motivo_rechazo = fields.find(f => f.id ===  'waapy_motivo_rechazo');
        if( !isUndefined(waapy_motivo_rechazo)){
            waapy_motivo_rechazo.value ="";
        }
        var waapy_datos_corregir = fields.find(f => f.id ===  'waapy_datos_corregir');
        if( !isUndefined(waapy_datos_corregir)){
            waapy_datos_corregir.value ="";
        } */
        

        
        

        var waapy_historico = fields.find(f => f.id ===  'waapy_historico');
        if( !isUndefined(waapy_historico) ){
            waapy_historico.readOnly = true;
            if (waapy_historico.value == null) waapy_historico.value = '';
            if (taskDefinitionKey.includes('waapy_t1') || (taskDefinitionKey.includes('waapy_t3')) ) {
                var waapy_comentarios_controller = fields.find(f => f.id === 'waapy_comentarios_controller');
                this.valueComentarios(waapy_comentarios_controller,waapy_historico,"\n- Controller : ");
                // if (waapy_comentarios_controller.value && !waapy_historico.value.includes(waapy_comentarios_controller.value)) {
                //     waapy_historico.value += "\n- Controller : " + waapy_comentarios_controller.value;
                //     waapy_comentarios_controller.value = "";
                // }

                var waapy_comentarios_csa = fields.find(f => f.id === 'waapy_comentarios_csa');
                this.valueComentarios(waapy_comentarios_csa,waapy_historico,"\n- CSA : ");
                // if (waapy_comentarios_csa.value && !waapy_historico.value.includes(waapy_comentarios_csa.value)) {
                //     waapy_historico.value += "\n- CSA : " + waapy_comentarios_csa.value;
                //     waapy_comentarios_csa.value = "";
                // }
            } else if (taskDefinitionKey.includes('waapy_t2')) {
                var comentariossolicitante = fields.find(f => f.id === 'waapy_comentarios_solicitante');
                
                this.valueComentarios(comentariossolicitante,waapy_historico,"\n- Solicitante : ");
                // if (comentariossolicitante.value && !waapy_historico.value.includes(comentariossolicitante.value)) {
                //     waapy_historico.value += "\n- Solicitante : " + comentariossolicitante.value;
                //     comentariossolicitante.value = "";
                // }
            // } 
            // else if (taskDefinitionKey.includes('waapy_t3')) {
            //     var waapy_comentarios_controller = fields.find(f => f.id === 'waapy_comentarios_controller');
            //     if (waapy_comentarios_controller.value && !waapy_historico.value.includes(waapy_comentarios_controller.value)) {
            //         waapy_historico.value += "\n- Controller : " + waapy_comentarios_controller.value;
            //         waapy_comentarios_controller.value = "";
            //     }
            } else if (taskDefinitionKey.includes('waapy_t4')) {
                //cambiar comentario controller que no un mostrar valor sino un campo editable
                var waapy_comentarios_csa = fields.find(f => f.id === 'waapy_comentarios_csa');
                this.valueComentarios(waapy_comentarios_csa,waapy_historico,"\n- CSA : ");
                // if (waapy_comentarios_csa.value && !waapy_historico.value.includes(waapy_comentarios_csa.value)) {
                //     waapy_historico.value += "\n- CSA : " + waapy_comentarios_csa.value;
                //     waapy_comentarios_csa.value = "";
                // }
            }
        }

        var grupo_tarea = fields.find(f => f.id === 'waapy_grupo_tareas');
        if (!isUndefined(grupo_tarea)) {
            grupo_tarea.value = 'Mantenimiento de estructuras de Control';
            grupo_tarea.readOnly = true;
        }

        var tarea = fields.find(f => f.id === 'waapy_tarea');
        if (!isUndefined(tarea)) {
            tarea.value = "Alta de Proyecto/PEP's";
            tarea.readOnly = true;
        }

        

        var fecha_solicitud = fields.find(f => f.id === 'waapy_fecha_solicitud');
        if (fecha_solicitud === null || !isUndefined(fecha_solicitud)) {
            fecha_solicitud.readOnly = true;
            if (taskDefinitionKey == "waapy_t1") {
                var date = new Date();
                fecha_solicitud.value = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
            }
        }

        var fechadesolicitud = fields.find(f => f.id ===  'fechadesolicitud');
        formatFechasTareasCompletadas(fechadesolicitud);
    },

    formFieldValueChanged(e: FormFieldEvent, fields: FormFieldModel[], treeService) {
        // let tipoTarea = e.form.taskName;
        let tipoTarea=e.form.json.taskDefinitionKey;
        if (!isNullOrUndefined(tipoTarea)){
        let waapy_solicitud = fields.find(f => f.id === 'waapy_solicitud');
        //si se edita la sociedad en un nuevo proyecto
        if (tipoTarea.includes("t1") && waapy_solicitud.value === "nuevo" && (e.field.id == "waapy_tabla_proyecto" || e.field.id === 'waapy_sociedad') ){
            let tree = fields.find(f => f.id === 'waapy_tree');
            let objTree; let firstCharacter;
            if (tree.value !== null) { objTree = JSON.parse(tree.value); }
            let waapy_sociedad = fields.find(f => f.id === 'waapy_sociedad');
            if ( !isUndefined(waapy_sociedad) && (waapy_sociedad.value !== null || waapy_sociedad.value !== undefined) && objTree) {
                if (tree.value !== null) { firstCharacter = objTree[0]["mascara"].charAt(0) };
                let tablaProyecto = fields.find(f => f.id === 'waapy_tabla_proyecto');
                if (treeService && treeService.rootPep && tablaProyecto && !isNullOrUndefined(tablaProyecto.value) && !isNullOrUndefined(tablaProyecto.value[0])) {
                    switch (waapy_sociedad.value) {
                        case "0100":
                            if (firstCharacter == 'G') {
                                treeService.rootPep[0]["perfil_proyecto_code"] = "PEOG001";
                            } else {
                                treeService.rootPep[0]["perfil_proyecto_code"] = "PEOP000";
                            }
                            break;
                        case "0101":
                            if (firstCharacter == 'G') {
                                treeService.rootPep[0]["perfil_proyecto_code"] = "PEEG001";
                            } else {
                                treeService.rootPep[0]["perfil_proyecto_code"] = "PEEP000";
                            }
                            break;
                        case "0102":
                            if (firstCharacter == 'G') {
                                treeService.rootPep[0]["perfil_proyecto_code"] = "PEHG001";
                            } else {
                                treeService.rootPep[0]["perfil_proyecto_code"] = "PEHP000";
                            }
                            break;
                        case "0103":
                            if (firstCharacter == 'G') {
                                treeService.rootPep[0]["perfil_proyecto_code"] = "PVHG001";
                            } else {
                                treeService.rootPep[0]["perfil_proyecto_code"] = "PVHP000";
                            }
                            break;
                        case "0104":
                            if (firstCharacter == 'G') {
                                treeService.rootPep[0]["perfil_proyecto_code"] = "PTCG001";
                            } else {
                                treeService.rootPep[0]["perfil_proyecto_code"] = "PTCP000";
                            }
                            break;
                        case "0262":
                            if (firstCharacter == 'G') {
                                treeService.rootPep[0]["perfil_proyecto_code"] = "PBDG001";
                            } else {
                                treeService.rootPep[0]["perfil_proyecto_code"] = "PBDP000";
                            }
                            break;
                        case "0446":
                            if (firstCharacter == 'G') {
                                treeService.rootPep[0]["perfil_proyecto_code"] = "PVDG001";
                            } else {
                                treeService.rootPep[0]["perfil_proyecto_code"] = "PVDP000";
                            }
                            break;
                        case "0568":
                            if (firstCharacter == 'G') {
                                treeService.rootPep[0]["perfil_proyecto_code"] = "PVPG001";
                            } else {
                                treeService.rootPep[0]["perfil_proyecto_code"] = "PVPP000";
                            }
                            break;
                        case "0607":
                            if (firstCharacter == 'G') {
                                treeService.rootPep[0]["perfil_proyecto_code"] = "PEIG001";
                            } else {
                                treeService.rootPep[0]["perfil_proyecto_code"] = "PEIP000";
                            }
                            break;
                        case "8700":
                        case "8704":
                        case "8712":
                        case "8729":
                            if (firstCharacter == 'G') {
                                treeService.rootPep[0]["perfil_proyecto_code"] = "PVRG001";
                            } else {
                                treeService.rootPep[0]["perfil_proyecto_code"] = "PVRP000";
                            }
                            break;
                    }
                    //asignación proyectCode
                    tablaProyecto.value[0]['waapy_proyecto_perfil_code'] = treeService.rootPep[0]["perfil_proyecto_code"];

                }
            }
        }
    }
            
        if (e.field.id === 'waapy_accion_controller') {
            let arrayTables = [];
            var waapy_tabla_pep1 = fields.find(f => f.id === 'waapy_tabla_pep1');
            // waapy_tabla_pep1.validate();
            var waapy_tabla_pep2 = fields.find(f => f.id === 'waapy_tabla_pep2');
            // waapy_tabla_pep2.validate();
            var waapy_tabla_pep3 = fields.find(f => f.id === 'waapy_tabla_pep3');
            // waapy_tabla_pep3.validate();
            arrayTables.push(waapy_tabla_pep1,waapy_tabla_pep2,waapy_tabla_pep3);
            for (let table of arrayTables){
                table.validate();
            }
            /*      if(e.field.value.value === "RECHAZAR"){
                     
                 } */
        }
        if (e.field.id === 'waapy_area') {
            var resp = fields.find(f => f.id === 'waapy_codigo_responsable');
            if (!isUndefined(e.field.value)) {
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
       
        if (e.field.id === 'waapy_sociedad') {
            if (fields.find(f => f.id ===  'waapy_sociedad')){
                var co = fields.find(f => f.id === 'waapy_sociedad_co');
                if(e.field.value == '8700' || e.field.value == '8704' || e.field.value == '8712'){
                    co.value = '8700';
                }else if(e.field.value == '0100' || e.field.value == '0101' || e.field.value == '0102' || e.field.value == '0103' || e.field.value == '0104' || e.field.value == '0262' || e.field.value == '0446' || e.field.value == '0568' || e.field.value == '0607'){
                    co.value = 'GV01'; 
                }
                var activitiwaapy_sociedad_co = fields.find(f => f.id === 'waapy_sociedad_co');
                activitiwaapy_sociedad_co.readOnly = true;
            }
        }

    },
    validateDynamicTableRow(row: DynamicTableRow, e: ValidateDynamicTableRowEvent, fields: FormFieldModel[], treeService: TreePepsService, formService: FormService, visibilityService) {
        /* let  duplicados =  *//* comprobarDuplicadosVariables(formService,mascara,visibilityService,"proyecto",e); */
        // Añadimos que es un nuevo pep para poder pintar en el arbol los valores que no contengan este valor
        row.value["newPep"] = true;
        let tipo_solicitud= fields.find(f => f.id === 'waapy_solicitud');
        let sociedad = fields.find(f => f.id === "waapy_sociedad");
        let sociedadesMultiRaiz = ["8700","8704","8712","8729"];
        let taskDef = e.form.json.taskDefinitionKey;
        if (e.field.id !== "waapy_tabla_proyecto" && treeService.rootPep[0]) {
            let mascara = treeService.rootPep[0].mascara;
            if (mascara.charAt(0) === "G") {
                treeService.rootPep[0].perfil_proyecto = "Gestional";
                let last_character = mascara.charAt(mascara.length - 1);
                if (last_character === "E" || last_character === "G") {
                    treeService.rootPep[0].clase_objeto = "Gasto";
                    treeService.rootPep[0].clase_proyecto = "GE";
                    // if ($('#waapy_orden_clase_activo').is(':visible')) { //si el campo esta visible en OrdenesImp validamos su valor
                    //     if (e.field.id == "waapy_tabla_ordenes" && (!row.value.waapy_orden_clase_activo)) {
                    //         e.summary.isValid = false;
                    //         e.summary.message = "Falta de rellenar el campo clase activo fijo";
                    //     }
                    // }PROYECTOS DE GASTO NO NECESITAN ACTIVO FIJO

                    // if (e.field.id == "waapy_tabla_ordenes" && ($('#waapy_orden_centro').is(':visible')) && (!row.value.waapy_orden_centro)){
                    //     e.summary.isValid = false;
                    //     e.summary.message = "Falta de rellenar el campo centro";
                    // }

                } else if (last_character === "I") {
                    treeService.rootPep[0].clase_objeto = "Inversión";
                    treeService.rootPep[0].clase_proyecto = "GI";
                    if (e.field.id == "waapy_tabla_pep2" && (!row.value.waapy_pep2_inversion_prot || !row.value.waapy_pep2_destino_inversion || !row.value.waapy_pep2_instalacion )) {
                        e.summary.isValid = false;
                        e.summary.message = "Faltan de rellenar campos de Inversión";
                    }
                    if ($('#waapy_orden_clase_activo').is(':hidden')){ //si el campo esta oculto en OrdenesImp no validamos su valor
                        if (e.field.id == "waapy_tabla_ordenes" && (!row.value.waapy_orden_unidad_negocio || !row.value.waapy_orden_desglose1 || !row.value.waapy_orden_desglose2 || !row.value.waapy_orden_criterio_clasificacion)) { //!row.value.waapy_orden_fecha_fin_trabajo
                            e.summary.isValid = false;
                            e.summary.message = "Faltan de rellenar campos de Inversión";
                        }
                    }else if (e.field.id == "waapy_tabla_ordenes" && (!row.value.waapy_orden_unidad_negocio || !row.value.waapy_orden_desglose1 || !row.value.waapy_orden_desglose2 || !row.value.waapy_orden_criterio_clasificacion || !row.value.waapy_orden_clase_activo)) { //!row.value.waapy_orden_fecha_fin_trabajo 
                        e.summary.isValid = false;
                        e.summary.message = "Faltan de rellenar campos de Inversión";
                    }
                }
            } else if (mascara.charAt(0) === "R") {
                // this.row.value.waapy_proyecto_perfil = "Real";
                row.value.waapy_proyecto_perfil = "Real";
                treeService.rootPep[0].clase_objeto = "Inversión";
                treeService.rootPep[0].clase_proyecto = "RI";

                if (e.field.id == "waapy_tabla_pep2" && (!row.value.waapy_pep2_inversion_prot || !row.value.waapy_pep2_destino_inversion || !row.value.waapy_pep2_instalacion )) {
                    e.summary.isValid = false;
                    e.summary.message = "Faltan de rellenar campos de Inversión";
                }
                if ($('#waapy_orden_clase_activo').is(':hidden')){
                if (e.field.id == "waapy_tabla_ordenes" && (!row.value.waapy_orden_unidad_negocio || !row.value.waapy_orden_desglose1 || !row.value.waapy_orden_desglose2 || !row.value.waapy_orden_criterio_clasificacion)) { //!row.value.waapy_orden_fecha_fin_trabajo 
                    e.summary.isValid = false;
                    e.summary.message = "Faltan de rellenar campos de Inversión";
                }
            }else if (e.field.id == "waapy_tabla_ordenes" && (!row.value.waapy_orden_unidad_negocio || !row.value.waapy_orden_desglose1 || !row.value.waapy_orden_desglose2 || !row.value.waapy_orden_criterio_clasificacion || !row.value.waapy_orden_clase_activo)) { //!row.value.waapy_orden_fecha_fin_trabajo
                
                e.summary.isValid = false;
                e.summary.message = "Faltan de rellenar campos de Inversión";
            }
        }

        }
        if (e.field.id == "waapy_tabla_proyecto") {
            let mascara = row.value.waapy_proyecto_mascara;
            /*
            let fechaIniP = new Date(row.value.waapy_proyecto_fecha_inicio);
            let fechaFinP = new Date(row.value.waapy_proyecto_fecha_fin);
            if (fechaIniP > fechaFinP) {
                e.summary.isValid = false;
                e.summary.message = "La fecha de inicio es superior a la de fin";

            }
            */
            if (row.isNew) {
                //fin prueba aldayr
                row.value["tipoPep"] = 0;
                /* let  duplicados =  *//* comprobarDuplicadosVariables(formService,mascara,visibilityService,"proyecto",e); */
                /* console.log(duplicados); */
                // Calculamos el perfil del proyecto
                if (mascara.charAt(0) === "G") {
                    row.value.waapy_proyecto_perfil = "Gestional";
                    let last_character = mascara.charAt(mascara.length - 1);
                    if (last_character === "E" || last_character === "G") {
                        row.value.waapy_proyecto_clase_proyecto = "GE";
                        row.value.waapy_proyecto_clase_objeto = "Gasto";
                    } else if (last_character === "I") {
                        row.value.waapy_proyecto_clase_objeto = "Inversión";
                        row.value.waapy_proyecto_clase_proyecto = "GI";
                    }

                } else if (mascara.charAt(0) === "R") {
                    row.value.waapy_proyecto_perfil = "Real";
                    row.value.waapy_proyecto_clase_objeto = "Inversión";
                    row.value.waapy_proyecto_clase_proyecto = "RI";
                }
                let perfil_proyecto = row.value.waapy_proyecto_perfil;
                // Segun el tipo de proyecto generamos una validacion de la mascara
                // Hay que controlar el comportamiento en caso de no se genere correctamente la mascara y no pueda calcular el perfil de proyecto
                validateMask(perfil_proyecto, e, mascara ,"proyecto",["G-[A-Za-z0-9]{6}-(E|I|G)$","R-[A-Za-z0-9]{6}-[0-9]{2}-[A-Za-z0-9]{2}$"]);
            }else{
                if( treeService.lastEditRow && (JSON.stringify(treeService.lastEditRow.value) !== JSON.stringify(row.value) ) ){
                    let propertiesChanged = [] ;
                    Object.keys(treeService.lastEditRow.value).forEach(key => {
                        if (treeService.lastEditRow.value[key] !== row.value[key]) {
                            let splice = key.split("_").slice(2).join("_");
                            propertiesChanged.push(splice);
                        }
                    });
                    let perfil_proyecto = row.value["waapy_proyecto_perfil"];
                    let validate = validateMask(perfil_proyecto, e, mascara ,"proyecto",["G-[A-Za-z0-9]{6}-(E|I|G)$","R-[A-Za-z0-9]{6}-[0-9]{2}-[A-Za-z0-9]{2}$"]);

                    if (validate) {
                        for (let i=1;i<=3;i++){
                        updateTable(e,e.form.values["waapy_tabla_pep" +i], "waapy_pep" + i + "_", "waapy_proyecto_", propertiesChanged, treeService, row, fields);
                        
                        }
                        updateTable(e,e.form.values["waapy_tabla_ordenes"], "waapy_orden_", "waapy_proyecto_", propertiesChanged, treeService, row, fields);
                       
                        // updateTable(e,e.form.values.waapy_tabla_pep1, "waapy_pep1_", "waapy_proyecto_", propertiesChanged, treeService, row, fields);
                        // updateTable(e,e.form.values.waapy_tabla_pep2, "waapy_pep2_", "waapy_proyecto_", propertiesChanged, treeService, row, fields);
                        // updateTable(e,e.form.values.waapy_tabla_pep3, "waapy_pep3_", "waapy_proyecto_", propertiesChanged, treeService, row, fields);
                    }
                }
            }

        }
        else if (e.field.id == "waapy_tabla_pep1") {
            // let fechaIniP1 = new Date(row.value.waapy_pep1_fecha_inicio);
            // let fechaFinP1 = new Date(row.value.waapy_pep1_fecha_fin);
            let mascara = row.value.waapy_pep1_mascara;
            /*
            if (tipo_solicitud.value == "nuevo") {
                if (fechaIniP1 > fechaFinP1) {
                    e.summary.isValid = false;
                    e.summary.message = "La fecha de inicio es superior a la de fin";
                }
            } else {
                if (fechaIniP1 > fechaFinP1) {
                    e.summary.isValid = false;
                    e.summary.message = 'La "Fecha fin" está fuera del rango. Modifique en tal caso la fecha del proyecto en consecuencia a través del proceso de "Modif. PEP\'s"';
                }
            }
            */
            /*
            if (tipo_solicitud.value == "existente" || tipo_solicitud.value == "nuevo"){
                let fechaFinProyecto = undefined;
                if (treeService.currentPep){
                fechaFinProyecto = treeService.currentPep.fecha_fin;
                }
                let fechaFinProyectoEditada = treeService.rootPep[0].fecha_fin;
                if (!isNullOrUndefined(fechaFinProyecto)) {
                    this.fechaFinElementoSuperior(e, row, fechaFinProyecto, "pep1");
                }else{
                    this.fechaFinElementoSuperior(e, row, fechaFinProyectoEditada, "pep1");
                }
            }
            */
            if (row.isNew) {
                row.value["tipoPep"] = 1;
                let perfil_proyecto = treeService.rootPep[0]["perfil_proyecto"];
                let mascara_proyecto = treeService.currentPep["mascara"];
                if (perfil_proyecto) {
                    // Segun el tipo de proyecto generamos una validacion de la mascara
                    // Hay que controlar el comportamiento en caso de no se genere correctamente la mascara y no pueda calcular el perfil de proyecto
                    if (!isUndefined(sociedad) && sociedadesMultiRaiz.includes(sociedad.value)) {
                        validateMask(perfil_proyecto, e, mascara, "pep1", ["G-[A-Za-z0-9]{6}-(E|I|G)(-[A-Za-z0-9]{2})$", "R-[A-Za-z0-9]{6}-[0-9]{2}-[A-Za-z0-9]{2}-[A-Za-z0-9]{1}$"]);
                    } else {
                        validateMask(perfil_proyecto, e, mascara, "pep1", ["G-[A-Za-z0-9]{6}-(E|I|G)(-[A-Za-z0-9]{2})?$", "R-[A-Za-z0-9]{6}-[0-9]{2}-[A-Za-z0-9]{2}$"]);
                        //opcional ultimos 2 chars -xx 
                    }
                    if(mascara.charAt(0)==="R"){
                        if (!isUndefined(sociedad) && !sociedadesMultiRaiz.includes(sociedad.value)){
                            // mascara = mascara.substring(0,mascara.length-3);
                            // mascara_proyecto = mascara_proyecto.substring(0,mascara_proyecto.length-3);
                    }
                }
                    
                    if( !mascara.includes(mascara_proyecto) ){
                        e.summary.isValid = false;
                        e.summary.message = "La máscara no incluye la parte del elemento superior";
                    }

                } else {
                    e.summary.isValid = false;
                    e.summary.message = "No hay un proyecto con un perfil";
                }

            } else {
                if (treeService.lastEditRow && (JSON.stringify(treeService.lastEditRow.value) !== JSON.stringify(row.value))) {
                    let propertiesChanged = [];
                    Object.keys(treeService.lastEditRow.value).forEach(key => {
                        if ((typeof (row.value[key]) === 'string' && treeService.lastEditRow.value[key] !== row.value[key]) || (typeof (row.value[key]) === 'object' && JSON.stringify(treeService.lastEditRow.value[key]) !== JSON.stringify(row.value[key]))) {
                            let splice = key.split("_").slice(2).join("_");
                            propertiesChanged.push(splice);
                        }
                    });
                    let perfil_proyecto = treeService.rootPep[0]["perfil_proyecto"];
                    // let validate = validateMask(perfil_proyecto, e, mascara ,"pep1",["G-[A-Za-z0-9]{6}-(E|I|G)(-[A-Za-z0-9]{2})?$","R-[A-Za-z0-9]{6}-[0-9]{2}-[A-Za-z0-9]{2}$"]);
                    let validate;
                    if (!isUndefined(sociedad) && sociedadesMultiRaiz.includes(sociedad.value)) {
                        validate = validateMask(perfil_proyecto, e, mascara, "pep1", ["G-[A-Za-z0-9]{6}-(E|I|G)(-[A-Za-z0-9]{2})$", "R-[A-Za-z0-9]{6}-[0-9]{2}-[A-Za-z0-9]{2}-[A-Za-z0-9]{1}$"]);

                    } else {
                        validate = validateMask(perfil_proyecto, e, mascara, "pep1", ["G-[A-Za-z0-9]{6}-(E|I|G)(-[A-Za-z0-9]{2})?$", "R-[A-Za-z0-9]{6}-[0-9]{2}-[A-Za-z0-9]{2}$"]);
                    }
                    let existeEnTablaPadre = existeEntabla(e.form.values.waapy_tabla_proyecto,mascara,"waapy_proyecto_mascara", false );
                    if(validate && ( existeEnTablaPadre || tipo_solicitud.value == "existente" ) ){
                        updateTable(e,e.form.values.waapy_tabla_pep2, "waapy_pep2_","waapy_pep1_" , propertiesChanged, treeService, row,fields);
                        updateTable(e,e.form.values.waapy_tabla_pep3, "waapy_pep3_","waapy_pep1_" , propertiesChanged, treeService, row ,fields);
                        updateTable(e,e.form.values["waapy_tabla_ordenes"], "waapy_orden_", "waapy_pep1_", propertiesChanged, treeService, row, fields);

                    }else if(validate && !existeEnTablaPadre && taskDef.includes("waapy_t1") ){
                        e.summary.isValid = false;
                        e.summary.message = "No existe un proyecto con esa máscara";
                    }


                }
                //let regex_validation = validateMask(perfil_proyecto, e, mascara ,["G-[A-Za-z0-9]{6}-(E|I|G)","G-[A-Za-z0-9]{6}-[0-9]{2}-[A-Za-z0-9]{2}","PB-[A-Za-z0-9]{6}"]);
            }

        }
        else if (e.field.id == "waapy_tabla_pep2") {
            // let fechaIniP2 = new Date(row.value.waapy_pep2_fecha_inicio);
            // let fechaFinP2 = new Date(row.value.waapy_pep2_fecha_fin);
            let mascara = row.value.waapy_pep2_mascara;
            /*
            if (tipo_solicitud.value == "nuevo") {
                if (fechaIniP2 > fechaFinP2) {
                    e.summary.isValid = false;
                    e.summary.message = "La fecha de inicio es superior a la de fin";
                }
            } else {
                if (fechaIniP2 > fechaFinP2) {
                    e.summary.isValid = false;
                    e.summary.message = 'La "Fecha fin" está fuera del rango. Modifique en tal caso la fecha del proyecto en consecuencia a través del proceso de "Modif. PEP\'s"';
                }
            }
            */
           /*
            if (tipo_solicitud.value == "existente" || tipo_solicitud.value == "nuevo") {
                let fechaFinPep1 = undefined;
                if (treeService.currentPep) {
                    fechaFinPep1 = treeService.currentPep.fecha_fin;
                }
                if (!isNullOrUndefined(fechaFinPep1)) {
                    this.fechaFinElementoSuperior(e, row, fechaFinPep1, "pep2");
                } else {
                    this.fechaFinEditadaElementoSuperior(e, row, treeService);
                }
            }
            */

            if (row.isNew) {
                row.value["tipoPep"] = 2;
                let perfil_proyecto = treeService.rootPep[0]["perfil_proyecto"];
                // console.log(perfil_proyecto);
                // console.log(treeService.rootPep);
                if (!isUndefined(sociedad) && sociedadesMultiRaiz.includes(sociedad.value)) {
                    validateMask(perfil_proyecto, e, mascara ,"pep2",["G-[A-Za-z0-9]{6}-(E|I|G)(-[A-Za-z0-9]{2})(-[A-Za-z0-9]{2})$","R-[A-Za-z0-9]{6}-[0-9]{2}-[A-Za-z0-9]{2}-[A-Za-z0-9]{1}-[A-Za-z0-9]{2}$"]);
                }else{
                    validateMask(perfil_proyecto, e, mascara ,"pep2",["G-[A-Za-z0-9]{6}-(E|I|G)-[A-Za-z0-9]{2}$","R-[A-Za-z0-9]{6}-[0-9]{2}-[A-Za-z0-9]{2}-[A-Za-z0-9]$"]);
                }
                let mascaraProyecto = treeService.rootPep[0]["mascara"];
                if( mascara.charAt(0)==="R"){
                    if ( !isUndefined(sociedad) && !sociedadesMultiRaiz.includes(sociedad.value)){
                    // mascaraProyecto = mascaraProyecto.substring(0,mascaraProyecto.length-3);
                    }
                }
                if (!isUndefined(sociedad) && sociedadesMultiRaiz.includes(sociedad.value)) {
                    let mascaraPep1 = treeService.currentPep.mascara;
                    if (!mascara.includes(mascaraPep1)) {
                        e.summary.isValid = false;
                        e.summary.message = "La máscara no incluye la parte del elemento superior";
                    }
                } else {
                    if (!mascara.includes(mascaraProyecto)) {
                        e.summary.isValid = false;
                        e.summary.message = "La máscara no incluye la parte del elemento superior";
                    }
                }
            } else {
                if (treeService.lastEditRow && (JSON.stringify(treeService.lastEditRow.value) !== JSON.stringify(row.value))) {
                    let propertiesChanged = [];
                    Object.keys(row.value).forEach(key => {
                        if ((typeof (row.value[key]) === 'string' && treeService.lastEditRow.value[key] !== row.value[key]) || (typeof (row.value[key]) === 'object' && JSON.stringify(treeService.lastEditRow.value[key]) !== JSON.stringify(row.value[key]))) {
                            let splice = key.split("_").slice(2).join("_");
                            propertiesChanged.push(splice);

                        }
                    });
                    let perfil_proyecto = treeService.rootPep[0]["perfil_proyecto"];
                    // let validate = validateMask(perfil_proyecto, e, mascara ,"pep2",["G-[A-Za-z0-9]{6}-(E|I|G)-[A-Za-z0-9]{2}$","R-[A-Za-z0-9]{6}-[0-9]{2}-[A-Za-z0-9]{2}-[A-Za-z0-9]$"]);
                    let validate;
                    if (!isUndefined(sociedad) && sociedadesMultiRaiz.includes(sociedad.value)) {
                        validate = validateMask(perfil_proyecto, e, mascara ,"pep2",["G-[A-Za-z0-9]{6}-(E|I|G)(-[A-Za-z0-9]{2})(-[A-Za-z0-9]{2})$","R-[A-Za-z0-9]{6}-[0-9]{2}-[A-Za-z0-9]{2}-[A-Za-z0-9]{1}-[A-Za-z0-9]{2}$"]);
                    }else{
                        validate = validateMask(perfil_proyecto, e, mascara ,"pep2",["G-[A-Za-z0-9]{6}-(E|I|G)-[A-Za-z0-9]{2}$","R-[A-Za-z0-9]{6}-[0-9]{2}-[A-Za-z0-9]{2}-[A-Za-z0-9]$"]);
                    }
                    let existeEnTablaPadre = existeEntabla(e.form.values.waapy_tabla_pep1,mascara,"waapy_pep1_mascara", false);
                    if(validate && ( existeEnTablaPadre || tipo_solicitud.value == "existente" )){
                        updateTable(e,e.form.values.waapy_tabla_pep3, "waapy_pep3_","waapy_pep2_" , propertiesChanged, treeService, row ,fields);
                        updateTable(e,e.form.values["waapy_tabla_ordenes"], "waapy_orden_", "waapy_pep2_", propertiesChanged, treeService, row, fields);
                       
                    }else if(validate && !existeEnTablaPadre && taskDef.includes("waapy_t1")){
                        e.summary.isValid = false;
                        e.summary.message = "No existe un pep1 con esa máscara";
                    }

                }
                //let regex_validation = validateMask(perfil_proyecto, e, mascara ,["G-[A-Za-z0-9]{6}-(E|I|G)","G-[A-Za-z0-9]{6}-[0-9]{2}-[A-Za-z0-9]{2}","PB-[A-Za-z0-9]{6}"]);
            }

        }
        else if (e.field.id == "waapy_tabla_pep3") {
            // let fechaIniP3 = new Date(row.value.waapy_pep3_fecha_inicio);
            // let fechaFinP3 = new Date(row.value.waapy_pep3_fecha_fin);
            let mascara = row.value.waapy_pep3_mascara;
            /*
            if (tipo_solicitud.value == "nuevo") {
                if (fechaIniP3 > fechaFinP3) {
                    e.summary.isValid = false;
                    e.summary.message = "La fecha de inicio es superior a la de fin";
                }
            } else {
                if (fechaIniP3 > fechaFinP3) {
                    e.summary.isValid = false;
                    e.summary.message = 'La "Fecha fin" está fuera del rango. Modifique en tal caso la fecha del proyecto en consecuencia a través del proceso de "Modif. PEP\'s"';
                }
            }
            */
           /*
            if (tipo_solicitud.value == "existente" || tipo_solicitud.value == "nuevo") {
                let fechaFinPep2 = undefined;
                if (treeService.currentPep) {
                    fechaFinPep2 = treeService.currentPep.fecha_fin;
                }
                if (!isNullOrUndefined(fechaFinPep2)) {
                    this.fechaFinElementoSuperior(e, row, fechaFinPep2, "pep3");
                } else {
                    this.fechaFinEditadaElementoSuperior(e, row, treeService);
                }
            }
            */
            
            if (row.isNew) {
                row.value["tipoPep"] = 3;
                let perfil_proyecto = treeService.rootPep[0]["perfil_proyecto"];
                // Segun el tipo de proyecto generamos una validacion de la mascara
                // Hay que controlar el comportamiento en caso de no se genere correctamente la mascara y no pueda calcular el perfil de proyecto
                if ( !isUndefined(sociedad) && sociedadesMultiRaiz.includes(sociedad.value)) {
                    validateMask(perfil_proyecto, e, mascara, "pep3", ["G-[A-Za-z0-9]{6}-(E|I|G)(-[A-Za-z0-9]{2})(-[A-Za-z0-9]{3,9})$", "R-[A-Za-z0-9]{6}-[0-9]{2}-[A-Za-z0-9]{2}-([A-Za-z0-9]{1})-([A-Za-z0-9]{2})([A-Za-z0-9]{1,4})$"]);
                } else {
                    validateMask(perfil_proyecto, e, mascara, "pep3", ["G-[A-Za-z0-9]{6}-(E|I|G)-[A-Za-z0-9]{2}-[A-Za-z0-9]{1,9}$", "R-[A-Za-z0-9]{6}-[0-9]{2}-[A-Za-z0-9]{2}-[A-Za-z0-9]-[A-Za-z0-9]{1,6}$"]);
                }
                if (!isUndefined(sociedad) && sociedadesMultiRaiz.includes(sociedad.value)) {
                    let mascaraPep2 = treeService.currentPep.mascara;
                    if (!mascara.includes(mascaraPep2)) {
                        e.summary.isValid = false;
                        e.summary.message = "La máscara no incluye la parte del elemento superior";
                    }
                } else {
                    if (!mascara.includes(treeService.currentPep["mascara"])) {
                        e.summary.isValid = false;
                        e.summary.message = "La máscara no incluye la parte del elemento superior";
                    }
                }
            } else {
                if (treeService.lastEditRow && (JSON.stringify(treeService.lastEditRow.value) !== JSON.stringify(row.value))) {
                    let propertiesChanged = [];
                    Object.keys(treeService.lastEditRow.value).forEach(key => {
                        if ((typeof (row.value[key]) === 'string' && treeService.lastEditRow.value[key] !== row.value[key]) || (typeof (row.value[key]) === 'object' && JSON.stringify(treeService.lastEditRow.value[key]) !== JSON.stringify(row.value[key]))) {
                            let splice = key.split("_").slice(2).join("_");
                            propertiesChanged.push(splice);
                        }
                    });

                let perfil_proyecto = treeService.rootPep[0]["perfil_proyecto"];
                // let validate = validateMask(perfil_proyecto, e, mascara,"pep3",["G-[A-Za-z0-9]{6}-(E|I|G)-[A-Za-z0-9]{2}-[A-Za-z0-9]{1,9}$","R-[A-Za-z0-9]{6}-[0-9]{2}-[A-Za-z0-9]{2}-[A-Za-z0-9]-[A-Za-z0-9]{1,6}$"]);
                let validate;
                if (!isUndefined(sociedad) && sociedadesMultiRaiz.includes(sociedad.value)) {
                   validate = validateMask(perfil_proyecto, e, mascara, "pep3", ["G-[A-Za-z0-9]{6}-(E|I|G)(-[A-Za-z0-9]{2})(-[A-Za-z0-9]{3,9})$", "R-[A-Za-z0-9]{6}-[0-9]{2}-[A-Za-z0-9]{2}-([A-Za-z0-9]{1})-([A-Za-z0-9]{2})([A-Za-z0-9]{1,4})$"]);
                } else {
                   validate = validateMask(perfil_proyecto, e, mascara, "pep3", ["G-[A-Za-z0-9]{6}-(E|I|G)-[A-Za-z0-9]{2}-[A-Za-z0-9]{1,9}$", "R-[A-Za-z0-9]{6}-[0-9]{2}-[A-Za-z0-9]{2}-[A-Za-z0-9]-[A-Za-z0-9]{1,6}$"]);
                }
                let existeEnTablaPadre = existeEntabla(e.form.values.waapy_tabla_pep2, mascara, "waapy_pep2_mascara", false);
                if(validate && ( existeEnTablaPadre || tipo_solicitud.value == "existente" )){
                updateTable(e,e.form.values["waapy_tabla_ordenes"], "waapy_orden_", "waapy_pep3_", propertiesChanged, treeService, row, fields);
                    } else if ((!existeEnTablaPadre && tipo_solicitud.value == "nuevo") && taskDef.includes("waapy_t1")) {
                        e.summary.isValid = false;
                        e.summary.message = "No existe un pep2 con esa máscara";
                    }
                }
            }
        } /*else if (e.field.id == "waapy_tabla_ordenes") {
            if (tipo_solicitud.value == "existente" || tipo_solicitud.value == "nuevo") {
                let fechaFinProyecto = treeService.rootPep[0].fecha_fin;
                if (!isNullOrUndefined(fechaFinProyecto)) {
                    this.fechaFinElementoSuperior(e, row, fechaFinProyecto, "orden");
                }
            }
        }*/
},
    valueComentarios(fieldComentario,fieldHistorico,texto){
        if (fieldComentario.value && !fieldHistorico.value.includes(fieldComentario.value)){
        fieldHistorico.value +=  texto + fieldComentario.value;
        fieldComentario.value = "";
    }
},

    /*fechaFinElementoSuperior(e: ValidateDynamicTableRowEvent, row: DynamicTableRow, fecha , pep){
        let momentElementoSuperior = moment(fecha);
        let momentElementoActual;
        let mensaje = "";
        if (pep === "orden") {
            momentElementoActual = moment(row.value['waapy_' + pep + '_fecha_fin_trabajo']);
            mensaje = "La fecha de fin seleccionada no puede ser mayor a la del proyecto";
        } else {
            momentElementoActual = moment(row.value['waapy_' + pep + '_fecha_fin']);
            mensaje = "La fecha de fin seleccionada no puede ser mayor a la del elemento superior";
        }
        if (momentElementoActual.format('YYYY-MM-DD') > momentElementoSuperior.format('YYYY-MM-DD')) {
            e.summary.isValid = false;
            e.summary.message = mensaje;
        }
    },*/

    /*fechaFinEditadaElementoSuperior(e: ValidateDynamicTableRowEvent, row: DynamicTableRow, treeService: TreePepsService){ 

        let currentTable = e.field.id.replace("_tabla", "");
        //comparamos la fecha editada del pep2 con la del pep1 && la fecha editada del pep3 con la del pep2 correspondientes
        if (!isNullOrUndefined(treeService.rootPep[0].children) && treeService.rootPep[0].children) { //si el arbol tiene hijos
            for (let i = 0; i < treeService.rootPep[0].children.length; i++) { //recorrer todos los hijos del arbol
                if (treeService.rootPep[0].children[i] !== null &&
                    treeService.lastEditRow.value[currentTable + "_nodo_superior"] === treeService.rootPep[0].children[i].mascara) {
                    this.fechaFinElementoSuperior(e, row, treeService.rootPep[0].children[i]["fecha_fin"], "pep2"); //recorrer los pep1
                } else {
                    if (!isNullOrUndefined(treeService.rootPep[0].children[i].children) && treeService.rootPep[0].children[i].children) {
                        for (let j = 0; j < treeService.rootPep[0].children[i].children.length; j++) { //recorrer los pep2
                            if (treeService.rootPep[0].children[i].children[j] !== null &&
                                treeService.lastEditRow.value[currentTable + "_nodo_superior"] === treeService.rootPep[0].children[i].children[j].mascara) {
                                this.fechaFinElementoSuperior(e, row, treeService.rootPep[0].children[i].children[j]["fecha_fin"], "pep3");
                            }
                        }
                    }
                }
            }
        }
    },*/
}

function loadTable(waapy_tabla: FormFieldModel,pepsCorrectos : boolean, fields,taskDefinitionKey) {
    /* let fechaProcesado = fields.find(f => f.id === "fechadeprocesadoensap"); */
    if (waapy_tabla.value) {
        waapy_tabla.value.forEach(pep => {
     /*        if (waapy_tabla.id !== "waapy_tabla_ordenes" && taskDefinitionKey.includes('waapy_t4')){
                if ( pep["creado_correcto"] || pepsCorrectos == true) {
                    pep["waapy_validacion_sap"] = "Creación Correcta";
                } else if( (fechaProcesado && ( fechaProcesado.value !== "" && fechaProcesado.value !== null && fechaProcesado.value !==undefined))){
                    pep["waapy_validacion_sap"] = "Creación Correcta";
                }
            } */
            // Limpiamos los campos de correccion de las tablas
            let corregir = waapy_tabla.id.replace("_tabla","")+"_corregir";
            if (corregir === "waapy_ordenes_corregir") corregir = "waapy_orden_corregir";
            if(pep[corregir]){
                pep[corregir] ="";
            }
        });
    }
}

function updateTable(e: ValidateDynamicTableRowEvent,tabla: any, childTable: string, originTable: string, propertiesChanged: any[], treeService: TreePepsService, row: DynamicTableRow, fields: FormFieldModel[]) {
    if (tabla) {
        let sociedadesMultiRaiz = ["8700","8704","8712","8729"];
        tabla.forEach(pep => {
            propertiesChanged.forEach(propertieName => {
                console.log(propertieName);
                if (propertieName == "mascara") {
                    if (originTable == "waapy_pep1_" && (treeService.lastEditRow.value[originTable + 'mascara'].length == 13 || treeService.lastEditRow.value[originTable + 'mascara'].length == 17) &&
                        (pep[childTable + 'mascara'].includes(treeService.lastEditRow.value[originTable + propertieName].substring(0, treeService.lastEditRow.value[originTable + propertieName].length - 3)))) {
                        let sociedad;
                        if (e && e.form.values && e.form.values.waapy_sociedad) {
                            sociedad = e.form.values.waapy_sociedad.id;
                        }
                        let valueToReplace = treeService.lastEditRow.value[originTable + propertieName];
                        if (!sociedadesMultiRaiz.includes(sociedad)){
                        valueToReplace = valueToReplace.substring(0, valueToReplace.length - 3)
                        }
                        let replaceValue = row.value[originTable + propertieName];
                        pep[childTable + propertieName] = pep[childTable + propertieName].replace(valueToReplace, replaceValue);
                        pep[childTable + "nodo_superior"] = pep[childTable + "nodo_superior"].replace(valueToReplace, replaceValue);
                    } else if (pep[childTable + 'mascara'].includes(treeService.lastEditRow.value[originTable + propertieName])) {
                        pep[childTable + propertieName] = pep[childTable + propertieName].replace(treeService.lastEditRow.value[originTable + propertieName], row.value[originTable + propertieName]);
                        if (pep[childTable + "nodo_superior"]) pep[childTable + "nodo_superior"] = pep[childTable + "nodo_superior"].replace(treeService.lastEditRow.value[originTable + propertieName], row.value[originTable + propertieName]);
                    }
                    else if (pep[childTable + "nodo_superior"].includes(treeService.lastEditRow.value[originTable + propertieName])){
                        pep[childTable + "nodo_superior"] = pep[childTable + "nodo_superior"].replace(treeService.lastEditRow.value[originTable + propertieName], row.value[originTable + propertieName]);
                    }
                } 
                else if (originTable === "waapy_pep1_") {
                    let mascarasActualizar = treeService.consultarHijos(treeService.lastEditRow.value[originTable + "mascara"]);
                    if (isNullOrUndefined(pep[childTable + 'correcto'])) {
                        for (let mascara of mascarasActualizar) {
                            if (pep[childTable + "nodo_superior"] === mascara) {
                                pep[childTable + propertieName] = row.value[originTable + propertieName];
                            }
                        }
                    } else {
                        for (let mascara of mascarasActualizar) {
                            if (pep[childTable + "nodo_superior"] === mascara &&
                               /*  (pep[childTable + 'correcto'] !== false && (propertieName == "fecha_inicio" || propertieName == "fecha_fin")) || */
                                pep[childTable + 'correcto'] !== true) {
                                pep[childTable + propertieName] = row.value[originTable + propertieName];
                            }
                        }
                    }
                } else if ((pep[childTable + 'mascara'].includes(treeService.lastEditRow.value[originTable + 'mascara']) || pep[childTable + 'mascara'].includes(row.value[originTable + 'mascara'])
                    || pep[childTable + 'nodo_superior'].includes(treeService.lastEditRow.value[originTable + 'mascara'])) && propertieName != "correcto"
                    && /*(((pep[childTable + 'correcto'] !== false && (propertieName == "fecha_inicio" || propertieName == "fecha_fin"))) ||*/
                        (pep[childTable + 'correcto'] !== true)
                ) {
                    if( (childTable+propertieName) == "waapy_pep1_desc" ) {
                        pep["waapy_pep1_denominacion"] = row.value[originTable + propertieName];
                    }
                    else if (pep[childTable + propertieName] || ( (childTable + propertieName === "waapy_pep3_inversion_prot") || propertieName==="destino_inversion") && propertieName != "desc") {
                          pep[childTable + propertieName] = row.value[originTable + propertieName];   
                    }
                }
            });
        });
        let fieldName = childTable.replace("waapy_", "waapy_tabla_");
        fieldName = fieldName.substring(0, fieldName.length - 1);
        var waapy_table = fields.find(f => f.id === fieldName);
        if (!isUndefined(waapy_table)) {
            waapy_table.validate();
            }
    }
}

function validateMask(perfil_proyecto: any, e: ValidateDynamicTableRowEvent, mascara: any, nivelTabla: string, regexValidations: string[]) {
    let regex = null;
    switch (perfil_proyecto) {
        case 'Gestional':
            regex = new RegExp(regexValidations[0]);//
            break;
        case 'Real':
            regex = new RegExp(regexValidations[1]);
            break;
        default:
            e.summary.isValid = false;
            e.summary.message = "La máscara no corresponde con ningun perfil de proyecto";
            break;
    }
    let validate = regex.test(mascara);
    // Comprobamos que la mascara sea valida
    if (e.summary.isValid && validate == false) {
        e.summary.isValid = false;
        e.summary.message = "Máscara Incorrecta";
    } else {
        let duplicados = false;
        var arrayTabla = e.field.form.values["waapy_tabla_" + nivelTabla];
        if (e.row.isNew) {
            duplicados = existeEntabla(arrayTabla, mascara, "waapy_" + nivelTabla + "_mascara", true);
        }
        if (duplicados == true) {
            e.summary.isValid = false;
            e.summary.message = "La máscara ya existe";
        }
    }
    return validate;
}

function existeEntabla(arrayTabla, mascaraNueva, nombreMascara, comprobarDuplicados) {
    let mascaraActual = null;
    let existe = false;
    if (arrayTabla != undefined) {
        for (let value of arrayTabla) {
            mascaraActual = value[nombreMascara];
            if( mascaraNueva.charAt(0)==="R" && nombreMascara === "waapy_proyecto_mascara" ){
                mascaraNueva = mascaraNueva.substring(0,mascaraNueva.length-3);
                mascaraActual = mascaraActual.substring(0,mascaraActual.length-3);
            }
            if ((comprobarDuplicados && mascaraActual == mascaraNueva) || (!comprobarDuplicados && mascaraNueva.includes(mascaraActual))) {
                existe = true;
            }
        }
    }
    if (existe == true) {
        return true;
    } else {
        return false;
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
