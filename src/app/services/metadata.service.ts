import {
    AlfrescoApiService,
    AuthenticationService,
    CookieService,
} from '@alfresco/adf-core';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isNull } from 'util';
/* import { SearchCategory } from '@alfresco/adf-content-services'; */

@Injectable()
export class MetadataService {
    private filters = [];

    constructor(
        protected apiService: AlfrescoApiService,
        protected authenticationService: AuthenticationService,
        protected http: HttpClient,
        protected route: ActivatedRoute,
        protected cookiesService: CookieService
    ) {}

    /**
     * Devuelve un array con los metadatos y asociaciones del site actual 
     *
     * @returns {Promise} Array de Objetos de metadatos
     */
    async getMetadata(metadatasite):Promise<any> {
        if(metadatasite==undefined)metadatasite = this.getSiteAspect()[0];

        return await this.apiService
            .getInstance()
            .core.classesApi.getClass(metadatasite)
            .then(async (success) => {
                let metadataResult = [];
                let associations = {};
                associations = success.associations;
                let ticket = this.authenticationService.getTicketEcm();
                // Una vez tenemos los metadatos consultamos la informacion de cada uno de ellos
                // Estas llamadas se ejecutaran a la vez de forma asincrona y esperaremos a que se resuelvan con un await
                await Promise.all(Object.keys(success.properties).map(async (metadataKey) =>{
                    let metadata = success.properties[metadataKey];
                    if (metadata.dataType == 'd:datetime') {
                        metadataResult.push({
                            name: metadata['name'],
                            title: metadata['title'],
                            dataType: metadata['dataType'],
                            constraints: [],
                            mandatory: metadata['mandatory'],
                        });
                    } else {
                        let meta = await this.http
                            .get(
                                '/alfresco/s/' +
                                    metadata.url +
                                    '?&alf_ticket=' +
                                    ticket
                            )
                            .toPromise()
                            .then((resp) => {
                                return {
                                    name: resp['name'],
                                    title: resp['title'],
                                    dataType: resp['dataType'],
                                    constraints: resp['constraints'],
                                    mandatory: resp['mandatory'],
                                }
                            });
                        metadataResult.push(meta);
                    }
                },metadataResult));
                return [metadataResult,associations];
            })
            .catch((rejected) => {
                //console.log(rejected);
            });
    }
    
    /**
     * Devuelve la clase del aspecto del site actual
     *
     * @returns Clase del aspecto
     */
    getSiteAspect() {
        let site = this.cookiesService.getItem('site');
        if (!isNull(site) && site != 'null') {
            let aspectClass = [];
            switch (site) {
                case 'regulacion':
                    aspectClass = ['regu_metadatos'];
                    break;
                case 'csa':
                    aspectClass = ['csa_metadatos'];
                    break;
                case 'polizas':
                    aspectClass = ['polizas_metadatos'];
                    break;
                 case 'financiero':
                    aspectClass = ['fi_factura','fi_factura_mm','fi_factura_pdp','fi_factura_sd','fi_avales_proveedor','fi_avales_deudor','fi_ancticipos'];
                        break;
                default:
                    break;
            }
            return aspectClass;
        }
    }

    /**
     * Devuelve la clase del aspecto del site actual
     *
     * @returns Clase del aspecto
     */
    getSiteAssociation() {
        return this.apiService
            .getInstance()
            .core.classesApi.getClass(this.getSiteAspect()[0]).then( classValue => {
                let associations = [];
                Object.keys(classValue.associations).forEach(association => {
                    associations.push( classValue.associations[association]["name"]);
                }); 
                return associations;
            });
    }

    /**
     * Devuelve los filtros de la busqueda avanzada del site actual
     *
     * @returns {Promise} Array de Objetos de filtros
     */
    async generateSearchFilters(selection) {
     
        this.filters = [];
        if (selection=='')selection = undefined;
        return this.getMetadata(selection).then((metadataResult) => {
            this.filters.push( this.generateDefaultContentFilter() );
            metadataResult[0].forEach((metadata) => {
           
                let componentFilter = {};
                if (
                    (metadata['dataType'] == 'd:text' ||
                    metadata['dataType'] == 'd:double' ||
                        metadata['dataType'] == 'd:long' ||
                        metadata['dataType'] == 'd:mltext') &&
                    !metadata['constraints'][0]
                ) {
                    componentFilter = this.generateTextFilter(
                        metadata['name'],
                        metadata['title']
                    );
                } else if (
                    metadata['dataType'] == 'd:text' &&
                    metadata['constraints'][0]
                ) {
                    componentFilter = this.generateComboFilter(
                        metadata['name'],
                        metadata['constraints'][0].parameters[0][
                            'allowedValues'
                        ]
                    );
                } else if (
                    metadata['dataType'] == 'd:datetime' &&
                    !metadata['constraints'][0]
                ) {
                    componentFilter = this.generateDateFilter(metadata['name']);
                }
                let filter = {
                    id: metadata['name'].replace(':', '_'),
                    name: metadata['title'],
                    enabled: true,
                    expanded: false,
                    component: componentFilter,
                };
                this.filters.push(filter);
            });
            return this.filters;
        });
    }

    /**
     * Genera la estructura de un filtro de texto
     *
     * @param metadataName El nombre del metadato
     * @param placeholder El placeholder del input
     * @returns Objeto filtro
     */
    private generateTextFilter(metadataName, placeholder) {
        let textFilter = {
            selector: 'text',
            settings: {
                pattern: metadataName + ":'(.*?)'",
                field: metadataName,
                placeholder: placeholder,
            },
        };
        return textFilter;
    }
    /**
     * Genera la estructura de un filtro de seleccion (Combobox)
     *
     * @param metadataName El nombre del metadato
     * @param options Los allowedValues del selector (Combobox)
     * @returns Objeto filtro
     */
    private generateComboFilter(metadataName, options) {
        let generatedOptions = [];
        options.forEach((optionValue) => {
            if(optionValue!= ''){
                generatedOptions.push({
                    name: optionValue,
                    value: metadataName + ':' + optionValue,
                });
            }
        });
        let comboFilter = {
            selector: 'check-list',
            settings: {
                pageSize: 70,
                operator: 'OR',
                options: generatedOptions,
            },
        };
        return comboFilter;
    }
    /**
     * Genera la estructura de un filtro que solo busque ficheros para que la busqueda cuando
     * no este seleccionado ningun filtro no falle. Hace que coincida el filtro que le metemos en ngOnInit() con la category
     * que se genera del filtro a traves del id 
     * 
     * queryFragments = { queryType: "TYPE:'cm:content'" }
     * 
     *
     * @returns Default Content Filter
     */
    private generateDefaultContentFilter() {
        return {
            id: "queryType",
            name: "TIPO DE CONTENIDO",
            enabled: true,
            expanded: false,
            component: {
                selector: "radio",
                settings: {
                    field: null,
                    pageSize: 5,
                    options: [
                        { name: "Documento", value: "TYPE:'cm:content'" ,"checked": true},
                        { name: "Carpeta", value: "TYPE:'cm:folder'" },  
                        { name: "Todos", value: "TYPE:'cm:folder' OR TYPE:'cm:content'" }
                    ]
                }
            }
        };
    }

    /**
     * Genera la estructura de un filtro de fecha
     *
     * @param metadataName El nombre del metadato
     * @returns Objeto filtro
     */
    private generateDateFilter(metadataName) {
        let dateFilter = {
            selector: 'date-range',
            settings: {
                field: metadataName,
            },
        };
        return dateFilter;
    }
}
