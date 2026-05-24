import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { SubmitProviderProfileDto } from '@application/dto';
import {
  ProviderFiscalProfileFormData,
  ProviderBankingInfoFormData,
} from '@domain/entities';

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

class AddressInfoRequestDto {
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
  city!: string;

  @IsNotEmpty()
  @IsString()
  state!: string;

  @IsNotEmpty()
  @IsString()
  postal_code!: string;
}

class FiscalProfileRequestDto {
  @IsNotEmpty()
  @IsString()
  business_name!: string;

  @IsNotEmpty()
  @IsString()
  rfc!: string;

  @ValidateNested()
  @Type(() => AddressInfoRequestDto)
  address!: AddressInfoRequestDto;

  @ValidateNested()
  @Type(() => ContactInfoRequestDto)
  billing_contact!: ContactInfoRequestDto;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNotEmpty()
  @IsString()
  tax_status_certificate_file_id!: string;

  @IsNotEmpty()
  @IsString()
  tax_compliance_opinion_file_id!: string;

  @IsNotEmpty()
  @IsString()
  address_proof_file_id!: string;
}

class BankingInfoRequestDto {
  @IsNotEmpty()
  @IsString()
  beneficiary!: string;

  @IsNotEmpty()
  @IsString()
  bank!: string;

  @IsNotEmpty()
  @IsString()
  account_number!: string;

  @IsNotEmpty()
  @IsString()
  clabe!: string;

  @IsOptional()
  @IsString()
  credit_granted?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNotEmpty()
  @IsString()
  bank_statement_file_id!: string;
}

export class SubmitProviderProfileRequestDto {
  @ValidateNested()
  @Type(() => ContactInfoRequestDto)
  contact!: ContactInfoRequestDto;

  @ValidateNested()
  @Type(() => FiscalProfileRequestDto)
  fiscal_profile!: FiscalProfileRequestDto;

  @ValidateNested()
  @Type(() => BankingInfoRequestDto)
  banking_info!: BankingInfoRequestDto;

  toDomain(token: string): SubmitProviderProfileDto {
    const fiscalProfileFormData: ProviderFiscalProfileFormData = {
      businessName: this.fiscal_profile.business_name,
      rfc: this.fiscal_profile.rfc,
      address: {
        street: this.fiscal_profile.address.street,
        number: this.fiscal_profile.address.number,
        neighborhood: this.fiscal_profile.address.neighborhood,
        city: this.fiscal_profile.address.city,
        state: this.fiscal_profile.address.state,
        postalCode: this.fiscal_profile.address.postal_code,
      },
      billingContact: {
        name: this.fiscal_profile.billing_contact.name,
        phone: this.fiscal_profile.billing_contact.phone,
        email: this.fiscal_profile.billing_contact.email,
      },
      notes: this.fiscal_profile.notes ?? null,
    };

    const bankingInfoFormData: ProviderBankingInfoFormData = {
      beneficiary: this.banking_info.beneficiary,
      bank: this.banking_info.bank,
      accountNumber: this.banking_info.account_number,
      clabe: this.banking_info.clabe,
      creditGranted: this.banking_info.credit_granted ?? null,
      notes: this.banking_info.notes ?? null,
    };

    return {
      token,
      contact: {
        name: this.contact.name,
        phone: this.contact.phone,
        email: this.contact.email,
      },
      fiscalProfile: {
        formData: fiscalProfileFormData,
        taxStatusCertificateFileId:
          this.fiscal_profile.tax_status_certificate_file_id,
        taxComplianceOpinionFileId:
          this.fiscal_profile.tax_compliance_opinion_file_id,
        addressProofFileId: this.fiscal_profile.address_proof_file_id,
      },
      bankingInfo: {
        formData: bankingInfoFormData,
        bankStatementFileId: this.banking_info.bank_statement_file_id,
      },
    };
  }
}
