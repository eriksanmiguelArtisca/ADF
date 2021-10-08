/*
 * Copyright 2005-2018 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreadCrumb } from './breadcrumb.model';
import { Router, NavigationEnd } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';

import { AppsProcessService } from '@alfresco/adf-core';
import {
    TaskFilterService,
    FilterRepresentationModel,
    ProcessFilterService,
    FilterProcessRepresentationModel
} from '@alfresco/adf-process-services';

import { APWProperties } from '../../../models';

@Component({
    selector: 'apw-breadcrumbs',
    templateUrl: './breadcrumbs.component.html'
})

export class BreadCrumbsComponent implements OnInit ,OnDestroy {
    

    private static WORKSPACE = 'workspace';
    currentMenu: string;
    filterId: string;
    appId: number;

    appName: string;
    processFilter: FilterProcessRepresentationModel;
    taskFilter: FilterRepresentationModel;

    processFilters: FilterProcessRepresentationModel[];
    taskFilters: FilterRepresentationModel[];

    sub: Subscription;
    parentSub: Subscription;
    navigationSubscription: Subscription;
    defaultTaskFilterName = 'My Tasks';
    defaultProcessFilterName = 'Running';

    crumbs: Array<BreadCrumb>;
    
    constructor(
                private router: Router,
                private taskFilterService: TaskFilterService,
                private processFilterService: ProcessFilterService,
                private appsProcessService: AppsProcessService,
    ) {}

    ngOnInit(): void {
        this.navigationSubscription = this.router.events.subscribe((e: any) => {
            if (e instanceof NavigationEnd) {
              let url = e.url.split("/");
              this.appId = Number.parseInt(url[2]);
              this.currentMenu = url[3];
              this.filterId = url[4];
              this.setFilters(this.appId);
            }
            
        });
    }

    ngOnDestroy() {
       if (this.sub) {
           this.sub.unsubscribe();
       }
       if (this.navigationSubscription) {
        this.navigationSubscription.unsubscribe();
        }
    }

/*     private getAppId(): number {
        return +this.appId === 0 ? null : this.appId;
    } */

    private setFilters(appId: number): void {
        forkJoin(
            this.processFilterService.getProcessFilters(appId),
            this.taskFilterService.getTaskListFilters(appId),
            (processFilters: FilterProcessRepresentationModel[], taskFilters: FilterRepresentationModel[]) => {
                this.processFilters = processFilters;
                this.taskFilters = taskFilters;
            }
        ).subscribe(() => { this.createBreadCrumbs(); });
    }

    createProcessFilterCrumb(filterId: number): BreadCrumb {
        this.processFilter = this.processFilters.filter(filter => filter.id === filterId)[0];
        return new BreadCrumb(this.processFilter.id.toString(), this.processFilter.name);
    }

    createTaskFilterCrumb(filterId: number): BreadCrumb {
        if (filterId) {
            this.taskFilter = this.taskFilters.filter(filter => filter.id === filterId)[0];
        } else {
            this.taskFilter = this.taskFilters[0];
        }

        return new BreadCrumb(this.taskFilter.id.toString(), this.taskFilter.name);
    }

    createAppNameCrumb(): void {
        if (this.appId) {
            this.appsProcessService.getApplicationDetailsById(this.appId).subscribe(
                (res: any) => {
                    this.appName = res.name;
                    this.crumbs[1] = new BreadCrumb(this.appName, this.appName);
                }
            );
        } else {
            this.appName = APWProperties.TASK_APP_NAME;
            this.crumbs[1] = new BreadCrumb(this.appName, this.appName);
        }
    }

    navigateToDefaultFilter(): void {
        let filter;
        if (this.currentMenu === 'tasks') {
            filter = this.taskFilters.find(aFilter => aFilter.name === this.defaultTaskFilterName);
        } else if (this.currentMenu === 'processes') {
            filter = this.processFilters.find(aFilter => aFilter.name === this.defaultProcessFilterName);
        }

        if (filter) {
            this.router.navigateByUrl(`apps/${this.appId}/${this.currentMenu}/${filter.id}`);
        }
    }

    createBreadCrumbs(): void {
        this.crumbs = [];
        this.crumbs.push(this.createRootCrumb());
        this.crumbs.push(this.createEmptyCrumb());

        let filterCrumb;
        switch (this.currentMenu) {
            case 'processes':
                this.crumbs.push(this.createProcessCrumb());
                if (this.filterId === 'new') {
                    filterCrumb = this.createNewProcessCrumb();
                } else {
                    filterCrumb = this.createProcessFilterCrumb(+this.filterId);
                }
                this.crumbs.push(filterCrumb);
                break;
            case 'tasks':
                this.crumbs.push(this.createTaskCrumb());
                if (this.filterId === 'new') {
                    filterCrumb = this.createNewTaskCrumb();
                } else {
                    filterCrumb = this.createTaskFilterCrumb(+this.filterId);
                }
                this.crumbs.push(filterCrumb);
                break;
            case 'dashboard':
                this.crumbs.push(this.createDashboardCrumb());
                break;
         }

         this.createAppNameCrumb();
    }

    private createEmptyCrumb(): BreadCrumb {
        return new BreadCrumb('', '');
    }

    private createRootCrumb(): BreadCrumb {
        return new BreadCrumb('workspace', 'DW-BREADCRUMBS.ROOT-KEY');
    }

    private createProcessCrumb(): BreadCrumb {
         return new BreadCrumb('processes', 'DW-BREADCRUMBS.ENTRY-PROCESSES');
    }

    private createNewProcessCrumb(): BreadCrumb {
        return new BreadCrumb('newprocess', 'DW-BREADCRUMBS.ENTRY-NEW-PROCESS');
    }

    private createTaskCrumb(): BreadCrumb {
        return new BreadCrumb('tasks', 'DW-BREADCRUMBS.ENTRY-TASKS');
    }

    private createNewTaskCrumb(): BreadCrumb {
        return new BreadCrumb('newtask', 'DW-BREADCRUMBS.ENTRY-NEW-TASK');
    }

    private createDashboardCrumb(): BreadCrumb {
        return new BreadCrumb('dashboard', 'DW-BREADCRUMBS.ENTRY-DASHBOARD');
    }
 
    private navigateToDashBoard(): void {
        this.router.navigate([`apps/${this.appId}/dashboard/default`]);
    } 

    private navigateToFilter(crumb: BreadCrumb): void {
        this.router.navigate([`apps/${this.appId}/${this.currentMenu}/${crumb.getId()}`]);
    }

    private navigateToRoot(): void {
        this.router.navigate(['/']);
    }

    navigateToCrumb(crumb: BreadCrumb): void {
        const crumbId = crumb.getId();

        if (crumbId === BreadCrumbsComponent.WORKSPACE) {
            this.navigateToRoot();
        }  else if (crumbId === this.appName) {
            this.navigateToDashBoard();
        } else if (+crumbId > 0) {
            this.navigateToFilter(crumb);
        } else {
            this.navigateToDefaultFilter();
        }
    }

}
