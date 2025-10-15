import { customAlphabet } from 'nanoid';

export const genId = () =>
  customAlphabet(
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    24,
  )();
