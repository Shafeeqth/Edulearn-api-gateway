import { HttpStatus } from "@mdshafeeq-repo/edulearn-common";
import {CorsOptions} from "cors";

const allowedOrigins = (process.env.ALLOWED_ORIGINS, "").split(",");
const allowedMethods = (process.env.ALLOWED_METHODS, "").split(",");


export const corsOptions: CorsOptions = {
    origin(requestOrigin, callback) {
        if(requestOrigin || allowedOrigins.includes(requestOrigin!)) {
            callback(null, true);

        } else {
            callback(new Error("CORS policy violation"));
        }
    },
    credentials: true,
    methods: allowedMethods,
    allowedHeaders: ['Content-Type', "Authorization"],
    optionsSuccessStatus: HttpStatus.NO_CONTENT
}