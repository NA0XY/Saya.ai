"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateQuery = exports.validateBody = void 0;
const zod_1 = require("zod");
const apiError_1 = require("../utils/apiError");
function validate(schema, source) {
    return (req, _res, next) => {
        try {
            const parsed = schema.parse(req[source]);
            Object.defineProperty(req, source, { value: parsed, writable: true, configurable: true });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                next(new apiError_1.ApiError(422, 'Validation error', error.errors, 'VALIDATION_ERROR'));
                return;
            }
            next(error);
        }
    };
}
const validateBody = (schema) => validate(schema, 'body');
exports.validateBody = validateBody;
const validateQuery = (schema) => validate(schema, 'query');
exports.validateQuery = validateQuery;
const validateParams = (schema) => validate(schema, 'params');
exports.validateParams = validateParams;
//# sourceMappingURL=validate.middleware.js.map