import { FormFieldModel, FormFieldEvent, DynamicTableRow, ValidateDynamicTableRowEvent } from "@alfresco/adf-core";
import { isUndefined } from "util";

export const IT_DARB = {
    formLoaded(fields: FormFieldModel[])  {
        //formulario DARB 
        var pcd_representante =   fields.find(f => f.id ==  'widarb_pcd_representante_negocio');
        if(pcd_representante.value === null){
            pcd_representante.readOnly = true;
        } 
    },
    
    formFieldValueChanged(e: FormFieldEvent, fields : FormFieldModel[]) {
        /////////////////// AUTOCUMPLIMENTACIÓN NOMBRE PROYECTO
        if (e.field.id == "widarb_des_nombre_proyecto") {
            var des_proyecto = e.field;
            var pcd_proyecto = fields.find(f => f.id ==  'widarb_pcd_nombre_proyecto');
            
            if(!isUndefined(des_proyecto) && des_proyecto.value !== null){
                if(pcd_proyecto.value !== des_proyecto.value){
                    pcd_proyecto.value = des_proyecto.value;
                    pcd_proyecto.readOnly = true;
                }
            }
        }

        /////////////////// AUTOSELECCIÓN AREA
        if (e.field.id == "widarb_des_area_negocio") {
            var des_area = e.field;
            var pcd_area= fields.find(f => f.id ==  'widarb_pcd_area_negocio');
            if(!isUndefined(des_area) && des_area.value !== null){
                if(pcd_area.value !== des_area.value){
                    pcd_area.value = des_area.value;
                    pcd_area.readOnly = true;
                }
            }
        }
        
        /////////////////// CÁLCULO DE CLASE
        if(e.field.id == 'widarb_pcd_novedad_proyecto' || e.field.id == 'widarb_pcd_novedad_tecnologia' ||  e.field.id == 'widarb_pcd_proveedores' ||
        e.field.id == 'widarb_pcd_dependencia' || e.field.id == 'widarb_pcd_presupuesto' || e.field.id == 'widarb_pcd_calendario' ||
        e.field.id == 'widarb_pcd_tamano_equipo' ||  e.field.id == 'widarb_pcd_duracion' ||   e.field.id == 'widarb_pcd_requerimientos'){
            
            var novedad_proyecto =   fields.find(f => f.id ==  'widarb_pcd_novedad_proyecto');
            if(!isUndefined(novedad_proyecto) && novedad_proyecto.value !== null){
                var novedad_proyecto_id = novedad_proyecto.value;
            }
            var novedad_tecnologia =   fields.find(f => f.id ==  'widarb_pcd_novedad_tecnologia');
            if(!isUndefined(novedad_tecnologia) && novedad_tecnologia.value !== null){
                var novedad_tecnologia_id = novedad_tecnologia.value;
            }
            var proveedores =   fields.find(f => f.id ==  'widarb_pcd_proveedores');
            if(!isUndefined(proveedores) && proveedores.value !== null){
                var proveedores_id = proveedores.value;
            }
            var dependencia =   fields.find(f => f.id ==  'widarb_pcd_dependencia');
            if(!isUndefined(dependencia) && dependencia.value !== null){
                var dependencia_id = dependencia.value;
            }
            var presupuesto =   fields.find(f => f.id ==  'widarb_pcd_presupuesto');
            if(!isUndefined(presupuesto) && presupuesto.value !== null){
                var presupuesto_id = presupuesto.value;
            }
            var calendario =   fields.find(f => f.id ==  'widarb_pcd_calendario');
            if(!isUndefined(calendario) && calendario.value !== null){
                var calendario_id = calendario.value;
            }
            var tamano_equipo =   fields.find(f => f.id ==  'widarb_pcd_tamano_equipo');
            if(!isUndefined(tamano_equipo) && tamano_equipo.value !== null){
                var tamano_equipo_id = tamano_equipo.value;
            }
            var duracion =   fields.find(f => f.id ==  'widarb_pcd_duracion');
            if(!isUndefined(duracion) && duracion.value !== null){
                var duracion_id = duracion.value;
            }
            var requerimientos =   fields.find(f => f.id ==  'widarb_pcd_requerimientos');
            if(!isUndefined(requerimientos) && requerimientos.value !== null){
                var requerimientos_id = requerimientos.value;
            }
            var clase = "empty";
            
            //TABLA DE PESOS
            var novedad_proyecto_pesos = {'PIONERO':1, 'REPETICION':2, 'RUTINARIO':3};
            var novedad_tecnologia_pesos = {'NINGUNA':1, 'POCA':2, 'CONOCIDO':3};
            var proveedores_pesos = {'MAS_TRES':1, 'DOS_TRES':2, 'UNO':3};
            var dependencia_pesos = {'SIGNIFICATIVA':1, 'MEDIA':2, 'POCA':3};
            var presupuesto_pesos = {'MAS_300':1, '100_300':2, '50_100':3};
            var calendario_pesos = {'CRITICO':1, 'NORMAL':2, 'NO_CRITICO':3};
            var tamano_equipo_pesos = {'GRANDE':1, 'MEDIO':2, 'PEQUENO':3};
            var duracion_pesos = {'MAS_SEIS':1, 'TRES_SEIS':2, 'MENOS_TRES':3};
            var requerimientos_pesos = {'BORRADOR':1, 'POCO_CLARA':2, 'CLARA':3};

            //CALCULO DE PUNTUACION
            var score1 = ((novedad_proyecto_pesos[novedad_proyecto_id] * 0.30) + (novedad_tecnologia_pesos[novedad_tecnologia_id] * 0.70)) * 0.1;
            var score2 = proveedores_pesos[proveedores_id] * 0.15;
            var score3 = dependencia_pesos[dependencia_id] * 0.15;
            var score4 = ((presupuesto_pesos[presupuesto_id] * 0.70) + (calendario_pesos[calendario_id] * 0.30)) * 0.1;
            var score5 = ((tamano_equipo_pesos[tamano_equipo_id] * 0.60) + (duracion_pesos[duracion_id] * 0.40)) * 0.2;
            var score6 = requerimientos_pesos[requerimientos_id] * 0.3;

            var score = score1 + score2 + score3 + score4 + score5 + score6;
            
            //CALCULO CLASE
            if(presupuesto_id == "MENOS_50"){
                clase = "C";
            }else if(score >= 2.5 && score < 3.5 && !Number.isNaN(score)){
                clase = "C";
            }else if(score >= 1.5 && score < 2.5 && !Number.isNaN(score)){
                clase = "B";
            }else if(!Number.isNaN(score)){
                clase = "A";
            }else{
                clase = "empty";
            }

            //ASIGNAR VALOR COMBO CLASE
            if(clase != undefined){
                var clase_proyecto =   fields.find(f => f.id ==  'widarb_pdc_clase_proyecto');
                if(!isUndefined(clase_proyecto) && clase !== "empty"){
                    if(clase_proyecto.value !== clase){
                        clase_proyecto.value = clase;
                        clase_proyecto.readOnly = true;
                    }   
                }
            }
        }

        if (e.field.id == "widarb_spid") {
            //var sp_id =   fields.find(f => f.id ==  'widarb_spid');
            var sp_id = e.field;
            if(!isUndefined(sp_id) && sp_id.value !== null && sp_id.value !== 'empty'){
                var old_name = e.field.form.values.widarb_spid.name;
                old_name = old_name.substring((old_name.indexOf(']')+2), old_name.length);
                var new_name = old_name.trim();
                var nombre_proyecto =   fields.find(f => f.id ==  'widarb_des_nombre_proyecto');
                nombre_proyecto.value = new_name;
            }
        }
    },
    validateDynamicTableRow(row: DynamicTableRow, e: ValidateDynamicTableRowEvent, fields : FormFieldModel[]){
        if(e.field.id == "widarb_pre_inversion"){
            if(row){
                var fila = row.value;
                var total_row = 0;
                fila.total = 0;
                total_row = parseFloat(fila.year1) + parseFloat(fila.year2) + parseFloat(fila.year3) + parseFloat(fila.year4) + parseFloat(fila.year5) + parseFloat(fila.year6);
                fila.total = total_row;

                //Carga de los totales en la ultima fila
                var tabla = fields.find(f => f.id ==  'widarb_pre_inversion');
             
                var last_row = tabla.json.value[4];
                var final_total = 0;
                var final_year1 = 0;
                var final_year2 = 0;
                var final_year3 = 0;
                var final_year4 = 0;
                var final_year5 = 0;
                var final_year6 = 0;
                for(var key in tabla.json.value){
                    if(tabla.json.value[key].title !== 'Inversión total'){
                        if(tabla.json.value[key].title === fila.title){
                            tabla.json.value[key].total = fila.total;
                            tabla.json.value[key].year1 = parseFloat(fila.year1);
                            tabla.json.value[key].year2 = parseFloat(fila.year2);
                            tabla.json.value[key].year3 = parseFloat(fila.year3);
                            tabla.json.value[key].year4 = parseFloat(fila.year4);
                            tabla.json.value[key].year5 = parseFloat(fila.year5);
                            tabla.json.value[key].year6 = parseFloat(fila.year6);
                        }
                        
                        final_total = final_total + tabla.json.value[key].total;
                        final_year1 = final_year1 + tabla.json.value[key].year1;
                        final_year2 = final_year2 + tabla.json.value[key].year2;
                        final_year3 = final_year3 + tabla.json.value[key].year3;
                        final_year4 = final_year4 + tabla.json.value[key].year4;
                        final_year5 = final_year5 + tabla.json.value[key].year5;
                        final_year6 = final_year6 + tabla.json.value[key].year6;
                    }
                last_row.total = final_total;
                last_row.year1 = final_year1;
                last_row.year2 = final_year2;
                last_row.year3 = final_year3;
                last_row.year4 = final_year4;
                last_row.year5 = final_year5;
                last_row.year6 = final_year6;
                }
            }
        }else if(e.field.id == "widarb_pre_costes_operacion_adicionales"){
            if(row){
                var fila = row.value;
                var total_row = 0;
                fila.total = 0;
                total_row = parseFloat(fila.year1) + parseFloat(fila.year2) + parseFloat(fila.year3) + parseFloat(fila.year4) + parseFloat(fila.year5) + parseFloat(fila.year6);
                fila.total = total_row;

                //Carga de los totales en la ultima fila
                var tabla = fields.find(f => f.id ==  'widarb_pre_costes_operacion_adicionales');
                var last_row = tabla.json.value[4];
                var final_total = 0;
                var final_year1 = 0;
                var final_year2 = 0;
                var final_year3 = 0;
                var final_year4 = 0;
                var final_year5 = 0;
                var final_year6 = 0;
                for(var key in tabla.json.value){
                    if(tabla.json.value[key].title !== 'Costes de operación totales'){
                        if(tabla.json.value[key].title === fila.title){
                            tabla.json.value[key].year1 = parseFloat(fila.year1);
                            tabla.json.value[key].year2 = parseFloat(fila.year2);
                            tabla.json.value[key].year3 = parseFloat(fila.year3);
                            tabla.json.value[key].year4 = parseFloat(fila.year4);
                            tabla.json.value[key].year5 = parseFloat(fila.year5);
                            tabla.json.value[key].year6 = parseFloat(fila.year6);
                        }
                        
                        final_year1 = final_year1 + tabla.json.value[key].year1;
                        final_year2 = final_year2 + tabla.json.value[key].year2;
                        final_year3 = final_year3 + tabla.json.value[key].year3;
                        final_year4 = final_year4 + tabla.json.value[key].year4;
                        final_year5 = final_year5 + tabla.json.value[key].year5;
                        final_year6 = final_year6 + tabla.json.value[key].year6;
                    }
                last_row.year1 = final_year1;
                last_row.year2 = final_year2;
                last_row.year3 = final_year3;
                last_row.year4 = final_year4;
                last_row.year5 = final_year5;
                last_row.year6 = final_year6;
                }
            }
        }
    }
}