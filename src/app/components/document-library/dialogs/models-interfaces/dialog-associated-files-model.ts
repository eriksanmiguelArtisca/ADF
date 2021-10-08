import { NodeAssociationPagingList } from '@alfresco/js-api';
export interface DialogAssociatedData {
  nombreFichero: string;
  idNodoFichero: string;
  nodosAsociaciones: NodeAssociationPagingList;
}