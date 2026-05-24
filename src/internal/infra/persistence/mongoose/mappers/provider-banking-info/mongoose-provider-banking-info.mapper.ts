import { ProviderBankingInfo } from '@domain/entities';
import { ProviderBankingInfoDocument } from '@infra/persistence/mongoose/schemas/provider-banking-info/provider-banking-info.schema';

export class MongooseProviderBankingInfoMapper {
  static toDomain(
    document: ProviderBankingInfoDocument,
  ): ProviderBankingInfo | null {
    if (!document) return null;

    return new ProviderBankingInfo({
      id: document.provider_banking_info_id,
      providerId: document.provider_id,
      status: document.status,
      formData: document.form_data
        ? {
            beneficiary: document.form_data.beneficiary,
            bank: document.form_data.bank,
            accountNumber: document.form_data.account_number,
            clabe: document.form_data.clabe,
            creditGranted: document.form_data.credit_granted,
            notes: document.form_data.notes,
          }
        : null,
      bankStatementFileId: document.bank_statement_file_id,
      submittedAt: document.submitted_at,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  static toMongoose(bankingInfo: ProviderBankingInfo) {
    return {
      provider_id: bankingInfo.providerId,
      status: bankingInfo.status,
      form_data: bankingInfo.formData
        ? {
            beneficiary: bankingInfo.formData.beneficiary,
            bank: bankingInfo.formData.bank,
            account_number: bankingInfo.formData.accountNumber,
            clabe: bankingInfo.formData.clabe,
            credit_granted: bankingInfo.formData.creditGranted,
            notes: bankingInfo.formData.notes,
          }
        : null,
      bank_statement_file_id: bankingInfo.bankStatementFileId,
      submitted_at: bankingInfo.submittedAt,
    };
  }
}
