/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlfrescoApiService } from '@alfresco/adf-core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { DialogReminder } from "../../document-library/dialogs/dialog-reminder/dialogReminder.component";
import { DialogSendEmail } from "../../document-library/dialogs/dialog-send-email/dialogSendEmail.component";
import { Node } from '@alfresco/js-api';

@Component({
    selector: 'app-file-view',
    templateUrl: 'file-view.component.html',
    styleUrls: ['file-view.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FileViewComponent implements OnInit {

    nodeId: string = null;
    name :string = null;
    node : Node = null;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private snackBar: MatSnackBar,
                private apiService: AlfrescoApiService,
                private dialog: MatDialog) {
    }

    ngOnInit() {

        this.route.params.subscribe(params => {
            const id = params.nodeId;
            if (id) {
                this.apiService.getInstance().nodes.getNodeInfo(id).then(
                    (node) => {
                     
                        if (node) {
                            if( node.properties['cm:destination'] ){
                                this.nodeId = node.properties['cm:destination'];
                            }else{
                                this.nodeId = id;
                            }
                            this.name = node.name;
                            this.node = node;
                            return;
                        }
                        this.router.navigate(['/files', id]);
                    },
                    () => this.router.navigate(['/files', id])
                );
            }
        });
    }

    openMailDialog(): void {
        const dialogRef = this.dialog.open(DialogSendEmail, {
          width: '640px',
          data: {name: this.name, asunto: ''}
        });
    
        dialogRef.afterClosed().subscribe(result => {
        });
    }

    openDialogVencimiento(): void {
        let id = null;
        let vencimiento = null;
        let recordatorio = '';
        let recordatorioArray = null ;
        let dataRecordatorios = {
          idNodo: null,
          vencimiento: null,
          recordatorio10Dias: false,
          recordatorio5Dias: false,
          recordatorio1Dia: false,
          recordatorioVencido: false,
        }

        id = this.nodeId;
        recordatorio = this.node.properties["regu:recordatorio"];
        vencimiento = this.node.properties["regu:fecha_vencimiento"];

        dataRecordatorios.vencimiento = vencimiento ;
        if(id !== null && id !== undefined ){
            dataRecordatorios.idNodo = id;
            if(recordatorio !== undefined){
                recordatorioArray = recordatorio.split('/');
                if(  recordatorioArray.find( value => value=='10dias') !== undefined ){
                    dataRecordatorios.recordatorio10Dias = true;
                }if(  recordatorioArray.find( value => value=='5dias') !== undefined ){
                    dataRecordatorios.recordatorio5Dias = true;
                }if(  recordatorioArray.find( value => value=='1dia') !== undefined ){
                    dataRecordatorios.recordatorio1Dia = true;
                }if(  recordatorioArray.find( value => value=='vencido') !== undefined ){
                    dataRecordatorios.recordatorioVencido = true;
                }
            }
            const dialogRef = this.dialog.open(DialogReminder, {
                width: '340px',
                data: dataRecordatorios
              });
          
            dialogRef.afterClosed().subscribe(result => {
            });
        }
        
    }

    onUploadError(errorMessage: string) {
        this.snackBar.open(errorMessage, '', { duration: 4000 });
    }
}
