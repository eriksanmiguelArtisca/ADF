import { FormFieldModel, FormFieldTypes, FormFieldValidator } from "@alfresco/adf-core";

export class FieldValidatorWARPF implements FormFieldValidator {
    isSupported(field: FormFieldModel): boolean {
        return field && field.type === FormFieldTypes.DYNAMIC_TABLE;
    }
    validate(field: FormFieldModel): boolean {
        if (this.isSupported(field) && field.value) {
            let taskDefinitionKey = field.form.json.taskDefinitionKey;
            let valid = true;
            let posiciones = field.form.values.warpf_posiciones;
            let nCreaciones = field.value.length;
            field.value.forEach(row => {
                if (isNaN(posiciones) == false && nCreaciones != parseInt(posiciones)){
                    field.validationSummary.message = 'El número de filas de la tabla tiene que equivaler al valor del campo posiciones [' + nCreaciones + '/' + posiciones + ']';
                    valid = false;
                }

                let accion_csa = field.form.values.warpf_accion_csa;
                if (accion_csa && accion_csa.id == "ACEPTAR" && field.id.includes("warpf_") && taskDefinitionKey.includes('warpf_t2') && valid &&
                    row.warpf_correcto != true) {
                    field.validationSummary.message = 'Es necesario validar todos los elementos';
                    valid = false;
                }

                if ((accion_csa && accion_csa.id == "RECHAZAR") && field.id.includes("warpf_") && (taskDefinitionKey.includes('warpf_t2') || taskDefinitionKey.includes('warpf_t3')) &&
                    (row.warpf_correcto != true && !row.warpf_corregir)) {
                    field.validationSummary.message = 'Hay elementos no válidos sin especificar las correcciones';
                    valid = false;
                }

            });
            return valid;
        }
        return true;
    }

}
