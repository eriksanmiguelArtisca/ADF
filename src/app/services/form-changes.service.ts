import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';

@Injectable()
export class FormChangesService {
    
    formFieldValueChanged = new Subject<any>();

    constructor() { }

    formFieldValueChange(event){
        this.formFieldValueChanged.next(event);
    }

}
