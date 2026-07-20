import RegistrationListClient from "./RegistrationListClient";

import { getRegistrationList } from "@/lib/services/coordinator/registrations";


export default async function RegistrationListPage() {

  const registrations = await getRegistrationList();


  console.log(
    "REGISTRATIONS:",
    registrations
  );


  return (
    <RegistrationListClient
      registrations={registrations}
    />
  );
}