import CareersHeader from "@/components/sections/careers-header";
import { getContent } from "@/lib/content";
import type { CareersContent } from "@/lib/content-types";

export default async function Careers() {
  const content = await getContent<CareersContent>("careers", "header");
  return <CareersHeader content={content} />;
}
