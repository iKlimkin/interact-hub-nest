import { ErrorsMessages } from '../../../src/infra/utils/error-handler';

enum errors {
  title = 'title',
  login = 'login',
  shortDescription = 'shortDescription',
  blogId = 'blogId',
  content = 'content',
  postId = 'postId',
  email = 'email',
  loginOrEmail = 'loginOrEmail',
  password = 'password',
}

type ErrorsMessagesTypes = keyof typeof errors;

export const createErrorsMessages = (
  fields: ErrorsMessagesTypes[],
  message?: string,
) => {
  const errorsMessages: ErrorsMessages[] = [];
  for (const field of fields) {
    errorsMessages.push({
      message: message ?? expect.any(String),
      field: field ?? expect.any(String),
    });
  }
  return { errorsMessages };
};
