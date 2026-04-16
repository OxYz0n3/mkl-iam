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

    constructor(resource: string) {
        super(`${resource} not found`);
    }
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
