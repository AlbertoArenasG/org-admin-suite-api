export interface IPhoneSchema {
  country_code: string;
  number: string;
}

const PhoneSchema = {
  country_code: { type: String },
  number: { type: String },
  _id: false,
};

export { PhoneSchema };
