import { getContent } from "@/lib/content";
import PrayerBar from "./PrayerBar";

export const dynamic = "force-dynamic";

export default async function TopBar() {
  const c = await getContent();
  return <PrayerBar settings={c.settings} />;
}