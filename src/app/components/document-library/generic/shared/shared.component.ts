import { Component} from '@angular/core';
import { PreviewService } from '../../../../services/preview.service';

@Component({
  selector: 'app-sharedComponent',
  templateUrl: './shared.component.html',
  styleUrls: ['./shared.component.css']
})
export class SharedComponent {

  constructor(private preview : PreviewService){

  }
  showPreview(event) {
    const entry = event.value.entry;
    if (entry && entry.isFile) {
      this.preview.showResource(entry.id);
    }
  }
  myCustomActionAfterDelete(event) {
/*     let entry = event.value.entry;

    let item = "";

    if (entry.isFile) {
      item = "file";
    } else if (entry.isFolder) {
      item = "folder"
    }
    this.documentList.reload();
    this.notificationService.openSnackMessage(`Deleted ${item} "${entry.name}" `, 20000); 
  }*/

  }

}
