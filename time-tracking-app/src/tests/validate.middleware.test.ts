import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate';

describe('Validate Middleware', () => {
    it('should call next() when request passes validation', async () => {
        const schema = {
            body: z.object({ title: z.string() }),
        };

        const req = {
            body: { title: 'Test Entry' },
            params: {},
            query: {},
        } as Request;

        const res = {} as Response;
        const next: NextFunction = vi.fn();

        const middleware = validate(schema);
        await middleware(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    it('should respond with 400 and error details when validation fails', async () => {
        const schema = {
            body: z.object({ title: z.string() }),
        };

        const req = {
            body: { title: 12345 }, // invalid type
            params: {},
            query: {},
        } as Request;

        const jsonMock = vi.fn();
        const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
        const res = { status: statusMock } as unknown as Response;
        const next: NextFunction = vi.fn();

        const middleware = validate(schema);
        await middleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith(
            expect.objectContaining({
                error: 'Validation failed',
                details: expect.arrayContaining([
                    expect.objectContaining({ path: 'title' }),
                ]),
            })
        );
    });

    it('should validate params correctly', async () => {
        const schema = {
            params: z.object({ id: z.string().length(24) }),
        };

        const req = {
            body: {},
            params: { id: 'too-short' },
            query: {},
        } as unknown as Request;

        const jsonMock = vi.fn();
        const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
        const res = { status: statusMock } as unknown as Response;
        const next: NextFunction = vi.fn();

        const middleware = validate(schema);
        await middleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
    });
});
