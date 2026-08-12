export interface IContactValueSchema {
  value: string;
}

export const ContactValueSchema = {
  value: { type: String, required: true, trim: true },
  _id: false,
};
