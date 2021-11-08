import { FormFieldModel, FormFieldTypes, FormFieldValidator } from "@alfresco/adf-core";

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
     
            if ( isNaN(posiciones)== false && nCreaciones != parseInt(posiciones) ) {
                field.validationSummary.message = 'El número de filas de la tabla tiene que equivaler al valor del campo posiciones [' + nCreaciones + '/' + posiciones + ']';
                valid = false;
            }
            field.value.forEach(row => {
                let accion_csa= field.form.values.wasp_accion_csa;
                let accion_correcto= field.form.values.wasp_accion_correcto;
                if ( ( (accion_csa && accion_csa.id == "ACEPTAR" && taskDefinitionKey.includes('wasp_t2') ) || 
                        accion_correcto && accion_correcto.id == "SAP" && taskDefinitionKey.includes('wasp_t3')  )
                    && field.id.includes("wasp_") && valid && row.wasp_correcto != true) {

                    field.validationSummary.message = 'Es necesario validar todos los elementos';
                    valid = false;
                }

                if ((accion_csa && accion_csa.id == "RECHAZAR") && field.id.includes("wasp_") && (taskDefinitionKey.includes('wasp_t2') || taskDefinitionKey.includes('wasp_t3')) &&
                    (row.wasp_correcto != true && !row.wasp_corregir)) {
                    field.validationSummary.message = 'Hay elementos no válidos sin especificar las correcciones';
                    valid = false;
                }

            });
            return valid;
        }
        return true;
    }

}
