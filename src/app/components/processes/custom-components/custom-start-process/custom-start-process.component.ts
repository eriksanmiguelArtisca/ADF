import { ActivitiContentService, AppConfigService, FormRenderingService } from '@alfresco/adf-core';
import { ProcessFormRenderingService, ProcessService, StartProcessInstanceComponent } from '@alfresco/adf-process-services';
import { Component } from '@angular/core';
import { CustomDynamicTableWidgetComponentComponent } from '../../custom-form-fields/CustomDynamicTableWidgetComponent/CustomDynamicTableWidgetComponent.component';

@Component({
  selector: 'app-custom-start-process',
  templateUrl: './custom-start-process.component.html',
  styleUrls: ['./custom-start-process.component.css']
})
export class CustomStartProcessComponent extends StartProcessInstanceComponent {

  constructor(activitiProcess: ProcessService, activitiContentService: ActivitiContentService, appConfig: AppConfigService, formRenderingService: FormRenderingService, processFormRenderingService:  ProcessFormRenderingService ) {
    formRenderingService.setComponentTypeResolver('dynamic-table', () => CustomDynamicTableWidgetComponentComponent, true);
    processFormRenderingService.setComponentTypeResolver('dynamic-table', () => CustomDynamicTableWidgetComponentComponent, true);
    super(activitiProcess, activitiContentService, appConfig);
  }

 
  

}
