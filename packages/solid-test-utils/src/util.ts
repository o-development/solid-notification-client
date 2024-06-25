import * as path from "path";
import {
  KeyPair,
  createDpopHeader,
  generateDpopKeyPair,
} from "@inrupt/solid-client-authn-core";
import { AppRunner, resolveModulePath } from "@solid/community-server";

const config = [
  {
    email: "hello@example.com",
    password: "abc123",
    pods: [{ name: "example" }],
  },
];

export function createApp() {
  return new AppRunner().create({
    loaderProperties: {
      mainModulePath: resolveModulePath(""),
      typeChecking: false,
    },
    config: resolveModulePath("config/default.json"),
    shorthand: {
      port: 3_001,
      loggingLevel: "off",
      seedConfig: new URL("../src/solid-css-seed.json", import.meta.url).pathname,
    },
  });
}

export interface ISecretData {
  id: string;
  secret: string;
}

// From https://communitysolidserver.github.io/CommunitySolidServer/7.x/usage/client-credentials/
export async function getSecret(): Promise<ISecretData> {
  const index = "http://localhost:3001/.account/";
  const webId = "http://localhost:3001/example/profile/card#me";
  // First we request the account API controls to find out where we can log in
  let indexResponse = await fetch(index);
  let { controls } = await indexResponse.json();

  // And then we log in to the account API
  const loginResponse = await fetch(controls.password.login, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: config[0].email,
      password: config[0].password,
    }),
  });
  // This authorization value will be used to authenticate in the next step
  const { authorization } = await loginResponse.json();
  // Now that we are logged in, we need to request the updated controls from the server.
  // These will now have more values than in the previous example.
  indexResponse = await fetch(index, {
    headers: { authorization: `CSS-Account-Token ${authorization}` },
  });
  controls = (await indexResponse.json()).controls;

  // Here we request the server to generate a token on our account
  const response = await fetch(controls.account.clientCredentials, {
    method: "POST",
    headers: {
      authorization: `CSS-Account-Token ${authorization}`,
      "content-type": "application/json",
    },
    // The name field will be used when generating the ID of your token.
    // The WebID field determines which WebID you will identify as when using the token.
    // Only WebIDs linked to your account can be used.
    body: JSON.stringify({
      name: "my-token",
      webId,
    }),
  });

  // These are the identifier and secret of your token.
  // Store the secret somewhere safe as there is no way to request it again from the server!
  // The `resource` value can be used to delete the token at a later point in time.
  return response.json();
}

export interface ITokenData {
  accessToken: string;
  dpopKey: KeyPair;
}

// From https://communitysolidserver.github.io/CommunitySolidServer/7.x/usage/client-credentials/
export async function refreshToken({
  id,
  secret,
}: ISecretData): Promise<ITokenData> {
  const dpopKey = await generateDpopKeyPair();
  const authString = `${encodeURIComponent(id)}:${encodeURIComponent(secret)}`;
  const tokenUrl = "http://localhost:3001/.oidc/token";
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      // The header needs to be in base64 encoding.
      authorization: `Basic ${Buffer.from(authString).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded",
      dpop: await createDpopHeader(tokenUrl, "POST", dpopKey),
    },
    body: "grant_type=client_credentials&scope=webid",
  });

  const { access_token: accessToken } = await response.json();

  return { accessToken, dpopKey };
}
