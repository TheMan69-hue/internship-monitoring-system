import RejectedApplicationsClient from "./RejectedApplicationsClient";

import {
  getRejectedApplications,
} from "@/lib/services/coordinator/rejectedApplications";

export default async function RejectedApplicationsPage() {

  const students =
    await getRejectedApplications();

  return (
    <RejectedApplicationsClient
      students={students}
    />
  );

}