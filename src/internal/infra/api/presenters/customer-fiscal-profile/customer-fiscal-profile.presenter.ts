import { Injectable } from '@nestjs/common';

import {
  CreateCustomerFiscalProfileResultDto,
  CustomerPublicAccessViewDto,
  CustomerFiscalProfileViewDto,
  CustomerFiscalProfileFilesMetadataDto,
  CustomerFiscalProfileFormDto,
  CustomerFiscalProfileDetailsDto,
} from '@application/dto';
import { EnumNameService } from '@infra/i18n/services';
import { EnvService } from '@infra/env';

@Injectable()
export class CustomerFiscalProfilePresenter {
  private readonly apiBaseUrl: string;
  private readonly publicBaseUrl: string;

  constructor(
    private readonly enumNameService: EnumNameService,
    private readonly envService: EnvService,
  ) {
    const apiBase = this.envService.get('API_BASE_URL');
    this.apiBaseUrl = apiBase.replace(/\/$/, '');

    const publicBase = this.envService.get('CUSTOMER_PUBLIC_PROFILE_BASE_URL');
    this.publicBaseUrl = publicBase.replace(/\/$/, '');
  }

  toCreateResponse(result: CreateCustomerFiscalProfileResultDto) {
    return this.toViewResponse(result);
  }

  toViewResponse(profile: CustomerFiscalProfileViewDto) {
    return {
      customer_id: profile.id,
      company_name: profile.companyName,
      client_code: profile.clientCode,
      customer_status_id: profile.status,
      customer_status_name: this.enumNameService.getEnumName(
        `CUSTOMER.STATUS.${profile.status}`,
      ),
      created_by: profile.createdBy
        ? {
            user_id: profile.createdBy.userId,
            name: profile.createdBy.name,
            email: profile.createdBy.email,
          }
        : null,
      updated_by: profile.updatedBy
        ? {
            user_id: profile.updatedBy.userId,
            name: profile.updatedBy.name,
            email: profile.updatedBy.email,
          }
        : null,
      created_at: profile.createdAt,
      updated_at: profile.updatedAt ?? null,
      fiscal_profile: profile.fiscalProfile
        ? this.toFiscalProfileResponse(profile.fiscalProfile)
        : null,
    };
  }

  toCollection(profiles: CustomerFiscalProfileViewDto[]) {
    return profiles.map((profile) => this.toViewResponse(profile));
  }

  toPublicAccessResponse(profile: CustomerPublicAccessViewDto) {
    return {
      customer_id: profile.customerId,
      public_access_token: profile.publicAccessToken,
      public_access_url: profile.publicAccessToken
        ? this.buildPublicUrl(profile.publicAccessToken)
        : null,
    };
  }

  private toFiscalProfileResponse(
    details: CustomerFiscalProfileDetailsDto,
  ): Record<string, unknown> {
    return {
      profile_id: details.id,
      status_id: details.status,
      status_name: this.enumNameService.getEnumName(
        `CUSTOMER_FISCAL_PROFILE.STATUS.${details.status}`,
      ),
      submitted_at: details.submittedAt,
      form_data: this.toFormDataResponse(details.formData),
      tax_certificate_file_id: details.taxCertificateFileId,
      invoice_requirements_file_id: details.invoiceRequirementsFileId,
      files_metadata: this.toFilesMetadataResponse(details.filesMetadata),
    };
  }

  private toFormDataResponse(
    formData: CustomerFiscalProfileFormDto | null,
  ): Record<string, unknown> | null {
    if (!formData) {
      return null;
    }

    return {
      business_name: formData.businessName,
      rfc: formData.rfc,
      tax_regime: formData.taxRegime,
      address: {
        street: formData.street,
        number: formData.number,
        neighborhood: formData.neighborhood,
        delegation: formData.delegation,
        city: formData.city,
        postal_code: formData.postalCode,
      },
      cfdi: {
        use: formData.cfdiUse,
        payment_method: formData.paymentMethod,
        payment_form: formData.paymentForm,
      },
      billing_contact: {
        name: formData.billingContact.name,
        phone: formData.billingContact.phone,
        email: formData.billingContact.email,
      },
      accounts_payable_contact: {
        name: formData.accountsPayableContact.name,
        phone: formData.accountsPayableContact.phone,
        email: formData.accountsPayableContact.email,
      },
      requirements_notes: formData.requirementsNotes,
    };
  }

  private toFilesMetadataResponse(
    metadata: CustomerFiscalProfileFilesMetadataDto,
  ) {
    return {
      tax_certificate: metadata.taxCertificate
        ? this.toFileDescriptorResponse(metadata.taxCertificate)
        : null,
      invoice_requirements: metadata.invoiceRequirements
        ? this.toFileDescriptorResponse(metadata.invoiceRequirements)
        : null,
    };
  }

  private toFileDescriptorResponse(descriptor: {
    fileId: string;
    originalName: string;
    extension: string;
  }) {
    return {
      file_id: descriptor.fileId,
      original_name: descriptor.originalName,
      extension: descriptor.extension,
      download_url: this.buildDownloadUrl(descriptor.fileId),
    };
  }

  private buildDownloadUrl(fileId: string): string {
    return `${this.apiBaseUrl}/v1/files/${fileId}/download`;
  }

  private buildPublicUrl(token: string): string {
    return `${this.publicBaseUrl}/${token}`;
  }
}
