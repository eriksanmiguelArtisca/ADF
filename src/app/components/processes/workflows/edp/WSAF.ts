//import { FormFieldModel, FormFieldEvent, DynamicTableRow, ValidateDynamicTableRowEvent, FormService, FORM_FIELD_VALIDATORS, NotificationService} from "@alfresco/adf-core"; 
import { FormFieldModel, FormFieldEvent, NotificationService} from "@alfresco/adf-core"; 
//import { FieldValidatorWASCS } from "./fieldValidatorWASCS";
//import { isUndefined, isNullOrUndefined } from "util"; 
//import { TreePepsService } from '../../../../../services/tree-peps.service';
//import { HttpClient } from "@angular/common/http";
//import { FormValueRepresentation } from "@alfresco/js-api";
//import * as moment from "moment";

export const WSAF = {


    formLoaded(e: FormFieldEvent, fields: FormFieldModel[]) {
        let tree = fields.find(f => f.id === 'wsaf_tree');
        tree.value = 
        [{
                "NumeroItem": "010000",
                "denominacion": "Edificio Social Oviedo",
                "checked": false,
                "children": [
                    {
                        "NumeroItem": "010100",
                        "denominacion": "Entrada General al Edificio",
                        "checked": false,
                        "children": [
                            {
                                "NumeroItem": "010101",
                                "denominacion": "Tornos del Hall",
                                "checked": false,
                                "Franjas_Horarias": "",
                                "Responsable_Ruta": "E341178",
                                "Responsable_Ejecucion_Solicitud": "E351220"
                            },
                            {
                                "NumeroItem": "010102",
                                "denominacion": "Muelle de Carga",
                                "checked": false,
                                "Franjas_Horarias": "",
                                "Responsable_Ruta": "E341178",
                                "Responsable_Ejecucion_Solicitud": "E351220"
                            },
                            {
                                "NumeroItem": "010103",
                                "denominacion": "Acceso Parking",
                                "checked": false,
                                "Franjas_Horarias": "24H-365D",
                                "Responsable_Ruta": "E341178",
                                "Responsable_Ejecucion_Solicitud": "E351220"
                            },
                            {
                                "NumeroItem": "010104",
                                "denominacion": "Acceso Parking",
                                "checked": false,
                                "Franjas_Horarias": "16H -L-V",
                                "Responsable_Ruta": "E341178",
                                "Responsable_Ejecucion_Solicitud": "E351220"
                            }
                        ]
                    },
                    {
                        "NumeroItem": "010200",
                        "denominacion": "Sala CPD",
                        "checked": false,
                        "children": [
                            {
                                "NumeroItem": "010201",
                                "denominacion": "Comunicaciones",
                                "checked": false,
                                "Franjas_Horarias": "",
                                "Responsable_Ruta": "E342020",
                                "Responsable_Ejecucion_Solicitud": "E351220"
                            },
                            {
                                "NumeroItem": "010202",
                                "denominacion": "Servidores",
                                "checked": false,
                                "Franjas_Horarias": "",
                                "Responsable_Ruta": "E343032",
                                "Responsable_Ejecucion_Solicitud": "E351220"
                            },
                            {
                                "NumeroItem": "010203",
                                "denominacion": "Seguridad Fisica",
                                "checked": false,
                                "Franjas_Horarias": "",
                                "Responsable_Ruta": "E341178",
                                "Responsable_Ejecucion_Solicitud": "E351220"
                            }
                        ]
                    },
                    {
                        "NumeroItem": "010300",
                        "denominacion": "Despacho DGE",
                        "checked": false,
                        "children": [
                            {
                                "NumeroItem": "010301",
                                "denominacion": "Acceso Despacho",
                                "checked": false,
                                "Franjas_Horarias": "",
                                "Responsable_Ruta": "E345445",
                                "Responsable_Ejecucion_Solicitud": "E351220"
                            }
                        ]
                    },
                    {
                        "NumeroItem": "010400",
                        "denominacion": "Centro de control SF",
                        "checked": false,
                        "children": [
                            {
                                "NumeroItem": "010401",
                                "denominacion": "Acceso Centro de Control",
                                "checked": false,
                                "Franjas_Horarias": "",
                                "Responsable_Ruta": "E344445",
                                "Responsable_Ejecucion_Solicitud": "E351220"
                            }
                        ]
                    },
                    {
                        "NumeroItem": "010500",
                        "denominacion": "Entrada Peatonal Nocturna",
                        "checked": false,
                        "children": [
                            {
                                "NumeroItem": "010501",
                                "denominacion": "Acceso Peatonal",
                                "checked": false,
                                "Franjas_Horarias": "",
                                "Responsable_Ruta": "E341178",
                                "Responsable_Ejecucion_Solicitud": "E351220"
                            }
                        ]
                    }
                ]
        }
    ];

    },

    formFieldValueChanged(e: FormFieldEvent, fields: FormFieldModel[], notificationService:NotificationService ) {
                                                                
    },
    // validateDynamicTableRow(row: DynamicTableRow, e: ValidateDynamicTableRowEvent, fields: FormFieldModel[], treeService: TreePepsService, formService: FormService, visibilityService) {
        
    // }, 
    valueComentarios(fieldComentario, fieldHistorico, texto) {
        if (fieldComentario.value && !fieldHistorico.value.includes(fieldComentario.value)) {
            fieldHistorico.value += texto + fieldComentario.value;
            fieldComentario.value = "";
        }
    }
}


