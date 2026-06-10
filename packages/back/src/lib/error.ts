export class NotImplementedError extends Error {
    constructor(message: string | undefined = undefined) {
        super(message ? `Not implemented: ${ message }` : 'Not implemented');
    }
}

export class HTTPError extends Error {
    status: number = 500;

    toResponse() {
		return Response.json({
			message: this.message,
		}, {
			status: this.status
		})
	}
}

export class NotFoundError extends HTTPError {
    status: number = 404;
};

export class ForbiddenError extends HTTPError {
    status: number = 403;

    constructor(message: string | undefined = undefined) {
        super(message ? `Forbidden: ${ message }` : 'Forbidden');
    }
};

export class UnauthorizedError extends HTTPError {
    status: number = 401;

    constructor(message: string | undefined = undefined) {
        super(message ? `Unauthorized: ${ message }` : 'Unauthorized');
    }
};

export class TooManyRequestsError extends HTTPError {
    status: number = 429;

    constructor() {
        super('Too many requests, please try again later');
    }
};

export class BadRequestError extends HTTPError {
    status: number = 400;

    constructor(message: string) {
        super(message);
    }
};

export class UniqueError extends HTTPError {
    status: number = 400;

    constructor(field: string) {
        super(`'${field}' property must be unique`);
    }
};
