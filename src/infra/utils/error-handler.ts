import { ValidationError } from 'express-validator';

export type ErrorsMessages = {
  message: string;
  field: string;
};
type ErrorFormatter<T> = (error: ValidationError) => T;

export type ErrorType = { errorsMessages: ErrorsMessages[] };

export const errorHandler: ErrorFormatter<ErrorsMessages> = (error) => {
  if (error.type === 'field') {
    return {
      message: error.msg,
      field: error.path,
    };
  }

  return {
    message: 'Unknown error',
    field: '',
  };
};

export const makeErrorsMessages = (msg: string): ErrorType => {
  const errorsMessages: Array<ErrorsMessages> = [];

  if (msg === 'login' || msg === 'email') {
    errorsMessages.push({
      message: `User with such ${msg} is already exists in the system`,
      field: `${msg}`,
    });
  }

  if (msg === 'code') {
    errorsMessages.push({
      message: `incorrect confirmation ${msg}, please check entered data or request again`,
      field: `${msg}`,
    });
  }

  if (msg === 'confirmation') {
    errorsMessages.push({
      message: `Email is already confirmed or user doesn't exist`,
      field: `email`,
    });
  }

  if (msg === 'rateLimit') {
    errorsMessages.push({
      message: `Too Many Requests`,
      field: `rate limiting`,
    });
  }
  return { errorsMessages };
};
