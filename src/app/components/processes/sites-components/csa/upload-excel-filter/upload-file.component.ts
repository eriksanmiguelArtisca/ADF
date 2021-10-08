import { Component} from '@angular/core';
import { NotificationService} from '@alfresco/adf-core';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css']
})
export class UploadFileComponent  {
  files: any = [];
  json: any= [] ;
  constructor(private notificationService:NotificationService){
  }
  

  uploadFile(event) {
     for (let index = 0; index < event.length; index++) {
      const element = event[index];
     if(element.name.includes(".xlsx")){
        this.files = [];
        this.json = []; 

        this.files.push(element.name);
        var file = element;
        var reader = new FileReader();
           
        reader.onload = (e:any) => {       
          var binary = "";
          var bytes = new Uint8Array(e.target.result);
          var length = bytes.byteLength;
          for (var i = 0; i < length; i++) {
              binary += String.fromCharCode(bytes[i]);
          }           
          var workbook = XLSX.read(binary, { type: 'binary' }); 
          var sheet_name_list = workbook.SheetNames;
          this.json = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]] , {header:1}) ;
          
        };
        reader.readAsArrayBuffer(file);
      }else {
        this.notificationService.showError("El archivo debe ser un Excel con extension '.xlsx' ") ; 
      } 
    }  
  }
  deleteAttachment(index) {
    this.files.splice(index, 1);
    this.json = [];
  }
}
