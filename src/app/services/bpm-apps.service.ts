import { Injectable } from '@angular/core';
import { BpmUserService, AppsProcessService } from '@alfresco/adf-core';

@Injectable()
export class BpmAppsService {
    apps: any[] = [];
    selected_app = { name: '', icon: null, id: null };
    processName : string;
    validApps : string [] = ["CSA","IT", "Accesos físicos"];

    constructor(public bpmUserService: BpmUserService,public appsProcessService : AppsProcessService) {
       /*  this.bpmUserService.getCurrentUserInfo().subscribe(success => {
            success.groups.forEach(group => {
                if (group.name.indexOf("APP") != -1 ) {
                    this.mostrarApp(group);
                }
            });;
        }); */
    }

/*     mostrarApp(group) {
        let appName = group.name.split(/['_',' ']+/)[0];
        this.appsProcessService.getDeployedApplicationsByName(appName).subscribe(success =>{
            let filter = this.validApps.filter(app => app === success.name );
            if(filter.length>0){
                this.apps.push({ name: success.name, icon: success.name, id: success.id });
                //this.apps.push({ name: success.name+'copy', icon: success.name, id: success.id });
            }
        });
    } */
    mostrarApps() {
        this.apps = [];
        this.appsProcessService.getDeployedApplications().subscribe( apps => {
            apps.forEach(app => {
                let filter = this.validApps.filter(validApp => validApp === app.name );
                if(filter.length>0){
                    if(app.name=='CSA')app.name = "Centro de Servicios Administrativos (CSA)";
                    this.apps.push({ name: app.name, icon: app.name, id: app.id });
                }
            });
        })/* (appName).subscribe(success =>{
            let filter = this.validApps.filter(app => app === success.name );
            if(filter.length>0){
                this.apps.push({ name: success.name, icon: success.name, id: success.id });
                //this.apps.push({ name: success.name+'copy', icon: success.name, id: success.id });
            }
        }); */
    }

    get_apps() {
        return this.apps;
    }

    get_processName() {
        return this.processName;
    }

    get_appsNumber() {
        return this.apps.length;
    }

    select_app(app){
        this.selected_app = app;
    }

    set_processName(processName){
        this.processName = processName;
    }

}
