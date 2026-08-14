import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "./env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Published content only, so the cached CDN endpoint is the right default.
  useCdn: true,
});
