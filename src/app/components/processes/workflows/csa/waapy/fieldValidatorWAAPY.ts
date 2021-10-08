import { FormFieldModel, FormFieldTypes, FormFieldValidator } from "@alfresco/adf-core";

export class FieldValidatorWAAPY implements FormFieldValidator{
    isSupported(field: FormFieldModel): boolean {
        return field && field.type === FormFieldTypes.DYNAMIC_TABLE;
    }
    validate(field: FormFieldModel): boolean {          
        if (this.isSupported(field) && field.value) {
            let taskDefinitionKey = field.form.json.taskDefinitionKey;
            let valid = true;
            field.value.forEach(row => {
                if( field.id.includes("pep2")  ){
                    let claseObjeto = row.waapy_pep2_clase_proyecto;
                    if(taskDefinitionKey.includes('waapy_t1') && (claseObjeto =="RI" || claseObjeto =="GI") && (!row.waapy_pep2_inversion_prot || !row.waapy_pep2_destino_inversion || !row.waapy_pep2_instalacion )  ){
                        field.validationSummary.message = 'Falta de ingresar algún campo de Inversión';
                        valid = false;
                    }
                } 
                let accion_controller = field.form.values.waapy_accion_controller;
                if( accion_controller && accion_controller.id=="ACEPTAR" &&  field.id.includes("waapy_")  && taskDefinitionKey.includes('waapy_t2') && valid && 
                    row.waapy_proyecto_correcto!= true  && row.waapy_pep1_correcto!= true &&  row.waapy_pep2_correcto!= true && row.waapy_pep3_correcto!= true && row.waapy_orden_correcto!= true ){
                    field.validationSummary.message = 'Es necesario validar todos los elementos';
                    valid = false;
                }
                let accion_csa = field.form.values.waapy_accion_csa;
                if( (accion_controller && accion_controller.id=="RECHAZAR" ||  accion_csa && accion_csa.id=="RECHAZAR") &&  field.id.includes("waapy_")  && ( taskDefinitionKey.includes('waapy_t2') || taskDefinitionKey.includes('waapy_t3') ) && 
                    (row.waapy_proyecto_correcto!= true  && row.waapy_pep1_correcto!= true &&  row.waapy_pep2_correcto!= true && row.waapy_pep3_correcto!= true && row.waapy_orden_correcto!= true) && 
                    (!row.waapy_proyecto_corregir  && !row.waapy_pep1_corregir &&  !row.waapy_pep2_corregir && !row.waapy_pep3_corregir && !row.waapy_orden_corregir) ){
                    field.validationSummary.message = 'Hay elementos no válidos sin especificar las correcciones';
                    valid = false;
                }

            });
            return valid;
        }
        return true;
    }
    
}
