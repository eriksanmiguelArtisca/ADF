import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Component,OnInit,Output, EventEmitter,Inject } from '@angular/core';
import { BpmUserService, NotificationService,AuthenticationService } from '@alfresco/adf-core';
import { TaskListService } from '@alfresco/adf-process-services';
import { LightUserRepresentation } from '@alfresco/js-api';
import { Observable, Observer } from 'rxjs';
import { share } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';
/*
  Componentes de los Formularios
*/
export interface DialogAsignarData {
  id: string;
}

@Component({
  selector: 'dialog-send-asignar',
  templateUrl: 'dialog-send-asignar.html',
})


	
export class DialogAsignar implements OnInit {
	
	@Output()
    changeAssignee: EventEmitter<LightUserRepresentation> = new EventEmitter<LightUserRepresentation>();
	
	private peopleSearchObserver: Observer<LightUserRepresentation[]>;
    peopleSearch$: Observable<LightUserRepresentation[]>;
    id : string;
    people:	LightUserRepresentation[];

    taskPeople: LightUserRepresentation[] = [];
    constructor(public dialogRef: MatDialogRef<DialogAsignar>,@Inject(MAT_DIALOG_DATA) public data: DialogAsignarData,
				 private taskListService : TaskListService,private authenticationService :AuthenticationService,	private bpmUserService : BpmUserService, private notificationService: NotificationService) { }

    ngOnInit() {
      this.grupos();
		this.peopleSearch$ = new Observable<LightUserRepresentation[]>(observer => this.peopleSearchObserver = observer).pipe(share());
    }
    
    searchUser(searchedWord: string) {
      let results = [];
   
      results = this.people.filter( person => (!isNullOrUndefined(person.firstName)  && (person.firstName.toLowerCase()+' '+person.lastName.toLowerCase()).includes(searchedWord) 
                                            || !isNullOrUndefined(person.lastName) && (person.lastName.toLowerCase()).includes(searchedWord.toLowerCase())));
      this.peopleSearchObserver.next(results);
    }

    assignTaskToUser(selectedUser: LightUserRepresentation) {

		if(selectedUser.id!=undefined){
		this.taskListService.assignTaskByUserId(this.data.id,selectedUser.id+'').subscribe(success =>{
	    this.bpmUserService.getCurrentUserInfo().subscribe(success =>{
			  
		},error=>{
				   this.notificationService.openSnackMessage('Error asignado usuario..', 5000);
		});
	    },error=>{
				   this.notificationService.openSnackMessage('Error asignado usuario..', 5000);
    });
   // this.dialogRef.close();
		}else{
      
			   this.notificationService.openSnackMessage('Seleccione un usuario.', 5000);
		}
	
    }

    onCloseSearch() {
    this.dialogRef.close();
    } 
	
    getTaskHeaderViewClass() {
    return 'default-view';
    }

  
     grupos(){
    let ticket = this.authenticationService.getTicketBpm();
    var this1 = this;

   
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        if (this.responseText != "") {
          var resu = JSON.parse(this.responseText);
          var data = resu['data'];
    
          this1.id = data[0]['id'];
          console.log(  this1.id );
          var xhr = new XMLHttpRequest();
          xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
              if (this.responseText != "") {
                var resu = JSON.parse(this.responseText);
              this1.people = resu['data'];
                console.log(resu);
            
              }
            }
          });
          xhr.open("GET", "/api/enterprise/groups/"+this1.id +"/users");
          xhr.setRequestHeader("Content-Type","application/json;charset=UTF-8" );
          xhr.setRequestHeader("Authorization",ticket );
          xhr.send();
        }
      }
    });

    xhr.open("GET", "/api/enterprise/groups?filter=CSA APP");
    xhr.setRequestHeader("Content-Type","application/json;charset=UTF-8" );
    xhr.setRequestHeader("Authorization",ticket );
    xhr.send();


  
  

  }

	
  
}



