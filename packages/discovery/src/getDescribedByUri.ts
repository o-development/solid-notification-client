export async function getDescribedByUri(
  resourceUri: string,
  options: { fetch: typeof fetch }
): Promise<string> {
  const headResponse = await options.fetch(resourceUri, { method: "head" });
  console.log(headResponse.headers);
  return "blah";
}
