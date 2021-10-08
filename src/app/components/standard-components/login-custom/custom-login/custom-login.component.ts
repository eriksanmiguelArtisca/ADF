import {
    Component, EventEmitter,
    Input, OnInit, Output, TemplateRef, ViewEncapsulation, OnDestroy
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
/* import { Location } from '@angular/common'; */
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
/* import { Location } from '@angular/common'; */
import { LoginSuccessEvent, LoginErrorEvent, LoginSubmitEvent, AuthenticationService, TranslationService, LogService, /* IdentityUserService , */
    AppConfigService, UserPreferencesService, OauthConfigModel, AppConfigValues, AppsProcessService, /* AlfrescoApiService, AuthGuardEcm, AuthGuardBpm, *//*  JwtHelperService */ } from '@alfresco/adf-core';
/* import { HTTP_INTERCEPTORS,ɵHttpInterceptingHandler } from '@angular/common/http'; */
declare var $: any;

enum LoginSteps {
  Landing = 0,
  Checking = 1,
  Welcome = 2
}

interface ValidationMessage {
  value: string;
  params?: any;
}

@Component({
  selector: 'custom-login',
  templateUrl: './custom-login.component.html',
  styleUrls: ['./custom-login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CustomLoginComponent implements OnInit, OnDestroy {
    isPasswordShow: boolean = false;

    /**
     * Should the `Remember me` checkbox be shown? When selected, this
     * option will remember the logged-in user after the browser is closed
     * to avoid logging in repeatedly.
     */
    @Input()
    showRememberMe: boolean = true;

    /** Should the extra actions (`Need Help`, `Register`, etc) be shown? */
    @Input()
    showLoginActions: boolean = true;

    /** Sets the URL of the NEED HELP link in the footer. */
    @Input()
    needHelpLink: string = '';

    /** Sets the URL of the REGISTER link in the footer. */
    @Input()
    registerLink: string = '';

    /** Path to a custom logo image. */
    @Input()
    logoImageUrl: string = './assets/images/alfresco-logo.svg';

    /** Path to a custom background image. */
    @Input()
    backgroundImageUrl: string = './assets/images/background.svg';

    /** The copyright text below the login box. */
    @Input()
    copyrightText: string = '\u00A9 2016 Alfresco Software, Inc. All Rights Reserved.';

    /** Custom validation rules for the login form. */
    @Input()
    fieldsValidation: any;

    /** Route to redirect to on successful login. */
    @Input()
    successRoute: string = null;

    /** Emitted when the login is successful. */
    @Output()
    success = new EventEmitter<LoginSuccessEvent>();

    /** Emitted when the login fails. */
    @Output()
    error = new EventEmitter<LoginErrorEvent>();

    /** Emitted when the login form is submitted. */
    @Output()
    executeSubmit = new EventEmitter<LoginSubmitEvent>();

    implicitFlow: boolean = false;

    form: FormGroup;
    isError: boolean = false;
    errorMsg: string;
    actualLoginStep: any = LoginSteps.Landing;
    LoginSteps = LoginSteps;
    rememberMe: boolean = true;
    formError: { [id: string]: string };
    minLength: number = 2;
    footerTemplate: TemplateRef<any>;
    headerTemplate: TemplateRef<any>;
    data: any;

    private _message: { [id: string]: { [id: string]: ValidationMessage } };
    private onDestroy$ = new Subject<boolean>();

    private BPMlogin ;

    /**
     * Constructor
     * @param _fb
     * @param authService
     * @param translate
     */
    constructor(
        private _fb: FormBuilder,
        private authService: AuthenticationService,
        private translateService: TranslationService,
        private logService: LogService,
        private router: Router,
        private appConfig: AppConfigService,
        private userPreferences: UserPreferencesService,
       /*  private location: Location, */
        private route: ActivatedRoute,
        private sanitizer: DomSanitizer,
        public appsProcessService : AppsProcessService,
     /*    private alfrescoApi:  AlfrescoApiService,
        private authGuardEcm : AuthGuardEcm ,
        private authGuardBpm : AuthGuardBpm, */
       /*  private jwtHelperService : JwtHelperService , */
      /*   private identityUserService : IdentityUserService */
        
    ) {
        this.initFormError();
        this.initFormFieldsMessages();
    }

    ngOnInit() {
        if (this.authService.isOauth()) {
            const oauth: OauthConfigModel = this.appConfig.get<OauthConfigModel>(AppConfigValues.OAUTHCONFIG, null);
            if (oauth && oauth.implicitFlow) {
                this.implicitFlow = true;
            }
        }

        // this.alfrescoApi.peopleApi.getSiteMembership("-me-").then( async  success => {
        //     let site = success.list.entries.filter( 
        //         group => group.entry.id === "regulacion" ||
        //             group.entry.id === "csa" ||
        //             group.entry.id === "polizas" ||
        //             group.entry.id === "financiero" ||
        //             group.entry.id === "it"
        //         );
        //         console.log(site);

        //  });
        // this.appsProcessService.getDeployedApplications().toPromise().then( async success => {
        //     let app = success.filter( app => app.name === "CSA" || 
        //                                     app.name === "IT");
        //      console.log(app);
        // });
      /*   if(this.loginECM == true && this.loginBPM == true){
            this.authService.setRedirect({provider:'ALL',url:'/apps'});
            this.changeProvider("ALL");
            this.storage.setItem("providers","ALL");
        }
        else if(this.loginECM == true ){
            this.authService.setRedirect({provider:'ECM',url:'/content/home'});
        }
        else if(this.loginBPM == true){
            this.authService.setRedirect({provider:'BPM',url:'/apps'});
        }else {
            this.authService.setRedirect(null);
            this.alfrescologin.errorMsg = "No tienes los permisos necesarios para acceder a la aplicación";
            this.alfrescologin.isError = true;
        } */
       /*  let redirectUrl = this.authService.getRedirect(); 
        if (redirectUrl) {
            this.authService.setRedirect(null);
            this.router.navigateByUrl(redirectUrl);
        } */
        // console.log("ECM logged "+this.authService.isEcmLoggedIn());
        // console.log("ECM ticket "+this.authService.getEcmUsername() );
        // console.log("BPM logged "+this.authService.isBpmLoggedIn());
        // console.log("BPM ticket "+this.authService.getBpmLoggedUser() );

        //this.appsProcessService.getDeployedApplications().subscribe( apps=> {console.log(apps);this.router.navigateByUrl("/apps"); }, error => {console.log("Error apps"); console.log(error);this.router.navigateByUrl("/content/home");});
        // if (provider === 'BPM') {
        //     return this.isBpmLoggedIn();
        // } else if (provider === 'ECM') {
        //     return this.isEcmLoggedIn();
        // } else {
        //     return this.isLoggedIn();
        // }
        // console.log("ECM logged "+this.authService.isEcmLoggedIn());
        // console.log("BPM logged "+ this.authService.isBpmLoggedIn());
        // console.log("logged "+ this.authService.isLoggedIn());
 /*        console.log("Logins check");
        console.log(this.identityUserService.getCurrentUserInfo() );
        this.identityUserService.checkUserHasApplicationAccess("60a9b6c5-64ef-405f-8c6f-66bd8cd3878a","ECM").subscribe( access => {
            console.log("has aplication acces ECM" + access);
        }) ;
        this.identityUserService.checkUserHasApplicationAccess("60a9b6c5-64ef-405f-8c6f-66bd8cd3878a","BPM").subscribe( access => {
            console.log("has aplication acces BPM" + access);
        }) ; */
        
        //checkUserHasApplicationAccess("BPM");
        //console.log(this.alfrescoApi.getInstance().processClient);
      /*   console.log(this.alfrescoApi.getInstance().getBpmUsername());
        console.log(this.authGuardEcm.checkLogin(this.route.snapshot,"/content/home"));
        console.log(this.authGuardBpm.checkLogin(this.route.snapshot,"/apps")); */

        if (this.authService.isEcmLoggedIn() || this.authService.isBpmLoggedIn()) {
            // var xhr = new XMLHttpRequest();
            // xhr.open("GET", "/activiti-app/api/enterprise/runtime-app-definitions", true);
            // xhr.setRequestHeader("Authorization", "Bearer "+this.authService.getToken()  )
            // xhr.send();   
            // var xhr = new XMLHttpRequest();
            // xhr.open("GET", "/alfresco/api/-default-/public/alfresco/versions/1/sites", true);
            // xhr.setRequestHeader("Authorization", "Bearer "+this.authService.getToken()  )
            // xhr.send();   
            //xhr.
            $.when.apply( undefined, this.callsAjax("Bearer "+this.authService.getToken() ) ).then( calls => {
                console.log(calls);
                this.authService.setRedirect({provider:'ALL',url:'/apps'});
                this.redirectLogin();
            }).catch( error => {
                this.authService.setRedirect({provider:'ECM',url:'/content/home'});
                this.redirectLogin();
            })

            
     
  
        } else {
            this.route.queryParams.subscribe((params: Params) => {
                const url = params['redirectUrl'];
                const provider = this.appConfig.get<string>(AppConfigValues.PROVIDERS);

                this.authService.setRedirect({ provider, url });
            });
        }

        if (this.hasCustomFieldsValidation()) {
            this.form = this._fb.group(this.fieldsValidation);
        } else {
            this.initFormFieldsDefault();
            this.initFormFieldsMessagesDefault();
        }
        this.form.valueChanges
            .pipe(takeUntil(this.onDestroy$))
            .subscribe(data => this.onValueChanged(data));
    }

  
 


    private redirectLogin() {
        let redirectUrl = this.authService.getRedirect();
        if (redirectUrl) {
            this.authService.setRedirect(null);
            this.router.navigateByUrl(redirectUrl);
        }
        this.BPMlogin = false;
        console.log(this.BPMlogin);
    }

  /*   generateEditGroupsAjax() {
        var ajaxRequests = [];
        ajaxRequests.push( addGroupAjax("GESTE_CECO_"+cecoGroup ) );

        return ajaxRequests;
    } */

    callsAjax(token){
        return [
           /*  $.ajax({
                type: 'GET',
                headers: {
                    'Authorization':token,
                    'Content-Type':'application/json'
                },
                async: true,
                url: "/alfresco/api/-default-/public/alfresco/versions/1/sites",
                success: function (success, status, xhr) {
                }
            }) , */
            $.ajax({
                type: 'GET',
                headers: {
                    'Authorization':token,
                    'Content-Type':'application/json'
                },
                async: true,
                url: "/activiti-app/api/enterprise/runtime-app-definitions",
                success: function (success, status, xhr) {
                    console.log(success);
                    //let app = success.filter( app => app.name === "CSA" ||  app.name === "IT");
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(xhr.status);
                    console.log(thrownError);
                }
            }) ,
        ];
        
    }

    ngOnDestroy() {
        this.onDestroy$.next(true);
        this.onDestroy$.complete();
    }

    submit() {
        this.onSubmit(this.form.value);
    }

    /**
     * Method called on submit form
     * @param values
     * @param event
     */
    onSubmit(values: any): void {
        this.disableError();

        const args = new LoginSubmitEvent({
            controls: { username: this.form.controls.username }
        });
        this.executeSubmit.emit(args);

        if (!args.defaultPrevented) {
            this.performLogin(values);
        }
    }

    implicitLogin() {
        this.authService.ssoImplicitLogin();
    }

    /**
     * The method check the error in the form and push the error in the formError object
     * @param data
     */
    onValueChanged(data: any) {
        this.disableError();
        for (const field in this.formError) {
            if (field) {
                this.formError[field] = '';
                const hasError =
                    (this.form.controls[field].errors && data[field] !== '') ||
                    (this.form.controls[field].dirty &&
                        !this.form.controls[field].valid);
                if (hasError) {
                    for (const key in this.form.controls[field].errors) {
                        if (key) {
                            const message = this._message[field][key];
                            if (message && message.value) {
                                const translated = this.translateService.instant(message.value, message.params);
                                this.formError[field] += translated;
                            }
                        }
                    }
                }
            }
        }
    }

    private performLogin(values: any) {
        this.actualLoginStep = LoginSteps.Checking;
        this.authService
            .login(values.username, values.password, this.rememberMe)
            .subscribe(
                (token: any) => {
                    const redirectUrl = this.authService.getRedirect();

                    this.actualLoginStep = LoginSteps.Welcome;
                    this.userPreferences.setStoragePrefix(values.username);
                    values.password = null;
                    this.success.emit(
                        new LoginSuccessEvent(token, values.username, null)
                    );
                    console.log(redirectUrl);
                    if (redirectUrl) {
                        this.authService.setRedirect(null);
                        this.router.navigateByUrl(redirectUrl);
                    } else if (this.successRoute) {
                        this.router.navigate([this.successRoute]);
                    }
                },
                (err: any) => {
                    this.actualLoginStep = LoginSteps.Landing;
                    this.displayErrorMessage(err);
                    this.isError = true;
                    this.error.emit(new LoginErrorEvent(err));
                },
                () => this.logService.info('Login done')
            );
    }

    /**
     * Check and display the right error message in the UI
     */
    private displayErrorMessage(err: any): void {
        if (
            err.error &&
            err.error.crossDomain &&
            err.error.message.indexOf('Access-Control-Allow-Origin') !== -1
        ) {
            this.errorMsg = err.error.message;
        } else if (
            err.status === 403 &&
            err.message.indexOf('Invalid CSRF-token') !== -1
        ) {
            this.errorMsg = 'LOGIN.MESSAGES.LOGIN-ERROR-CSRF';
        } else if (
            err.status === 403 &&
            err.message.indexOf('The system is currently in read-only mode') !==
            -1
        ) {
            this.errorMsg = 'LOGIN.MESSAGES.LOGIN-ECM-LICENSE';
        } else {
            this.errorMsg = 'LOGIN.MESSAGES.LOGIN-ERROR-CREDENTIALS';
        }
    }

    /**
     * Add a custom form error for a field
     * @param field
     * @param msg
     */
    public addCustomFormError(field: string, msg: string) {
        this.formError[field] += msg;
    }

    /**
     * Add a custom validation rule error for a field
     * @param field
     * @param ruleId - i.e. required | minlength | maxlength
     * @param msg
     */
    addCustomValidationError(
        field: string,
        ruleId: string,
        msg: string,
        params?: any
    ) {
        this._message[field][ruleId] = {
            value: msg,
            params
        };
    }

    /**
     * Display and hide the password value.
     */
    toggleShowPassword(event: MouseEvent | KeyboardEvent) {
        event.stopPropagation();
        this.isPasswordShow = !this.isPasswordShow;
    }

    /**
     * The method return if a field is valid or not
     * @param field
     */
    isErrorStyle(field: AbstractControl) {
        return !field.valid && field.dirty && !field.pristine;
    }

    /**
     * Trim username
     */
    trimUsername(event: any) {
        event.target.value = event.target.value.trim();
    }

    getBackgroundUrlImageUrl(): SafeStyle {
        return this.sanitizer.bypassSecurityTrustStyle(`url(${this.backgroundImageUrl})`);
    }

    /**
     * Default formError values
     */
    private initFormError() {
        this.formError = {
            username: '',
            password: ''
        };
    }

    /**
     * Init form fields messages
     */
    private initFormFieldsMessages() {
        this._message = {
            username: {},
            password: {}
        };
    }

    /**
     * Default form fields messages
     */
    private initFormFieldsMessagesDefault() {
        this._message = {
            username: {
                required: {
                    value: 'LOGIN.MESSAGES.USERNAME-REQUIRED'
                },
                minLength: {
                    value: 'LOGIN.MESSAGES.USERNAME-MIN',
                    params: {
                        get minLength() {
                            return this.minLength;
                        }
                    }
                }

            },
            password: {
                required: {
                    value: 'LOGIN.MESSAGES.PASSWORD-REQUIRED'
                }
            }
        };
    }

    private initFormFieldsDefault() {
        this.form = this._fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    /**
     * Disable the error flag
     */
    private disableError() {
        this.isError = false;
        this.initFormError();
    }

    private hasCustomFieldsValidation(): boolean {
        return this.fieldsValidation !== undefined;
    }
}