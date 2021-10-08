
import { DropdownEditorComponent, DynamicTableModel, DynamicTableRow, FormService, FormFieldOption, LogService } from '@alfresco/adf-core'; //ErrorMessageModel,FormFieldEvent
import { DynamicTableColumnOption } from '@alfresco/adf-core/form/components/widgets/dynamic-table/dynamic-table-column-option.model';
import { DynamicTableColumn } from '@alfresco/adf-core/form/components/widgets/dynamic-table/dynamic-table-column.model';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { isArray, isNullOrUndefined, isString } from "util"; //isArray //isObject isUndefined
import { ENTER, ESCAPE } from '@angular/cdk/keycodes';
import { FormChangesService } from '../../../../../../services/form-changes.service';
import { TreePepsService } from '../../../../../../services/tree-peps.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


 
declare var $: any; 

@Component({
  selector: 'dynamic-dropdown-editor',
  templateUrl: './dynamic-dropdown-editor.component.html',
  styleUrls: ['./dynamic-dropdown-editor.component.scss']
})
export class DynamicDropdownEditorComponent extends DropdownEditorComponent  implements OnInit,AfterViewInit,OnDestroy {
  value: any = null;
  options: DynamicTableColumnOption[] = [];

  minTermLength: number = 1;
  oldValue: string;
  error: Boolean;
  typeCombo: string;
  dynamicField : Object [];
  when : Object;
  // emptyCombos : boolean;
  sub: Subscription;
  private onDestroy$ = new Subject<boolean>();


  @Input()
  table: DynamicTableModel;

  @Input()
  row: DynamicTableRow;

  @Input()
  column: DynamicTableColumn;

  @Output() 
  onAutocompleteValueChange: EventEmitter<any> = new EventEmitter<any>();

  
  constructor(formService: FormService, logService: LogService,public http: HttpClient,private formChangesService:FormChangesService, public treeService: TreePepsService) {
    super(formService,logService);
  }

  ngOnInit() {
    let columndynamic;
    if (this.treeService.rootPep && this.treeService.rootPep[0].clase_objeto == "Inversión") {
      columndynamic = (JSON.parse(this.table.json.params.customProperties.columndynamic)[0].fields.filter(dynamicColumns => dynamicColumns.name == this.column.id));
    } else {
      columndynamic = (JSON.parse(this.table.json.params.customProperties.columndynamic)[1].fields.filter(dynamicColumns => dynamicColumns.name == this.column.id));
    }
    let projectType = JSON.parse(this.table.json.params.customProperties.columndynamic);
    this.when = projectType['when'];
    this.dynamicField = columndynamic;
    this.typeCombo = this.dynamicField[0]["type"];
    this.error = false;

     
    //Tras cancelar la creación de la ordenImp o haber creado una, se ejecutan 2 veces las llamadas -> unsuscribe
    this.formChangesService.formFieldValueChanged.pipe(takeUntil(this.onDestroy$)).subscribe(
      (event) => {
        if (event.column.id == "waapy_orden_clase" && this.column.id !== "waapy_orden_clase"){
          this.column.options = [];
          this.options = this.column.options;
        }else if (event.column.id == "waapy_orden_clase_activo" && this.column.id !== "waapy_orden_clase" && this.column.id !=="waapy_orden_clase_activo"){
          this.column.options = [];
          this.options = this.column.options;
        }else if (event.column.id == "waapy_orden_clase_af" && this.column.id !== "waapy_orden_clase" && this.column.id !=="waapy_orden_clase_activo" && this.column.id !== "waapy_orden_clase_af"){
          this.column.options = [];
          this.options = this.column.options;
        }else if (event.column.id == "waapy_orden_desglose1" && this.column.id !== "waapy_orden_clase" && this.column.id !=="waapy_orden_clase_activo" && this.column.id !== "waapy_orden_desglose1"){
          this.column.options = [];
          this.options = this.column.options;
        }else if (event.column.id == "waapy_orden_desglose2" && this.column.id !== "waapy_orden_clase" && this.column.id !=="waapy_orden_clase_activo" && this.column.id !== "waapy_orden_desglose1" && this.column.id !== "waapy_orden_desglose2"){
          this.column.options = [];
          this.options = this.column.options;
        }
        
        if (this.dynamicField.length == 1) { //los campos != a desglose1 || desglose2 || criterio_clasificacion no tienen campo 'when'
          if (this.dynamicField[0]["dependsOn"].includes(event.column.id) && this.dependsOnCheck(0)) {
            this.queryOptions(this.dynamicField[0]);
          }
        } else {
          for (let i = 0; i < this.dynamicField.length; i++) {
            if (this.row.value[this.dynamicField[i]["when"]["field"]].id === this.dynamicField[i]['when']['value'] &&
              this.dynamicField[i]["dependsOn"].includes(event.column.id) && this.dependsOnCheck(i)) {
              this.queryOptions(this.dynamicField[i]);
            }
          }
        }
      });
       /*Recuperación de datos en combos, Typehead Methods*/
    const field = this.table.field;
    if (field) {
      this.options = this.column.options || [];
      this.value = this.table.getCellValue(this.row, this.column);
    }
  }

  ngAfterViewInit(): void {
    //  setTimeout(() => {
      //la llamada por defecto devuelve [], por tanto es necesario realizar la llamada tras cargar el formulario para no machacar los valores
      /* if (this.dependsOnCheck(0)) {//only for clase_orden because depends of destino_inversion
        this.queryOptions(this.dynamicField[0]);
      } */
    //  }, 500);
    if (this.dynamicField.length == 1) { //los campos != a desglose1 || desglose2 || criterio_clasificacion no tienen campo 'when'
      if (this.dependsOnCheck(0)) {
        this.queryOptions(this.dynamicField[0]);
      }
    } else {
      for (let i = 0; i < this.dynamicField.length; i++) {
        if (this.row.value[this.dynamicField[i]["when"]["field"]].id === this.dynamicField[i]['when']['value'] && this.dependsOnCheck(i)) {
          this.queryOptions(this.dynamicField[i]);
        }
      }
    }
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  dependsOnCheck(index): boolean {
    let dependsCheckValid = true;
    this.dynamicField[index]["dependsOn"].forEach(fieldId => {
      if (!this.row.value[fieldId] && !this.table.form.values[fieldId]) dependsCheckValid = false; //check if row value has value
    });
    return dependsCheckValid;
  }

  // Funcion para consultar los valores del combo
  queryOptions(filterField) {
    console.log(filterField);
    let restUrl = this.column.restUrl;
    // Recorremos los campos de los que depende
    filterField.dependsOn.forEach(dependsOnField => {
      let fieldValue = this.row.value[dependsOnField] ? this.row.value[dependsOnField] : this.table.form.values[dependsOnField];
      // Remplazamos el valor del dependsOnField
      if (!isString(fieldValue)) restUrl = restUrl.replace("{" + dependsOnField + "}", fieldValue.id);
      else restUrl = restUrl.replace("{" + dependsOnField + "}", fieldValue);
    });

    // Remplazamos los valores que no se han rellenado en el dependsOn y los ponemos como nulos para indicar que van vacios
    let regex = /{(.*?)}/g;
    restUrl = restUrl.replace(regex, null);
    //Hacemos la llamada a la API
    this.http.get(this.column.endpoint.path + "/" + restUrl, { observe: 'response' }).subscribe(response => {
      //mapeamos los combos de respuesta controlando que la respuesta sea array o texto
      if (response.body["response"] == "") {
        this.error = true;
        /*Vacíamos los valores del combo para los casos en que la respuesta sea vacía y siga habiendo valores
        cargados previamente (ej: crear una orden con una clase y luego con otra)*/
        this.column.options = [];
        this.options = this.column.options;
      }
      else {
        this.error = false;
        this.column.options = []; // si se desea crear una orden tras cancelar una previa los combos tienen datos y la funcionalidad del stencil no es correcta
        let dynamicTableColumnOption: DynamicTableColumnOption[] = response.body ? isArray(response.body["response"]) ? response.body["response"] : [response.body["response"]] : [];
        this.column.options = dynamicTableColumnOption.map(comboOption => { return { id: comboOption["value"], name: comboOption["text"] } });
        this.options = this.column.options;
      }
    }, error => console.log(error));
  }


/*
TYPEHEAD METHODS
*/

onValueChanged(row: DynamicTableRow, column: DynamicTableColumn, event: any) {
  let value: any = (<HTMLInputElement>event).value;
  value = column.options.find((opt) => opt.id === value);
  if (!isNullOrUndefined(value)) {
    row.value[column.id] = value;
  }
}

handleError(error: any) {
  console.log(error);  
}

getValuesByProcessDefinitionId(field) {
  this.formService
      .getRestFieldValuesColumnByProcessId(
          field.form.processDefinitionId,
          field.id,
          this.column.id
      )
      .subscribe(
          (dynamicTableColumnOption: DynamicTableColumnOption[]) => {
              this.column.options = dynamicTableColumnOption || [];
              this.options = this.column.options;
              if (typeof this.row.value[this.column.id] === 'string') {
                  this.row.value[this.column.id] = this.options.find((opt) => opt.id === this.row.value[this.column.id]);
                  if (this.row.value[this.column.id]) this.value = this.row.value[this.column.id].name;
              } else {
                  this.value = this.table.getCellValue(this.row, this.column);
                  if (this.value && this.column.type == "dynamic-dropdown") { //typehead
                      this.value = this.value.name;
                  }
              }
          },
          (err) => this.handleError(err)
      );
}

  getValuesByTaskId(field) {
    this.formService
      .getRestFieldValuesColumn(
        field.form.taskId,
        field.id,
        this.column.id
      )
      .subscribe(
        (dynamicTableColumnOption: DynamicTableColumnOption[]) => {
          this.column.options = dynamicTableColumnOption || [];
          this.options = this.column.options;

          if (typeof this.row.value[this.column.id] === 'string') {
            this.row.value[this.column.id] = this.options.find((opt) => opt.id === this.row.value[this.column.id]);
            if (this.row.value[this.column.id]) this.value = this.row.value[this.column.id].name;
          } else {
            this.value = this.table.getCellValue(this.row, this.column);
            if (this.value && this.column.type == "dynamic-dropdown") { //typehead
              // this.value = this.value.name;
              /*Linea superior comentada template:[displayWith]="getOption" para no obtener object Object tras seleccionar el mismo valor en el input */
            }
          }
        },
        (err) => this.handleError(err)
      );
  }

  onItemSelect(item: FormFieldOption) {
    if (item) {
      // this.value = item.name;
      /*Linea superior comentada template:[displayWith]="getOption" para no obtener object Object tras seleccionar el mismo valor en el input */
      this.row.value[this.column.id] = item;
      this.onAutocompleteValueChange.emit({ id: this.column.id, values: item });
      this.formChangesService.formFieldValueChange({ row: this.row, column: this.column, value: item });
    }
  }

  getOption(item) {
    return item.name;
  }

  validate() {
    if (this.value instanceof Object) {
      let ids = ["waapy_orden_clase", "waapy_orden_clase_activo", "waapy_orden_clase_af", "waapy_orden_desglose1", "waapy_orden_desglose2",
        "waapy_orden_criterio_clasificacion"];
      let idsVaciar = ids;
      if (ids.includes(this.column.id) && this.row.value[this.column.id] && this.row.value[this.column.id] !== this.value) { //si se ha modificado un campo del stencil
        switch (this.column.id) { //|| isUndefined(this.row.value[this.column.id])
          case "waapy_orden_clase":
            // idsVaciar.shift();
            idsVaciar.splice(0, 1);
            break;
          case "waapy_orden_clase_activo":
            if (this.row.value["waapy_orden_clase"] && (this.row.value["waapy_orden_clase"].id == "P20" || this.row.value["waapy_orden_clase"].id == "P13")) {
              idsVaciar.splice(0, 2);
            } else {
              //si no es p20 o p13, no se mustra AF, por tanto vaciamos su valor y las siguientes dependencias
              idsVaciar.splice(0, 3);
            }
            break;
          case "waapy_orden_clase_af":
            idsVaciar.splice(0, 3);
            break;
          case "waapy_orden_desglose1":
            idsVaciar.splice(0, 4);
            break;
          case "waapy_orden_desglose2":
            idsVaciar.splice(0, 5);
            break;
        }
        if (this.column.id !== "waapy_orden_criterio_clasificacion") {
          for (let i = 0; i < idsVaciar.length; i++) {
            $("#" + idsVaciar[i]).val("");
            this.row.value[idsVaciar[i]] = undefined;
          }
          this.error = false;
        }
      }
      this.row.value[this.column.id] = this.value;
    } else {
      this.row.value[this.column.id] = '';
    }
  }


  onKeyUp(event: KeyboardEvent) {
    if (this.value && this.value.trim().length >= this.minTermLength && this.oldValue !== this.value) {
      if (event.keyCode !== ESCAPE && event.keyCode !== ENTER) {
        if (this.value.length >= this.minTermLength) {
          this.options = this.getOptions();
          this.oldValue = this.value;
          if (this.isValidOptionName(this.value)) {
            this.table.field.value = this.options[0].id;
          }
        }
      }
    }
    if (this.isValueDefined() && this.value.trim().length === 0) {
      this.oldValue = this.value;
      this.options = [];
    }
  }

  getOptions(): DynamicTableColumnOption[] {
    const val = this.value.trim().toLocaleLowerCase();
    return this.column.options.filter((item) => {
      const name = item.name.toLocaleLowerCase();
      return name.indexOf(val) > -1;
    });
  }

  isValueDefined() {
    return this.value !== null && this.value !== undefined;
  }

  isValidOptionName(optionName: string): boolean {
    const option = this.column.options.find((item) => item.name && item.name.toLocaleLowerCase() === optionName.toLocaleLowerCase());
    return option ? true : false;
  }

}