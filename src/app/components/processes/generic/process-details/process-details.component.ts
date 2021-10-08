/*
 * Copyright 2005-2018 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, ViewEncapsulation, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ProcessInstance } from '@alfresco/adf-process-services';
import { LogService,CookieService } from '@alfresco/adf-core';

@Component({
    selector: 'apw-process-details',
    templateUrl: './process-details.component.html',
    styleUrls: ['./process-details.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ProcessDetailsComponent implements OnInit {

    @Input()
    processInstanceDetails: ProcessInstance;

    @Output()
    navigate: EventEmitter<string> = new EventEmitter<string>();

    presetColoum = 'dw-process-task-list';
    cookie: string;
    constructor(private logService: LogService, private cookiesService: CookieService) { }

    ngOnInit() {
		this.cookie = this.cookiesService.getItem('vertarea');
	
    }

    onTaskRowDoubleCLick(id): void {
        this.navigate.emit(id);
    }

    getTaskStatus(taskDetails: any): string {
        return taskDetails.endDate ? 'Completed' : 'Open';
    }

    isCompletedProcess(): boolean {
        return !!this.processInstanceDetails.ended;
    }

    isRunning(): boolean {
        return !this.isCompletedProcess();
    }

    onAuditError(event: any): void {
        this.logService.error(event);
    }

    onViewTask(taskId: any): void {
        this.navigate.emit(taskId);
    }
}
