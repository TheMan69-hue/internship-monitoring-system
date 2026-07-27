import { getHTEs } from "@/lib/services/hte";
import HTEManagementClient from "./HTEManagementClient";

export default async function HTEManagementPage() {
  const htes = await getHTEs();

  return (
    <HTEManagementClient
      initialHTEs={htes}
    />
  );
}