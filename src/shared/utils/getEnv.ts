import  dotenv from "dotenv"
import { EnvNotFoundError } from "./errors/env-not-found-error";
dotenv.config();


type EnvironmentVariables = {
  [key: string]: string;
};

export function getEnvs(...envs: string[]): EnvironmentVariables {
  const variables: EnvironmentVariables = {};
  envs.forEach((env) => {
    if (!process.env[env]) {
      throw new EnvNotFoundError(env);
    }
    variables[env] = process.env[env];
  });
  return variables;
}
 