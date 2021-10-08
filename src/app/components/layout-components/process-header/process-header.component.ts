import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService, LogService, AppConfigService,AppsProcessService, CookieService,SitesService } from '@alfresco/adf-core';
/* import { AuthenticationService, LogService, AppConfigService,AppsProcessService, CookieService } from '@alfresco/adf-core'; */
import {TaskFilterService, ProcessFilterService, FilterRepresentationModel, FilterProcessRepresentationModel} from '@alfresco/adf-process-services';
import { MediaQueryService } from '../../../services/media-query.service';
import { BpmAppsService } from '../../../services';
import { Observable } from 'rxjs/internal/Observable';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { MatMenuTrigger } from '@angular/material';

@Component({
  selector: 'app-process-header',
  templateUrl: './process-header.component.html',
  styleUrls: ['./process-header.component.scss']
})
export class ProcessHeaderComponent implements OnInit,OnDestroy {
    
    color = 'primary';
    title: string;
    logoPath: string; 
    firstSite: string; 
    apps: { name: string; icon: string; id: number; }[] = [] ;
    showCarouselMenu = false;
    showDownloadsPanel = false;
    carouselOptions: any;
    appId: number;
    sub: any;
    responsiveOptions: { breakpoint: string; numVisible: number; numScroll: number; }[];
    isEcmLoggedIn:boolean;
    activeScrollLeft: boolean = true;
    activeScrollRight: boolean = false;
    device:string;
    @Input()
    showMenu: boolean;

    @Output()
    expandMenu: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

    
/*     taskId: number;
    processInstanceId: any; */


    constructor(private authService: AuthenticationService,
              private logService: LogService,
              private cookiesService: CookieService,
              private route: ActivatedRoute,
              public router: Router,
              private media: MediaQueryService,
              private appConfig: AppConfigService,
              private changeDetector: ChangeDetectorRef,
              public bpmUserService : BpmAppsService,
              public appsProcessService : AppsProcessService,
              public taskFilterService :TaskFilterService,
              public processFilterService : ProcessFilterService,
              public sitesService:SitesService) {
                  
    this.taskFilterService.getCompletedTasksFilterInstance = this.getCompletedTasksFilterInstance.bind(this.taskFilterService);
    this.taskFilterService.getInvolvedTasksFilterInstance = this.getInvolvedTasksFilterInstance.bind(this.taskFilterService);
    this.taskFilterService.getMyTasksFilterInstance = this.getMyTasksFilterInstance.bind(this.taskFilterService);
    this.taskFilterService.getQueuedTasksFilterInstance = this.getQueuedTasksFilterInstance.bind(this.taskFilterService);
    


    this.media.deviceType$.subscribe(device => {
        this.device = device;
    });
    
    this.isEcmLoggedIn = this.authService.isEcmLoggedIn();
    
    this.sub = this.route.children[0].params.subscribe(params => {
        this.appId = +params['appId'];
  /*       this.taskId = +params['taskId'];
        this.processInstanceId = +params['processInstanceId']; */
        if(Number.isInteger(this.appId) && this.appId!= 0){
            this.appsProcessService.getApplicationDetailsById(this.appId).subscribe(success =>{
                let appName = success.name.split(/['_',' ']+/)[0];
                if(appName == "CSA")success.name = "Centro de Servicios Administrativos (CSA)";
                this.bpmUserService.select_app({ name: success.name, icon: appName.toLowerCase(), id: this.appId, } );
            });
        }else if(this.appId == 0){
            this.bpmUserService.select_app({ name: '', icon: null, id: 0 } );
        }else if(isNaN(this.appId)){
            this.bpmUserService.select_app({ name: '', icon: null, id: null } );
        }
    });    
  }

    openSubMenu() {
        this.trigger.openMenu();
    } 
    closeSubMenu() {
        this.trigger.closeMenu();
    }

    showScrollButtons(){
        if(  ( (this.device == 'desktop' || this.device == 'tablet') && this.apps.length>6 ) || this.device == 'mobile' && this.apps.length>1  ){
            return true;
        }
        return false;
    }

   showCarousel(){
       if(this.showCarouselMenu){
            this.showCarouselMenu = false;
       }else {
            this.showCarouselMenu = true;
       }
    return this.showCarouselMenu;
  } 

  scrollLeft(){
    if(this.carouselOptions.nativeElement.scrollLeft == 0){
        this.activeScrollLeft = false;
        this.activeScrollRight = true;
    }else {
        this.activeScrollLeft = true;
    }
    this.carouselOptions.nativeElement.scrollLeft -= 150;
    this.activeScrollRight = true;
  }

  scrollRight(){
    let beforeScrollLeft = this.carouselOptions.nativeElement.scrollLeft; 
    this.carouselOptions.nativeElement.scrollLeft += 150;
    this.activeScrollLeft = true;
    if(this.carouselOptions.nativeElement.scrollLeft == beforeScrollLeft){
        this.activeScrollRight = false;
        this.activeScrollLeft = true;
    }else {
        this.activeScrollRight = true;
    }
    
  }

  getApps(){
    this.apps = [];
    this.apps = this.bpmUserService.get_apps();
    this.changeDetector.detectChanges();
    return this.apps;
  }

    navegar(ruta,subruta?){
        const appId = this.bpmUserService.selected_app.id ? this.bpmUserService.selected_app.id : 0;
        switch (ruta) {
            case 'apps':
                this.router.navigate([`apps`]);    
                break;
            case 'processes-catalog':
                this.router.navigate([`apps/${appId}/processes-catalog`]);
                break;
            case 'tasks':
                this.taskFilterService.getTaskListFilters(appId).subscribe(async success =>{
                    let filters = [];
                    if(success.length > 0){
                         filters = success;
                    }else if( success.length == 0) {
                        await this.taskFilterService.createDefaultFilters(appId).toPromise().then( successCreated => {
                            filters = successCreated;
                        })
                    }
                    let filter = filters.filter(filter => filter.name === "Mis tareas" || filter.name === "My Tasks");
                    this.router.navigate([`apps/${appId}/${ruta}/${filter[0].id}`]);  
                });
                break;
            case 'processes':
                this.processFilterService.getProcessFilters(appId).subscribe(async success =>{
                    let filters = [];
                    if(success.length > 0){
                        filters = success;
                    }else if( success.length == 0) {
                        await this.createDefaultProcessFilters(appId).toPromise().then(successCreated => {
                            filters = successCreated;
                        })
                    }
                    let filter = filters.filter(filter => filter.name === "Ejecutándose" || filter.name === "Running");
                    this.router.navigate([`apps/${appId}/${ruta}/${filter[0].id}`]);
                })
                break;
            case 'documents':
                //window.location.href = `http://gesdocpre.viesgo.net/share/page/`;// `http://localhost:8080/share/page/`;
                /* window.open(`http://gesdocpre.viesgo.net/share/page/`,"_blank"); */
                var date = new Date;
                date.setHours(date.getHours() + 1);
                this.sitesService.getSites().subscribe(sites => {
                    let filter = sites.list.entries.filter(site => site.entry.id === this.bpmUserService.selected_app.name.toLocaleLowerCase() );
                    if(filter.length > 0 ){
                        this.cookiesService.setItem('site',filter[0].entry.id,date,null);
                    }else{
                        this.cookiesService.setItem('site',null,date,null);
                    }
                    if (filter.length > 0 && filter[0].entry.id === 'regulacion') {
                        this.router.navigate(['content/documentlist']); 
                    } else if(filter.length > 0){
                        this.router.navigate(['content/documentlist/'+filter[0].entry.id]).then( success => {
                        },error =>{
                            this.router.navigate(['content/documentlist-g']);
                        })
                    }
                    this.router.navigate([`content/documentlist-g`]);
                })
                break;
            case 'downloads':
                this.router.navigate([`apps/${this.bpmUserService.selected_app.id}/download/${subruta}`]);
                break;
            default:
                break;
        }
    }
  

  seleccionarApp(app){
    const appId = app.id ? app.id : 0;
    this.bpmUserService.select_app(app);
    if( this.router.url.includes('/processes/') ){ 
        this.processFilterService.getProcessFilters(appId).subscribe(success =>{
            let filter = success.filter(filter => filter.name === "Ejecutándose" || filter.name === "Running");
            this.router.navigate([`apps/${appId}/processes/${filter[0].id}`]);
            this.changeDetector.detectChanges();
        })
    }else if( this.router.url.includes('/tasks/') ){
        this.taskFilterService.getTaskListFilters(appId).subscribe(success =>{
            let filter = success.filter(filter => filter.name === "Mis tareas" || filter.name === "My Tasks");
            this.router.navigate([`apps/${appId}/tasks/${filter[0].id}`]);
            this.changeDetector.detectChanges();
        })
    }else {
        this.router.navigate([`apps/${appId}/processes-catalog`]);
    }
    
    }

  ngOnInit() {
      this.media.deviceType$.subscribe(device => this.setTitle(device));
      this.logoPath = this.appConfig.get<string>('path-logo', this.logoPath);
      this.bpmUserService.mostrarApps();
  }

    ngOnDestroy(): void {
        this.changeDetector.detach();
    }

  ngAfterViewChecked(): void {
    this.getApps(); 
    if(this.bpmUserService.selected_app.name === "Centro de Servicios Administrativos (CSA)"){
        this.showDownloadsPanel = true;
    }else{
        this.showDownloadsPanel = false;
    }
    this.changeDetector.detectChanges();
    /* let filter = this.bpmUserService.apps.filter(app => app.name === "CSA" );
    if(filter.length>0){
        this.showDownloadsPanel = true;
    } */
  }
  onUserMenuSelect(menuName: string): void {
      if (menuName === 'sign_out') {
          this.onLogout();
      }
  }

  onLogout(): void {
      this.authService.logout()
          .subscribe(
              () => {
                  localStorage.setItem('user_role', '');
                  this.navigateToLogin();
              },
              (error: any) => {
                  if (error && error.response && error.response.status === 401) {
                      this.navigateToLogin();
                  } else {
                      this.logService.error('An unknown error occurred while logging out', error);
                      this.navigateToLogin();
                  }
              }
          );
  }

  private navigateToLogin(): void {
      this.router.navigate(['/login']);
  }

  toggleMenu() {
    if(  (this.device == 'desktop' || this.device == 'tablet') ){
        this.expandMenu.emit();
    }
  }

  private setTitle(device: string): void {
          /* if (device === MediaQueryService.DESKTOP_DEVICE) {
              this.title = 'DW-HEADER.APPS-DESKTOP';
          } else if (device === MediaQueryService.TABLET_DEVICE) {
              this.title = 'DW-HEADER.APPS-TABLETS';
          } else if (device === MediaQueryService.MOBILE_DEVICE) {
              this.title = 'DW-HEADER.APPS-MOBILES';
          } */
          this.title = 'Viesgo';
  }



     /**
     * Creates and returns a filter for "Involved" task instances.
     * @param appId ID of the target app
     * @returns The newly created filter
     */
    getInvolvedTasksFilterInstance(appId: number): FilterRepresentationModel {
        return new FilterRepresentationModel({
            'name': 'Tareas en las que participo',
            'appId': appId,
            'recent': false,
            'icon': 'glyphicon-align-left',
            'filter': {'sort': 'created-desc', 'name': '', 'state': 'open', 'assignment': 'involved'}
        });
    }

    /**
     * Creates and returns a filter for "My Tasks" task instances.
     * @param appId ID of the target app
     * @returns The newly created filter
     */
    getMyTasksFilterInstance(appId: number): FilterRepresentationModel {
        return new FilterRepresentationModel({
            'name': 'Mis tareas',
            'appId': appId,
            'recent': false,
            'icon': 'glyphicon-inbox',
            'filter': {'sort': 'created-desc', 'name': '', 'state': 'open', 'assignment': 'assignee'}
        });
    }

    /**
     * Creates and returns a filter for "Queued Tasks" task instances.
     * @param appId ID of the target app
     * @returns The newly created filter
     */
    getQueuedTasksFilterInstance(appId: number): FilterRepresentationModel {
        return new FilterRepresentationModel({
            'name': 'Tareas en cola',
            'appId': appId,
            'recent': false,
            'icon': 'glyphicon-record',
            'filter': {'sort': 'created-desc', 'name': '', 'state': 'open', 'assignment': 'candidate'}
        });
    }

    /**
     * Creates and returns a filter for "Completed" task instances.
     * @param appId ID of the target app
     * @returns The newly created filter
     */
    getCompletedTasksFilterInstance(appId: number): FilterRepresentationModel {
        return new FilterRepresentationModel({
            'name': 'Tareas completadas',
            'appId': appId,
            'recent': true,
            'icon': 'glyphicon-ok-sign',
            'filter': {'sort': 'created-desc', 'name': '', 'state': 'completed', 'assignment': 'involved'}
        });
    }

     /**
     * Creates and returns the default filters for an app.
     * @param appId ID of the target app
     * @returns Default filters just created
     */
    public createDefaultProcessFilters(appId: number): Observable<FilterProcessRepresentationModel[]> {
        const runningFilter = this.getRunningFilterInstance(appId);
        const runningObservable = this.processFilterService.addProcessFilter(runningFilter);

        const completedFilter = this.getCompletedFilterInstance(appId);
        const completedObservable = this.processFilterService.addProcessFilter(completedFilter);

        const allFilter = this.getAllFilterInstance(appId);
        const allObservable = this.processFilterService.addProcessFilter(allFilter);

        return new Observable((observer) => {
            forkJoin(
                runningObservable,
                completedObservable,
                allObservable
            ).subscribe(
                (res) => {
                    const filters: FilterProcessRepresentationModel[] = [];
                    res.forEach((filter) => {
                        if (filter.name === runningFilter.name) {
                            runningFilter.id = filter.id;
                            filters.push(runningFilter);
                        } else if (filter.name === completedFilter.name) {
                            completedFilter.id = filter.id;
                            filters.push(completedFilter);
                        } else if (filter.name === allFilter.name) {
                            allFilter.id = filter.id;
                            filters.push(allFilter);
                        }
                    });
                    observer.next(filters);
                    observer.complete();
                },
                (err: any) => {
                    this.logService.error(err);
                });
        });
    }

    /**
     * Creates and returns a filter that matches "running" process instances.
     * @param appId ID of the target app
     * @returns Filter just created
     */
    public getRunningFilterInstance(appId: number): FilterProcessRepresentationModel {
        return new FilterProcessRepresentationModel({
            'name': 'Ejecutándose',
            'appId': appId,
            'recent': true,
            'icon': 'glyphicon-random',
            'filter': { 'sort': 'created-desc', 'name': '', 'state': 'running' }
        });
    }

    
     /**
     * Returns a static Completed filter instance.
     * @param appId ID of the target app
     * @returns Details of the filter
     */
    private getCompletedFilterInstance(appId: number): FilterProcessRepresentationModel {
        return new FilterProcessRepresentationModel({
            'name': 'Completado',
            'appId': appId,
            'recent': false,
            'icon': 'glyphicon-ok-sign',
            'filter': { 'sort': 'created-desc', 'name': '', 'state': 'completed' }
        });
    }

    /**
     * Returns a static All filter instance.
     * @param appId ID of the target app
     * @returns Details of the filter
     */
    getAllFilterInstance(appId: number): FilterProcessRepresentationModel {
        return new FilterProcessRepresentationModel({
            'name': 'Todos',
            'appId': appId,
            'recent': true,
            'icon': 'glyphicon-th',
            'filter': { 'sort': 'created-desc', 'name': '', 'state': 'all' }
        });
    }

}
