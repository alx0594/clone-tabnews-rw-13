import {
  MethodNotAllowedError,
  InternalServerError,
  ValidationError,
  NotFoundError,
} from "infra/error.js";

function onNoMatchHandler(request, response) {
  const publicObjectError = new MethodNotAllowedError();
  return response.status(publicObjectError.statusCode).json(publicObjectError);
}

function onErrorHandler(error, request, response) {
  if (error instanceof ValidationError || error instanceof NotFoundError) {
    return response.status(error.statusCode).json(error);
  }

  const publicObjectError = new InternalServerError({
    cause: error,
  });
  return response.status(publicObjectError.statusCode).json(publicObjectError);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;
