/*
 * Copyright 2005-2018 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AppDefinitionRepresentationModel, TaskFilterService } from '@alfresco/adf-process-services';
import { AppConfigService,AppsProcessService } from '@alfresco/adf-core';
import { BpmAppsService } from '../../../../services';



@Component({
    selector: 'apw-apps',
    templateUrl: 'apps.component.html',
    styleUrls: ['./apps.component.scss'],
    providers: []
})

export class AppsComponent implements OnInit {

    landingRoutePage: string;

    constructor(private appConfig: AppConfigService, public router: Router,public bpmUserService : BpmAppsService, public taskFilterService: TaskFilterService ,public changeDetector : ChangeDetectorRef,public appsProcessService : AppsProcessService) {

    }

    seleccionarApp(app){
        if(app.id == 0 ){
			this.appsProcessService.getDeployedApplicationsByName("CSA").subscribe(success =>{
				this.taskFilterService.getTaskListFilters(success.id).subscribe(success2 =>{
					let filter = success2.filter(filter => filter.name === "Mis tareas" || filter.name === "My Tasks");
					this.bpmUserService.select_app({ name: 'Aplicacion de tareas', icon: 'task', id: success.id });
					this.router.navigate([`apps/${success.id}/tasks/${filter[0].id}`]);
					this.changeDetector.detectChanges();
				})
        });
            
        }else {
            const appId = app.id ? app.id : 0;
            this.bpmUserService.select_app(app);
            this.router.navigate([`apps/${appId}/processes-catalog`]);
        }
    }

    ngOnInit() {
        this.landingRoutePage = this.appConfig.get('landing-page', 'tasks/1003');
        //this.bpmUserService.mostrarApps();
    }

    onAppSelection(app: AppDefinitionRepresentationModel) {
        const appId = app.id ? app.id : 0;
        this.router.navigate([`apps/${appId}/processes-catalog`]);
    }
	
	

}
