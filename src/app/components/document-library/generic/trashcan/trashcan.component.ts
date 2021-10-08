import { Component, ViewChild } from '@angular/core';
import { AlfrescoApiService } from '@alfresco/adf-core';
import { Subscription } from 'rxjs';
import { DocumentListComponent } from '@alfresco/adf-content-services';


@Component({
  selector: 'app-trashcanComponent',
  templateUrl: './trashcan.component.html',
  styleUrls: ['./trashcan.component.css']
})
export class TrashcanComponent {
  subscription : Subscription;

  @ViewChild('trashcan')
  documentList: DocumentListComponent;

  constructor(private apiService: AlfrescoApiService){

  }
  restore(event){
    this.apiService.getInstance().core.nodesApi.restoreNode(event.value.entry.id).then(success => {
      this.documentList.reload();
    });
  }
  

}
