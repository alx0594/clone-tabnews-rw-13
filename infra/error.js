export class MethodNotAllowedError extends Error {
  constructor() {
    super("O método HTTP utilizado não é permitido.");
    this.name = "MethodNotAllowedError";
    this.action = "Verificar o método HTTP utilizado.";
    this.statusCode = 405;
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class InternalServerError extends Error {
  constructor({ cause, message }) {
    super(message || "Um erro interno do sistema aconteceu.", {
      cause,
    });
    this.name = "InternalServerError";
    this.message = message;
    this.action = "Entrar em contato com o time de suporte.";
    this.statusCode = 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ServiceError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Serviço indisponível.", {
      cause,
    });
    this.name = "ServiceError";
    this.message = message;
    this.action = action || "Verificar se o serviço está disponível.";
    this.statusCode = 503;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
