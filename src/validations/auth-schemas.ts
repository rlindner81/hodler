import { validasaur } from "../deps.ts";
const { required, isString, isEmail, lengthBetween } = validasaur;

const loginSchema = {
  email: [required, isString, lengthBetween(1, 256), isEmail],
  password: [required, isString, lengthBetween(1, 256)],
};

const meSchema = {
  name: [isString, lengthBetween(1, 256)],
  email: [isString, lengthBetween(1, 256), isEmail],
  password: [isString, lengthBetween(1, 256)],
};

const registerSchema = {
  name: [required, isString, lengthBetween(1, 256)],
  email: [required, isString, lengthBetween(1, 256), isEmail],
  password: [required, isString, lengthBetween(1, 256)],
};

export { loginSchema, meSchema, registerSchema };
