import { Component, AfterContentInit, OnDestroy, ChangeDetectorRef, OnInit } from '@angular/core';
import { DocumentlistComponent } from "../sites-components/regulacion/documentlist/documentlist.component";
import { NotificationService, AuthenticationService, CookieService } from '@alfresco/adf-core';
import { Subscription } from 'rxjs';
import { isUndefined, isNull } from 'util';
import { Router } from '@angular/router';
import { DocumentlistComponentGeneric } from '../generic/documentlist-generic/documentlist-generic.component';

@Component({
  selector: 'app-root',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.css']
})
export class AppLayoutComponent implements AfterContentInit,OnDestroy,OnInit {
  
  
 
  subscription: Subscription;
  componenteActual: any;
  isDocumentList = false;
  folderId = '';
  showGenericComponents = true;

  loginECM = false;
  loginBPM = false;

  constructor(private notificationService: NotificationService,private authService : AuthenticationService ,
    private changeDetector: ChangeDetectorRef,public router: Router,private cookiesService : CookieService){

  }

  ngOnInit(): void {
    this.loginECM = this.authService.isEcmLoggedIn();
    this.loginBPM = this.authService.isBpmLoggedIn();
    this.changeDetector.detectChanges();
  }

  ngAfterContentInit(): void {

    
  }

  ngOnDestroy(): void {
    if( !isUndefined(this.subscription) ){
      this.subscription.unsubscribe();
    }
  }

  navigateDocumentList(){
    let site = this.cookiesService.getItem('site');
        if (site === 'regulacion') {
            this.router.navigate(['content/documentlist']);
        } else {
            this.router.navigate(['content/documentlist/'+site]).then( success => {
          
            },error =>{
                this.router.navigate(['content/documentlist-g']);
            })
        }
  }

  navigateSearch(){
    let site = this.cookiesService.getItem('site');
        if (site === 'regulacion') {
            this.router.navigate(['content/home']);
        } else {
            this.router.navigate(['content/search/'+site]).then( success => {
             
            },error =>{
                this.router.navigate(['content/search-g']);
            })
        }
  }



  successCreateFolder($event){
    this.notificationService.openSnackMessage('Carpeta creada correctamente');
    if(this.componenteActual instanceof DocumentlistComponent){
      this.componenteActual.documentList.reload();
    }else if(this.componenteActual instanceof DocumentlistComponentGeneric){
      this.componenteActual.documentList.reload();
    }
  }
  errorCreateFolder($event){
    this.notificationService.openSnackMessage($event);
  }
  onActivate(componentRef){
    if( !isUndefined(this.subscription) ){
      this.subscription.unsubscribe();
    }
    this.componenteActual = componentRef;
    if(this.componenteActual instanceof DocumentlistComponent){
      this.isDocumentList = true;
      this.subscription = this.componenteActual.documentList.ready.subscribe(next => {
        this.folderId =  this.componenteActual.documentList.currentFolderId;
      });
      //this.folderId = this.componenteActual.documentList.folderNode      
    }
    else if(this.componenteActual instanceof DocumentlistComponentGeneric){
      this.isDocumentList = true;
      this.subscription = this.componenteActual.documentList.ready.subscribe(next => {
        this.folderId =  this.componenteActual.documentList.currentFolderId;
      });
      //this.folderId = this.componenteActual.documentList.folderNode      
    }
    else {
      this.isDocumentList = false;
      if( !isUndefined(this.subscription) ){
        this.subscription.unsubscribe();
      }
    }
  }
  showGeneric(){
    let site = this.cookiesService.getItem('site');
    if (!isNull(site) && site != 'null') {
      if(site == 'regulacion'){
        return false;
      }
    }
    return true;
    
  }
  showCreateFolder(){
    return (this.isDocumentList && this.router.url.search('documentlist') != -1) ||  this.router.url.search('documentlist-g') != -1;
  }
}
