import { ErrorMessageModel, WidgetVisibilityService } from "@alfresco/adf-core";
// import * as moment from "moment";
import { isNullOrUndefined } from "util";
import { CustomRowEditorComponent } from "../../../custom-form-fields/CustomDynamicTableWidgetComponent/custom-row-editor/custom-row-editor.component";

declare var $: any;

export const CSA_WAAPY_EDITOR = {
     /** 
     * Configura las limitaciones
     * @param taskDef - taskDefinitionKey identificador de la tarea actual
     * @param rowEditor - Componente customRowEditor, con acceso a todos los valores
     */
    fieldsConfig(taskDef,rowEditor ) {
      //OCULTAR FECHAS DE TODAS LAS TABLAS
      let ids = ["#waapy_proyecto_fecha_inicio","#waapy_proyecto_fecha_fin","#waapy_pep1_fecha_inicio","#waapy_pep1_fecha_fin",
      "#waapy_pep2_fecha_inicio","#waapy_pep2_fecha_fin","#waapy_pep3_fecha_inicio","#waapy_pep3_fecha_fin","#waapy_orden_fecha_fin_trabajo"]
      rowEditor.hideDivs(ids);


        if (rowEditor.table.id.includes("waapy_tabla_proyecto")) {
            if (taskDef == "waapy_t1" || taskDef == "waapy_t1_correction") {
              $("#waapy_proyecto_desc").attr('maxlength', 40);
              $("#waapy_proyecto_comentarios").attr('maxlength', 300);
              let ayuda = ["Gestional: G-XXXXXX-X (E o I o G)",[" ----- "],"Real: R-XXXXXX-00-XX"];
              rowEditor.asignarAyudaUsuario(ayuda,"#waapy_proyecto_mascara");
            }
              // });
            if (taskDef == "waapy_t2" || taskDef == "waapy_t3" || taskDef == "waapy_t4" ){
              //waapy_proyecto_mascara TOOLTIP
              if ($("#waapy_proyecto_correcto-input").is(":checked") == true){ 
                $("#waapy_proyecto_corregir").parents(".row-editor > div").hide();
                }else{
                $("#waapy_proyecto_corregir").parents(".row-editor > div").show();
                }
                $("#waapy_proyecto_correcto").click(function(){
                  $("#waapy_proyecto_corregir").val("");
                 if ($("#waapy_proyecto_correcto-input").is(":checked") !== true){ //comprobar distinto true porque tarda en asignar el valor
                  $("#waapy_proyecto_corregir").parents(".row-editor > div").hide();
                 }else{
                  $("#waapy_proyecto_corregir").parents(".row-editor > div").show();
                }
                });
            }
          }
          else if (rowEditor.table.id.includes("waapy_tabla_pep1")) {
            if (taskDef == "waapy_t1" || taskDef == "waapy_t1_correction") {
              let ayuda;
              if (rowEditor.table && rowEditor.table.form && rowEditor.table.form.values) {
                let sociedad = rowEditor.table.form.values["waapy_sociedad"].id;
                let solicitud = rowEditor.table.form.values["waapy_solicitud"].id;
                if ((sociedad === "8700" || sociedad === "8704" || sociedad === "8712" || sociedad === "8729") && (solicitud === "nuevo")) {
                  if (rowEditor.row.value.waapy_pep1_clase_objeto === "Gasto" || (rowEditor.row.value.waapy_pep1_clase_objeto === "Inversión" && rowEditor.row.value.waapy_pep1_clase_proyecto.startsWith("G"))) {
                    ayuda = ["Gestional Pep 1 multiraiz: G-XXXXXX-X-XX"];
                  } else if (rowEditor.row.value.waapy_pep1_clase_proyecto.startsWith("R")) {
                    ayuda = ["Real Pep 1 multiraiz: R-XXXXXX-00-XX-X"]; //real
                  }
                } else if ((sociedad === "8700" || sociedad === "8704" || sociedad === "8712" || sociedad === "8729") && (solicitud === "existente")) {
                  if (rowEditor.row.value.waapy_pep1_clase_objeto === "Gasto" || (rowEditor.row.value.waapy_pep1_clase_objeto === "Inversión" && rowEditor.row.value.waapy_pep1_clase_proyecto.startsWith("G"))) {
                    ayuda = ["Si desea añadir más de un pep 1 al proyecto existente: Gestional Pep 1 multiraiz: G-XXXXXX-X-XX"];
                  } else if (rowEditor.row.value.waapy_pep1_clase_proyecto.startsWith("R")) {
                    ayuda = ["Si desea añadir más de un pep 1 al proyecto existente: Real Pep 1 multiraiz: R-XXXXXX-00-XX-X"]; //real
                  }
                }else{
                 ayuda = ["Gestional: G-XXXXXX-X",[" ----- "],"Real: R-XXXXXX-00-XX"];
                }
              }
              rowEditor.asignarAyudaUsuario(ayuda,"#waapy_pep1_mascara");
              let ids=["#waapy_pep1_clase_proyecto","#waapy_pep1_clase_objeto","#waapy_pep1_cebe"];
              rowEditor.hideDivs(ids);
              //CAMPOS OCULTOS TAREA 1
              /*         $("#waapy_pep1_clase_proyecto").parents(".row-editor > div").hide();
                      $("#waapy_pep1_clase_objeto").parents(".row-editor > div").hide();
                      $("#waapy_pep1_cebe").parents(".row-editor > div").hide(); */
            } else if (taskDef == "waapy_t2" || taskDef == "waapy_t3" || taskDef == "waapy_t4") {
              //CAMPOS OCULTOS TAREA 2
              if (taskDef === "waapy_t2"){
                let ids=["#waapy_pep1_clase_proyecto","#waapy_pep1_clase_objeto"];
                rowEditor.hideDivs(ids);
              }
              if ($("#waapy_pep1_correcto-input").is(":checked") == true){ 
              $("#waapy_pep1_corregir").parents(".row-editor > div").hide();
              }else{
              $("#waapy_pep1_corregir").parents(".row-editor > div").show();
              }
              $("#waapy_pep1_correcto").click(function(){
                $("#waapy_pep1_corregir").val("");
               if ($("#waapy_pep1_correcto-input").is(":checked") !== true){ //comprobar distinto true porque tarda en asignar el valor
                $("#waapy_pep1_corregir").parents(".row-editor > div").hide();
               }else{
                $("#waapy_pep1_corregir").parents(".row-editor > div").show();
              }
              });
              
            }
         
            $("#waapy_pep1_denominacion").attr('maxlength', 40);
            $("#waapy_pep1_comentarios").attr('maxlength', 300);

          if (rowEditor.table.form && rowEditor.table.form.values && rowEditor.table.form.values.waapy_sociedad) {
            let sociedad = rowEditor.table.form.values.waapy_sociedad.id;
            let sociedadesMultiRaiz = ["8700", "8704", "8712", "8729"];
            if (sociedadesMultiRaiz.includes(sociedad)) {
              let column_denominacion = rowEditor.table.columns.find(f => f.id === "waapy_pep1_denominacion");
              if (taskDef == "waapy_t1" || taskDef == "waapy_t1_correction") {
                if (rowEditor.row.isNew) {
                  if (!isNullOrUndefined(column_denominacion) && rowEditor.table.rows && rowEditor.table.rows.length == 0) {
                    column_denominacion.editable = false;
                  } else {
                    column_denominacion.editable = true;
                  }
                } else { //if user edit position
                  if (!isNullOrUndefined(rowEditor.table.rows[0]) && JSON.stringify(rowEditor.row.value) === JSON.stringify(rowEditor.table.rows[0].value)) {
                    //1ºpos pep1
                    column_denominacion.editable = false;
                  } else {
                    column_denominacion.editable = true;
                  }
                }

              }
            }
          }
           
            
      
          } else if (rowEditor.table.id.includes("waapy_tabla_pep2")) {
            
            let claseProyecto = rowEditor.treeService.rootPep[0].clase_objeto;
            $("#waapy_pep2_desc").attr('maxlength', 40);
            $("#waapy_pep2_comentarios").attr('maxlength', 300);
            /* rowEditor.row.value.waapy_pep2_ceco_solicitante = rowEditor.treeService.currentPep.ceco_solicitante; */
            if (claseProyecto != "Inversión") {
              // ocultamos campos no necesarios para la clase de proyecto
              let ids=["#waapy_pep2_inversion_prot","#waapy_pep2_destino_inversion","#waapy_pep2_instalacion"];
              rowEditor.hideDivs(ids);
            } else if (claseProyecto == "Inversión") {
              //NO ACTION
            }
            if (taskDef == "waapy_t1" || taskDef == "waapy_t1_correction") {
              let ayuda;
              if (rowEditor.table && rowEditor.table.form && rowEditor.table.form.values) {
                let sociedad = rowEditor.table.form.values["waapy_sociedad"].id;
                let solicitud = rowEditor.table.form.values["waapy_solicitud"].id;
                if ((sociedad === "8700" || sociedad === "8704" || sociedad === "8712" || sociedad === "8729") && (solicitud === "nuevo" || solicitud === "existente")) {
                  if (rowEditor.row.value.waapy_pep2_clase_objeto === "Gasto" || (rowEditor.row.value.waapy_pep2_clase_objeto === "Inversión" && rowEditor.row.value.waapy_pep2_clase_proyecto.startsWith("G"))) {
                    ayuda = ["Gestional Pep 2 multiraiz: G-XXXXXX-X-XX-XX"];
                  } else if (rowEditor.row.value.waapy_pep2_clase_proyecto.startsWith("R")) {
                    ayuda = ["Real Pep 2 multiraiz: R-XXXXXX-00-XX-X-XX"]; //real
                  }
                } else {
                  ayuda = ["Gestional: G-XXXXXX-X-XX", [" ----- "], "Real: R-XXXXXX-00-XX-X"];
                }
              }
              rowEditor.asignarAyudaUsuario(ayuda,"#waapy_pep2_mascara");
              //CAMPOS OCULTOS TAREA 1
              let ids=["#waapy_pep2_clase_proyecto","#waapy_pep2_clase_objeto","#waapy_pep2_cebe"];
              rowEditor.hideDivs(ids);
            } else if (taskDef == "waapy_t2" || taskDef == "waapy_t3" || taskDef == "waapy_t4" ) {
              //CAMPOS OCULTOS TAREA 2
              if (taskDef === "waapy_t2"){
              let ids=["#waapy_pep2_clase_proyecto","#waapy_pep2_clase_objeto"];
              rowEditor.hideDivs(ids);
              }
              if ($("#waapy_pep2_correcto-input").is(":checked") == true){ 
                $("#waapy_pep2_corregir").parents(".row-editor > div").hide();
                }else{
                $("#waapy_pep2_corregir").parents(".row-editor > div").show();
                }
                $("#waapy_pep2_correcto").click(function(){
                  $("#waapy_pep2_corregir").val("");
                 if ($("#waapy_pep2_correcto-input").is(":checked") !== true){ //comprobar distinto true porque tarda en asignar el valor
                  $("#waapy_pep2_corregir").parents(".row-editor > div").hide();
                 }else{
                  $("#waapy_pep2_corregir").parents(".row-editor > div").show();
                }
                });
            }
          } else if (rowEditor.table.id.includes("waapy_tabla_pep3")) {
            $("#waapy_pep3_desc").attr('maxlength', 40);
            $("#waapy_pep3_comentarios").attr('maxlength', 300);
      
            let claseProyecto = rowEditor.treeService.rootPep[0].clase_objeto;
            if (claseProyecto != "Inversión") {
              // ocultamos campos no necesarios para la clase de proyecto
              let ids=["#waapy_pep3_destino_inversion","#waapy_pep3_inversion_prot"];
              rowEditor.hideDivs(ids);
            } else if (claseProyecto == "Inversión") {
              //Hay que hace obligatorios todos los campos de arriba en caso de que sí sea
            }
            if (taskDef == "waapy_t1" || taskDef == "waapy_t1_correction") {
              let ayuda;
              if (rowEditor.table && rowEditor.table.form && rowEditor.table.form.values) {
                let sociedad = rowEditor.table.form.values["waapy_sociedad"].id;
                let solicitud = rowEditor.table.form.values["waapy_solicitud"].id;
                if ((sociedad === "8700" || sociedad === "8704" || sociedad === "8712" || sociedad === "8729") && (solicitud === "nuevo" || solicitud === "existente")) {
                  if (rowEditor.row.value.waapy_pep3_clase_objeto === "Gasto" || (rowEditor.row.value.waapy_pep3_clase_objeto === "Inversión" && rowEditor.row.value.waapy_pep3_clase_proyecto.startsWith("G"))) {
                    ayuda = ["Gestional Pep 3 multiraiz: G-XXXXXX-X-XX-XXXXXXXXX"];
                  } else if (rowEditor.row.value.waapy_pep3_clase_proyecto.startsWith("R")) {
                    ayuda = ["Real Pep 3 multiraiz: R-XXXXXX-00-XX-X-XXXXXX"]; //real
                  }
                } else {
                  ayuda = ["Gestional: G-XXXXXX-X-XX-XXXXXXXXX", [" ----- "], "Real: R-XXXXXX-00-XX-X-XXXXXX"];
                }
              }
              // let ayuda = ["Gestional Pep 3: G-XXXXXX-X-XX-XXXXXXXXX",[" ----- "],"Real Pep 3: R-XXXXXX-00-XX-X-XXXXXX"];
              rowEditor.asignarAyudaUsuario(ayuda,"#waapy_pep3_mascara");
              //CAMPOS OCULTOS TAREA 1
              let ids=["#waapy_pep3_clase_proyecto","#waapy_pep3_clase_objeto","#waapy_pep3_cebe",
              "#waapy_pep3_actividad","#waapy_pep3_inversion_prot"];
              rowEditor.hideDivs(ids);
            } else if (taskDef == "waapy_t2" || taskDef == "waapy_t3" || taskDef == "waapy_t4") {
              //CAMPOS OCULTOS TAREA 2
              if (taskDef === "waapy_t2"){
              let ids=["#waapy_pep3_clase_proyecto","#waapy_pep3_clase_objeto","#waapy_pep3_actividad","#waapy_pep3_inversion_prot"];
              rowEditor.hideDivs(ids);
              }
              if ($("#waapy_pep3_correcto-input").is(":checked") == true){ 
              $("#waapy_pep3_corregir").parents(".row-editor > div").hide();
              }else{
              $("#waapy_pep3_corregir").parents(".row-editor > div").show();
              }
              $("#waapy_pep3_correcto").click(function(){
                $("#waapy_pep3_corregir").val("");
                if ($("#waapy_pep3_correcto-input").is(":checked") !== true){ //comprobar distinto true porque tarda en asignar el valor
                $("#waapy_pep3_corregir").parents(".row-editor > div").hide();
                }else{
                $("#waapy_pep3_corregir").parents(".row-editor > div").show();
              }
              });
            }
          } else if (rowEditor.table.id.includes("waapy_tabla_ordenes")) {
            if (rowEditor.row.value.waapy_orden_clase) {
              switch (rowEditor.row.value.waapy_orden_clase.id) {
                case "GGEN":
                case "P03":
                  $("#waapy_orden_clase_activo").parents(".row-editor > div").hide();
                  $("#waapy_orden_clase_af").parents(".row-editor > div").hide();
                  rowEditor.mostrarActivoFijo=false;
                  rowEditor.mostrarAF = false;
                  break;
                case "P13":
                case "P20":
                case "P12":
                case "P14":
                  $("#waapy_orden_clase_activo").parents(".row-editor > div").show();
                  rowEditor.mostrarActivoFijo = true;
                  if (rowEditor.row.value.waapy_orden_clase.id == "P12" || rowEditor.row.value.waapy_orden_clase.id == "P14") {
                    $("#waapy_orden_clase_af").parents(".row-editor > div").hide();
                    rowEditor.mostrarAF = false;
                  } else {
                    $("#waapy_orden_clase_af").parents(".row-editor > div").show();
                    rowEditor.mostrarAF = true;
                  }
                  break;
                /*case "P18":
                  $("#waapy_orden_clase_activo").parents(".row-editor > div").hide();
                  $("#waapy_orden_centro").parents(".row-editor > div").show();
                  rowEditor.mostrarCentro=true;
                  rowEditor.mostrarActivoFijo=false;*/
      
              }
            }
            $("#waapy_orden_mascara").attr('maxlength', 12);
            $("#waapy_orden_texto").attr('maxlength', 40);
            $("#waapy_orden_comentarios").attr('maxlength', 300);
            let claseProyecto = rowEditor.treeService.rootPep[0].clase_objeto;
            if (claseProyecto != "Inversión") {
              // ocultamos campos no necesarios para la clase de proyecto
              let ids=["#waapy_orden_unidad_negocio","#waapy_orden_desglose1", //"#waapy_orden_fecha_fin_trabajo"
              "#waapy_orden_desglose2","#waapy_orden_criterio_clasificacion","#waapy_orden_clase_activo","#waapy_orden_supranumero"];
              // if (rowEditor.mostrarCentro !==true){
              //   ids.push("#waapy_orden_centro");
              // }
              if (rowEditor.mostrarAF !== true) {
                ids.push("#waapy_orden_clase_af");
              }
              rowEditor.hideDivs(ids);
            } else if (claseProyecto == "Inversión") {
              //Hay que hace obligatorios todos los campos de arriba en caso de que sí sea
              // let ids=["#waapy_orden_centro"];
              let ids = [];
              if (rowEditor.mostrarActivoFijo !== true){
                ids.push("#waapy_orden_clase_activo");
              }
              if (rowEditor.mostrarAF !== true) {
                ids.push("#waapy_orden_clase_af");
              }
              rowEditor.hideDivs(ids);
            }
            if (taskDef == "waapy_t1" || taskDef == "waapy_t1_correction") {
              //CAMPOS OCULTOS TAREA 1
              let ids=["#waapy_orden_ceco_responsable","#waapy_orden_cebe","#waapy_orden_actividad",
              "#waapy_orden_destino_inversion"];
              rowEditor.hideDivs(ids);
            } else if (taskDef == "waapy_t2" || taskDef == "waapy_t3" || taskDef == "waapy_t4") {
              //CAMPOS OCULTOS TAREA 2
              if (taskDef === "waapy_t2"){
                let ids=["#waapy_orden_ceco_responsable","#waapy_orden_cebe","#waapy_orden_actividad",
                "#waapy_orden_destino_inversion"];
                rowEditor.hideDivs(ids);
              }
             
              if ($("#waapy_orden_correcto-input").is(":checked") == true){ 
                $("#waapy_orden_corregir").parents(".row-editor > div").hide();
                }else{
                $("#waapy_orden_corregir").parents(".row-editor > div").show();
                }
                $("#waapy_orden_correcto").click(function(){
                  // rowEditor.row.value.waapy_orden_corregir = "";
                  $("#waapy_orden_corregir").val("");
                 if ($("#waapy_orden_correcto-input").is(":checked") !== true){ //comprobar distinto true porque tarda en asignar el valor
                  $("#waapy_orden_corregir").parents(".row-editor > div").hide();
                 }else{
                  $("#waapy_orden_corregir").parents(".row-editor > div").show();
                }
                });
            }
          }
      
          //en el momento que se crea o edita un nodo, se desactiva el cambio del Tree
          // $("#field-waapy_tabla_pep1-container").is(":visible");
          // $("input[name='mat-radio-group-3']").prop('disabled', false);
          if ($("#waapy_proyecto_mascara").is(":visible") || $("#waapy_pep1_mascara").is(":visible") || $("#waapy_pep2_mascara").is(":visible")
              || $("#waapy_pep3_mascara").is(":visible") || $("#waapy_orden_mascara").is(":visible")) {
                $("mat-tree input").prop('disabled', true);
          } else {
                $("mat-tree input").prop('disabled', false);
          }



    },
     /** 
     * Configura las herencia de los campos
     * @param rowEditor - Componente customRowEditor, con acceso a todos los valores
     */
    heritage(rowEditor : CustomRowEditorComponent) {
          /*
        for (let i = 0; i < rowEditor.table.columns.length; i++) {
            if (rowEditor.table.columns[i].id == "waapy_pep1_fecha_inicio" || rowEditor.table.columns[i].id == "waapy_pep2_fecha_inicio"
              || rowEditor.table.columns[i].id == "waapy_pep1_fecha_fin" || rowEditor.table.columns[i].id == "waapy_pep2_fecha_fin"
              || rowEditor.table.columns[i].id == "waapy_pep3_fecha_fin" || rowEditor.table.columns[i].id == "waapy_pep3_fecha_inicio" ||
              rowEditor.table.columns[i].id == "waapy_orden_fecha_fin_trabajo") {
              let moment_fecha_incio = moment(rowEditor.treeService.currentPep.fecha_inicio);
              rowEditor.table.columns[i]["minDate"] = moment_fecha_incio.isValid() == true ? moment_fecha_incio.format('YYYY-MM-DD') + "T00:00:00.000Z" : moment().format('YYYY-MM-DD') + "T00:00:00.000Z";
              let moment_fecha_fin = moment(rowEditor.treeService.currentPep.fecha_fin);
              rowEditor.table.columns[i]["maxDate"] = moment_fecha_fin.isValid() == true ? moment_fecha_fin.format('YYYY-MM-DD') + "T00:00:00.000Z" : "";
            }
          }
          
          */  
          if (rowEditor.table.id.includes("waapy_tabla_proyecto")) {
            // rowEditor.row.value.waapy_proyecto_fecha_inicio = moment().format('YYYY-MM-DD') + "T00:00:00.000Z";
            // rowEditor.row.value.waapy_proyecto_fecha_fin = moment('2099-12-31').format('YYYY-MM-DD') + "T00:00:00.000Z";
          } else if(rowEditor.table.id.includes("waapy_tabla_")) {
            if (rowEditor.treeService.rootPep[0].clase_proyecto == "GE" || rowEditor.treeService.rootPep[0].clase_proyecto == "GG") {
              rowEditor.treeService.currentPep.clase_objeto = "Gasto";
            } else {
              rowEditor.treeService.currentPep.clase_objeto = "Inversión";
            }
          }
          if (rowEditor.table.id.includes("waapy_tabla_pep1")) {
          let solicitud = rowEditor.table.form.values["waapy_solicitud"].id;
            rowEditor.row.value["waapy_pep1_nodo_superior"]="";
            rowEditor.row.value["waapy_pep1_denominacion"]=rowEditor.treeService.currentPep.desc;
            let arrayCurrentPep = ['waapy_pep1_mascara']; //'waapy_pep1_fecha_inicio','waapy_pep1_fecha_fin'
            let arrayRootPep = ['waapy_pep1_clase_proyecto','waapy_pep1_clase_objeto'];
            this.heritageTables(arrayCurrentPep, arrayRootPep, solicitud, rowEditor);
          } else if (rowEditor.table.id.includes("waapy_tabla_pep2")) {
            let solicitud = rowEditor.table.form.values["waapy_solicitud"].id;
            rowEditor.row.value["waapy_pep2_nodo_superior"]=rowEditor.treeService.currentPep.mascara;
            let arrayCurrentPep = ['waapy_pep2_mascara','waapy_pep2_ceco_solicitante','waapy_pep2_ceco_responsable']; // 'waapy_pep2_fecha_inicio','waapy_pep2_fecha_fin'
            let arrayRootPep = ['waapy_pep2_clase_proyecto','waapy_pep2_clase_objeto'];
            // if(rowEditor.treeService.currentPep.mascara.charAt(0) =="R"){
            //   arrayCurrentPep.push('waapy_pep2_mascara');
            // }else{
            //   arrayRootPep.push('waapy_pep2_mascara');
            // }
            this.heritageTables(arrayCurrentPep, arrayRootPep, solicitud, rowEditor);
          } else if (rowEditor.table.id.includes("waapy_tabla_pep3")) {
            let solicitud = rowEditor.table.form.values["waapy_solicitud"].id;
            rowEditor.row.value["waapy_pep3_nodo_superior"] = rowEditor.treeService.currentPep.mascara;
            let arrayCurrentPep = ['waapy_pep3_mascara','waapy_pep3_ceco_solicitante','waapy_pep3_ceco_responsable', //'waapy_pep3_fecha_inicio','waapy_pep3_fecha_fin'
            'waapy_pep3_inversion_prot','waapy_pep3_destino_inversion','waapy_pep3_actividad'];
            // 'waapy_pep3_cebe'
            let arrayRootPep = ['waapy_pep3_clase_proyecto','waapy_pep3_clase_objeto'];
            this.heritageTables(arrayCurrentPep, arrayRootPep , solicitud, rowEditor);
    
          } else if (rowEditor.table.id.includes("waapy_tabla_ordenes")) {
            let solicitud = rowEditor.table.form.values["waapy_solicitud"].id;
            rowEditor.row.value["waapy_orden_nodo_superior"] = rowEditor.treeService.currentPep.mascara;
            /*let moment_fecha_fin_trabajo = moment(rowEditor.treeService.rootPep[0].fecha_fin);
            rowEditor.row.value.waapy_orden_fecha_fin_trabajo= moment_fecha_fin_trabajo.isValid() == true ? moment_fecha_fin_trabajo.format('YYYY-MM-DD') + "T00:00:00.000Z" : "";*/
            // rowEditor.row.value.waapy_orden_fecha_fin_trabajo = rowEditor.treeService.rootPep[0].fecha_fin;
            let arrayCurrentPep = ['waapy_orden_ceco_responsable','waapy_orden_actividad', //'waapy_orden_cebe'
            'waapy_orden_destino_inversion'];
            let arrayRootPep = ['waapy_orden_clase_proyecto','waapy_orden_clase_objeto'];
            this.heritageTables(arrayCurrentPep, arrayRootPep, solicitud, rowEditor);
          }
    },
     /** 
     * Configura la visibilidad de campos
     * @param tarea - taskDefinitionKey identificador de la tarea actual
     * @param ids - Componente customRowEditor, con acceso a todos los valores
     */
    visibility(tarea, ids) {
        if (isNullOrUndefined(tarea) || tarea === "waapy_borrador" || tarea === "waapy_t1_correction") { //null or undefined = tarea waapy start. // t2,t3,t4 se visualizan.
            for (let id of ids) {
                $(id).parents(".row-editor > div").hide();
            }
        }
    },
     /** 
     * Método asíncrono -> Valida la row actual y comprueba si el dato ya existe en SAP para informar al usuario
     * @param rowEditor - Componente customRowEditor, con acceso a todos los valores
     */
    async validateSave(rowEditor : CustomRowEditorComponent){
        let currentTable = rowEditor.table.id.replace("_tabla", "");
        let tableName = rowEditor.table.id.replace("waapy_tabla_", "");
        let taskId = rowEditor.table.form.taskId;
        this.comprobarDuplicadosVariables(rowEditor.row.value[currentTable + "_mascara"], rowEditor.visibilityService, tableName, taskId, rowEditor).then(
          validationCorrect => {
            rowEditor.validationSummary = validationCorrect;
            if (validationCorrect.isValid) {
              if (rowEditor.table.id == "waapy_tabla_pep2" || rowEditor.table.id == "waapy_tabla_pep3" || rowEditor.table.id == "waapy_tabla_ordenes") {
                let cecoId;
                if (currentTable == "waapy_ordenes") {
                  cecoId = rowEditor.row.value["waapy_orden" + "_ceco_responsable"].id;
                  currentTable = "waapy_orden";
                } else {
                  cecoId = rowEditor.row.value[currentTable + "_ceco_responsable"].id;
                }
                let parentCeco = rowEditor.row.isNew ? rowEditor.treeService.currentPep["ceco_responsable"] : rowEditor.treeService.lastEditRow.value[currentTable + "_ceco_responsable"];
                if ((rowEditor.table.id == "waapy_tabla_pep3" || rowEditor.table.id == "waapy_tabla_ordenes") && (cecoId == parentCeco || cecoId == parentCeco["id"])) {
                  // En caso de que en pep3 no se modifique el ceco se deja el cebe heredado(En caso caso de ser un pep como un proyecto existente viene como string)
                  // si es modificacion y no ha cambiado dejamos el actual
                  if (rowEditor.row.isNew) rowEditor.row.value[currentTable + "_cebe"] = typeof rowEditor.treeService.currentPep["cebe"] === 'string' ? { id: rowEditor.treeService.currentPep["cebe"], name: rowEditor.treeService.currentPep["cebe"] } : rowEditor.treeService.currentPep["cebe"];
                  rowEditor.validateRowAndSave();
                } else {
                  rowEditor.http.get('/WS_BPM_REST/jcmouse/restapi/sap_pi/VISUALIZAR/CECO/SOCIEDAD_CO,COSTCENTER,VALID_TO/GV01,' + cecoId + ',99991231', { observe: 'response' })
                    .subscribe(response => {
                      if (response.body["MT_HUBCOM_RES"]["CORRECTO"] === "X") {
                        let cebe = response.body["MT_HUBCOM_RES"]["RESULTADO"].item[11]["VALOR"];
                        rowEditor.row.value[currentTable + "_cebe"] = { id: cebe, name: cebe };
                        rowEditor.validateRowAndSave();
                      }
                      else {
                        rowEditor.http.get('/WS_BPM_REST/jcmouse/restapi/sap_pi/VISUALIZAR/CECO/SOCIEDAD_CO,COSTCENTER,VALID_TO/8700,' + cecoId + ',99991231', { observe: 'response' })
                          .subscribe(response => {
                            if (response.body["MT_HUBCOM_RES"]["CORRECTO"] === "X") {
                              let cebe = response.body["MT_HUBCOM_RES"]["RESULTADO"].item[11]["VALOR"];
                              rowEditor.row.value[currentTable + "_cebe"] = { id: cebe, name: cebe };
                              rowEditor.validateRowAndSave();
                            }
                          });
                      }
                    });
                }

              } else {
                rowEditor.validateRowAndSave();
              }

            }
          }
        )
        
    },
    /** 
     * Detector de eventos de campos de texto. Asigna los valores del proyecto (perfil, tipo, etc...). Controla las ordenes de imputación
     * @param event - El evento que se ha detectado
     * @param rowEditor - Componente customRowEditor, con acceso a todos los valores
     */
    inputListener(event,rowEditor){
      if (event.id == "waapy_proyecto_mascara" || event.id == "waapy_pep1_mascara" || event.id == "waapy_pep2_mascara" ||
      event.id == "waapy_pep3_mascara" || event.id == "waapy_orden_mascara") {
        let maskUppercase = event.value.toUpperCase();
        $("#"+event.id).val(maskUppercase);
      }
      if (event.id == "waapy_proyecto_mascara" && event.value.length >= 10) {
        let mascara = event.value;
        let firstCharacter = mascara.charAt(0);
        let perfil_code = "";
        let sociedad = rowEditor.table.form.values["waapy_sociedad"]["id"];
        switch (sociedad) {
          case "0100":
            if (firstCharacter == 'G') {
              perfil_code = "PEOG001";
            } else {
              perfil_code = "PEOP000";
            }
            break;
          case "0101":
            if (firstCharacter == 'G') {
              perfil_code = "PEEG001";
            } else {
              perfil_code = "PEEP000";
            }
            break;
          case "0102":
            if (firstCharacter == 'G') {
              perfil_code = "PEHG001";
            } else {
              perfil_code = "PEHP000";
            }
            break;
          case "0103":
            if (firstCharacter == 'G') {
              perfil_code = "PVHG001";
            } else {
              perfil_code = "PVHP000";
            }
            break;
          case "0104":
            if (firstCharacter == 'G') {
              perfil_code = "PTCG001";
            } else {
              perfil_code = "PTCP000";
            }
            break;
          case "0262":
            if (firstCharacter == 'G') {
              perfil_code = "PBDG001";
            } else {
              perfil_code = "PBDP000";
            }
            break;
          case "0446":
            if (firstCharacter == 'G') {
              perfil_code = "PVDG001";
            } else {
              perfil_code = "PVDP000";
            }
            break;
          case "0568":
            if (firstCharacter == 'G') {
              perfil_code = "PVPG001";
            } else {
              perfil_code = "PVPP000";
            }
            break;
          case "0607":
            if (firstCharacter == 'G') {
              perfil_code = "PEIG001";
            } else {
              perfil_code = "PEIP000";
            }
            break;
          case "8700":
          case "8704":
          case "8712":
          case "8729":
            if (firstCharacter == 'G') {
              perfil_code = "PVRG001";
            } else {
              perfil_code = "PVRP000";
            }
            break;
        }
        rowEditor.row.value.waapy_proyecto_perfil_code = perfil_code;
        rowEditor.row.value.waapy_proyecto_mascara = mascara;
        if (firstCharacter === "G") {
          rowEditor.row.value.waapy_proyecto_perfil = "Gestional";
          let last_character = mascara.charAt(9);
          if (last_character === "E" || last_character === "G") {
            rowEditor.row.value.waapy_proyecto_clase_proyecto = "GE";
            rowEditor.row.value.waapy_proyecto_clase_objeto = "Gasto";
          } else if (last_character === "I") {
            rowEditor.row.value.waapy_proyecto_clase_proyecto = "GI";
            rowEditor.row.value.waapy_proyecto_clase_objeto = "Inversión";
          }
        }
        else if (firstCharacter === "R") {
          rowEditor.row.value.waapy_proyecto_perfil = "Real";
          rowEditor.row.value.waapy_proyecto_clase_proyecto = "RI";
          rowEditor.row.value.waapy_proyecto_clase_objeto = "Inversión";
        }
      } else if (event.id == "waapy_orden_mascara" && (event.value.length>= 1 && event.value.length<= 5 )){ //|| waapy_orden_mascara
        let msg;
        let validationOrden: any = new ErrorMessageModel({
          message: ""
        });
        let firstCharacterOrden = event.value.trim().charAt(0);
        if (isNullOrUndefined(rowEditor.row.value.waapy_orden_clase) || rowEditor.row.value.waapy_orden_clase === "") {
          msg = "Es necesario introducir la clase de orden";
          validationOrden.message = msg;
          validationOrden.isValid = false;
          rowEditor.validationSummary = validationOrden;
          event.value = "";
        }
        else if (firstCharacterOrden === "" || event.value === undefined) {
          msg = "Es necesario introducir la máscara de orden";
          validationOrden.message = msg;
          validationOrden.isValid = false;
          rowEditor.validationSummary = validationOrden;
        } else if (rowEditor.row.value.waapy_orden_clase) {
          switch (rowEditor.row.value.waapy_orden_clase.id) {
            case "GGEN":
              if (firstCharacterOrden === "G" && rowEditor.treeService.rootPep[0].clase_objeto === "Gasto") {
                validationOrden.isValid = true;
                $("#buttons").children().eq(1).prop('disabled', false);
              } else if (rowEditor.treeService.rootPep[0].clase_objeto === "Gasto") {
                msg = "Es obligatorio que la máscara de orden que empiece por G";
                validationOrden.isValid = false;
                // rowEditor.row.value.waapy_orden_mascara = "";
                $("#waapy_orden_mascara").val("");
                $("#buttons").children().eq(1).prop('disabled', true);
              }
              break;
            case "P03":
              if (firstCharacterOrden === "V" && rowEditor.treeService.rootPep[0].clase_objeto === "Gasto") {
                validationOrden.isValid = true;
                $("#buttons").children().eq(1).prop('disabled', false);
              } else if (rowEditor.treeService.rootPep[0].clase_objeto === "Gasto"){
                msg = "Es obligatorio que la máscara de orden que empiece por V";
                validationOrden.isValid = false;
                // rowEditor.row.value.waapy_orden_mascara = "";
                $("#waapy_orden_mascara").val("");
                $("#buttons").children().eq(1).prop('disabled', true);
              }
              break;
            case "P12":
              if (firstCharacterOrden !== "") {//firstCharacterOrden === "2"){
                validationOrden.isValid = true;
                // rowEditor.row.value.waapy_orden_mascara = "";
                $("#waapy_orden_mascara").val("");
              } else {
                msg = "Es obligatorio que la máscara de orden que empiece por 2";
                validationOrden.isValid = false;
                rowEditor.row.value.waapy_orden_mascara = "";
              }
              break;
            case "P13":
              if (firstCharacterOrden !== "") { //firstCharacterOrden === "3"){
                validationOrden.isValid = true;
                // rowEditor.row.value.waapy_orden_mascara = "";
                $("#waapy_orden_mascara").val("");
              } else {
                msg = "Es obligatorio que la máscara de orden que empiece por 3";
                validationOrden.isValid = false;
                rowEditor.row.value.waapy_orden_mascara = "";
              }
              break;
            case "P14":
              if (firstCharacterOrden !== "") {//firstCharacterOrden === "4"){
                validationOrden.isValid = true;
                // rowEditor.row.value.waapy_orden_mascara = "";
                $("#waapy_orden_mascara").val("");
              } else {
                msg = "Es obligatorio que la máscara de orden que empiece por 4";
                validationOrden.isValid = false;
                rowEditor.row.value.waapy_orden_mascara = "";
              }
              break;
            case "P20":
              if (firstCharacterOrden !== "") {//firstCharacterOrden === "1"){
                validationOrden.isValid = true;
                // rowEditor.row.value.waapy_orden_mascara = "";
                $("#waapy_orden_mascara").val("");
              } else {
                msg = "Es obligatorio que la máscara de orden que empiece por 1";
                validationOrden.isValid = false;
                rowEditor.row.value.waapy_orden_mascara = "";
              }
              break;

          }
          validationOrden.message = msg;
          rowEditor.validationSummary = validationOrden;
        }
      }
    },
      /** 
     * Detector de eventos de campos de autocompletado. Rellena ciertos campos en base a la selección de otros.
     * @param $event - El evento que se ha detectado
     * @param rowEditor - Componente customRowEditor, con acceso a todos los valores
     */
    onAutocompleteValueChange($event,rowEditor){
        if ($event.id === "waapy_pep1_ceco_responsable") {
            rowEditor.row.value.waapy_pep1_ceco_solicitante = $event.values;
            $("#waapy_pep1_ceco_solicitante").val(rowEditor.row.value.waapy_pep1_ceco_solicitante.name);
          } else if ($event.id === "waapy_pep2_ceco_responsable") {
            rowEditor.row.value.waapy_pep2_ceco_solicitante = $event.values;
            $("#waapy_pep2_ceco_solicitante").val(rowEditor.row.value.waapy_pep2_ceco_responsable.name);
          }
          else if ($event.id === "waapy_pep3_ceco_responsable") {
            rowEditor.row.value.waapy_pep3_ceco_solicitante = $event.values;
            $("#waapy_pep3_ceco_solicitante").val(rowEditor.row.value.waapy_pep3_ceco_solicitante.name);
          }
          if ($event.id === "waapy_orden_clase") {
            $("#waapy_orden_mascara").val("");
            $("#waapy_orden_mascara").prop("disabled", false);
            $("#buttons").children().eq(1).prop('disabled', false);
            rowEditor.validationSummary.message = null;
            rowEditor.validationSummary.isValid = null;
            if ($event.values.id == "") {
              $("#waapy_orden_mascara").val("");
            } else {
              switch ($event.values.id) {
                // case "P12":
                // case "P14":
                /* case "P32":
                let idClase;
                //   if ($event.values.id === "P12") {
                //     idClase = "P12";
                //   } else if ($event.values.id === "P14") {
                //     idClase = "P14";
                //   }
                //    else {
                //     idClase = "P32";
                //   }
                  if ($event.values.id === "P32") {
                    idClase = "P32";
                  }
                  $("#waapy_orden_clase_activo").parents(".row-editor > div").hide();
                  // $("#waapy_orden_clase_activo").val(""); //lo vaciamos en las que no aparece AF para que cuando se muestre no tenga valor
                  $("#waapy_orden_centro").parents(".row-editor > div").hide();
                  if (rowEditor.treeService.rootPep[0].clase_objeto === "Gasto") {
                    $("#waapy_orden_clase").val("");
                    $("#waapy_orden_mascara").val("");
                    $("#buttons").children().eq(1).prop('disabled', true);
                    rowEditor.notificationService.openSnackMessageAction("La clase de orden [" + idClase + "] no puede utilizarse en un proyecto de Gasto", "Aceptar", {
                      duration: 10000,
                      horizontalPosition: "center",
                      verticalPosition: "bottom"
                    });
                    $(".cdk-global-overlay-wrapper").css("height", "45%");
                  } else {
                    rowEditor.notificacionOrdenes();
                    this.asignarIdTemporal(idClase, rowEditor);
                  }
                  break;*/
                case "P13": /*INVERSIÓN*/
                case "P20":
                // case "P31":
                // case "P40":
                // case "P41":
                case "P12":
                case "P14":
                  // $("#waapy_orden_centro").parents(".row-editor > div").hide();
                  if (rowEditor.treeService.rootPep[0].clase_objeto === "Inversión") {
                    $("#waapy_orden_clase_activo").parents(".row-editor > div").show();
                  }
                  let idInversion;
                  if ($event.values.id === "P13") {
                    idInversion = "P13";
                    $("#waapy_orden_clase_af").parents(".row-editor > div").show();
                  } else if ($event.values.id === "P20") {
                    idInversion = "P20";
                    $("#waapy_orden_clase_af").parents(".row-editor > div").show();
                  } else if ($event.values.id === "P12") {
                    idInversion = "P12";
                    $("#waapy_orden_clase_af").parents(".row-editor > div").hide();
                  }else{
                    idInversion = "P14";
                    $("#waapy_orden_clase_af").parents(".row-editor > div").hide();
                  }
                   /*else if ($event.values.id === "P31") {
                    idInversion = "P31";
                  } else if ($event.values.id === "P40") {
                    idInversion = "P40";
                  } else if ($event.values.id === "P41") {
                    idInversion = "P41";*/
                  if (rowEditor.treeService.rootPep[0].clase_objeto === "Gasto") {
                    $("#waapy_orden_clase").val("");
                    $("#waapy_orden_mascara").val("");
                    $("#buttons").children().eq(1).prop('disabled', true);
                    rowEditor.notificationService.openSnackMessageAction("La clase de orden [" + idInversion + "] no puede utilizarse en un proyecto de Gasto", "Aceptar", {
                      duration: 10000,
                      horizontalPosition: "center",
                      verticalPosition: "bottom"
                    });
                    $(".cdk-global-overlay-wrapper").css("height", "45%");
                  } else {
                    rowEditor.notificacionOrdenes();
                    this.asignarIdTemporal(idInversion, rowEditor);
                  }
                  break;
                case "GGEN": //Gasto
                case "P03": //Gasto
                  let id;
                  if ($event.values.id === "GGEN") {
                    id = "GGEN";
                  } else {
                    id = "P03";
                  }
                  if (rowEditor.treeService.rootPep[0].clase_objeto !== "Gasto") {
                    // setInterval(function(){$("#waapy_orden_clase").val("");},100);
                    // $("#waapy_orden_mascara").val("");
                    $("#buttons").children().eq(1).prop('disabled', true);
                    rowEditor.notificationService.openSnackMessageAction("La clase de orden [" + id + "] no puede utilizarse en un proyecto de inversión", "Aceptar", {
                      duration: 10000,
                      horizontalPosition: "center",
                      verticalPosition: "bottom"
                    });
                    $(".cdk-global-overlay-wrapper").css("height", "45%");
                  } else {
                    $("#buttons").children().eq(1).prop('disabled', true);
                    $("#waapy_orden_clase_activo").parents(".row-editor > div").hide();
                    // $("#waapy_orden_clase_activo").val(""); //lo vaciamos en las que no aparece AF para que cuando se muestre no tenga valor
                    // $("#waapy_orden_centro").parents(".row-editor > div").hide();
                  }
                  break;
                /*case "P18": //Gasto
                  $("#waapy_orden_clase_activo").parents(".row-editor > div").hide();
                  // $("#waapy_orden_clase_activo").val(""); //lo vaciamos en las que no aparece AF para que cuando se muestre no tenga valor
                  if (rowEditor.treeService.rootPep[0].clase_objeto === "Gasto") {
                    $("#waapy_orden_centro").parents(".row-editor > div").show();
                  }
                  if (rowEditor.treeService.rootPep[0].clase_objeto === "Inversión") {
                    $("#waapy_orden_clase").val("");
                    $("#waapy_orden_mascara").val("");
                    $("#buttons").children().eq(1).prop('disabled', true);
                    rowEditor.notificationService.openSnackMessageAction("La clase de orden [P18] no puede utilizarse en un proyecto de inversión", "Aceptar", {
                      duration: 10000,
                      horizontalPosition: "center",
                      verticalPosition: "bottom"
                    });
                    $(".cdk-global-overlay-wrapper").css("height", "45%");
                  } else {
                    rowEditor.notificacionOrdenes();
                    this.asignarIdTemporal("P18", rowEditor);
                  }
                  break;*/
              }
            }
          }
    },
      /** 
     * Método para controlar que cuando el usuario se encuentra editando un elemento, no pueda cambiar el nodo del árbol para evitar errores.
     */
    onCancelChanges(){
        if ( $("#waapy_proyecto_mascara").is(":visible") || $("#waapy_pep1_mascara").is(":visible") || $("#waapy_pep2_mascara").is(":visible")
        || $("#waapy_pep3_mascara").is(":visible") || $("#waapy_orden_mascara").is(":visible") ) {
          $("mat-tree input").prop('disabled', false);
        }
    },
   /** 
     * Método para asignar a las rows el valor correspondiente heredado dinamicamente, llamado desde el método "heritage"
     * @param arrayCurrentPep - Array con los ids de los campos específicos al elemento (pep u orden) actual
     * @param arrayRootPep - Array con los ids de los campos que heredan datos del elemento Proyecto. 
     * @param solicitud - No se usa ya que las fechas no aplican actualmente (controla si el proyecto es "nuevo" o "existente")
     * @param rowEditor - Componente customRowEditor, con acceso a todos los valores
     */
  heritageTables(arrayCurrentPep, arrayRootPep, solicitud, rowEditor){
    arrayCurrentPep.forEach( (propertie : string) => {
      let propertieRecortada=propertie.substring(11,propertie.length);
      /*
      if (propertie.includes("fecha")) {
        let moment_fecha = moment(rowEditor.treeService.currentPep[propertieRecortada]);
        rowEditor.row.value[propertie] = moment_fecha.isValid() == true ? moment_fecha.format('YYYY-MM-DD') + "T00:00:00.000Z" : "";
        if (propertie.includes("fecha_inicio") && solicitud === "existente") {
          let momentActual = moment();
          let momentHeredado = moment(rowEditor.treeService.currentPep[propertieRecortada]);
          if (momentHeredado < momentActual) {
            rowEditor.row.value[propertie] = momentActual.isValid() == true ? momentActual.format('YYYY-MM-DD') + "T00:00:00.000Z" : "";
          }
        }
      }...else{}*/
        //asignación forEach
        if (propertie === "waapy_pep3_actividad"){
          rowEditor.row.value[propertie] = rowEditor.treeService.currentPep["waapy_pep2_actividad"] && rowEditor.treeService.currentPep["waapy_pep2_actividad"].id ? rowEditor.treeService.currentPep["waapy_pep2_actividad"].id : rowEditor.treeService.currentPep["actividad"];
        }else if (propertie === "waapy_orden_actividad"){
          rowEditor.row.value[propertie] = rowEditor.treeService.currentPep["actividad"];
        }else if (propertieRecortada === "_destino_inversion"){
          rowEditor.row.value[propertie] = rowEditor.treeService.currentPep["waapy_pep3_destino_inversion"] ? rowEditor.treeService.currentPep["waapy_pep3_destino_inversion"] : rowEditor.treeService.currentPep["destino_inversion"];
        }else if(propertieRecortada === "_ceco_responsable"){
          rowEditor.row.value[propertie] = rowEditor.treeService.currentPep["ceco_responsable"];
        }
        else{
        rowEditor.row.value[propertie] = rowEditor.treeService.currentPep[propertieRecortada];
        }
    });
    arrayRootPep.forEach(propertie => {
      if (propertie.substring(11,propertie.length) == "_clase_proyecto"){
        rowEditor.row.value[propertie] = rowEditor.treeService.rootPep[0]["clase_proyecto"];
      }else if(propertie.substring(11,propertie.length) =="_clase_objeto"){
        rowEditor.row.value[propertie] = rowEditor.treeService.rootPep[0]["clase_objeto"];
      }else{
      rowEditor.row.value[propertie] = rowEditor.treeService.rootPep[0][propertie.substring(11,propertie.length)];
      }

    });
  },
  /** 
     * Método asíncrono -> Método para comprobar element_list con los valores de la mascara introducidos en las tablas. Llamado desde "validateSave"
     * @param mascaraNueva - Máscara introducida por el usuario para el elemento actual
     * @param visibilityService - visibilityService para obtener resultados de duplicados en SAP
     * @param nombreTabla - Identificador de la tabla donde se intenta guardar sin el prefijo "waapy_tabla_" (Ej: 'pep1')
     * @param taskId - taskDefinitionKey identificador de la tarea actual
     * @param rowEditor - Componente customRowEditor, con acceso a todos los valores
     * @return {Object} validationCorrect
     */
  async comprobarDuplicadosVariables(mascaraNueva, visibilityService: WidgetVisibilityService, nombreTabla, taskId, rowEditor: CustomRowEditorComponent) {
    return await visibilityService.getTaskProcessVariable(taskId).toPromise().then(async(varia: any[]) => {
      let mascara = mascaraNueva;
      let mascaras;
      let valoresMascaras;
      let dinamicMsg;
      let url='/WS_BPM_REST/jcmouse/restapi/sap_pi/CHECK_ELEMENT_EXISTS/ELEMENTOS_PEP/';
      let validationCorrect: any = new ErrorMessageModel({
        message: ""
      });

      validationCorrect.isValid=true;
      if (nombreTabla == "proyecto") {
        url += 'PROJECT_DEFINITION/';
        dinamicMsg="La máscara de este proyecto ya existe en SAP";
      } else if (nombreTabla == "pep1" || nombreTabla == "pep2" || nombreTabla == "pep3") {
        url += 'PEP/';
        dinamicMsg="La máscara de este PEP ya existe en SAP";
      }else{ //si es ordenImp y la clase de orden necesita máscara, lo comprobamos
        if (rowEditor.row.value.waapy_orden_clase && (rowEditor.row.value.waapy_orden_clase.id === "GGEN" || rowEditor.row.value.waapy_orden_clase.id === "P03")){
        url+='ORDEN/';
        dinamicMsg="La máscara de orden ya existe en SAP";
        mascara = rowEditor.row.value["waapy_orden_mascara"];
        }
      }
      let flagExiste = false;
      if (mascara!== "" && mascara !==undefined){
       await rowEditor.http.get(
        url + mascara, { observe: 'response' }).toPromise()
        .then(response => {
          let correct = response.body["MT_HUBCOM_RES"]["CORRECTO"];
          if (correct == "X") {
            flagExiste = true;
            if (flagExiste) {
               validationCorrect.isValid = false;
               validationCorrect.message = dinamicMsg;
            }
          }
        });
      }
      for (let values of varia) {
        if (values.id == "waapy_elements_list") {
          mascaras = JSON.parse(values.value);
          valoresMascaras = mascaras[nombreTabla];
          for (values of valoresMascaras) {
            if (mascara == values) {
              validationCorrect.isValid=false;
               validationCorrect.message="El elemento ya esta en un proceso en ejecución";
              return validationCorrect;
            }
          }
        }
      }
        return validationCorrect;
    });
  },
  /** 
     * Método para generar un id aleatorio a las clases_orden que no necesitan máscara. Llamado desde "onAutocompleteValueChange"
     * @param id - Id del campo clase_orden perteneciente a la orden de imputación
     * @param rowEditor - Componente customRowEditor, con acceso a todos los valores
     */
  asignarIdTemporal(id, rowEditor: CustomRowEditorComponent) {
    let contadorCoincidentes = 0;
    let valorAleatorio = 0;
    if (rowEditor.table.rows && rowEditor.table.rows.length !== 0) {
      for (let i = 0; i < rowEditor.table.rows.length; i++) {
        if (rowEditor.table.rows[i].value["waapy_orden_mascara"].startsWith("ID")) {
          contadorCoincidentes++;
        }
      }
    }
    valorAleatorio = this.asignarIdAleatorio(100, 999);
    let valor = "IDtemp" + valorAleatorio;
    if (id === "P12" || id === "P13" || id === "P14" || id === "P20" ) { //|| id === "P31" || id === "P32" || id === "P40" || id === "P41" || id === "P18" 
      $("#waapy_orden_mascara").val(valor + contadorCoincidentes);
      rowEditor.row.value.waapy_orden_mascara = valor + contadorCoincidentes;
      $("#waapy_orden_mascara").prop("disabled", true);
    }
  },
  /** 
     * Método para generar un número aleatorio. Genera un número en el rango entre el mínimo y el máximos ambos dos inclusive
     * @param minimo - Valor mínimo inclusive
     * @param maximo - Valor máximo inclusive
     * @return {number} entero aleatorio
     */
  asignarIdAleatorio(minimo,maximo){
    return Math.round(Math.random() * (maximo - minimo) + minimo);
  }


}

