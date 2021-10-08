import { AfterViewInit, Component, Inject,} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

export interface DialogProcessActionData {
  options: string [];
  selectedOption : string;
}

@Component({
  selector: 'dialog-process-action',
  templateUrl: 'dialog-process-action.html',
})
export class DialogProcessAction implements AfterViewInit {

constructor(
  public dialogRef: MatDialogRef<DialogProcessAction>,@Inject(MAT_DIALOG_DATA) public data: DialogProcessActionData ) {
    
}
ngAfterViewInit(): void {
}

onNoClick(): void {
  this.dialogRef.close();
}


}




