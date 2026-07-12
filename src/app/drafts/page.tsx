import { listDrafts } from "@/lib/drafts";
import DraftsClient from "./DraftsClient";

export const dynamic = "force-dynamic";

export default async function DraftsPage() {
  const drafts = await listDrafts();
  return <DraftsClient initialDrafts={drafts} />;
}
