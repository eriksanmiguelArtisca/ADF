//import { DynamicTableRow, ValidateDynamicTableRowEvent, FormService, FORM_FIELD_VALIDATORS, NotificationService} from "@alfresco/adf-core"; 

import { HttpClient } from "@angular/common/http";
import {  ArbolAccesos/*, TreeAccesos2Service*/} from "../../../../../../src/app/services/tree-accesos2.service";
import _ from 'lodash';
import { isUndefined, isNullOrUndefined } from "util"; 
import { isString } from "util";
import { FormFieldModel, FormFieldEvent} from "@alfresco/adf-core"; 

//import { Observable } from "rxjs";
//import { completedTaskDetailsMock } from "src/app/test-mock";
//import { FieldValidatorWASCS } from "./fieldValidatorWASCS";
//import { TreePepsService } from '../../../../../services/tree-peps.service';
//import { HttpClient } from "@angular/common/http";



export const WSAF = {
    async formLoaded(e: FormFieldEvent, fields: FormFieldModel[],http:HttpClient/*, treeAccesos2Service ?: TreeAccesos2Service*/) {
        let tree = fields.find(f => f.id === 'wsaf_tree');
       /*  if(!isNullOrUndefined(tree) && isNullOrUndefined(tree.value)){ 
            tree.value = http.get('/WS_BPM_REST/jcmouse/restapi/get_accesosTree').pipe( share() ).subscribe(data => {
                tree.value = data;
                console.log(tree.value);
                //console.log(typeof tree.value); Aqui tree value se devuelve como un objeto
            });
            
            for (let i = 0; i < tree.value.length; i++){
                for(let j=0;j<tree.value[i].children.length;j++){
                    for(let k=0;k<tree.value[i].children[j].children.length;k++){
                        if(tree.value[i].children[j].children[k].checked=="true"){
                            tree.value[i].children[j].children[k].checked=true;
                        }else{
                            tree.value[i].children[j].children[k].checked=false;
                        }
                    }
                }
            }
        } */
        
        let taskDefinitionKey = e.form.json.taskDefinitionKey;
        if (!isUndefined(taskDefinitionKey)) {

            //treeAccesos2Service.tipoOperacion=taskDefinitionKey;
            //console.log(treeAccesos2Service.getTipo());
            
            if (taskDefinitionKey === "undefined"){
            }
    
            if (taskDefinitionKey === "wsaf_t1"){
                let aux=JSON.parse(tree.value);
                let rutas:ArbolAccesos[]=[];
                let recintos:ArbolAccesos[]=[];
                let edificios:ArbolAccesos[]=[];
                let final:ArbolAccesos[]=[];
                let resp:boolean=false;

                for(let i = 0; i < aux.length; i++){
                    for(let j=0;j<aux[i].children.length;j++){
                        for(let k=0;k<aux[i].children[j].children.length;k++){
                            if(aux[i].children[j].children[k].checked){
                                rutas.push(aux[i].children[j].children[k]);
                            }
                        }
                        if(rutas.length>0){
                            recintos.push(JSON.parse(JSON.stringify(aux[i].children[j])));
                            let con=recintos.length-1;
                            recintos[con].children=rutas;
                            resp=true;
                        }
                        rutas=[];
                    }
    
                    if(resp){
                        edificios=JSON.parse(JSON.stringify(aux[i]));
                        edificios['children']=recintos;
                        final.push(JSON.parse(JSON.stringify(edificios)));
                        resp=false;
                    }

                    recintos = [];
                    edificios = [];
                }
                tree.value = JSON.stringify(final);
            }
            

            //     tree.value = aux;
            //     if(!isNullOrUndefined(tree)){
            //         tree.value = http.get('/WS_BPM_REST/jcmouse/restapi/get_accesosTree').pipe( share() ).subscribe(data => {
            //             console.log(data);
            //             tree.value = data;
            //             console.log(tree);
            //         });
            //         let aux:ArbolAccesos[]=[ {tipo:"", numeroItem : "",denominacion: "" ,checked: false, children : null}];
            //         for (let i = 0; i < tree.value.length; i++){
            //             for(let j=0;j<tree.value[i].children.length;j++){
            //                 for(let k=0;k<tree.value[i].children[j].children.length;k++){
            //                     if(tree.value[i].children[j].children[k].checked){
            //                         aux.push(tree.value[i].children[j].children[k]);
            //                     }
            //                 }
            //             }
            //         }
            //         console.log(aux);
            //     }
            // }
    
            if (taskDefinitionKey === "wsaf_t2" || taskDefinitionKey === "wsaf_t3") {
                //Misma ruta en la que se encuentren
            }
        }else{
            
        }
        
        /*if (taskDefinitionKey === "wsaf_t2" || taskDefinitionKey === "wsaf_t3") {
            //var wsaf_borrador = fields.find(f => f.id === 'wsaf_borrador');
            var wsaf_correction = fields.find(f => f.id === 'wsaf_correction');
            //var wsaf_start = fields.find(f => f.id === 'wsaf_start');
            if (wsaf_correction) wsaf_correction.value = "SI";
            if (!isUndefined(wsaf_motivo_rechazo)) {
                var wsaf_accion_csa = fields.find(f => f.id === 'wsaf_accion_csa');
                if (wsaf_accion_csa) wsaf_accion_csa.value = "ACEPTAR";
                wsaf_motivo_rechazo.value = "";
            }
        }*/

        if (!isUndefined(taskDefinitionKey)) {
            console.log(fields.find(f => f.id === 'wsaf_tree'));
            if (taskDefinitionKey.includes('wsaf_t1')) {
                fields.forEach(field => {
                    if (field.id == 'wsaf_correction' || field.id == 'wsaf_borrador') {
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
                var wsaf_motivo_rechazo = fields.find(f => f.id === 'wsaf_correction');
                if (!isUndefined(wsaf_motivo_rechazo)) {
                    // Limpiamos los radio buttons que sirven para indicar es correcto y el campo de rechazo
                    /*var wsaf_accion_controller = fields.find(f => f.id === 'wsaf_accion_controller');
                    var wsaf_accion_csa = fields.find(f => f.id === 'wsaf_accion_csa');
                    if (wsaf_accion_controller) wsaf_accion_controller.value = "ACEPTAR";
                    if (wsaf_accion_csa) wsaf_accion_csa.value = "ACEPTAR";
                    wsaf_motivo_rechazo.value = "";*/
                }
                var wsaf_datos_corregir = fields.find(f => f.id === 'wsaf_datos_corregir');
                if (!isUndefined(wsaf_datos_corregir)) {
                    // Limpiamos los radio buttons que sirven para indicar si se ha realizado correctamente y el campo de datos a corregir
                    /*var wsaf_correcto = fields.find(f => f.id === 'wsaf_correcto');
                    var wsaf_accion_correcto = fields.find(f => f.id === 'wsaf_accion_correcto');
                    wsaf_correcto.value = "SI";
                    wsaf_accion_correcto.value = "VIABLE";
                    wsaf_datos_corregir.value = "";*/
                }

                let resultadoSap = fields.find(f => f.id === "resultadodesap");
                if ((!isUndefined(resultadoSap) && (resultadoSap.value !== "MODIFICACIÓN DE ACCESOS COMPLETADA"))) {
                    let radioBtn = fields.find(f => f.id === "wsaf_correcto");
                    radioBtn.value = "NO";
                    radioBtn.readOnly = true;
                }
            }

            fields.forEach(field => {
                if ((field.id == 'wsaf_routeList') || (field.id == "wsaf_treeAux")) {
                    field.readOnly = true;
                    let visibility: any = {
                        leftFormFieldId: field.id,
                        leftType: "field",
                        leftValue: field.id
                    };
                    field.visibilityCondition = visibility;
                }
            });
    }
},
    
    /*taskCompleted(e: FormEvent, fields: FormFieldModel[]){
        console.log("COMPLETED");
    },
    taskCompletedError(e: FormErrorEvent, fields: FormFieldModel[]){
        console.log("COMPLETED ERROR");
    },*/

    formFieldValueChanged(e: FormFieldEvent, fields: FormFieldModel[],http:HttpClient ) {     
        
        if (e.field.id === 'wsaf_resp') {
            //console.log(e.field.value);
            //var idResp = fields.find(f => f.id === 'wsaf_id_resp');
        }

        if (e.field.id === 'wsaf_tree' && !isNullOrUndefined(e.field.value) && !isString(e.field.value) ) {
            //console.log("CAMBIO");
            e.field.value = JSON.stringify(e.field.value);
            //var idResp = fields.find(f => f.id === 'wsaf_id_resp');
        }
    },

    valueComentarios(fieldComentario, fieldHistorico, texto) {
        if (fieldComentario.value && !fieldHistorico.value.includes(fieldComentario.value)) {
            fieldHistorico.value += texto + fieldComentario.value;
            fieldComentario.value = "";
        }
    },

    async cargarEdificios(http) : Promise<string[]>{
        const response = http.get('/WS_BPM_REST/jcmouse/restapi/get_accesosTree').toPromise();
        return await response;
    }

}


