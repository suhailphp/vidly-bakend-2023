const yup = require('yup');
const i18n = require('i18n');
const { sequelize } = require('../models/index');

const setRequired = (rule, required) => {
  if (required) return rule.required();
  return rule;
};

/* eslint-disable no-unexpected-multiline */
module.exports = {
  yup,
  schema: (rules) => yup.object().shape(rules),
  rules: {
    userID: (key = 'userID', label) => ({
      [key]: yup
        .number()
        // .transform(async (value, originalValue) => {
        //   const c = await sequelize.models.user.count({ where: { userID: value } });
        //   if (c) return value;
        //   console.log(1, c, value);
        // })
        .required(i18n.__(`${label || key} is required`))
        .typeError(i18n.__(`${label || key} is invalid`)),
    }),
    sid: (key, label) => ({
      [key]: yup
        .string()
        .required(i18n.__(`${label || key} is required`))
        .typeError(i18n.__(`${label || key} is invalid`)),
    }),
    id: (key, label) => ({
      [key]: yup
        .number()
        .required(i18n.__(`${label || key} is required`))
        .positive(i18n.__(`${label || key} is invalid`))
        .integer(i18n.__(`${label || key} is invalid`))
        .typeError(i18n.__(`${label || key} is invalid`)),
    }),
    uuid: (key, label, required) => ({
      [key]: yup
        .string()
        [required ? 'required' : 'notRequired'](i18n.__(`${label || key} is required`))
        // .required(i18n.__(`${label || key} is invalid`))
        // .nullable(nullable, `${i18n.__(`${label || key} is invalid`)} h`)
        .typeError(i18n.__(`${label || key} is invalid`)),
    }),
    amount: (key, label, required) => ({
      [key]: yup
        .number()
        .min(0, i18n.__('amount is invalid'))
        .required(i18n.__(`${label || key} is required`))
        [required ? 'required' : 'notRequired'](i18n.__(`${label || key} is required`))
        .positive(i18n.__(`${label || key} is invalid`))
        .integer(i18n.__(`${label || key} is invalid`))
        .typeError(i18n.__(`${label || key} is invalid`)),
    }),
    string: (key, label, required) => ({
      [key]: yup
        .string()
        [required ? 'required' : 'notRequired'](i18n.__(`${label || key} is required`))
        .typeError(i18n.__(`${label || key} is invalid`)),
    }),
    number: (key, label, min, max) => {
      if (min && max) {
        return {
          [key]: yup
            .number()
            .min(min)
            .max(max)
            .required(i18n.__(`${label || key} is required`))
            .typeError(i18n.__(`${label || key} is invalid`)),
        };
      }
      return {
        [key]: yup
          .number()
          .required(i18n.__(`${label || key} is required`))
          .typeError(i18n.__(`${label || key} is invalid`)),
      };
    },
    year: (key = 'year', label) => ({
      [key]: yup
        .number()
        .min(1900)
        .max(3000)
        .required(i18n.__(`${label || key} is required`))
        .typeError(i18n.__(`${label || key} is invalid`)),
    }),
    date: (key, label, required = true) => ({
      [key]: yup
        .date()
        [required ? 'required' : 'notRequired'](i18n.__(`${label || key} is required`))
        .typeError(i18n.__(`${label || key} is invalid`)),
    }),
    object: (key, label, children) => ({
      [key]: yup
        .object(children)
        .required(i18n.__(`${label || key} is required`))
        .typeError(i18n.__(`${label || key} is invalid`)),
    }),
    mixed: (key, label, children) => ({
      [key]: yup
        .mixed(children)
        .required(i18n.__(`${label || key} is required`))
        .typeError(i18n.__(`${label || key} is invalid`)),
    }),
    array: (key, label, children) => ({
      [key]: yup
        .array()
        .required(i18n.__(`${label || key} is required`))
        .typeError(i18n.__(`${label || key} is invalid`)),
    }),
    arrayOf: (key, label, children) => ({
      [key]: yup
        .array()
        .of(children)
        .required(i18n.__(`${label || key} is required`))
        .typeError(i18n.__(`${label || key} is invalid`)),
    }),
    email: (key = 'email', label) => ({
      [key]: yup
        .string().email()
        .required(i18n.__(`${label || key} is required`))
        .typeError(i18n.__(`${label || key} is invalid`)),
    }),
    boolean: (key, label) => ({
      [key]: yup
        .boolean()
        .required(i18n.__(`${label || key} is required`))
        .typeError(i18n.__(`${label || key} is invalid`))
        .default(false),
    }),
    mobile: (key = 'mobile', label, required = true) => ({
      [key]: yup
        .string()
        .matches(
          /^(971)\d{9}$/gm,
          i18n.__(`Invalid ${key} eg. 971501234567`),
        )
        [required ? 'required' : 'notRequired'](i18n.__(`${label || key} is required`))
        .typeError(i18n.__(`${label || key} is invalid`)),
    }),
    file: (key = 'file', label, required) => ({
      [key]: yup
        .object()
        .shape({
          fieldname: yup.string()[required ? 'required' : 'notRequired'](i18n.__(`${label || key} is required`)),
          mimetype: yup.string()[required ? 'required' : 'notRequired'](i18n.__(`${label || key} is required`)),
          size: yup.number()[required ? 'required' : 'notRequired'](i18n.__(`${label || key} is required`)),
        })
        [required ? 'required' : 'notRequired']()
        .typeError(i18n.__(`${label || key} is invalid`)),
    }),
  },
};
