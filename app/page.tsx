// app/page.tsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

type Lang = "ar" | "en";

function getPreferredLang(acceptLanguage: string | null): Lang {
  if (!acceptLanguage) {
    return "ar";
  }

  const parts = acceptLanguage
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);

  for (const part of parts) {
    const [tag] = part.split(";");
    const lang = tag.split("-")[0];

    if (lang === "en") {
      return "en";
    }

    if (lang === "ar") {
      return "ar";
    }
  }

  return "ar";
}

export default async function RootPage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");

  const lang = getPreferredLang(acceptLanguage);

  redirect(`/${lang}`);
}