/*!
 * @license
 * Copyright 2019 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { DynamicTableModel, DynamicTableRow, FormFieldOption, FormService, LogService } from "@alfresco/adf-core";
import { DynamicTableColumnOption } from "@alfresco/adf-core/form/components/widgets/dynamic-table/dynamic-table-column-option.model";
import { DynamicTableColumn } from "@alfresco/adf-core/form/components/widgets/dynamic-table/dynamic-table-column.model";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ENTER, ESCAPE } from '@angular/cdk/keycodes';
import { FormChangesService } from '../../../../../../services/form-changes.service';

 /* tslint:disable:component-selector  */
@Component({
    selector: 'custom-typehead-editor',
    templateUrl: './custom-typehead.editor.html',
    styleUrls: ['./custom-typehead.editor.scss'],
})
export class CustomTypeheadEditor implements OnInit {

    value: any = null;
    options: DynamicTableColumnOption[] = [];
    minTermLength: number = 1;
    oldValue: string;

    @Input()
    table: DynamicTableModel;

    @Input()
    row: DynamicTableRow;

    @Input()
    column: DynamicTableColumn;

    @Output()
    onAutocompleteValueChange: EventEmitter<any> = new EventEmitter<any>();

    constructor(public formService: FormService,private formChangesService:FormChangesService,
                private logService: LogService) {  
    }

    ngOnInit() {
        //this.table.field.name = "prueba";
        const field = this.table.field;
        if (field) {
            if (this.column.optionType === 'rest') {
                if (this.table.form && this.table.form.taskId) {
                    this.getValuesByTaskId(field);
                } else {
                    this.getValuesByProcessDefinitionId(field);
                }
            } else {
                this.options = this.column.options || [];
                this.value = this.table.getCellValue(this.row, this.column);
       
                this.onItemSelect(this.value);

            }
        }
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
                        if(this.value && this.column.type=="typehead"){
                            this.value = this.value.name;
                        }
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
                    if (typeof this.row.value[this.column.id] === 'string') {
                        this.row.value[this.column.id] = this.options.find((opt) => opt.id === this.row.value[this.column.id]);
                        if (this.row.value[this.column.id]) this.value = this.row.value[this.column.id].name;
                    } else {
                        this.value = this.table.getCellValue(this.row, this.column);
                        if (this.value && this.column.type == "typehead") {
                            this.value = this.value.name;
                        }
                    }
                },
                (err) => this.handleError(err)
            );
    }

    onValueChanged(row: DynamicTableRow, column: DynamicTableColumn, event: any) {
        let value: any = (<HTMLInputElement> event).value;
        value = column.options.find((opt) => opt.name === value);
        row.value[column.id] = value;
        
    }

    validate() {
        if (this.value instanceof Object) {
            this.row.value[this.column.id] = this.value;
        } else {
            this.row.value[this.column.id] = '';
        }
    }

    onItemSelect(item: FormFieldOption) {
        
        if (item) {
            //this.field.value = item.id;
            //this.row.value[this.column.id]
            this.value = item.name;
            //this.row.value[this.column.id] = item.id;
            this.row.value[this.column.id] = item;
            //this.onFieldChanged(this.field);
            this.onAutocompleteValueChange.emit({id: this.column.id, values: item});
            this.formChangesService.formFieldValueChange( {row: this.row, column: this.column, value : item });
        }
    }

    handleError(error: any) {
        this.logService.error(error);
    }

    //puesto por aldayr
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

    isValidOptionName(optionName: string): boolean {
        const option = this.column.options.find((item) => item.name && item.name.toLocaleLowerCase() === optionName.toLocaleLowerCase());
        return option ? true : false;
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
}