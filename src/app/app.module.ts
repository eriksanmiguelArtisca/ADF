/*
 * Copyright 2005-2018 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule, ErrorHandler,LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ChartsModule } from 'ng2-charts';

import { AppConfigService, TRANSLATION_PROVIDER,AuthBearerInterceptor } from '@alfresco/adf-core';
import { AdfModule } from './adf.module';

import { environment } from '../environments/environment';

import { AppRootComponent } from './app-root.component';
import { routing } from './app.routes';
import { MaterialModule } from './material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SelectAutocompleteModule } from 'select-autocomplete';
import {EditorModule} from 'primeng/editor';
/* import {  LOCALE_ID } from '@angular/core';
import { RouterModule } from '@angular/router'; */

/* import { TranslateLoaderService,} from '@alfresco/adf-core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core'; */

import { registerLocaleData } from '@angular/common';
import  locale_ES from '@angular/common/locales/es';
registerLocaleData(locale_ES);

import {
    AppsContainerComponent,
    AppsComponent,
    AppContainerComponent,
    BreadCrumbsActionsComponent,
    BreadCrumbsComponent,
    BreadCrumbsEntryComponent,
    CreateProcessComponent,
    CreateTaskComponent,
    DashboardComponent,
    DashboardSettingsComponent,
    HeaderComponent,
    LoginComponent,
    ProcessAttachmentComponent,
    ProcessDetailsComponent,
    ProcessDetailsContainerComponent,
    ProcessListPaginatorComponent,
    ProcessListContainerComponent,
    ProcessSidebarComponent,
    ProcessStatisticsComponent,
    ProcessToolbarComponent,
    SideMenuComponent,
    TaskAttachmentComponent,
    TaskDetailsContainerComponent,
    TaskFromComponent,
    TaskFormDialogComponent,
    TaskListContainerComponent,
    TaskSidebarComponent,
    TaskToolbarComponent,
    TaskListPaginatorComponent,
    UserProfileMenuComponent,
    SettingComponent,
    ProvidersComponent,
    DialogConfirmationComponent,
    BlobPreviewComponent,
    /* Empieza import content services*/ 
    AppLayoutComponent,
    DocumentlistComponent,
    FileViewComponent,
    BlobViewComponent,
    TrashcanComponent,
    SharedComponent,
    EmailSentComponent,
    RemindersComponent,
    UploadFileForm,
    UploadFileComponent,
    DowloadFilesPanelComponent,
    PolizasSearchComponent,
    PolizasDocumentlistComponent,
    /* Componentes Genericos*/
    DocumentlistComponentGeneric,
    SearchGeneric,
    CreateNodeComponent,
    /* Dialogs*/ 
    DialogSendEmail,
    DialogAssociatedFiles,
    DialogReminder,
    DialogExport,
	DialogTags,
    DialogGrupos,
    DialogProcessAction,
	DialogAsignar,
    /* Empieza import process services*/ 
    ProcessCatalogComponent,
    ProcessHeaderComponent,
    CustomDynamicTableWidgetComponentComponent,
    /* Empieza import editores Tabla*/ 
    CustomRowEditorComponent,
    CustomTypeheadEditor,
    CustomPeopleWidgetComponentComponent,
    customDateEditorComponent,
    CustomDropdownEditorComponent,
    DynamicDropdownEditorComponent,
    /* Empieza import process services*/ 
    CustomFormComponent,
    TreeComponent,
    CustomStartProcessComponent,
    CustomStartFormComponent
} from './components';

import { ApplicationContentStateService,
    PreviewService,
    MediaQueryService,
    UnauthorisedErrorHandler,
    BpmAppsService,
    CustomDialogsService,
    MetadataService,
    TableActionsService,
    TreePepsService,
    FormChangesService } from './services';

import { FullNamePipe } from './pipes';

import { DragDropDirective } from './directives/drag-drop.directive';
import { DownloadFiltersComponentContabilizacion,DownloadFiltersComponentAcreedor_Referencia} from './components/processes/sites-components/csa/download-files-panel/download-files-filters/download-filters.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MAT_AUTOCOMPLETE_SCROLL_STRATEGY } from '@angular/material';
import { BlockScrollStrategy, Overlay } from '@angular/cdk/overlay';
import { CustomLoginComponent } from './components/standard-components/login-custom/custom-login/custom-login.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TreeAccesos2Component } from './components/processes/custom-components/tree-accesos2/tree-accesos2.component';

/* import { TreeComponent } from "./components/processes/custom-components/tree-component/treeComponent"; */

export function scrollFactory(overlay: Overlay): () => BlockScrollStrategy { //CloseScrollStrategy close //RepositionScrollStrategy reposition
	return () => overlay.scrollStrategies.block();
}

@NgModule({
    imports: [
        BrowserModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        routing,
        AdfModule,
        ChartsModule,
        FlexLayoutModule,
        BrowserAnimationsModule,
        SelectAutocompleteModule,
        /* Primeng Modules*/
        EditorModule,
        ScrollingModule
    ],
    declarations: [
        AppRootComponent,
        AppsContainerComponent,
        AppContainerComponent,
        AppsComponent,
        BreadCrumbsActionsComponent,
        BreadCrumbsComponent,
        BreadCrumbsEntryComponent,
        CreateProcessComponent,
        CreateTaskComponent,
        DashboardComponent,
        DashboardSettingsComponent,
        HeaderComponent,
        LoginComponent,
        ProcessAttachmentComponent,
        ProcessDetailsComponent,
        ProcessDetailsContainerComponent,
        ProcessListPaginatorComponent,
        ProcessListContainerComponent,
        ProcessSidebarComponent,
        ProcessStatisticsComponent,
        ProcessToolbarComponent,
        SideMenuComponent,
        TaskAttachmentComponent,
        TaskDetailsContainerComponent,
        TaskFromComponent,
        TaskListContainerComponent,
        TaskSidebarComponent,
        TaskToolbarComponent,
        TaskListPaginatorComponent,
        UserProfileMenuComponent,
        SettingComponent,
        ProvidersComponent,
        DialogConfirmationComponent,
        BlobPreviewComponent,
        TaskFormDialogComponent,
        FullNamePipe,
        ProcessCatalogComponent,
        /* Termina declarations content services */ 
        /* Empieza declarations content services*/
        AppLayoutComponent,
        FileViewComponent,
        BlobViewComponent,
        DocumentlistComponent,
        TrashcanComponent,
        SharedComponent,
        EmailSentComponent,
        RemindersComponent,
        UploadFileForm,
        UploadFileComponent,
        DowloadFilesPanelComponent,
        PolizasSearchComponent,
        PolizasDocumentlistComponent,
        DialogSendEmail,
        DialogAssociatedFiles,
        DialogReminder,
        DialogExport,
		DialogTags,
        DialogGrupos,
        DialogProcessAction,
		DialogAsignar,
        ProcessHeaderComponent,
        DragDropDirective,
        DownloadFiltersComponentContabilizacion,
        CustomDynamicTableWidgetComponentComponent,
        CustomRowEditorComponent,
        CustomTypeheadEditor,
        customDateEditorComponent,
        CustomDropdownEditorComponent,
        DynamicDropdownEditorComponent,
        CustomPeopleWidgetComponentComponent,
        CustomFormComponent,
        /* Componentes Genericos*/
        DocumentlistComponentGeneric,
        SearchGeneric,
        DownloadFiltersComponentAcreedor_Referencia,
        CreateNodeComponent,
        TreeComponent,
        CustomStartProcessComponent,
        CustomStartFormComponent,
        CustomLoginComponent,
        TreeAccesos2Component
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS, useClass:
            AuthBearerInterceptor, multi: true
        },
        { provide: MAT_AUTOCOMPLETE_SCROLL_STRATEGY, useFactory: scrollFactory, deps: [Overlay] },
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: AppConfigService, useClass: environment.appConfigServiceType },
        {
            provide: TRANSLATION_PROVIDER,
            multi: true,
            useValue: {
                name: 'app',
                source: 'resources'
            }
        },
        {provide: LOCALE_ID, useValue: 'es'},
        MediaQueryService,
        PreviewService,
        ApplicationContentStateService,
        { provide: ErrorHandler, useClass: UnauthorisedErrorHandler },
        BpmAppsService,
        CustomDialogsService,
        MetadataService,
        TableActionsService,
        TreePepsService,
        FormChangesService
    ],
    exports: [
        DialogConfirmationComponent,
        TaskFormDialogComponent,
        CustomRowEditorComponent,
        CustomTypeheadEditor,
        customDateEditorComponent,
        CustomDropdownEditorComponent,
        DynamicDropdownEditorComponent ,
        DownloadFiltersComponentContabilizacion,
        DownloadFiltersComponentAcreedor_Referencia
    ],
    entryComponents: [
        DialogConfirmationComponent,
        TaskFormDialogComponent,
        DialogSendEmail,
        DialogAssociatedFiles,
        DialogReminder,
        DialogExport,
		DialogTags,
        DialogGrupos,
        DialogProcessAction,
		DialogAsignar,
        CustomDynamicTableWidgetComponentComponent,
        CustomPeopleWidgetComponentComponent,
        DownloadFiltersComponentContabilizacion,
        DownloadFiltersComponentAcreedor_Referencia,
        TreeComponent,
        CustomStartProcessComponent,
        CustomStartFormComponent,
        CustomLoginComponent,
        TreeAccesos2Component
    ],
    bootstrap: [AppRootComponent]
})
export class AppModule { }
