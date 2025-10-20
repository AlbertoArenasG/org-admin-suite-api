import { ValueObject } from '@src/internal/core/entities/value-object';
import {
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';

export interface PhoneProps {
  countryCode: string | null;
  number: string | null;
}

export class Phone extends ValueObject<PhoneProps> {
  constructor(props: PhoneProps = { countryCode: null, number: null }) {
    let isValid = true;

    if (props.countryCode && !/^\+\d{1,4}$/.test(props.countryCode))
      isValid = false;

    if (props.number && !/^\d{7,15}$/.test(props.number)) isValid = false;

    if (!isValid) {
      throw InvalidValueException.create(InvalidValueExceptionCode.PHONE, {
        phone: `${props.countryCode} ${props.number}`,
      });
    }

    super(props);
  }

  get countryCode(): string | null {
    return this.props.countryCode;
  }

  get number(): string | null {
    return this.props.number;
  }

  get fullNumber(): string {
    return `${this.props.countryCode}${this.props.number}`;
  }

  get isNull(): boolean {
    return !this.props.countryCode || !this.props.number;
  }

  public equals(other: Phone): boolean {
    return this.fullNumber === other.fullNumber;
  }
}
