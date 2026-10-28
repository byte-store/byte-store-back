export class ValidationError extends Error {
  status = 400;
}

export class UnauthorizedError extends Error {
  status = 401;
}

export class ForbiddenError extends Error {
  status = 403;
}

export class NotFoundError extends Error {
  status = 404;
}

export class ConflictError extends Error {
  status = 409;
}

// Códigos de error de Postgres que traducimos a errores HTTP
export const PG_FOREIGN_KEY_VIOLATION = "23503";
export const PG_UNIQUE_VIOLATION = "23505";
export const PG_NUMERIC_OUT_OF_RANGE = "22003";

// Máximo de una columna INTEGER/SERIAL de Postgres
export const PG_MAX_INT = 2147483647;
