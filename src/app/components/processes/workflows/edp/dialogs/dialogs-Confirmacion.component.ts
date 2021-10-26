import { AfterViewInit, Component, Inject,} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

export interface DialogConfirmacionActionData {
  options: string [];
  selectedOption : string;
}

@Component({
  selector: 'dialog-Confirmacion-action',
  templateUrl: 'dialog-Confirmacion-action.html',
})
export class DialogConfirmacionAction implements AfterViewInit {

constructor(
  public dialogRef: MatDialogRef<DialogConfirmacionAction>,@Inject(MAT_DIALOG_DATA) public data: DialogConfirmacionActionData ) {
    
}
ngAfterViewInit(): void {
}

onNoClick(): void {
  this.dialogRef.close();
}


}




