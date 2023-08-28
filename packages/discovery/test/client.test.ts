import SolidTestUtils from "solid-test-utils";
import { DiscoveryClient } from "../src/client";
import { DC, NOTIFY } from "@janeirodigital/interop-utils";

describe("discovery", () => {
  const stu = new SolidTestUtils();
  beforeAll(async () => stu.beforeAll());
  afterAll(async () => stu.afterAll());

  const cardUri = "http://localhost:3001/example/profile/card"

  test("discoverStorageDescription", async () => {
    const client = new DiscoveryClient(stu.authFetch)
    const storageDescriptionUri = await client.discoverStorageDescription(cardUri)
    expect(storageDescriptionUri).toBe('http://localhost:3001/example/.well-known/solid');
  });

  test("fetchStorageDescription", async () => {
    const client = new DiscoveryClient(stu.authFetch)
    const dataset = await client.fetchStorageDescription(cardUri)
    expect(dataset.match(null, NOTIFY.subscription, NOTIFY.WebhookChannel2023)).toBeTruthy()
  });

  test("discoverDescriptionResource", async () => {
    const client = new DiscoveryClient(stu.authFetch)
    const resourceDescriptionUri = await client.discoverDescriptionResource(cardUri)
    expect(resourceDescriptionUri).toBe('http://localhost:3001/example/profile/card.meta');
  });

  test("fetchDescriptionResource", async () => {
    const client = new DiscoveryClient(stu.authFetch)
    const dataset = await client.fetchDescriptionResource(cardUri)
    expect(dataset.match(null, DC.modified)).toBeTruthy()
  });

  test("find Webhook service", async () => {
    const client = new DiscoveryClient(stu.authFetch)
    const service = await client.findService(cardUri, NOTIFY.WebhookChannel2023.value)
    expect(service).toEqual(expect.objectContaining({
      id: 'http://localhost:3001/.notifications/WebhookChannel2023/',
      channelType: NOTIFY.WebhookChannel2023.value
    }))
  });

  test("find Web Socket service", async () => {
    const client = new DiscoveryClient(stu.authFetch)
    const service = await client.findService(cardUri, NOTIFY.WebSocketChannel2023.value)
    expect(service).toEqual(expect.objectContaining({
      id: 'http://localhost:3001/.notifications/WebSocketChannel2023/',
      channelType: NOTIFY.WebSocketChannel2023.value
    }))
  });

  test("find non existing service", async () => {
    const client = new DiscoveryClient(stu.authFetch)
    //@ts-ignore
    const service = await client.findService(cardUri, 'https://fake.example/SomeChannel')
    expect(service).toBeNull()
  });
});
