import { Injectable } from '@nestjs/common';
import { BillingRecordComment } from '@domain/entities';

@Injectable()
export class BillingRecordCommentPresenter {
  toResponse(comment: BillingRecordComment) {
    return {
      comment_id: comment.id,
      record_id: comment.recordId,
      text: comment.text,
      visibility: comment.visibility,
      created_at: comment.createdAt,
      updated_at: comment.updatedAt,
      created_by: comment.createdBy,
      updated_by: comment.updatedBy,
    };
  }
}
