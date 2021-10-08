import { Component, Inject, OnInit,ChangeDetectorRef } from '@angular/core';
import { AuthenticationService,CookieService } from '@alfresco/adf-core';
import { HttpClient } from '@angular/common/http';

//Filters
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import {
    /* NodeActionsService, ConfirmDialogComponent, */ TagService,
} from '@alfresco/adf-content-services';


export declare var $: any;

export interface DialogTags {
    id: string;
}

/*
  Componentes de los Formularios
*/

@Component({
    selector: 'dialog-tags',
    templateUrl: 'dialog-tags.html',
    styleUrls: ['dialog-tags.scss'],
})
export class DialogTags implements OnInit {
    id: string;
    etiquetas: string;
    etiselect: string;

    constructor(
        public dialogRef: MatDialogRef<DialogTags>,
        @Inject(MAT_DIALOG_DATA) public data: DialogTags,
        private authenticationService: AuthenticationService,
        private http: HttpClient,
        private cookiesService: CookieService,
        private tagService: TagService,
        protected changeDetector: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.id = this.data.id;
        this.loadtag();
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    loadtag(): void {
        let site = this.cookiesService.getItem('site');
        let ticket = this.authenticationService.getTicketEcm();
        if(site!='null'){
        this.http
            .get(
                '/alfresco/s/api/tagscopes/site/'+site+'/documentLibrary/tags?&topN=1000&alf_ticket=' +
                    ticket
            )
            .subscribe((resp) => {
                this.etiquetas = resp['tags'];
              
            });
            this.changeDetector.detectChanges();
        }  
    } 


    addtag(id: any): void {
        var sinespacio  = this.etiselect.trim();
        this.tagService.addTag(id,sinespacio );
        this.tagService.refresh;
        this.loadtag();
    }
}
