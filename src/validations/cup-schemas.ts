import { validasaur } from "../deps.ts";
const { required, isString, isEmail, lengthBetween } = validasaur;

const registerSchema = {
  name: [required, isString, lengthBetween(1, 256)],
  email: [required, isString, lengthBetween(1, 256), isEmail],
  password: [required, isString, lengthBetween(1, 256)],
};

export { registerSchema };
