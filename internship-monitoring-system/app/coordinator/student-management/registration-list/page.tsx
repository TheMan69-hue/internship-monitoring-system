import RegistrationListClient from "./RegistrationListClient";

import { getRegistrationList } from "@/lib/services/coordinator/registrations";


export default async function RegistrationListPage() {

  const registrations = await getRegistrationList();


  return (
    <RegistrationListClient
      registrations={registrations}
    />
  );
}