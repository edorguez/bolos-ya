/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthResponse } from '../models/AuthResponse';
import type { HealthResponse } from '../models/HealthResponse';
import type { LoginRequest } from '../models/LoginRequest';
import type { RegisterRequest } from '../models/RegisterRequest';
import type { SyncRequest } from '../models/SyncRequest';
import type { SyncResponse } from '../models/SyncResponse';
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * Health check endpoint
     * @returns HealthResponse Service is healthy
     * @throws ApiError
     */
    public static healthCheck(): CancelablePromise<HealthResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/health',
        });
    }
    /**
     * Register a new user
     * @param requestBody
     * @returns User User created successfully
     * @throws ApiError
     */
    public static registerUser(
        requestBody: RegisterRequest,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                409: `User already exists`,
            },
        });
    }
    /**
     * Authenticate user
     * @param requestBody
     * @returns AuthResponse Authentication successful
     * @throws ApiError
     */
    public static loginUser(
        requestBody: LoginRequest,
    ): CancelablePromise<AuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Invalid credentials`,
            },
        });
    }
    /**
     * Sync offline operations
     * @param requestBody
     * @returns SyncResponse Sync processed
     * @throws ApiError
     */
    public static syncOperations(
        requestBody: SyncRequest,
    ): CancelablePromise<SyncResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/sync',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                409: `Conflict detected`,
            },
        });
    }
}
