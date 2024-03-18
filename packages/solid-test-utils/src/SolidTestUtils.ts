import { App } from "@solid/community-server";
import {
  createApp,
  getSecret,
  ISecretData,
  ITokenData,
  refreshToken,
} from "./util";
import { buildAuthenticatedFetch } from "@inrupt/solid-client-authn-core";

export class SolidTestUtils {
  app: App;
  secret: ISecretData;
  token: ITokenData;
  authFetch: typeof fetch;
  globalFetch: typeof fetch;

  async beforeAll(): Promise<void> {
    // Store global fetch to reset to after mock.
    this.globalFetch = globalThis.fetch;

    // Use an increased timeout, since the CSS server takes too much setup time.
    jest.setTimeout(40_000);

    // Start up the server
    this.app = await createApp();
    await this.app.start();

    // Generate secret
    this.secret = await getSecret();

    // Get token
    this.token = await refreshToken(this.secret);

    // Build authenticated fetch
    this.authFetch = <typeof fetch>(
      await buildAuthenticatedFetch(fetch, this.token.accessToken, {
        dpopKey: this.token.dpopKey,
      })
    );

    // Override global fetch with auth fetch
    // @ts-ignore
    globalThis.fetch = jest.fn(this.authFetch);
  }

  async afterAll(): Promise<void> {
    await this.app.stop();

    // Reset global fetch. This is probably redundant, as jest clears the DOM after each file.
    globalThis.fetch = this.globalFetch;
  }
}
