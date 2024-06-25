import { App } from "@solid/community-server";
import {
  createApp,
  getSecret,
  refreshToken,
  ISecretData,
  ITokenData,
} from "./util";
import { buildAuthenticatedFetch } from "@inrupt/solid-client-authn-core";

export class SolidTestUtils {
  app: App;
  secret: ISecretData;
  token: ITokenData;
  authFetch: typeof fetch;

  async beforeAll(): Promise<void> {
    // Start up the server
    this.app = await createApp();
    await this.app.start();

    // Generate secret
    this.secret = await getSecret();

    // Get token
    this.token = await refreshToken(this.secret);

    // Build authenticated fetch
    this.authFetch = await buildAuthenticatedFetch(this.token.accessToken, {
      dpopKey: this.token.dpopKey,
    });
  }

  async afterAll(): Promise<void> {
    await this.app.stop();
  }
}
