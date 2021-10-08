import { DropdownEditorComponent, DynamicTableModel, DynamicTableRow, FormService, LogService } from '@alfresco/adf-core';
import { DynamicTableColumnOption } from '@alfresco/adf-core/form/components/widgets/dynamic-table/dynamic-table-column-option.model';
import { DynamicTableColumn } from '@alfresco/adf-core/form/components/widgets/dynamic-table/dynamic-table-column.model';
import { Component, Input, OnInit } from '@angular/core';
import { FormChangesService } from '../../../../../../services/form-changes.service';

@Component({
  selector: 'custom-dropdown-editor',
  templateUrl: './custom-dropdown-editor.component.html',
  styleUrls: ['./custom-dropdown-editor.component.scss']
})
export class CustomDropdownEditorComponent extends DropdownEditorComponent  implements OnInit {
  value: any = null;
  options: DynamicTableColumnOption[] = [];

  @Input()
  table: DynamicTableModel;

  @Input()
  row: DynamicTableRow;

  @Input()
  column: DynamicTableColumn;
  
  constructor(formService: FormService,private formChangesService:FormChangesService,
    logService: LogService) {
    super(formService,logService);

  }

  ngOnInit() {
    super.ngOnInit();
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
                if ( typeof this.row.value[this.column.id] === 'string'){
                  this.row.value[this.column.id] = this.options.find((opt) => opt.id === this.row.value[this.column.id]);
                  if(this.row.value[this.column.id]) this.value = this.row.value[this.column.id].name;
                }else {
                    this.value = this.table.getCellValue(this.row, this.column);
                }   
                
            },
            (err) => this.handleError(err)
        );
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
                //this.value = this.table.getCellValue(this.row, this.column);
            },
            (err) => this.handleError(err)
        );
}

onValueChanged(row: DynamicTableRow, column: DynamicTableColumn, event: any) {
    let value: any = (<HTMLInputElement> event).value;
    value = column.options.find((opt) => opt.id === value);
    row.value[column.id] = value;
    this.formChangesService.formFieldValueChange( {row: this.row, column: this.column, value : value });
}

handleError(error: any) {
  console.log(error);  
  //logService.error(error);
}

}
