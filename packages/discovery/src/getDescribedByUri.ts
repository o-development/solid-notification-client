import { FetchFunction } from "@solid-notifications/types";

export async function getDescribedByUri(
  resourceUri: string,
  options: { fetch: FetchFunction }
): Promise<string> {
  const headResponse = await options.fetch(resourceUri, { method: "head" });
  console.log(headResponse.headers);
  return "blah";
}
