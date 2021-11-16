import { FormFieldModel, FormFieldTypes, FormFieldValidator } from "@alfresco/adf-core";
import { isNullOrUndefined } from 'util';

export class FieldValidatorWASP implements FormFieldValidator{
    isSupported(field: FormFieldModel): boolean {
        return field && field.type === FormFieldTypes.DYNAMIC_TABLE;
    }
    validate(field: FormFieldModel): boolean {
        if (this.isSupported(field) && field.value) {
            let taskDefinitionKey = field.form.json.taskDefinitionKey;
            let valid = true;
            let posiciones = field.form.values.wasp_posiciones;
            let nCreaciones= field.value.length;
     
            if(isNullOrUndefined(taskDefinitionKey) || (!taskDefinitionKey.includes('wasp_t2') && !taskDefinitionKey.includes('wasp_t1_correction'))){
                if ( isNaN(posiciones)== false && nCreaciones != parseInt(posiciones) ) {
                    field.validationSummary.message = 'El número de filas de la tabla tiene que equivaler al valor del campo posiciones [' + nCreaciones + '/' + posiciones + ']';
                    valid = false;
                }

                for(let i=0;i<field.form.values.wasp_solicitudes.length;i++){
                    if(field.form.values.wasp_tipo_pedido.id == "abierto" && isNullOrUndefined(field.form.values.wasp_solicitudes[i].wasp_ceco)){
                        field.validationSummary.message = 'Hay elementos no válidos sin especificar en alguna linea las correcciones';
                        valid = false;
                    }else if(field.form.values.wasp_tipo_pedido.id=="cerrado" && field.form.values.wasp_solicitudes[i].wasp_orden_imputacion==undefined){
                        field.validationSummary.message = 'Hay elementos no válidos sin especificar en alguna linea las correcciones';
                        valid = false;
                    }
                }
            }
            
            /*field.value.forEach(row => {
                if(row.wasp_correcto != true && taskDefinitionKey.includes('wasp_t2')){
                    field.validationSummary.message = 'Hay elementos no válidos sin especificar en alguna linea las correcciones';
                    valid=false;
                }
            });*/

            //console.log(field.form.values.wasp_solicitudes);

            field.value.forEach(row => {
                let accion_csa= field.form.values.wasp_accion_csa;
                //let accion_correcto= field.form.values.wasp_correcto;
                if ( ( (accion_csa && accion_csa.id == "SI" && taskDefinitionKey.includes('wasp_t2')))
                    && field.id.includes("wasp_") && valid && row.wasp_correcto != true) {

                    field.validationSummary.message = 'Es necesario validar todos los elementos';
                    valid = false;
                }
                
                /*if (row.wasp_correcto != true && taskDefinitionKey.includes('wasp_t2')){
                    field.validationSummary.message = 'Hay elementos no válidos sin especificar en alguna linea las correcciones';
                    valid=false;
                }*/

                if ((accion_csa && accion_csa.id == "NO") && field.id.includes("wasp_") && (taskDefinitionKey.includes('wasp_t2')) &&
                    (row.wasp_correcto != true && !row.wasp_corregir)) {
                    field.validationSummary.message = 'Hay elementos no válidos sin especificar las correcciones';
                    valid = false;
                }
                
                if (accion_csa && accion_csa.id == "ACEPTAR" && field.id.includes("wasp_") && taskDefinitionKey.includes('wasp_t2') && valid &&
                    row.warpf_correcto != true) {
                    field.validationSummary.message = 'Es necesario validar todos los elementos';
                    valid = false;
                }

                /*if(row.wasp_correcto != true && taskDefinitionKey.includes('wasp_t2')){
                    field.validationSummary.message = 'Hay elementos no válidos sin especificar en alguna linea las correcciones';
                    valid=false;
                }*/

            });
            return valid;
        }
        return true;
        /*if (this.isSupported(field) && field.value) {
            let taskDefinitionKey = field.form.json.taskDefinitionKey;
            let valid = true;
            let posiciones = field.form.values.warpf_posiciones;
            let nCreaciones = field.value.length;
            field.value.forEach(row => {
                if (isNaN(posiciones) == false && nCreaciones != parseInt(posiciones)){
                    field.validationSummary.message = 'El número de filas de la tabla tiene que equivaler al valor del campo posiciones [' + nCreaciones + '/' + posiciones + ']';
                    valid = false;
                }

                if(field.form.values.wasp_tipo_pedido.id=="abierto" && field.form.values.wasp_solicitudes[row].wasp_ceco==undefined){
                    field.validationSummary.message = 'Hay elementos no válidos sin especificar en alguna linea las correcciones';
                    valid = false;
                }else if(field.form.values.wasp_tipo_pedido.id=="cerrado" && field.form.values.wasp_solicitudes[row].wasp_orden_imputacion==undefined){
                    field.validationSummary.message = 'Hay elementos no válidos sin especificar en alguna linea las correcciones';
                    valid = false;
                }

                let accion_csa = field.form.values.warpf_accion_csa;
                if (accion_csa && accion_csa.id == "ACEPTAR" && field.id.includes("wasp_") && taskDefinitionKey.includes('wasp_t2') && valid &&
                    row.warpf_correcto != true) {
                    field.validationSummary.message = 'Es necesario validar todos los elementos';
                    valid = false;
                }

                if ((accion_csa && accion_csa.id == "RECHAZAR") && field.id.includes("wasp_") && (taskDefinitionKey.includes('wasp_t2') || taskDefinitionKey.includes('warpf_t3')) &&
                    (row.warpf_correcto != true && !row.warpf_corregir)) {
                    field.validationSummary.message = 'Hay elementos no válidos sin especificar las correcciones';
                    valid = false;
                }

            });
            return valid;
        }
        return true;*/
    }

}
