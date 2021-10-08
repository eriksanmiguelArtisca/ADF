import { Component, OnInit, OnDestroy } from "@angular/core";import { DateEditorComponent, MomentDateAdapter, MOMENT_DATE_FORMATS, UserPreferencesService } from "@alfresco/adf-core";
import { DateAdapter, MAT_DATE_FORMATS } from "@angular/material";
import { Moment } from "moment";


@Component({
    selector: 'custom-date-editor',
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: MOMENT_DATE_FORMATS }],
    templateUrl: './custom-date.editor.component.html',
    styleUrls: ['./custom-editor.component.scss']
  })
export class customDateEditorComponent extends DateEditorComponent implements OnInit, OnDestroy {

    
    constructor( dateAdapter: DateAdapter<Moment>, userPreferencesService: UserPreferencesService) {
        super(dateAdapter,userPreferencesService);
    }
    ngOnInit(){
        super.ngOnInit();
        if(this.column["maxDate"]){
            this.maxDate  = this.column["maxDate"];
        }
        if(this.column["minDate"]){
            this.minDate =  this.column["minDate"];
        }
        
        
        
    }
    
}