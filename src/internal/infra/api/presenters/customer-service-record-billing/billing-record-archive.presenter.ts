import { Injectable } from '@nestjs/common';
import { BillingRecordArchive } from '@domain/entities';
import { EnvService } from '@infra/env';
import { EnumNameService } from '@infra/i18n/services';

@Injectable()
export class BillingRecordArchivePresenter {
  constructor(
    private readonly env: EnvService,
    private readonly names: EnumNameService,
  ) {}

  toSummary(value: BillingRecordArchive) {
    return {
      archive_id: value.id,
      invoice_revision: value.invoiceRevision,
      reference_number: value.invoice.referenceNumber,
      invoice_status: value.billing.invoiceStatus
        ? this.status(value.billing.invoiceStatus)
        : null,
      archived_at: value.archivedAt,
      archived_by: value.archivedBy,
    };
  }

  toDetail(value: BillingRecordArchive) {
    const file = (item: {
      fileId: string;
      originalName: string;
      mimeType: string;
      size: number;
    }) => {
      const downloadUrl = `${this.env.get('API_BASE_URL').replace(/\/$/, '')}/v1/files/${item.fileId}/download`;
      return {
        file_id: item.fileId,
        original_name: item.originalName,
        mime_type: item.mimeType,
        size: item.size,
        download_url: downloadUrl,
        preview_url: `${downloadUrl}?disposition=inline`,
      };
    };
    return {
      ...this.toSummary(value),
      record_id: value.recordId,
      invoice: {
        reference_number: value.invoice.referenceNumber,
        files: value.invoice.files.map(file),
        removed_files: value.invoice.removedFiles.map(file),
        payment_complements: value.invoice.paymentComplements.map((item) => ({
          complement_id: item.id,
          reference_number: item.referenceNumber,
          files: item.files.map(file),
          removed_files: item.removedFiles.map(file),
        })),
      },
      billing: {
        invoice_status: value.billing.invoiceStatus
          ? this.status(value.billing.invoiceStatus)
          : null,
        issued_at: value.billing.issuedAt,
        delivered_at: value.billing.deliveredAt,
        payment_term: value.billing.paymentTerm,
        estimated_payment_at: value.billing.estimatedPaymentAt,
        paid_at: value.billing.paidAt,
      },
    };
  }

  private status(code: string) {
    const nameKey = `CUSTOMER_SERVICE_RECORD.INVOICE_STATUS.${code}`;
    return { code, name: this.names.getEnumName(nameKey), name_key: nameKey };
  }
}
