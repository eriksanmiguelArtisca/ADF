import { Component } from '@angular/core';
import { PreviewService } from '../../../services/preview.service';
import { Router } from '@angular/router';

@Component({
    templateUrl: 'bob-view.component.html'
})
export class BlobViewComponent {
    content: Blob;
    name: string;

    constructor(preview: PreviewService, router: Router) {
        if (preview.content === null ) {
            router.navigate([{ outlets: { overlay: null } }]);
            return;
        }
        this.content = preview.content.contentBlob;
        this.name = preview.content.name; 
    }
}
