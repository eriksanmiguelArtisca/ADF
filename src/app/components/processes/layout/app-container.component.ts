/*
 * Copyright 2005-2018 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, ViewChild, ViewEncapsulation, OnInit, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { SidenavLayoutComponent } from '@alfresco/adf-core';
import { MediaQueryService } from '../../../services/media-query.service';
import { TaskFilterService, ProcessFilterService } from '@alfresco/adf-process-services';
import { BpmAppsService } from '../../../services/bpm-apps.service';
import { Router } from '@angular/router';

@Component({
    selector: 'apw-app-container',
    templateUrl: './app-container.component.html',
    styleUrls: ['./app-container.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AppContainerComponent implements OnInit,AfterViewInit,OnDestroy{
    
    @ViewChild('adfsidenavlayout')
    adfsidenavComponent: SidenavLayoutComponent;
    displayMenu :boolean = false;

    constructor(private media: MediaQueryService,
            private router: Router,
            public bpmUserService : BpmAppsService,
            public taskFilterService :TaskFilterService,
            public processFilterService : ProcessFilterService,
            public changeDetectorRef : ChangeDetectorRef){
        
    }

    ngOnInit(){
        
    }
    ngAfterViewInit(): void {
        this.media.deviceType$.subscribe(device => {
            if(device == 'tablet' || device == 'mobile'){
                this.displayMenu = true;
            }else {
                this.displayMenu = false;
                if (!this.adfsidenavComponent.isMenuMinimized) {
                    this.adfsidenavComponent.toggleMenu();
                }
            }
            this.changeDetectorRef.detectChanges();
        });
    }

    ngOnDestroy(): void {
        this.changeDetectorRef.detach();
    }

    navegar(ruta){
        const appId = this.bpmUserService.selected_app.id ? this.bpmUserService.selected_app.id : 0;
        switch (ruta) {
            case 'apps':
                this.router.navigate([`apps`]);    
                break;
            case 'processes-catalog':
                this.router.navigate([`apps/${appId}/processes-catalog`]);
                break;
            case 'tasks':
                this.taskFilterService.getTaskListFilters(appId).subscribe(success =>{
                    let filter = success.filter(filter => filter.name === "Mis tareas" || filter.name === "My Tasks");
                    this.router.navigate([`apps/${appId}/${ruta}/${filter[0].id}`]);
                });
                break;
            case 'processes':
                this.processFilterService.getProcessFilters(appId).subscribe(success =>{
                    let filter = success.filter(filter => filter.name === "Ejecutándose" || filter.name === "Running");
                    this.router.navigate([`apps/${appId}/${ruta}/${filter[0].id}`]);
                })
                break;
            default:
                break;
        }
        this.adfsidenavComponent.toggleMenu();
    }

    minimizeSidenav() {
        if (!this.adfsidenavComponent.isMenuMinimized) {
            this.adfsidenavComponent.toggleMenu();
        }
    }

    diplaySidenav() {
        this.adfsidenavComponent.toggleMenu();
    }
}
