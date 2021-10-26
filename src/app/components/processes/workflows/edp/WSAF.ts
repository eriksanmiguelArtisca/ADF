//import { FormFieldModel, FormFieldEvent, DynamicTableRow, ValidateDynamicTableRowEvent, FormService, FORM_FIELD_VALIDATORS, NotificationService} from "@alfresco/adf-core"; 
import { FormFieldModel, FormFieldEvent} from "@alfresco/adf-core"; 
//import {default as datos} from "./arbolAccesos.json , NotificationService";
import { HttpClient } from "@angular/common/http";
import { share } from "rxjs/operators";
import { ArbolAccesos } from "src/app/services/tree-accesos2.service";
import _ from 'lodash';
//import { SyncLogEntryRepresentation } from "alfresco-js-api-node";
//import { debounceTime } from "rxjs/operators";

//import { Observable } from "rxjs";
//import { getTreeNoValidDataSourceError } from "@angular/cdk/tree";
//import { completedTaskDetailsMock } from "src/app/test-mock";
//import { FieldValidatorWASCS } from "./fieldValidatorWASCS";
import { isUndefined, isNullOrUndefined } from "util"; 
//import { TreePepsService } from '../../../../../services/tree-peps.service';
//import { HttpClient } from "@angular/common/http";
//import { FormValueRepresentation } from "@alfresco/js-api";
//import * as moment from "moment";

export const WSAF = {
    async formLoaded(e: FormFieldEvent, fields: FormFieldModel[],http:HttpClient) {
        let tree = fields.find(f => f.id === 'wsaf_tree');
        if(!isNullOrUndefined(tree) && isNullOrUndefined(tree.value)){ 
            tree.value = http.get('/WS_BPM_REST/jcmouse/restapi/get_accesosTree').pipe( share() ).subscribe(data => {
                tree.value = data;
                //console.log(tree);
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
        }
        

        let taskDefinitionKey = e.form.json.taskDefinitionKey;
        if (!isUndefined(taskDefinitionKey)) {
            if (taskDefinitionKey === "undefined"){
                if(!isNullOrUndefined(tree) && isNullOrUndefined(tree.value)){ 
                    tree.value = http.get('/WS_BPM_REST/jcmouse/restapi/get_accesosTree').pipe( share() ).subscribe(data => {
                        tree.value = data;
                        //console.log(tree);
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
                }
            }
    
            if (taskDefinitionKey === "wsaf_t1"){
                //Arbol con checked en true
                /*let ex:ArbolAccesos[]=[];
                let aux:ArbolAccesos[]=[];
                let posiciones:any[];*/
                let nivel1:ArbolAccesos[]=[];
                let nivel2:ArbolAccesos[]=[];
                let nivel1Aux:ArbolAccesos[]=[];
                let nivel2Aux:ArbolAccesos[]=[];

                for (let i = 0; i < tree.value.length; i++){    
                    nivel1=JSON.parse(JSON.stringify(tree.value[i]));
                    for(let j=0;j<tree.value[i].children.length;j++){
                        nivel2 = JSON.parse(JSON.stringify(tree.value[i].children[j]));
                        //console.log(nivel2);
                        for(let k=0;k<tree.value[i].children[j].children.length;k++){
                            if(tree.value[i].children[j].children[k].checked){
                                console.log(nivel1['numeroItem']);
                                console.log(nivel1Aux['numeroItem']);
                                if(nivel1['numeroItem']!=nivel1Aux['numeroItem']){
                                    
                                    console.log('entra 1');
                                    nivel1['children'] = null;
                                    nivel2['children'] = null; 
                                    nivel2['children'] = tree.value[i].children[j].children[k]; 
                                    nivel1['children'] = nivel2;
                                    console.log(nivel1);    
                                }else if (nivel2["numeroItem"]!=nivel2Aux["numeroItem"]){
                                    nivel2['children'] = null; 
                                    nivel2['children'] = tree.value[i].children[j].children[k];

                                    //nivel2['children'].push(nivel1.chlidren);
                                    //nivel1['children']=nivel1['children']+nivel2;
                                    console.log(nivel1);
                                }else{
                                    /*nivel2['children'].push(tree.value[i].children[j].children[k]);
                                    nivel1['children'] = nivel2;*/

                                }
                                nivel1Aux = nivel1;
                                nivel2Aux = nivel2;
                            }
                        }  
                    }
                }


                /*for (let i = 0; i < tree.value.length; i++){
                    console.log("nivel 1");
                    for(let j=0;j<tree.value[i].children.length;j++){
                        console.log("nivel 2");
                        for(let k=0;k<tree.value[i].children[j].children.length;k++){
                            console.log("nivel 3");
                            if(tree.value[i].children[j].children[k].checked){
                                ex.push(tree.value[i].children[j].children[k]);

                                let n1=tree.value[i];
                                n1.children=null;
                                posiciones.push(n1);
                                let n2=tree.value[i].children[j];
                                n2.children=null;
                                posiciones.push(n2);

                                for (let x = 0; x < posiciones.length; x++) {
                                    if (posiciones[x + 1] === posiciones[i]) {
                                        posiciones.splice(x+1,1);
                                    }
                                }
                            }
                        }
                    }
                }*/

                //tree.value = aux;
                //if(!isNullOrUndefined(tree)){
                  //  tree.value = http.get('/WS_BPM_REST/jcmouse/restapi/get_accesosTree').pipe( share() ).subscribe(data => {
                     //   console.log(data);
                        //tree.value = data;
                        //console.log(tree);
                  /*  });
                    /*let aux:ArbolAccesos[]=[ {tipo:"", numeroItem : "",denominacion: "" ,checked: false, children : null}];
                    for (let i = 0; i < tree.value.length; i++){
                        for(let j=0;j<tree.value[i].children.length;j++){
                            for(let k=0;k<tree.value[i].children[j].children.length;k++){
                                if(tree.value[i].children[j].children[k].checked){
                                    aux.push(tree.value[i].children[j].children[k]);
                                }
                            }
                        }
                    }
                    console.log(aux);*/
                //}
            }
    
            if (taskDefinitionKey === "wsaf_t2" || taskDefinitionKey === "wsaf_t3") {
                //Misma ruta en la que se encuentren
            }
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
    }
},
    
    formFieldValueChanged(e: FormFieldEvent, fields: FormFieldModel[],http:HttpClient ) {     
        
        if (e.field.id === 'wsaf_resp') {
            //console.log(e.field.value);
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


