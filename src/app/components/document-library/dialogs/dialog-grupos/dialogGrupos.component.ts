import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { DataRowActionEvent, DataCellEvent, AlfrescoApiService, /* NotificationService, */ DataTableComponent } from '@alfresco/adf-core';
import { SelectAutocompleteComponent } from 'select-autocomplete';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MatSnackBar } from '@angular/material';

declare var $: any;
/*
  Gestión de Grupos
*/
@Component({
  selector: 'dialog-grupos',
  templateUrl: 'dialog-grupos.html'
})
export class DialogGrupos implements OnInit {
  @ViewChild(SelectAutocompleteComponent)
  multiSelect: SelectAutocompleteComponent;
  sites = [];
  persons = [];
  correo: string = "";
  ldap: any = [];
  ldapaux: any = [];
  options: any = [];
  selectedOptions = [];
  usercorreo: string = "";
  subject: string = "";
  selected = this.selectedOptions;
  showError = false;
  errorMessage = '';
  ver: boolean = false;
  dataAdapter: any = [];
  dataAdapteraux: any = [];
  schema: any;
  nombregrupo: string = "";
  datagrupo: any = [];
  datagrupoaux: any = [];
  idgrupos: string = "";
  datalistaaux: string = "";
  @ViewChild('dataTable1')
  dataTable1: DataTableComponent;
  constructor(public dialogRef: MatDialogRef<DialogGrupos>, private snackBar: MatSnackBar, private changeDetector: ChangeDetectorRef, private http: HttpClient, private apiService: AlfrescoApiService) {
    this.schema =
      [
        {
          type: 'text',
          key: 'idusario',
          title: 'IdUsuario',
          sortable: true
        },
        {
          type: 'text',
          key: 'nombreusuario',
          title: 'Grupo',
          sortable: true
        },
        {
          type: 'text',
          key: 'mail',
          title: 'Usuario',
          sortable: true
        }
      ];
  }
  getSelectedOptions(selected) {
    this.selected = selected;
  }
  onResetSelection() {
    this.selectedOptions = [];
  }
  ngOnInit() {
    this.CargarGrupos();
  }
  onShowRowActionsMenu(event: DataCellEvent) {
    let aviso = { title: 'Eliminar', icon: "delete" };
    let acciones = [aviso];
    event.value.actions = acciones;
  }
  onExecuteRowAction(event: DataRowActionEvent) {
    let args = event.value;
    let id = args.row.getValue('idusario');
    switch (args.action.title) {
      case 'Eliminar':
        this.snackBar.open('Eliminando usuario...', '', {
          panelClass: ['mat-snack-bar-container']
        });
        var funct = this;
        var snackBar = this.snackBar;
        var data = encodeURI('idusuario=' + id + '');
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("readystatechange", function () {
          if (this.readyState === 4) {
            if (this.responseText != "") {
              //var resu = JSON.parse(this.responseText);
              snackBar.dismiss();
              funct.cargarLista();
            }
          }
        });
        this.onResetSelection();
        xhr.open("POST", "./WSRegulacionRest/jcmouse/restapi/borrarusuario/");
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(data);
        break;
      default:
        break;
    }
  }
  cargarLista(): void {
    this.dataAdapter = [];
    this.dataTable1.loading = true;
    this.http.get('./WSRegulacionRest/jcmouse/restapi/usuarios/' + this.idgrupos + ',' + Date.now() + '')
      .subscribe(data1 => {
        if (data1 != undefined) {
          this.dataAdapteraux = data1;
          if (this.dataAdapteraux.US.length != 0)
            this.dataTable1.loading = false;
          if (this.dataAdapteraux.US.length > 1) {
            this.dataAdapteraux.US.forEach(element => {
              this.dataAdapter.push(element);
            });
          }
          else {
            this.dataAdapter.push(this.dataAdapteraux.US);
          }
          this.changeDetector.detectChanges();
          this.dataTable1.loading = false;
        }
        else {
          this.dataTable1.loading = false;
          this.dataAdapter = [];
        }
      }, error => {
        console.log(error, "error");
      });
  }
  CargarGrupos(): void {
    $('.ver').hide();
    this.http.get('./WSRegulacionRest/jcmouse/restapi/ldap/null,' + Date.now() + '')
      .subscribe(data1 => {
        this.ldapaux = data1;
        this.ldap = this.ldapaux.LDAP;
        this.options = this.ldap;
        var aux = [];
        this.options.forEach(element => {
          aux.push({ display: element.display, value: element.display + '//' + element.value });
        });
        this.options = aux;
      }, error => {
        console.log(error, "error");
      });
    this.apiService.peopleApi.getPerson('-me-').then(result => {
      this.usercorreo = result.entry.email;
      this.snackBar.open('Cargando grupos...', '', {
        panelClass: ['mat-snack-bar-container']
      });
      var snackBar = this.snackBar;
      this.http.get('./WSRegulacionRest/jcmouse/restapi/grupos/' + this.usercorreo + ',' + Date.now() + '')
        .subscribe(data2 => {
          if (data2 != null) {
            this.datagrupo = [];
            this.datagrupoaux = data2;
            if (this.datagrupoaux.GR.length > 1) {
              this.datagrupoaux.GR.forEach(element => {
                this.datagrupo.push(element);
              });
            }
            else {
              this.datagrupo.push(this.datagrupoaux.GR);
            }
          }
          else {
            this.datagrupo = [];
          }
          //this.options =	this.datagrupo;
          snackBar.dismiss();
        }, error => {
          console.log(error, "error");
        });
    });
  }
  AnadirUsuario(): void {
    this.apiService.peopleApi.getPerson('-me-').then(result => {
      this.usercorreo = result.entry.email;
      if (this.idgrupos != "") {
        var auxcorreo = [];
        var repetidos = "";
        var entra = "false";
        this.dataAdapter.forEach(element => {
          if (element.mail != "") {
            auxcorreo.push(element.mail);
          }
          else {
            this.snackBar.open('Correo asociado al usuario vacio', '', {
              panelClass: ['mat-snack-bar-container'],
              duration: 2500
            });
          }
        });
        var aux = "";
        this.selected.forEach(element => {
          var correospit = element.split("//");
          const index = auxcorreo.indexOf(correospit[1]);
          if (index == -1) {
            entra = "true";
            aux += element + "/-/";
          }
          else {
            repetidos += " " + correospit[1];
          }
        });
        if (repetidos != "") {
          this.snackBar.open('Usuarios ya existentes en el gurpo ' + repetidos, '', {
            panelClass: ['mat-snack-bar-container'],
            duration: 2500
          });
        }
        if (entra == "true") {
          this.snackBar.open('Guardando usuarios...', '', {
            panelClass: ['mat-snack-bar-container']
          });
          var funct = this;
          var snackBar = this.snackBar;
          var data = encodeURI('idgrupo=' + this.idgrupos + '&' + 'usuariologin=' + this.usercorreo + '&' + 'nombreusuario=' + aux.slice(0, -3) + '');
          var xhr = new XMLHttpRequest();
          xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
              if (this.responseText != "") {
                snackBar.dismiss();
                funct.cargarLista();
              }
            }
          });
          this.onResetSelection();
          xhr.open("POST", "./WSRegulacionRest/jcmouse/restapi/crearusuario/");
          xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
          xhr.send(data);
        }
      }
      else {
        this.snackBar.open('Seleccione un grupo', '', {
          panelClass: ['mat-snack-bar-container'],
          duration: 2000
        });
      }
    });
  }
  MostarNuevoGrupo(): void {
    $('.ver').show();
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  BorrarGrupo(): void {
    if (this.idgrupos != "") {
      var funct = this;
      this.snackBar.open('Borrando grupo...', '', {
        panelClass: ['mat-snack-bar-container']
      });
      var snackBar = this.snackBar;
      var data = encodeURI('idgrupo=' + this.idgrupos + '&' + 'usuario=' + this.usercorreo + '');
      var xhr = new XMLHttpRequest();
      xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
          if (this.responseText != "") {
            //var resu = JSON.parse(this.responseText);
            snackBar.dismiss();
            funct.CargarGrupos();
            funct.cargarLista();
          }
        }
      });
      xhr.open("POST", "./WSRegulacionRest/jcmouse/restapi/borrargrupo/");
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.send(data);
    }
    else {
      this.snackBar.open('Seleccione un grupo...', '', {
        panelClass: ['mat-snack-bar-container'],
        duration: 2000
      });
    }
  }
  guardargrupo(): void {
    if (this.nombregrupo != "") {
      var aux = [];
      this.datagrupo.forEach(element => {
        aux.push(element.nombregrupo);
      });
      const index = aux.indexOf(this.nombregrupo);
      if (index == -1) {
        var funct = this;
        this.snackBar.open('Creando grupo...', '', {
          panelClass: ['mat-snack-bar-container']
        });
        var snackBar = this.snackBar;
        var data = encodeURI('nombregrupo=' + this.nombregrupo + '&' + 'usuario=' + this.usercorreo + '');
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("readystatechange", function () {
          if (this.readyState === 4) {
            if (this.responseText != "") {
              //var resu = JSON.parse(this.responseText);
              snackBar.dismiss();
              funct.CargarGrupos();
            }
          }
        });
        xhr.open("POST", "./WSRegulacionRest/jcmouse/restapi/creargrupo/");
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(data);
        this.nombregrupo = "";
      }
      else {
        this.snackBar.open('El grupo ya existe', '', {
          panelClass: ['mat-snack-bar-container'],
          duration: 2000
        });
      }
    }
    else {
      this.snackBar.open('Rellene nombre de grupo', '', {
        panelClass: ['mat-snack-bar-container']
      });
    }
  }
}