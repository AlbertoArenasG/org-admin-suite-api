import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import {
  CustomerFiscalProfileFormDto,
  SubmitCustomerFiscalProfileDto,
} from '@application/dto';

class ContactInfoRequestDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  phone!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;
}

export class SubmitCustomerFiscalProfileRequestDto {
  @IsNotEmpty()
  @IsString()
  business_name!: string;

  @IsNotEmpty()
  @IsString()
  rfc!: string;

  @IsNotEmpty()
  @IsString()
  tax_regime!: string;

  @IsNotEmpty()
  @IsString()
  street!: string;

  @IsNotEmpty()
  @IsString()
  number!: string;

  @IsNotEmpty()
  @IsString()
  neighborhood!: string;

  @IsNotEmpty()
  @IsString()
  delegation!: string;

  @IsNotEmpty()
  @IsString()
  city!: string;

  @IsNotEmpty()
  @IsString()
  postal_code!: string;

  @IsNotEmpty()
  @IsString()
  cfdi_use!: string;

  @IsNotEmpty()
  @IsString()
  payment_method!: string;

  @IsNotEmpty()
  @IsString()
  payment_form!: string;

  @ValidateNested()
  @Type(() => ContactInfoRequestDto)
  billing_contact!: ContactInfoRequestDto;

  @ValidateNested()
  @Type(() => ContactInfoRequestDto)
  accounts_payable_contact!: ContactInfoRequestDto;

  @IsOptional()
  @IsString()
  requirements_notes?: string;

  @IsNotEmpty()
  @IsString()
  tax_certificate_file_id!: string;

  @IsOptional()
  @IsString()
  invoice_requirements_file_id?: string;

  toFormData(): CustomerFiscalProfileFormDto {
    return {
      businessName: this.business_name,
      rfc: this.rfc,
      taxRegime: this.tax_regime,
      street: this.street,
      number: this.number,
      neighborhood: this.neighborhood,
      delegation: this.delegation,
      city: this.city,
      postalCode: this.postal_code,
      cfdiUse: this.cfdi_use,
      paymentMethod: this.payment_method,
      paymentForm: this.payment_form,
      billingContact: {
        name: this.billing_contact.name,
        phone: this.billing_contact.phone,
        email: this.billing_contact.email,
      },
      accountsPayableContact: {
        name: this.accounts_payable_contact.name,
        phone: this.accounts_payable_contact.phone,
        email: this.accounts_payable_contact.email,
      },
      requirementsNotes: this.requirements_notes ?? null,
    };
  }

  toDomain(token: string): SubmitCustomerFiscalProfileDto {
    return {
      token,
      formData: this.toFormData(),
      taxCertificateFileId: this.tax_certificate_file_id,
      invoiceRequirementsFileId: this.invoice_requirements_file_id ?? null,
    };
  }
}
