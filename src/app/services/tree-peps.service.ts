import { DynamicTableRow } from '@alfresco/adf-core';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ArbolPeps {
    mascara: string;
    desc: string;
    denominacion?: string;
    tipoPep?: number ;
    perfil_proyecto? : string;
    clase_objeto?: string;
    clase_proyecto? : string;
    fecha_inicio? : string ;
    fecha_fin? :string;
    coment?: string;
    ceco_responsable?: any;
    ceco_solicitante?: any;
    inversion_prot? : string;
    children? : ArbolPeps[];
}

@Injectable()
export class TreePepsService {

    public  seletedPep$ = new Subject<ArbolPeps>();
    public  treeChanged$ = new Subject<ArbolPeps[]>();
    public  deleteRow$ = new Subject<{ tabledId: string,row :DynamicTableRow}>();

    public currentPep :  ArbolPeps = null;
    public rootPep :  ArbolPeps [] = null;

    lastEditRow: DynamicTableRow = null;

    constructor() { 
    }
    
    selectPep(selectedPep : ArbolPeps){
        this.seletedPep$.next(selectedPep);
        this.currentPep = selectedPep;
    }

    
    searchTreeLevel(element, elementBusqueda, level){
        if(JSON.stringify(element) === JSON.stringify(elementBusqueda)){
             return level;
        }else if (element.children != null){
             var i;
             var result = null;
             for(i=0; result == null && i < element.children.length; i++){
                  result = this.searchTreeLevel(element.children[i], elementBusqueda ,level+1);
             }
             return result;
        }
        return null;
      }
      
      deleteTreeElementByMask(element :ArbolPeps, mascaraBusqueda ,arrayPosition){
        // Como normalmente Proyecto y pep1 tienen la misma mascara comprobamos que no sea el mismo objeto
        // (element.mascara === "" && element["waapy_orden_nodo_superior"])
        if(element.mascara === mascaraBusqueda && JSON.stringify(element) !== JSON.stringify(this.rootPep[0])){
            return true;
        }else if (element.children != null){
             var i;
             var result = null;
             for(i=0; result == null && i < element.children.length; i++){
                result = this.deleteTreeElementByMask(element.children[i], mascaraBusqueda ,i );
                if(result == true){
                    element.children.splice(i,1);
                }
             }
             /* return element; */
        }
        return null;
    }

    searchTree(element, mascara , tipoPep?){
        if(element.mascara == mascara && ( (tipoPep && element.tipoPep === tipoPep) || !tipoPep )){
             return element;
        }else if (element.children != null){
             var i;
             var result = null;
             for(i=0; result == null && i < element.children.length; i++){
                  result = this.searchTree(element.children[i], mascara);
             }
             return result; //revisar
        }
        return null;
      }

      changeChilren(element,changes,row:DynamicTableRow){
        if (element.children != null){
          var i;
          var result = null;
          for(i=0; result == null && i < element.children.length; i++){
               result = this.changeChilren(element.children[i], changes ,row);
          }
        }
        for(i=0; i < changes.length; i++){
          let replaValue = "";
          let pepsArray=["waapy_proyecto_","waapy_pep1_","waapy_pep2_","waapy_pep3_","waapy_orden_"];
          if(changes[i] == "mascara"){
            /* let currentMask = this.treeService.lastEditRow.value[currentTable + '_mascara']; */
            for (let pep of pepsArray){
              if (row.value[pep+changes[i]]){
                replaValue = element[changes[i]].replace( this.lastEditRow.value[pep+changes[i]], row.value[pep+changes[i]] );
              }
            }
            element[changes[i]] =replaValue;
          }else if( changes[i]=="desc" || changes[i]=="texto" || changes[i] == "denominacion"){
            if( (row.value["waapy_proyecto_"+changes[i]] || row.value["waapy_proyecto_"+changes[i]]) && row.value["waapy_proyecto_mascara"] == element["mascara"] ){
              element[changes[i]] = row.value["waapy_proyecto_"+changes[i]];
            }else if(row.value["waapy_pep1_mascara"] == element["mascara"] ){
              element[changes[i]] = row.value["waapy_pep1_denominacion"]  ;
            }else if(row.value["waapy_pep2_mascara"] == element["mascara"]){
              element[changes[i]] = row.value["waapy_pep2_"+changes[i]]  ;
            }
            else if(row.value["waapy_pep3_mascara"] == element["mascara"] ){
              element[changes[i]] = row.value["waapy_pep3_"+changes[i]]  ;
            }
            else if(row.value["waapy_orden_mascara"] == element["mascara"] ){
              element["waapy_orden_texto"] = row.value["waapy_orden_texto"] ;
            }
          }else {
            for (let pep of pepsArray){
              if(row.value[pep+changes[i]]){
                element[changes[i]] = row.value[pep+changes[i]]  ;
              }
          
           }
          }
        }
      }

      compruebaCargaTablas(id,selectedNode,converted,dataSource){
          let incluye;
          let elemento;
          let incluyeSelected;
        if (id=="waapy_tabla_pep2"){
           incluye=dataSource.data[0].mascara;
           incluyeSelected= selectedNode.mascara;
           elemento=converted.mascara;
        }else if (id=="waapy_tabla_pep3"){
            incluye=selectedNode.mascara;
            elemento=converted.mascara;
        } else if (id=="waapy_tabla_ordenes"){
            incluye=selectedNode.mascara;
            elemento=converted.waapy_orden_nodo_superior;
        }
        if(selectedNode && (elemento.includes(incluye) || elemento.includes(incluyeSelected)) && selectedNode.children && selectedNode.children.length > 0){
            selectedNode.children.push(converted);
          }else if(selectedNode && (elemento.includes(incluye) || elemento.includes(incluyeSelected))) {
            selectedNode.children = [converted];
          }
      }

  consultarHijos(lastEditMascara) {
    let arrayMascarasHijas = [];
    let mascaraPep1 = "";
    let mascaraPep2 = "";
    let mascaraPep3 = "";
    let mascaraOrden = "";
    if (lastEditMascara !== null || lastEditMascara !== undefined) {
      if ((this.rootPep[0].children !== null || this.rootPep[0].children !== undefined) && this.rootPep[0].children) {
        for (let i = 0; i < this.rootPep[0].children.length; i++) { //recorrer todos los hijos del arbol
          if (this.rootPep[0].children[i] !== null && lastEditMascara === this.rootPep[0].children[i].mascara) {
            mascaraPep1 = this.rootPep[0].children[i].mascara; //mascara recien editada
            arrayMascarasHijas.push(mascaraPep1);
            if ((this.rootPep[0].children[i].children !== null || this.rootPep[0].children[i].children !== undefined) && this.rootPep[0].children[i].children) {
              for (let j = 0; j < this.rootPep[0].children[i].children.length; j++) { //recorrer los hijos del hijo que se ha editado
                if (this.rootPep[0].children[i].children[j] !== null && this.rootPep[0].children[i].children[j]["waapy_pep2_nodo_superior"] === mascaraPep1) {
                  mascaraPep2 = this.rootPep[0].children[i].children[j]["mascara"]; //mascara del pep2
                  arrayMascarasHijas.push(mascaraPep2);
                  if ((this.rootPep[0].children[i].children[j].children !== null || this.rootPep[0].children[i].children[j].children !== undefined) && this.rootPep[0].children[i].children[j].children) {
                    for (let z = 0; z < this.rootPep[0].children[i].children[j].children.length; z++) { //recorrer los hijos de los hijos del que se ha editado
                      if (this.rootPep[0].children[i].children[j].children[z] != null && this.rootPep[0].children[i].children[j].children[z]["waapy_pep3_nodo_superior"] === mascaraPep2) {
                        mascaraPep3 = this.rootPep[0].children[i].children[j].children[z]["mascara"]; //mascara del pep3
                        arrayMascarasHijas.push(mascaraPep3);
                        if ((this.rootPep[0].children[i].children[j].children[z].children !== null || this.rootPep[0].children[i].children[j].children[z].children !== undefined) && this.rootPep[0].children[i].children[j].children[z].children) {
                          for (let u = 0; u < this.rootPep[0].children[i].children[j].children[z].children.length; u++) { //recorrer los hijos de los hijos de los hijos del que se ha editado
                            if (this.rootPep[0].children[i].children[j].children[z].children[u] != null && this.rootPep[0].children[i].children[j].children[z].children[u]["waapy_orden_nodo_superior"] === mascaraPep3) {
                              mascaraOrden = this.rootPep[0].children[i].children[j].children[z].children[u]["mascara"]; //mascara del pep3
                              arrayMascarasHijas.push(mascaraOrden);
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        return arrayMascarasHijas;
      }
    }
  }

    }
