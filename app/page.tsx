import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PageBuilder from "@/components/PageBuilder";
import { client } from "@/sanity/client";
import { PAGE_QUERY } from "@/sanity/queries";

const options = { next: { revalidate: 30 } };

async function getHomePage() {
  return client.fetch(PAGE_QUERY, { slug: "home" }, options);
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomePage();
  if (!page) return {};

  return {
    title: page.seoTitle ?? page.title ?? undefined,
    description: page.seoDescription ?? undefined,
  };
}

export default async function Home() {
  const page = await getHomePage();

  if (!page) notFound();

  return <PageBuilder blocks={page.pageBuilder} />;
}
