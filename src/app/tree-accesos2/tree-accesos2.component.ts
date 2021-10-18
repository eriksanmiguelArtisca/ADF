import { Component, ViewEncapsulation, SimpleChanges, OnChanges, Input, ChangeDetectorRef, ViewChild, AfterViewInit } from '@angular/core';
import {
/*   DynamicTableRow,
  FormFieldModel, */
  FormService,
  /* ValidateDynamicTableRowEvent, */
  WidgetComponent,
  WidgetVisibilityService
} from '@alfresco/adf-core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTree, MatTreeNestedDataSource } from '@angular/material/tree';
/* import { isUndefined } from 'util'; */
import { Subject } from 'rxjs';
//import { WSAF } from '../components/processes/generic/task-details/workflows-logic';
import { ArbolAccesos, TreeAccesos2Service } from '../services/tree-accesos2.service';
/* import { takeUntil } from 'rxjs/operators'; */


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
  /** field. */
  @Input()
  selectproject: string = "";

  @Input()
  selectedNode: ArbolAccesos = null;

  @ViewChild('treeAccesos2Component')
  treeAccesos2Component: MatTree<ArbolAccesos>;

  arbol : ArbolAccesos[] =  /* null; */[ { NumeroItem : "",denominacion: "" ,checked: false, children : null}] ;
  private onDestroy$ = new Subject<boolean>();

  constructor(formService: FormService, cd : ChangeDetectorRef,private treeAccesos2Service : TreeAccesos2Service,visibilityService : WidgetVisibilityService,) {
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
    console.log("!!");
    //console.log(this.treeControl);
    //console.log(JSON.parse(this.field.value));
    try {  
      /*if(!Array.isArray(this.field.value) ){
        this.arbol = [JSON.parse(this.field.value)];
      }else {
        this.arbol = JSON.parse(this.field.value);
      }*/
      this.arbol = this.field.value;
      console.log( this.arbol);
      this.dataSource.data =  this.arbol;
      this.treeAccesos2Service.rootPep = this.dataSource.data;
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
    console.log(this.selectedNode);
    this.treeAccesos2Service.selectPep(this.selectedNode);
    this.onFieldChanged(this.field);
  }

  marcar(seleccionado) {
    for (let i = 0; i < this.arbol.length; i++){
      for(let j=0;j<this.arbol[i].children.length;j++){
        for(let k=0;k<this.arbol[i].children[j].children.length;k++){
          if(this.arbol[i].children[j].children[k].NumeroItem==seleccionado){
            if (!this.arbol[i].children[j].children[k].checked){
              this.arbol[i].children[j].children[k].checked = true;
            }else{
              this.arbol[i].children[j].children[k].checked = false;
            }
            console.log(this.arbol[i].children[j].children[k]);
          }
        }
      }
    }
  }

  hasChild = (_: number, node: ArbolAccesos) => !!node.children && node.children.length > 0;
}

