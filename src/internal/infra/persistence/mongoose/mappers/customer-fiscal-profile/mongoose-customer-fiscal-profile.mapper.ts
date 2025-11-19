import {
  CustomerFiscalProfile,
  CustomerFiscalProfileFormData,
  CustomerFiscalProfileStatus,
} from '@domain/entities';
import {
  CustomerFiscalProfileDocument,
  CustomerFiscalProfileFormDocument,
} from '@infra/persistence/mongoose/schemas';

export class MongooseCustomerFiscalProfileMapper {
  static toDomain(
    document: CustomerFiscalProfileDocument,
  ): CustomerFiscalProfile | null {
    if (!document) {
      return null;
    }

    return new CustomerFiscalProfile({
      id: document.customer_fiscal_profile_id,
      customerId: document.customer_id,
      status: document.status ?? CustomerFiscalProfileStatus.PENDING,
      formData: this.toFormData(document.form_data),
      submittedAt: document.submitted_at ?? null,
      taxCertificateFileId: document.tax_certificate_file_id ?? null,
      invoiceRequirementsFileId: document.invoice_requirements_file_id ?? null,
      createdAt: document.createdAt ?? undefined,
      updatedAt: document.updatedAt ?? undefined,
    });
  }

  static toMongoose(profile: CustomerFiscalProfile) {
    return {
      customer_fiscal_profile_id: profile.id,
      customer_id: profile.customerId,
      status: profile.status,
      form_data: this.toFormDocument(profile.formData),
      submitted_at: profile.submittedAt,
      tax_certificate_file_id: profile.taxCertificateFileId,
      invoice_requirements_file_id: profile.invoiceRequirementsFileId,
    };
  }

  private static toFormData(
    form?: CustomerFiscalProfileFormDocument | null,
  ): CustomerFiscalProfileFormData | null {
    if (!form) {
      return null;
    }

    return {
      businessName: form.business_name,
      rfc: form.rfc,
      taxRegime: form.tax_regime,
      street: form.street,
      number: form.number,
      neighborhood: form.neighborhood,
      delegation: form.delegation,
      city: form.city,
      postalCode: form.postal_code,
      cfdiUse: form.cfdi_use,
      paymentMethod: form.payment_method,
      paymentForm: form.payment_form,
      billingContact: {
        name: form.billing_contact?.name ?? '',
        phone: form.billing_contact?.phone ?? '',
        email: form.billing_contact?.email ?? '',
      },
      accountsPayableContact: {
        name: form.accounts_payable_contact?.name ?? '',
        phone: form.accounts_payable_contact?.phone ?? '',
        email: form.accounts_payable_contact?.email ?? '',
      },
      requirementsNotes: form.requirements_notes ?? null,
    };
  }

  private static toFormDocument(
    form: CustomerFiscalProfileFormData | null,
  ): CustomerFiscalProfileFormDocument | null {
    if (!form) {
      return null;
    }

    return {
      business_name: form.businessName,
      rfc: form.rfc,
      tax_regime: form.taxRegime,
      street: form.street,
      number: form.number,
      neighborhood: form.neighborhood,
      delegation: form.delegation,
      city: form.city,
      postal_code: form.postalCode,
      cfdi_use: form.cfdiUse,
      payment_method: form.paymentMethod,
      payment_form: form.paymentForm,
      billing_contact: {
        name: form.billingContact.name,
        phone: form.billingContact.phone,
        email: form.billingContact.email,
      },
      accounts_payable_contact: {
        name: form.accountsPayableContact.name,
        phone: form.accountsPayableContact.phone,
        email: form.accountsPayableContact.email,
      },
      requirements_notes: form.requirementsNotes,
    };
  }
}
