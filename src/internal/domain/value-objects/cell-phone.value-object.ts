import { ValueObject } from '@src/internal/core/entities/value-object';

export interface CellPhoneProps {
  countryCode: string;
  number: string;
}

export class CellPhone extends ValueObject<CellPhoneProps> {
  private readonly countryCode: string;
  private readonly number: string;

  constructor(props: CellPhoneProps = { countryCode: null, number: null }) {
    super(props);

    if (this.countryCode && !/^\+\d{1,4}$/.test(this.countryCode)) {
      throw new Error('Invalid country code format');
    }

    if (this.number && !/^\d{7,15}$/.test(this.number)) {
      throw new Error('Invalid phone number format');
    }
  }

  public getFullNumber(): string {
    return `${this.countryCode}${this.number}`;
  }

  public getCountryCode(): string {
    return this.countryCode;
  }

  public getNumber(): string {
    return this.number;
  }

  public isNull(): boolean {
    return !this.countryCode || !this.number;
  }

  public equals(other: CellPhone): boolean {
    return this.getFullNumber() === other.getFullNumber();
  }
}
