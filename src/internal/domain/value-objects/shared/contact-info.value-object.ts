import { ValueObject } from '@src/internal/core/entities/value-object';
import {
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';

export interface ContactInfoProps {
  name: string;
  phone: string;
  email: string;
}

export class ContactInfo extends ValueObject<ContactInfoProps> {
  constructor(props: ContactInfoProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'contact_name',
      });
    }

    if (!props.phone || !/^\d{10}$/.test(props.phone)) {
      throw InvalidValueException.create(InvalidValueExceptionCode.PHONE, {
        phone: props.phone,
      });
    }

    if (!props.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(props.email)) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'contact_email',
      });
    }

    super(props);
  }

  get name(): string {
    return this.props.name;
  }

  get phone(): string {
    return this.props.phone;
  }

  get email(): string {
    return this.props.email;
  }

  public equals(other: ContactInfo): boolean {
    return (
      this.name === other.name &&
      this.phone === other.phone &&
      this.email === other.email
    );
  }
}
