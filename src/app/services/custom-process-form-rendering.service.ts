import { Injectable, Type } from '@angular/core';
import { DynamicComponentResolveFunction, FormFieldModel, FormRenderingService, TextWidgetComponent } from '@alfresco/adf-core';
import { AttachFileWidgetComponent, AttachFolderWidgetComponent } from '@alfresco/adf-process-services';
import { CustomDynamicTableWidgetComponentComponent } from '../components/processes/custom-form-fields/CustomDynamicTableWidgetComponent/CustomDynamicTableWidgetComponent.component';
import { CustomPeopleWidgetComponentComponent } from '../components/processes/custom-form-fields/CustomPeopleWidgetComponent/CustomPeopleWidgetComponent.component';
import { TreeComponent } from '../components/processes/custom-components/tree-component/tree.component';




@Injectable({
    providedIn: 'root'
})
export class CustomProcessFormRenderingService extends FormRenderingService {
    constructor() {
        super();
        this.setComponentTypeResolver('upload', () => AttachFileWidgetComponent, true);
        this.setComponentTypeResolver('select-folder', () => AttachFolderWidgetComponent, true);
        this.setComponentTypeResolver('dynamic-table', () => CustomDynamicTableWidgetComponentComponent, true);
        this.setComponentTypeResolver('people', () => CustomPeopleWidgetComponentComponent, true);
        let customResolver: DynamicComponentResolveFunction = (field: FormFieldModel): Type<{}> => {
            if (field) {
                if (field.id === "waapy_tree" || field.id === "wampy_tree") {
                    return TreeComponent;
                }
            }
            return TextWidgetComponent;
        };
        this.setComponentTypeResolver('text', customResolver, true);
    }
}