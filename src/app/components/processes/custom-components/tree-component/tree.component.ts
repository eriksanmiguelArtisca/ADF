import { Component, ViewEncapsulation, SimpleChanges, OnChanges, Input, ChangeDetectorRef, ViewChild, AfterViewInit } from '@angular/core';
import {
  DynamicTableRow,
  FormFieldModel,
  FormService,
  ValidateDynamicTableRowEvent,
  WidgetComponent,
  WidgetVisibilityService
} from '@alfresco/adf-core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTree, MatTreeNestedDataSource } from '@angular/material/tree';
/* import { isUndefined } from 'util'; */
import { Subject } from 'rxjs';
import { CSA_WAAPY } from '../../generic/task-details/workflows-logic';
import { ArbolPeps, TreePepsService } from '../../../../services/tree-peps.service';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'tree',
  templateUrl: 'tree.component.html',
  styleUrls: ['tree-checklist.css'],
  host: {
    '(click)': 'event($event)',
    '(blur)': 'event($event)',
    '(change)': 'event($event)',
    '(focus)': 'event($event)',
    '(focusin)': 'event($event)',
    '(focusout)': 'event($event)',
    '(input)': 'event($event)',
    '(invalid)': 'event($event)',
    '(select)': 'event($event)',
  },
  encapsulation: ViewEncapsulation.None
})
export class TreeComponent extends WidgetComponent implements OnChanges,AfterViewInit {
  @Input() treeControl = new NestedTreeControl<ArbolPeps>(node => node.children);
  @Input() dataSource = new MatTreeNestedDataSource<ArbolPeps>();
  /** field. */
  @Input()
  selectproject: string = "";

  @Input()
  selectedNode: ArbolPeps = null;

  @ViewChild('treeComponent')
  treeComponent: MatTree<ArbolPeps>;

  arbol : ArbolPeps[] =  /* null; */[ { mascara : "",desc : "" , children : null}] ;
  private onDestroy$ = new Subject<boolean>();
  private treeFormService : FormService; 
  constructor(formService: FormService, cd : ChangeDetectorRef,private treeService : TreePepsService,visibilityService : WidgetVisibilityService,) {
    super(formService);
    this.treeFormService = formService;
    /* this.dataSource.data = TREE_DATA; */
    
    this.treeService.treeChanged$.subscribe( (tree:ArbolPeps[]) => {
      this.dataSource.data = null;
      this.dataSource.data = tree;
      this.treeComponent.treeControl.collapseAll();
      this.treeService.currentPep = null;
    });
 
    formService.validateDynamicTableRow.pipe(takeUntil(this.onDestroy$)).subscribe(
        (e: ValidateDynamicTableRowEvent) => {
           if(e.form.json.processDefinitionKey == 'csa_waapy_'){
            const fields: FormFieldModel[] = e.form.getFormFields();
            const row: DynamicTableRow = e.row;
            
            try {
              CSA_WAAPY.validateDynamicTableRow(row , e, fields,treeService,this.treeFormService,visibilityService)   
              this.cargarTablas(row , e, fields);
            } catch (error) {
              e.summary.isValid = false;
              e.summary.message = "Ha surgido un error al guardar los datos actuales";
              console.error("Exception : " + error);
            }
          } 
      }
    );

  }

  ngAfterViewInit(){
    try {
      this.selectedNode = null;
      let taskDefinitionKey = this.field.form.json.taskDefinitionKey;
      if ( (this.field.value && this.field.form.values && this.field.form.values.waapy_solicitud &&
        this.field.form.values.waapy_solicitud.id == "existente" && taskDefinitionKey == "waapy_t1") ||
        (this.field.value && this.field.form.values && taskDefinitionKey == "wampy_t1") ) { 
        
        let prueba  = this.field.value;
        let replaceValues = [ ["PERFIL_PROYECTO_CODE","perfil_proyecto_code"],["VALOR","mascara"],["DESCRIPTION","desc"],["DENOMINACION","desc"],["FECHA_INICIO","fecha_inicio"],["FECHA_FIN","fecha_fin"],["clase_proyecto","clase_proyecto"],
        ["CENTRO_BENEFICIO","cebe"],["ACTIVIDAD","actividad"],["DEST_INVERSION","destino_inversion"],["RESP_COSTCENTER","ceco_responsable"],
        ["SOL_COSTCENTER","ceco_solicitante"],["INV_PROT_AMB","inversion_prot"] ];
        prueba = this.replaceCharacters(prueba,replaceValues);
        this.field.value = prueba;
        let valueParsed = JSON.parse(this.field.value);
        if(!Array.isArray(valueParsed) ){
          this.arbol = [valueParsed];
        }else {
          this.arbol = valueParsed;
        }
        
        let first_character = this.arbol[0].mascara.charAt(0);
        let last_character = "";
        //comprobación proyecto real existente
        if (first_character === "R"){
          last_character = "I";
        }else{
          last_character = this.arbol[0].mascara.charAt(this.arbol[0].mascara.length-1);
        }
        this.arbol[0].clase_proyecto = first_character+last_character;
        this.arbol[0].perfil_proyecto =  first_character === "R" ? "Real": "Gestional";
        this.field.form.values.waapy_tabla_proyecto = [ {
          "waapy_proyecto_mascara": this.arbol[0].mascara ,
          "waapy_proyecto_clase_proyecto": first_character+last_character ,
          // Hay que añadir los 2 campos para proyectos existentes
          "waapy_proyecto_perfil": first_character === "R" ? "Real": "Gestional"  ,
          "waapy_proyecto_clase_objeto": this.arbol[0]["CLASE_OBJETO"]  ,
          "waapy_proyecto_perfil_code": this.arbol[0]["perfil_proyecto_code"]  ,
          "waapy_proyecto_desc": this.arbol[0]["desc"]  ,
          "waapy_proyecto_correcto" : true                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
        }  ];      
        this.field.form.values.waapy_proyecto_creado = true;
        
        // this.dataSource.data = null;
      }else{
        this.arbol = JSON.parse(this.field.value);
      }
      this.dataSource.data =  this.arbol;
      this.treeService.rootPep = this.dataSource.data;

    } catch (error) {
      console.error("Exception : " + error);
    }
    
   
  }

  cargarTablas(row , e, fields){
    
    //Si es una modfificacion recorremos el arbol y actulizamos el arbol
    if( !row.isNew && this.treeService.lastEditRow && this.dataSource.data && this.dataSource.data[0] && e.summary.isValid){
      let node = null;
      let currentTable = e.field.id.replace("_tabla","");
      if (currentTable=="waapy_ordenes"){
        currentTable="waapy_orden";
      }
      let currentMask = this.treeService.lastEditRow.value[currentTable + '_mascara'];
      let tipoPep = this.treeService.lastEditRow.value["tipoPep"];

     
      if( this.dataSource.data && currentMask){
        let propertiesChanged = [] ;
        Object.keys(row.value).forEach(key => {
            if( this.treeService.lastEditRow.value[key] !== row.value[key]){
                let splice = key.split("_").slice(2).join("_");
                propertiesChanged.push(splice );
            }
        });
        node = this.treeService.searchTree(this.dataSource.data[0], currentMask ,tipoPep );


        if(node){
          this.treeService.changeChilren(node, propertiesChanged, row);
          /*  if (currentTable == "waapy_pep1") {
            node.desc = node.denominacion;
          } */
          this.dataSource.data = null;
          this.dataSource.data = this.arbol;
        }
      }
    }
    //Si es una nueva linea hacemos una insercion en el arbol
    if( row  && row.isNew && e.summary.isValid){
      let str = JSON.stringify(e.row.value);
      if(e.field.id == "waapy_tabla_proyecto"){
        let replaceValues = [["waapy_proyecto_perfil","perfil_proyecto"],["waapy_proyecto_desc","desc"], ["waapy_proyecto_mascara","mascara"],["waapy_proyecto_comentarios","coment"],
        ["waapy_proyecto_clase_objeto","clase_objeto"],["waapy_proyecto_clase_proyecto","clase_proyecto"],["waapy_proyecto_fecha_inicio","fecha_inicio"],["waapy_proyecto_fecha_fin","fecha_fin"]];
        str = this.replaceCharacters(str,replaceValues);
        var converted  = JSON.parse(str);

        this.arbol  = [converted] ; 
        if(!row.isNew){
          if( this.dataSource.data && this.dataSource.data[0] ){
            this.arbol[0].children = this.dataSource.data[0].children;
          }
        }else {
          this.dataSource.data = this.arbol;
        }
  
      }
      if(e.field.id == "waapy_tabla_pep1"){ 
        let replaceValues = [ ["waapy_pep1_denominacion","desc"],["waapy_pep1_mascara","mascara"],["waapy_pep1_comentarios","coment"],["waapy_pep1_fecha_inicio","fecha_inicio"],
        ["waapy_pep1_fecha_fin","fecha_fin"],["waapy_pep1_clase_proyecto","clase_proyecto"],["waapy_pep1_clase_objeto","clase_objeto"],["waapy_pep1_ceco_responsable","ceco_responsable"],
        ["waapy_pep1_ceco_solicitante","ceco_solicitante"]];
        str = this.replaceCharacters(str,replaceValues);
        
        var converted  = JSON.parse(str);
        if(this.arbol[0].children && this.arbol[0].children.length > 0){
          this.arbol[0].children.push(converted);
        }else {
          this.arbol[0].children = [converted];
        }
        // Asignamos el valor null volvemos a asignar el arbol
        // si no se hace no detecta los hijos
          this.dataSource.data = null;
          this.dataSource.data = this.arbol;
      }else if(e.field.id == "waapy_tabla_pep2"){
        let replaceValues = [ ["waapy_pep2_mascara","mascara"],["waapy_pep2_desc","desc"],["waapy_pep2_fecha_inicio","fecha_inicio"],["waapy_pep2_fecha_fin","fecha_fin"],["waapy_pep2_ceco_responsable","ceco_responsable"],
        ["waapy_pep2_ceco_solicitante","ceco_solicitante"],["waapy_pep2_inversion_prot","inversion_prot"],["waapy_pep2_destino_inversion","destino_inversion"],["waapy_pep2_cebe","cebe"]];
        str = this.replaceCharacters(str,replaceValues);
        
        var converted  = JSON.parse(str);
        if(this.treeService.searchTree( this.treeService.rootPep[0] ,converted.mascara) == null ){
          this.treeService.compruebaCargaTablas(e.field.id,this.selectedNode,converted,this.dataSource);
          const data  = this.dataSource.data ;
          // Asignamos el valor null volvemos a asignar el arbol
          // si no se hace no detecta los hijos
          
          this.dataSource.data = null;
          this.dataSource.data = data;
        }

      }else if(e.field.id == "waapy_tabla_pep3"){
        let replaceValues = [ ["waapy_pep3_mascara","mascara"],["waapy_pep3_desc","desc"],["waapy_pep3_fecha_inicio","fecha_inicio"],["waapy_pep3_fecha_fin","fecha_fin"],["waapy_pep3_cebe","cebe"],
        ["waapy_pep3_actividad","actividad"],["waapy_pep3_inversion_prot","inversion_prot"],["waapy_pep3_ceco_responsable","ceco_responsable"], ["waapy_pep3_ceco_solicitante","ceco_solicitante"]];
        str = this.replaceCharacters(str,replaceValues);

        var converted  = JSON.parse(str);
        if(this.treeService.searchTree( this.treeService.rootPep[0],converted.mascara) == null ){
          this.treeService.compruebaCargaTablas(e.field.id,this.selectedNode,converted,this.dataSource);
          const data  = this.dataSource.data ;
          // Asignamos el valor null volvemos a asignar el arbol
          // si no se hace no detecta los hijos
          this.dataSource.data = null;
          this.dataSource.data = data;
        }
        
      }else if(e.field.id == "waapy_tabla_ordenes"){
        let replaceValues = [["waapy_orden_mascara","mascara"]];
        str = this.replaceCharacters(str,replaceValues);
        var converted  = JSON.parse(str);

        this.treeService.compruebaCargaTablas(e.field.id,this.selectedNode,converted,this.dataSource);
        const data  = this.dataSource.data ;
        // Asignamos el valor null volvemos a asignar el arbol
        // si no se hace no detecta los hijos
        this.dataSource.data = null;
        this.dataSource.data = data;
        
      }
    }
    this.field.value = JSON.stringify(this.dataSource.data);
    this.treeService.rootPep = this.dataSource.data;
  }

  replaceCharacters(textString , replaceValues){
    replaceValues.forEach(replaceValue => {
      let searchRegExp = new RegExp(replaceValue[0], 'g');
      textString = textString.replace(searchRegExp,replaceValue[1]);
    });
    return textString;
  }

  getColor(node : ArbolPeps ){
   
    // Si estamos creando peps de un proyecto existente les marcamos de otro color en el arbol
    if(this.field.form.values && this.field.form.values.waapy_solicitud && this.field.form.values.waapy_solicitud.id === "existente" && node["newPep"] === true){
      return "cornflowerblue";
    }
    return null;
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    const field = changes['field'];
    if (field && field.currentValue) {
      return;
    }
  }

  valueChanged() {
    let nivel = this.treeService.searchTreeLevel(this.arbol[0],this.selectedNode,0);
    this.selectedNode.tipoPep = nivel;
    this.treeService.selectPep(this.selectedNode);
    this.onFieldChanged(this.field);
  }

  hasChild = (_: number, node: ArbolPeps) => !!node.children && node.children.length > 0;
}
