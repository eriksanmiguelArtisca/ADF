import { Component, ViewChild, Inject, OnInit } from '@angular/core';
import { AlfrescoApiService } from '@alfresco/adf-core';
import { SelectAutocompleteComponent } from 'select-autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA, MatChipInputEvent, MatDialog, MatSnackBar } from '@angular/material';
import { /*  MinimalNode, */ NodeBodyUpdate } from '@alfresco/js-api';
import { DialogGrupos } from "../dialog-grupos/dialogGrupos.component";

declare var $: any;

export interface Ponente {
  name: string;
  mano: string;
}

export interface DialogEmailData {
  id : string;
  path: string;
  name: string;
  vencimiento : string;
  asunto : string;
  cuerpo : string; 
}


@Component({
  selector: 'dialog-send-email',
  templateUrl: 'dialog-send-email.html',
})
export class DialogSendEmail implements OnInit {
  @ViewChild(SelectAutocompleteComponent)
  multiSelect: SelectAutocompleteComponent;
  sites = [];
  persons = [];
  correo: string = "";
  ldap: any = [];
  ldapaux: any = [];
  options: any = [];
  datagrupocorreo: any = [];
  datagrupoauxcorreo: any = [];
  selectedOptions = [];
  usercorreo: string = "";
  subject: string = "";
  ponentes: Ponente[] = [];
  selected = this.selectedOptions;
  showError = false;
  errorMessage = '';
  auxcorreo: any = [];
  idgrupos: any = [];
  id: any = [];
  notificationService: any;
  constructor(public dialogRef: MatDialogRef<DialogSendEmail>,
    @Inject(MAT_DIALOG_DATA)
    public data: DialogEmailData, private snackBar: MatSnackBar, private dialog: MatDialog, private http: HttpClient, private apiService: AlfrescoApiService) {
    this.id = this.data.id;
    this.subject = this.data.cuerpo;
  }
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    if ((value || '').trim()) {
      this.ponentes.push({ name: value.trim(), mano: 'si' });
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
  }
  remove(ponente: Ponente): void {
    var aux = [];
    const index = this.ponentes.indexOf(ponente);
    if (index >= 0) {
      this.ponentes.splice(index, 1);
    }
    this.ponentes.forEach(element => {
      if (element.mano == 'no')
        aux.push(element.name);
    });
    this.multiSelect.selectedValue = aux;
  }
  getSelectedOptions(selected) {
    var aux = [];
    var repetidos = "";
    this.ponentes.forEach(element => {
      aux.push(element.name);
    });
    selected.forEach(element => {
      const index = aux.indexOf(element);
      if (index == -1) {
        if (element != "") {
          this.ponentes.push({ name: element, mano: 'no' });
          this.selected = selected;
        }
      }
      else {
        repetidos += " " + element;
      }
    });
    if (repetidos != "") {
      this.snackBar.open('Se han elimanado correos duplicados ' + repetidos, '', {
        panelClass: ['mat-snack-bar-container'],
        duration: 2000
      });
    }
  }
  onResetSelection() {
    this.selectedOptions = [];
  }
  ngOnInit() {
    this.http.get('./WSRegulacionRest/jcmouse/restapi/ldap/null,' + Date.now() + '')
      .subscribe(data1 => {
        this.ldapaux = data1;
        this.ldap = this.ldapaux.LDAP;
        this.options = this.ldap;
      }, error => {
        console.log(error, "error");
      });
    this.cargarGrupos();
  }
  cargarGrupos(): void {
    this.apiService.peopleApi.getPerson('-me-').then(result => {
      this.usercorreo = result.entry.email;
      this.snackBar.open('Cargando grupos...', '', {
        panelClass: ['mat-snack-bar-container']
      });
      var snackBar = this.snackBar;
      this.http.get('./WSRegulacionRest/jcmouse/restapi/grupos/' + this.usercorreo + ',' + Date.now() + '')
        .subscribe(data2 => {
          if (data2 != null) {
            this.datagrupocorreo = [];
            this.datagrupoauxcorreo = data2;
            if (this.datagrupoauxcorreo.GR.length > 1) {
              this.datagrupoauxcorreo.GR.forEach(element => {
                this.datagrupocorreo.push(element);
              });
            }
            else {
              this.datagrupocorreo.push(this.datagrupoauxcorreo.GR);
            }
          }
          else {
            this.datagrupocorreo = [];
          }
          //this.options =	this.datagrupo;
          snackBar.dismiss();
        }, error => {
          console.log(error, "error");
        });
    });
  }
  cargarLista(): void {
    var aux = [];
    this.ponentes.forEach(element => {
      if (element.mano == 'si')
        aux.push({ name: element.name, mano: 'si' });
    });
    this.ponentes = aux;
    this.actualizarvalores();
    this.idgrupos.forEach(grupo => {
      this.http.get('./WSRegulacionRest/jcmouse/restapi/usuarios/' + grupo + ',' + Date.now() + '')
        .subscribe(data1 => {
          if (data1 != undefined) {
            var aux = [];
            var repetidos = "";
            this.ponentes.forEach(element => {
              aux.push(element.name);
            });
            this.auxcorreo = data1;
            if (this.auxcorreo.US.length > 1) {
              this.auxcorreo.US.forEach(element => {
                const index = aux.indexOf(element.mail);
                if (index == -1) {
                  this.ponentes.push({ name: element.mail, mano: 'no' });
                  this.actualizarvalores();
                }
                else {
                  repetidos += " " + element.mail;
                }
              });
            }
            else {
              const index = aux.indexOf(this.auxcorreo.US.mail);
              if (index == -1) {
                this.ponentes.push({ name: this.auxcorreo.US.mail, mano: 'no' });
                this.actualizarvalores();
              }
              else {
                repetidos += " " + this.auxcorreo.US.mail;
              }
            }
            //	this.idgrupos="";
            if (repetidos != "") {
              this.snackBar.open('Se han elimanado correos duplicados ' + repetidos, '', {
                panelClass: ['mat-snack-bar-container'],
                duration: 2500
              });
            }
          }
          else {
            this.snackBar.open('EL grupo no contiene usuarios', '', {
              panelClass: ['mat-snack-bar-container'],
              duration: 2000
            });
          }
        }, error => {
          console.log(error, "error");
        });
    });
  }
  actualizarvalores(): void {
    var aux1 = [];
    this.ponentes.forEach(element => {
      if (element.mano == 'no')
        aux1.push(element.name);
    });
    this.multiSelect.selectedValue = aux1;
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  AbrirGrupos(): void {
    const ref = this.dialog.open(DialogGrupos, { width: '840px' });
    ref.afterClosed().subscribe(() => {
      this.cargarGrupos();
    });
  }
  UpdateSendMail(id) {
    let nodeBody = <NodeBodyUpdate>{
      "properties": {
        "regu:enviado": "SI",
      }
    };
    this.apiService
      .getInstance()
      .upload.updateNode(id, nodeBody).then(success => {
      }, error => {
        this.notificationService.openSnackMessage("Se ha producido un error actualizando metadato de envio", 4000);
      });
  }
  send(): void {
    var ruta = $('#ruta').val();
    var aux = ruta.split('/');
    aux.shift();
    aux.shift();
    ruta = aux.join("/");
    var destinatario = "";
    for (var i = 0; i < this.ponentes.length; i++) {
      destinatario += this.ponentes[i].name + ',';
    }
    destinatario = destinatario.slice(0, -1);
    if (destinatario != "") {
      this.snackBar.open('Enviando...', '', {
        panelClass: ['mat-snack-bar-container']
      });
      var snackBar = this.snackBar;
      var dialogRef = this.dialogRef;
      var id = this.id;
      var this1 = this;
      var data = encodeURI('destinatario=' + destinatario + '&' + 'asunto=' + $('#asunto').val() + '&' + 'cuerpo=' + this.subject + '&' + 'path=' + ruta + '&' + 'vecimiento=' + $('#vencimiento').val() + '&' + 'creadopor=' + this.usercorreo + '');
      var xhr = new XMLHttpRequest();
      xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
          if (this.responseText != "") {
            var resu = JSON.parse(this.responseText);
            snackBar.dismiss();
            if (resu[0] == "true") {
              dialogRef.close();
              $('#vencimiento').val('');
              this1.UpdateSendMail(id);
              snackBar.open('Enviado correctamente', '', {
                panelClass: ['mat-snack-bar-container'],
                duration: 2000
              });
            }
            else {
              snackBar.open('Fallo en el envio', '', {
                panelClass: ['mat-snack-bar-container'],
                duration: 2000
              });
            }
          }
        }
      });
      xhr.open("POST", "./WSRegulacionRest/jcmouse/restapi/mail/");
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.send(data);
    }
    else {
      this.snackBar.open('Introducir destinatario', '', {
        panelClass: ['mat-snack-bar-container'],
        duration: 2000
      });
    }
  }
}