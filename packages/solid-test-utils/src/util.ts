import * as path from "path";
import {
  KeyPair,
  createDpopHeader,
  generateDpopKeyPair,
} from "@inrupt/solid-client-authn-core";
import { AppRunner, resolveModulePath } from "@solid/community-server";

const config = [
  {
    podName: "example",
    email: "hello@example.com",
    password: "abc123",
  },
];

// Use an increased timeout, since the CSS server takes too much setup time.
jest.setTimeout(40_000);

export function createApp() {
  return new AppRunner().create(
    {
      mainModulePath: resolveModulePath(""),
      typeChecking: false,
    },
    resolveModulePath("config/default.json"),
    {},
    {
      port: 3_001,
      loggingLevel: "off",
      seededPodConfigJson: path.join(__dirname, "solid-css-seed.json"),
    }
  );
}

export interface ISecretData {
  id: string;
  secret: string;
}

// From https://communitysolidserver.github.io/CommunitySolidServer/5.x/usage/client-credentials/
export function getSecret(): Promise<ISecretData> {
  return fetch("http://localhost:3001/idp/credentials/", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: config[0].email,
      password: config[0].password,
      name: config[0].podName,
    }),
  }).then((res) => res.json());
}

export interface ITokenData {
  accessToken: string;
  dpopKey: KeyPair;
}

// From https://communitysolidserver.github.io/CommunitySolidServer/5.x/usage/client-credentials/
export async function refreshToken({
  id,
  secret,
}: ISecretData): Promise<ITokenData> {
  const dpopKey = await generateDpopKeyPair();
  const authString = `${encodeURIComponent(id)}:${encodeURIComponent(secret)}`;
  const tokenUrl = "http://localhost:3001/.oidc/token";
  const accessToken = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      // The header needs to be in base64 encoding.
      authorization: `Basic ${Buffer.from(authString).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded",
      dpop: await createDpopHeader(tokenUrl, "POST", dpopKey),
    },
    body: "grant_type=client_credentials&scope=webid",
  })
    .then((res) => res.json())
    .then((res) => res.access_token);

  return { accessToken, dpopKey };
}
