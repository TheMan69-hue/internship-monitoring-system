import { getHTEList } from "@/lib/services/coordinator/hte";
import HTEManagementClient from "./HTEManagementClient";

export default async function HTEManagementPage() {
  const htes = await getHTEList();

  return <HTEManagementClient initialHTes={htes} />;
}
