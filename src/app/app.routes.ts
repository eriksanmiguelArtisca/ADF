/*
 * Copyright 2005-2018 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardBpm, AuthGuardEcm/* , AuthGuard  */} from '@alfresco/adf-core';

import {
    AppsContainerComponent ,
/*     AppContainerComponent, */
    AppsComponent ,
    CreateProcessComponent,
    CreateTaskComponent,
    DashboardComponent,
    LoginComponent,
    ProcessDetailsContainerComponent,
    ProcessListContainerComponent,
    TaskDetailsContainerComponent,
    TaskListContainerComponent,
    SettingComponent,
    ProvidersComponent,
    AppLayoutComponent,
    DocumentlistComponent,
    DocumentlistComponentGeneric,
    TrashcanComponent,
    SharedComponent,
    EmailSentComponent,
/*     UploadFileForm, */
    FileViewComponent,
    RemindersComponent,
    ProcessCatalogComponent,
    DowloadFilesPanelComponent,
    SearchGeneric,
    CreateNodeComponent,
    PolizasSearchComponent,
    PolizasDocumentlistComponent
} from './components';
import { BlobPreviewComponent } from './components/standard-components/blob-preview/blob-preview.component';

export const appRoutes: Routes = [
    { path: '',   redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'settings', component: SettingComponent },
    { path: 'providers', component: ProvidersComponent },
    {
        path: 'content',
        component: AppLayoutComponent,
        canActivate: [ AuthGuardEcm ],
        children: [
            { path: 'home', component: DocumentlistComponent  },
            { path: 'documentlist', component: DocumentlistComponent  },
            { 
                path: 'documentlist', 
                children:[
                    { path: 'polizas', component: PolizasDocumentlistComponent  },
                    { path: 'csa', component: DocumentlistComponentGeneric  },
                    { path: 'it', component: DocumentlistComponentGeneric  }
                ]
            },
            { path: 'documentlist-g', component: DocumentlistComponentGeneric  },
            { 
                path: 'search' , children: [
                    { path: 'polizas', component: PolizasSearchComponent  },
                    { path: 'csa', component: SearchGeneric  },
                    { path: 'it', component: SearchGeneric  }
                ] 
            },
            { path: 'search-g', component: SearchGeneric  }, 
            { path: 'trashcan', component: TrashcanComponent  },
            { path: 'shared', component: SharedComponent  },
            { path: 'sent', component: EmailSentComponent  },
            { path: 'reminders', component: RemindersComponent  },
            { path: 'upload-form/:carpeta-subida', component:  CreateNodeComponent,  }
        ]
    },
    {
        path: 'apps',
        component: AppsContainerComponent,
        canActivate: [AuthGuardBpm],                                                                                                                                   
        children: [
            { path: '', component: AppsComponent },
            {
                path: ':appId',
                children: [
                    { path: 'tasks', component: TaskListContainerComponent },
                    { path: 'tasks/new', component: CreateTaskComponent },
                    { path: 'tasks/:taskFilterId', component: TaskListContainerComponent },
                    { path: 'processes', component: ProcessListContainerComponent },
                    { path: 'processes-catalog', component: ProcessCatalogComponent },
                    { path: 'processes/new/:processId', component: CreateProcessComponent },
                    { path: 'processes/:processFilterId', component: ProcessListContainerComponent },
                    { path: 'dashboard/default', component: DashboardComponent },
                    {
                        path: 'download/:filterType',
                        component: DowloadFilesPanelComponent
                    }
                ]
            }
        ]
    },
    {
        path: 'downloadTestPanel',
        component: DowloadFilesPanelComponent
    },
    {
        path: 'create-node',
        component: CreateNodeComponent
    },
    { path: 'processdetails/:appId/:processInstanceId', component: ProcessDetailsContainerComponent, canActivate: [AuthGuardBpm] },
    {
        path: 'taskdetails/:appId/:taskId',
        component: TaskDetailsContainerComponent,
        canActivate: [AuthGuardBpm],
    },
    {
        path: 'preview/blob',
        component: BlobPreviewComponent,
        outlet: 'overlay',
    },
    { 
        path: 'files/:nodeId/view', 
        component: FileViewComponent,
        canActivate: [AuthGuardEcm], 
        outlet: 'overlay' 
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes, { useHash: true, onSameUrlNavigation: 'reload' });
