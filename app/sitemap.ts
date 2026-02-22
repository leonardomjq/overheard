import type { MetadataRoute } from "next";
import { getAllCards, getAllDates } from "@/lib/data";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://scout-daily.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const cardEntries: MetadataRoute.Sitemap = getAllCards().map((card) => ({
    url: `${BASE_URL}/card/${card.id}`,
    lastModified: new Date(card.date),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const latestDate = getAllDates()[0];

  return [
    {
      url: BASE_URL,
      lastModified: latestDate ? new Date(latestDate) : new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/archive`,
      lastModified: latestDate ? new Date(latestDate) : new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...cardEntries,
  ];
}
