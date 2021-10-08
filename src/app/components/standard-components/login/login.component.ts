/*
 * Copyright 2005-2018 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router /* ,ActivatedRoute, Params  */} from '@angular/router';
import { Validators } from '@angular/forms';
import { AppConfigService, LogService,AuthenticationService, AlfrescoApiService, StorageService,LoginComponent as login ,AppsProcessService, CookieService} from '@alfresco/adf-core';
import { Subscription} from 'rxjs';


@Component({
    selector: 'apw-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit,AfterViewInit {

    @ViewChild('alfrescologin')
    alfrescologin: login;


    customValidation: any;

    customMinLength = 2;

    copyrightText = '\u00A9 2018 Alfresco Software, Inc. All Rights Reserved.';

    loginECM = false;
    loginBPM = false;
    provider = "ALL";

    successRoute: any;
    susbcription :Subscription;
    password: any;
    username: any;


    constructor(public router: Router,
        private logService: LogService,
        private appConfig: AppConfigService,
        /* private route:  ActivatedRoute, */
        private alfrescoApi:  AlfrescoApiService,
        private authService : AuthenticationService,
        private changeDetector: ChangeDetectorRef,
        private storage: StorageService, 
        private appsProcessService:AppsProcessService,
        private cookieService:CookieService,
        /* public alfrescoApiClient : AlfrescoApiClient  */
        ) {

            this.customValidation = {
            username: ['', Validators.compose([
                Validators.required,
                Validators.minLength(this.customMinLength)
            ])],
            password: ['', Validators.required]
        };
        
    }

    ngOnInit() {
        this.copyrightText = this.appConfig.get<string>('adf-login.copyrightText', this.copyrightText);
        this.alfrescologin.addCustomValidationError('username', 'required', 'LOGIN.MESSAGES.USERNAME-REQUIRED');
        this.alfrescologin.addCustomValidationError('username', 'minlength', 'LOGIN.MESSAGES.USERNAME-MIN',
               { minLength: this.customMinLength });
        this.alfrescologin.addCustomValidationError('password', 'required', 'LOGIN.MESSAGES.PASSWORD-REQUIRED'); 
    /*     this.route.queryParams.subscribe((params: Params) => {
            const url = params['redirectUrl'];
            const provider = this.provider;//this.appConfig.get<string>(AppConfigValues.PROVIDERS);
            this.authService.setRedirect({ provider, url });
            if(url.includes("/tasks")  ){
                let redirectUrl = this.authService.getRedirect(); 
                if (redirectUrl) {
                    this.authService.setRedirect(null);
                    this.router.navigateByUrl(redirectUrl).then( success => {
                        console.log(success);
                    }, error => {
                        console.log(error);
                    });
                }
            }
        }); */
        

        this.authService.alfrescoApi.alfrescoApi.processAuth.basicAuth = function basicAuth(username: string, password: string): string {
            const str: any = username + ':' + password;
    
            let base64;

            base64 = btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
                return String.fromCharCode(parseInt(p1, 16))
            }))
    
            return 'Basic ' + base64;
        };
    }

    ngAfterViewInit(){
        
    }

    onLogin($event) {
        
    }

    onError($event) {
        this.logService.error($event);
    }

    validateForm($event) {
        this.username = $event.values.controls.username.value;
        this.password = $event.values.controls.username.parent.value.password;

        this.login(this.username,this.password);
        
        $event.preventDefault(); 
    }

    login(username,password){
		let promise1 = this.logUser("ECM",username, password).then( success => {
        //let promise1 = this.logUser("ECM","admin", "Aa@12345").then( success => {
                this.loginECM = true;
            }, error => { 

            }
        ) 
		let promise2 = this.logUser("BPM",username,password).then( success => {
		//let promise2 = this.logUser("BPM","admin@app.activiti.com", "Aa@12345").then( success => {
                this.loginBPM = true;
            }, error => { 
                console.log(error)
            }
        ); 
        Promise.all( [promise1  ,promise2  ] ).then(success =>{
                this.authService.alfrescoApi.getInstance().setAuthenticationClientECMBPM(this.authService.alfrescoApi.getInstance().contentAuth.getAuthentication(), this.authService.alfrescoApi.getInstance().processAuth.getAuthentication());
                if(this.loginECM  && this.loginBPM ){
                    this.groupsRedirect("ALL");
                }
                else if(this.loginECM){
                    this.groupsRedirect("ECM");
                }else if(this.loginBPM){
                    this.groupsRedirect("BPM");
                }else {
                    this.alfrescologin.errorMsg = "No se han reconocido los datos de autenticación o el servicio no esta disponible ";
                    this.alfrescologin.isError = true;
                }
            }
            ,error => {
                console.log(error)
            }
        )
    }

    logUser(provider,username, password) {
        this.changeProvider(provider);
        this.changeDetector.detectChanges();

        return this.authService
            .login(username, password, true).toPromise(); 
    }

    changeProvider(provider){
        this.alfrescoApi.getInstance().contentAuth.config.provider = provider; 
        this.alfrescoApi.getInstance().processAuth.config.provider = provider; 
        this.alfrescoApi.getInstance().config.provider = provider; 
        this.alfrescoApi.lastConfig.provider = provider;
        this.appConfig.config.providers = provider;
    }

    async groupsRedirect(provider){
        this.cookieService.setItem('site',null,null,null);
        if(provider =='ALL' ){
            await this.alfrescoApi.peopleApi.getSiteMembership("-me-").then( async  success => {
                let site = success.list.entries.filter( 
                    group => group.entry.id === "regulacion" ||
                        group.entry.id === "csa" ||
                        group.entry.id === "polizas" ||
                        group.entry.id === "financiero" ||
                        group.entry.id === "it"
                    );
                if( site.length > 0 ){
                    this.loginECM = true;
                }else{
                    this.loginECM = false;
                    await this.alfrescoApi.getInstance().contentAuth.logout();
                }
             });
            await this.appsProcessService.getDeployedApplications().toPromise().then( async success => {
                let app = success.filter( app => app.name === "CSA" || 
                                                app.name === "IT");

                if( app.length > 0 ){
                    this.loginBPM = true;
                }else{
                    this.loginBPM = false;
                    await this.alfrescoApi.getInstance().processAuth.logout();
                }
            });
            if(this.loginECM == true && this.loginBPM == true){
                this.authService.setRedirect({provider:'ALL',url:'/apps'});
                this.changeProvider("ALL");
                this.storage.setItem("providers","ALL");
            }
            else if(this.loginECM == true ){
                this.authService.setRedirect({provider:'ECM',url:'/content/home'});
                this.changeProvider("ECM");
                this.storage.setItem("providers","ECM");
            }
            else if(this.loginBPM == true){
                this.authService.setRedirect({provider:'BPM',url:'/apps'});
                this.changeProvider("BPM");
                this.storage.setItem("providers","BPM");
            }else {
                this.authService.setRedirect(null);
                this.alfrescologin.errorMsg = "No tienes los permisos necesarios para acceder a la aplicación";
                this.alfrescologin.isError = true;
            }
            let redirectUrl = this.authService.getRedirect(); 
            if (redirectUrl) {
                this.authService.setRedirect(null);
                this.router.navigateByUrl(redirectUrl);
            }
        }
        else if(provider =='ECM'){
            await this.alfrescoApi.peopleApi.getSiteMembership("-me-").then( async success => {
                let site = success.list.entries.filter( 
                    group => group.entry.id === "regulacion" ||
                        group.entry.id === "polizas" ||
                        group.entry.id === "it" ||
                        group.entry.id === "financiero" 
                    );
                if( site.length > 0 ){
                    this.authService.setRedirect({provider:'ECM',url:'/content/home'});
                    this.changeProvider("ECM");
                    this.storage.setItem("providers","ECM");
                }else{
                    this.authService.setRedirect(null);
                    await this.alfrescoApi.getInstance().contentAuth.logout();
                    this.alfrescologin.errorMsg = "No tienes los permisos necesarios para acceder a la aplicación";
                    this.alfrescologin.isError = true;
                }

                let redirectUrl = this.authService.getRedirect(); 
                if (redirectUrl) {
                    this.authService.setRedirect(null);
                    this.router.navigateByUrl(redirectUrl);
                }
             });
    
        }else if(provider =='BPM'){
            await this.appsProcessService.getDeployedApplications().toPromise().then( async success => {
                let app = success.filter( app => app.name === "CSA" ||
                                                app.name === "IT");
                if( app.length > 0 ){
                    this.authService.setRedirect({provider:'BPM',url:'/apps'});
                    this.changeProvider("BPM");
                    this.storage.setItem("providers","BPM");
                }else{
                    this.authService.setRedirect(null);
                    this.alfrescologin.errorMsg = "No tienes los permisos necesarios para acceder a la aplicación";
                    this.alfrescologin.isError = true;
                    await  this.alfrescoApi.getInstance().processAuth.logout();
                }

                let redirectUrl = this.authService.getRedirect(); 
                if (redirectUrl) {
                    this.authService.setRedirect(null);
                    this.router.navigateByUrl(redirectUrl);
                }

            });
        }
    }


}
