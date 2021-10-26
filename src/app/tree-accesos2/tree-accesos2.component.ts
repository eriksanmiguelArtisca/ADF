import { Component, ViewEncapsulation, SimpleChanges, OnChanges, Input, ChangeDetectorRef, ViewChild, AfterViewInit } from '@angular/core';
import {
  FormFieldModel,
/*DynamicTableRow,
  FormFieldModel,
  ValidateDynamicTableRowEvent, */
  FormService,
  WidgetComponent,
  WidgetVisibilityService
} from '@alfresco/adf-core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTree, MatTreeNestedDataSource } from '@angular/material/tree';
import { Subject } from 'rxjs';
import { ArbolAccesos, TreeAccesos2Service } from '../services/tree-accesos2.service';
import { HttpClient } from '@angular/common/http';
import { isNullOrUndefined } from 'util';

/*import { isUndefined } from 'util'; 
import { DialogConfirmacionAction } from '../components/processes/workflows/edp/dialogs/dialogs-Confirmacion.component';
import { BpmAppsService } from '../services/bpm-apps.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
/*import { takeUntil } from 'rxjs/operators'; 
import { WSAF } from '../components/processes/generic/task-details/workflows-logic';*/


@Component({
  selector: 'apa-tree-accesos',
  templateUrl: './tree-accesos2.component.html',
  styleUrls: ['./tree-accesos2.component.scss'],
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
export class TreeAccesos2Component extends WidgetComponent implements OnChanges,AfterViewInit {
  @Input() treeControl = new NestedTreeControl<ArbolAccesos>(node => node.children);
  @Input() dataSource = new MatTreeNestedDataSource<ArbolAccesos>();
  
  @Input()
  selectproject: string = "";

  @Input()
  selectedNode: ArbolAccesos = null;

  @ViewChild('treeAccesos2Component')
  treeAccesos2Component: MatTree<ArbolAccesos>;

  arbol : ArbolAccesos[] =[ {tipo:"", numeroItem : "",denominacion: "" ,checked: false, children : null}] ;
  private onDestroy$ = new Subject<boolean>();

  constructor(formService: FormService, cd : ChangeDetectorRef,private treeAccesos2Service : TreeAccesos2Service,visibilityService : WidgetVisibilityService,
    /*private router : Router, private bpmAppsService : BpmAppsService,private dialog: MatDialog,*/private http:HttpClient) {
    super(formService);
    //this.treeFormService = formService;
    /* this.dataSource.data = TREE_DATA; */
    
    this.treeAccesos2Service.treeChanged$.subscribe( (tree:ArbolAccesos[]) => {
      this.dataSource.data = null;
      this.dataSource.data = tree;
      this.treeAccesos2Component.treeControl.collapseAll();
      this.treeAccesos2Service.currentPep = null;
    });
    
    /* formService.validateDynamicTableRow.pipe(takeUntil(this.onDestroy$)).subscribe(
    ); */

  }

  ngAfterViewInit(){
    try {  
      /*(async () => {
        this.arbol = await this.field.value;
        this.dataSource.data = await this.arbol;
        this.treeAccesos2Service.rootPep = await this.dataSource.data;
        console.log("-----");
        console.log(await this.arbol);
      })();*/
        
        /*this.treeAccesos2Service.rootPep = await this.cargaDatos().then(data => this.treeAccesos2Service.rootPep = data);
        console.log(this.treeAccesos2Service.rootPep);*/
        this.cargaDatos();
    }catch(E){
      console.log(E);
    }
  }

  /*cargarTablas(row , e, fields){
    if( !row.isNew && this.treeAccesos2Service.lastEditRow && this.dataSource.data && this.dataSource.data[0] && e.summary.isValid){
      let node = null;
      let currentTable = e.field.id.replace("_tabla","");
      let currentMask = this.treeAccesos2Service.lastEditRow.value[currentTable + '_numeroItem'];
      let tipoPep = this.treeAccesos2Service.lastEditRow.value[0];

     
      if( this.dataSource.data && currentMask){
        let propertiesChanged = [] ;
        Object.keys(row.value).forEach(key => {
            if( this.treeAccesos2Service.lastEditRow.value[key] !== row.value[key]){
                let splice = key.split("_").slice(2).join("_");
                propertiesChanged.push(splice );
            }
        });
        node = this.treeAccesos2Service.searchTree(this.dataSource.data[0], currentMask ,tipoPep );

        if(node){
          this.treeAccesos2Service.changeChilren(node, propertiesChanged, row);
          this.dataSource.data = null;
          this.dataSource.data = this.arbol;
        }
      }
    }
    
    this.field.value = JSON.stringify(this.dataSource.data);
    this.treeAccesos2Service.rootPep = this.dataSource.data;
  }*/

  llamadaRecursiva(arbolDeAccesos){
    for (let a = 0; a <arbolDeAccesos.length; a++){
      if(arbolDeAccesos[a].children){
        arbolDeAccesos[a].checked==false;
        return (this.llamadaRecursiva(arbolDeAccesos[a].children));
      }else{
        arbolDeAccesos[a].checked==false;
      }
    }
  }

  async cargaDatos(){
    await this.http.get('/WS_BPM_REST/jcmouse/restapi/get_accesosTree').toPromise();
    this.arbol=this.field.value;
    if(!isNullOrUndefined(this.arbol)){ 
        for (let i = 0; i < this.arbol.length; i++){
            for(let j=0;j<this.arbol[i].children.length;j++){
                for(let k=0;k<this.arbol[i].children[j].children.length;k++){
                    this.arbol[i].children[j].children[k].checked=false;
                }
            }
        }
        //this.llamadaRecursiva(this.arbol);
    }

    this.dataSource.data = this.arbol;
    this.treeAccesos2Service.rootPep = this.dataSource.data;

    //getSpeedClass = () => (this.currentSpeed < this.getThreshold() ? 'good' : 'warning');
    //private getThreshold = () => this.topSpeed * 0.8;
  }

  onFieldChanged(field: FormFieldModel) {
    super.onFieldChanged(field);
    this.cargaDatos();
  }
  replaceCharacters(textString , replaceValues){
    replaceValues.forEach(replaceValue => {
      let searchRegExp = new RegExp(replaceValue[0], 'g');
      textString = textString.replace(searchRegExp,replaceValue[1]);
    });
    return textString;
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
    //let nivel = this.treeAccesos2Service.searchTreeLevel(this.arbol[0],this.selectedNode,0);
    //this.selectedNode.tipoPep = nivel;
    this.treeAccesos2Service.selectPep(this.selectedNode);
    this.onFieldChanged(this.field);
  }

  marcar(seleccionado) {
    for (let i = 0; i < this.arbol.length; i++){
      for(let j=0;j<this.arbol[i].children.length;j++){
        for(let k=0;k<this.arbol[i].children[j].children.length;k++){
          if(this.arbol[i].children[j].children[k].numeroItem==seleccionado){
            if ((this.arbol[i].children[j].children[k].checked==false)){
              this.arbol[i].children[j].children[k].checked = true;
            }else{
              this.arbol[i].children[j].children[k].checked = false;
              this.arbol[i].children[j].checked=false;
            }
            console.log(this.arbol[i].children[j].children[k]);
          }
        }
      }
    }
  }

  allComplete(numero){
    for (let i = 0; i < this.arbol.length; i++){  
      for(let j=0;j<this.arbol[i].children.length;j++){
        if(this.arbol[i].children[j].numeroItem==numero){
          if (!this.arbol[i].children[j].checked){
            this.arbol[i].children[j].checked = true;
            for(let k=0;k<this.arbol[i].children[j].children.length;k++){
              this.arbol[i].children[j].children[k].checked = true;
            }
          }else{
            this.arbol[i].children[j].checked = false;
            for(let k=0;k<this.arbol[i].children[j].children.length;k++){
              this.arbol[i].children[j].children[k].checked = false;
            }
          }
        }
      }
    }
  }

  /*abrirProceso(proceso,opciones){
    this.abrirDialog(proceso,opciones);
  }

  abrirDialog(proceso,opciones:Array<any> ){
    const appId = this.bpmAppsService.selected_app.id ? this.bpmAppsService.selected_app.id : 0;
    if(opciones.length > 0){
      const dialogRef = this.dialog.open(DialogConfirmacionAction, {
        data: {
            options: opciones,
            selectedOption: null
        },
        minWidth: '250px'
      });
      dialogRef.afterClosed().subscribe((result) => {
        if( !isUndefined(result) ){
          this.navegarStartForm(result, appId);
        }
      });
    }else {
      this.navegarStartForm(proceso, appId);
    }
  }

  navegarStartForm(proceso: any, appId: any) {
    this.router.navigate([`apps/${appId}/processes/new/${proceso}` ] );
  }*/

  hasChild = (_: number, node: ArbolAccesos) => node.tipo=="C" || node.tipo=="R";
}

