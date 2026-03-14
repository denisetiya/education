declare const env: {
    readonly nodeEnv: "production" | "development";
    readonly isProduction: boolean;
    readonly port: number;
    readonly databaseUrl: string;
    readonly jwtSecret: string;
    readonly jwtIssuer: string;
    readonly jwtAudience: string;
    readonly authCookieName: string;
    readonly frontendOrigins: string[];
    readonly requestBodyLimit: string;
    readonly bcryptRounds: number;
    readonly generalRateLimitWindowMs: number;
    readonly generalRateLimitMax: number;
    readonly authRateLimitWindowMs: number;
    readonly authRateLimitMax: number;
};
export default env;
//# sourceMappingURL=env.d.ts.map