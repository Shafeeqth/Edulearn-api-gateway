import { EnvNotFoundError } from "@mdshafeeq-repo/edulearn-common";
import  dotenv from "dotenv"
dotenv.config();


type EnvironmentVariables = {
  [key: string]: string;
};

export function getEnvs(...envs: string[]): EnvironmentVariables {
  const variables: EnvironmentVariables = {};
  envs.forEach((env) => {
    if (!process.env[env]) throw new EnvNotFoundError(env);
    variables[env] = process.env[env];
  });
  return variables;
}
 