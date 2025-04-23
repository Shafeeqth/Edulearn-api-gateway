import { RequestHandler } from "express";
import helmet from "helmet";

export const helmetSecurity : RequestHandler = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []

        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: {policy: "same-origin"},
    crossOriginResourcePolicy: {policy: "same-origin"},
    referrerPolicy: {policy: "no-referrer"},
    frameguard: {action: "deny"},
    hidePoweredBy: true,
})