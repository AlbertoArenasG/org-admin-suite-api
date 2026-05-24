import { ProviderFiscalProfile } from '@domain/entities';
import { ProviderFiscalProfileDocument } from '@infra/persistence/mongoose/schemas/provider-fiscal-profile/provider-fiscal-profile.schema';

export class MongooseProviderFiscalProfileMapper {
  static toDomain(
    document: ProviderFiscalProfileDocument,
  ): ProviderFiscalProfile | null {
    if (!document) return null;

    return new ProviderFiscalProfile({
      id: document.provider_fiscal_profile_id,
      providerId: document.provider_id,
      status: document.status,
      formData: document.form_data
        ? {
            businessName: document.form_data.business_name,
            rfc: document.form_data.rfc,
            address: {
              street: document.form_data.address.street,
              number: document.form_data.address.number,
              neighborhood: document.form_data.address.neighborhood,
              city: document.form_data.address.city,
              state: document.form_data.address.state,
              postalCode: document.form_data.address.postal_code,
            },
            billingContact: {
              name: document.form_data.billing_contact.name,
              phone: document.form_data.billing_contact.phone,
              email: document.form_data.billing_contact.email,
            },
            notes: document.form_data.notes,
          }
        : null,
      taxStatusCertificateFileId: document.tax_status_certificate_file_id,
      taxComplianceOpinionFileId: document.tax_compliance_opinion_file_id,
      addressProofFileId: document.address_proof_file_id,
      submittedAt: document.submitted_at,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  static toMongoose(profile: ProviderFiscalProfile) {
    return {
      provider_id: profile.providerId,
      status: profile.status,
      form_data: profile.formData
        ? {
            business_name: profile.formData.businessName,
            rfc: profile.formData.rfc,
            address: {
              street: profile.formData.address.street,
              number: profile.formData.address.number,
              neighborhood: profile.formData.address.neighborhood,
              city: profile.formData.address.city,
              state: profile.formData.address.state,
              postal_code: profile.formData.address.postalCode,
            },
            billing_contact: {
              name: profile.formData.billingContact.name,
              phone: profile.formData.billingContact.phone,
              email: profile.formData.billingContact.email,
            },
            notes: profile.formData.notes,
          }
        : null,
      tax_status_certificate_file_id: profile.taxStatusCertificateFileId,
      tax_compliance_opinion_file_id: profile.taxComplianceOpinionFileId,
      address_proof_file_id: profile.addressProofFileId,
      submitted_at: profile.submittedAt,
    };
  }
}
