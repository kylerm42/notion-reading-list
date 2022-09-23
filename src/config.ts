import Joi from "joi";

export type Env = {
  NOTION_DATABASE_ID: string;
  NOTION_API_KEY: string;
  FETCH_INTERVAL: number;
};

const envValidator = Joi.object<Env>({
  NOTION_DATABASE_ID: Joi.string().required(),
  NOTION_API_KEY: Joi.string().required(),
  FETCH_INTERVAL: Joi.number().default(10000),
});

export function validateEnv() {
  const validationResult = envValidator.validate(process.env, {
    stripUnknown: true,
    convert: true,
  });
  if (validationResult.error) {
    throw new Error(validationResult.error.message);
  } else {
    return validationResult.value;
  }
}
