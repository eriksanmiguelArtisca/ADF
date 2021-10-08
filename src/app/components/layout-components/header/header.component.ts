/*
 * Copyright 2005-2018 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewEncapsulation,
    OnInit,
    ViewChild /* , ChangeDetectorRef */,
} from '@angular/core';
import { Router } from '@angular/router';
import {
    AuthenticationService,
    LogService,
    AppConfigService,
    CookieService,
    AlfrescoApiService,
} from '@alfresco/adf-core';
import { MediaQueryService } from '../../../services/media-query.service';
import { DropdownSitesComponent } from '@alfresco/adf-content-services';
import { isNull } from 'util';
import { SitePaging } from '@alfresco/js-api';

@Component({
    selector: 'apw-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {
    color = 'primary';
    title: string;
    logoPath: string;
    firstSite: string;
    sitios = [];
    sitePaging: SitePaging = { list: { pagination: {}, entries: [] } };

    @Input()
    showMenu: boolean;

    @Output()
    expandMenu: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('sitesDropdownModule')
    sitesDropdownModule: DropdownSitesComponent;
    loginBPM: boolean;

    constructor(
        private authService: AuthenticationService,
        private logService: LogService,
        private router: Router,
        private media: MediaQueryService,
        private appConfig: AppConfigService,
        private cookiesService: CookieService,
        private apiService: AlfrescoApiService
    ) /* private changeDetector:ChangeDetectorRef */ {}
    ngOnInit() {
        this.media.deviceType$.subscribe((device) => this.setTitle(device));
        this.logoPath = this.appConfig.get<string>('path-logo', this.logoPath);
        this.getSiteList();
    }

    getSiteContent($event) {
        let site = '';
        site = $event.entry.id;
        var date = new Date();
        date.setHours(date.getHours() + 1);

        this.cookiesService.setItem('site', site, date, null);
        if (site === 'regulacion') {
            this.router.navigate(['content/documentlist']);
        } else {
            this.router.navigate(['content/documentlist/'+site]).then( success => {
            
            },error =>{
                this.router.navigate(['content/documentlist-g']);
            })
        }
    }

    getSiteList() {
        this.apiService.sitesApi.getSites().then((success: SitePaging) => {
            for (var sites in success.list.entries) {
                if (
                    success.list.entries[sites].entry.id == 'regulacion' ||
                    success.list.entries[sites].entry.id == 'csa' ||
                    success.list.entries[sites].entry.id == 'polizas' ||
                    success.list.entries[sites].entry.id == 'financiero' ||
                    success.list.entries[sites].entry.id == 'it'
                ) {
                    this.sitios.push(success.list.entries[sites]);
                }
            }
            success.list.entries = this.sitios;
            this.sitePaging = success;
            let site = this.cookiesService.getItem('site');
            if (!isNull(site) && site != 'null') {
                this.apiService.sitesApi.getSite(site).then((site) => {
                    var date = new Date();
                    date.setHours(date.getHours() + 1);
                    this.cookiesService.setItem(
                        'site',
                        site.entry.id,
                        date,
                        null
                    );
                    this.sitesDropdownModule.change.emit(site);
                    this.sitesDropdownModule.placeholder = site.entry.title;
                });
            } /* else {
                this.apiService.sitesApi.getSites().then(success => {
                    var date = new Date;
                    date.setHours(date.getHours() + 1);
                    this.cookiesService.setItem('site',success.list.entries[0].entry.id,date,null);
                    this.sitesDropdownModule.change.emit(success.list.entries[0] );
                    this.sitesDropdownModule.placeholder = success.list.entries[0].entry.title;
                });
            } */
            return success;
        });
    }

    onUserMenuSelect(menuName: string): void {
        if (menuName === 'sign_out') {
            this.onLogout();
        }
    }

    onLogout(): void {
        this.authService.logout().subscribe(
            () => {
                localStorage.setItem('user_role', '');
                this.navigateToLogin();
            },
            (error: any) => {
                if (error && error.response && error.response.status === 401) {
                    this.navigateToLogin();
                } else {
                    this.logService.error(
                        'An unknown error occurred while logging out',
                        error
                    );
                    this.navigateToLogin();
                }
            }
        );
    }

    private navigateToLogin(): void {
        this.router.navigate(['/login']);
    }

    toggleMenu() {
        this.expandMenu.emit();
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
}
