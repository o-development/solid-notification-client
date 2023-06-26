import SolidTestUtils from "solid-test-utils";
import { SubscriptionClient } from "../src/client";
import { NOTIFY } from "@janeirodigital/interop-utils";

describe("subscription", () => {
  const stu = new SolidTestUtils();
  beforeAll(async () => stu.beforeAll());
  afterAll(async () => stu.afterAll());

  const cardUri = "http://localhost:3001/example/profile/card"

  test("subscribe for Webhook", async () => {
    const client = new SubscriptionClient(stu.authFetch)
    const sendTo = 'https://webhook.example/086b0e2a-25ea-4b94-a3c6-d2ddfcd1e022'
    const channel = await client.subscribe(cardUri, NOTIFY.WebhookChannel2023.value, sendTo)
    expect(channel).toEqual(expect.objectContaining({
      type: NOTIFY.WebhookChannel2023.value,
      topic: cardUri,
      sendTo
    }))
  });

  test("subscribe for Web Socket", async () => {
    const client = new SubscriptionClient(stu.authFetch)
    const channel = await client.subscribe(cardUri, NOTIFY.WebSocketChannel2023.value)
    expect(channel).toEqual(expect.objectContaining({
      type: NOTIFY.WebSocketChannel2023.value,
      topic: cardUri,
      receiveFrom: expect.stringContaining('ws://localhost:3001/.notifications/WebSocketChannel2023/')
    }))
  });

});
