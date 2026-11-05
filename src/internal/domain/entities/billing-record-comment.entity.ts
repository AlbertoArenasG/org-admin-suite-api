export enum BillingRecordCommentVisibility {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
}

export interface BillingRecordComment {
  id: string;
  recordId: string;
  text: string;
  visibility: BillingRecordCommentVisibility;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
