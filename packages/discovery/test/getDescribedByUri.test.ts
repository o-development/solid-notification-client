import SolidTestUtils from "solid-test-utils";
import { getDescribedByUri } from "../src/getDescribedByUri";

describe("getDescribedByUri", () => {
  const stu = new SolidTestUtils();
  beforeAll(async () => stu.beforeAll());
  afterAll(async () => stu.afterAll());

  test("Trivial", async () => {
    await getDescribedByUri("http://localhost:3001/example/profile/card", {
      fetch: stu.authFetch,
    });
    expect(true).toBe(true);
  });
});
