/*
 * Copyright 2005-2018 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */
    /* Empieza STANDARD*/
    export * from './standard-components/login/login.component';
    export * from './standard-components/blob-preview/blob-preview.component';
    export * from './standard-components/file-view/blob-view.component';
    export * from './standard-components/file-view/file-view.component';
    export * from './standard-components/user-profile-menu';
    /* Acaba STANDARD*/

    /* Empieza BIBLIOTECA DOCUMENTOS*/
    export * from './document-library/layout/app-layout.component';

    export * from './document-library/generic/search-generic/search-generic.component';
    export * from './document-library/generic/documentlist-generic/documentlist-generic.component';
    export * from './document-library/generic/trashcan/trashcan.component';
    export * from './document-library/generic/shared/shared.component';
    export * from './document-library/generic/create-node/create-node.component';

    export * from './document-library/sites-components/regulacion/documentlist/documentlist.component';
    export * from './document-library/sites-components/regulacion/emails-sent/emails-sent.component';
    export * from './document-library/sites-components/regulacion/reminders/reminders.component';
    export * from './document-library/sites-components/regulacion/upload-file-form/upload-file-form.component';
    
    export * from './document-library/dialogs';

    export * from './document-library/sites-components/polizas/polizas-search/polizas-search.component';
    export * from './document-library/sites-components/polizas/polizas-documentlist/polizas-documentlist.component';
    
    /* Acaba BIBLIOTECA DOCUMENTOS*/

    /* Empieza PROCESOS*/
    export * from './processes/layout/app-container.component';

    export * from './processes/generic/apps';
    export * from './processes/generic/process-catalog/process-catalog.component';
    export * from './processes/generic/processes';
    export * from './processes/generic/process-details';
    export * from './processes/generic/process-catalog/dialogs/dialogs.component';
    export * from './processes/generic/tasks';
    export * from './processes/generic/tasks/dialogs/dialogs.component';
    export * from './processes/generic/task-details';
   // Custom form-fields
    export * from './processes/custom-form-fields/CustomDynamicTableWidgetComponent/CustomDynamicTableWidgetComponent.component';
    export * from './processes/custom-form-fields/CustomDynamicTableWidgetComponent/custom-row-editor/custom-row-editor.component';
    export * from './processes/custom-form-fields/CustomDynamicTableWidgetComponent/custom-row-editor/custom-tyhead-editor/custom-typehead.editor';
    export * from './processes/custom-form-fields/CustomDynamicTableWidgetComponent/custom-row-editor/custom-date.editor/custom-date.editor';
    export * from './processes/custom-form-fields/CustomDynamicTableWidgetComponent/custom-row-editor/custom-dropdown-editor/custom-dropdown-editor.component';
    export * from './processes/custom-form-fields/CustomDynamicTableWidgetComponent/custom-row-editor/dynamic-dropdown/dynamic-dropdown-editor.component';

    
    export * from './processes/custom-form-fields/CustomPeopleWidgetComponent/CustomPeopleWidgetComponent.component';
   
    // Custom process components
    export * from './processes/custom-components/custom-form-component/custom-form.component';
    export * from './processes/custom-components/tree-component/tree.component';
    export * from './processes/custom-components/custom-start-process/custom-start-process.component';
    export * from './processes/custom-components/custom-start-process/custom-start-form/custom-start-form-component.component';
    
    export * from './processes/sites-components/csa/download-files-panel/dowload-files-panel.component';
    export * from './processes/sites-components/csa/download-files-panel/download-files-filters/download-filters.component';
    export * from './processes/sites-components/csa/upload-excel-filter/upload-file.component';

    /* Acaba PROCESOS*/
    /* Empieza COMPONENTES SIN USAR*/
    export * from './not-used/setting/setting.component';
    export * from './not-used/providers/providers.component';
    export * from './not-used/dashboard';
    /* Acaba COMPONENTES SIN USAR*/
    

    export * from './layout-components';