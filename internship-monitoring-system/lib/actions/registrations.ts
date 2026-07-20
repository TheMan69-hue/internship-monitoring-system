"use server";

import { revalidatePath } from "next/cache";
import { approveRegistration } from "@/lib/services/registration/approveRegistration";
import { rejectRegistration } from "@/lib/services/registration/rejectRegistration";
import { restoreRegistration } from "@/lib/services/registration/restoreRegistration";
import { deleteRejectedRegistration } from "@/lib/services/registration/deleteRejectedRegistration";

export async function approveRegistrationAction(
  registrationId: string
) {
  try {
    await approveRegistration(registrationId);

    revalidatePath(
      "/admin/student-management/registration-list"
    );

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong.",
    };
  }
}

export async function approveRegistrationsAction(
  registrationIds: string[]
) {
  try {

    for (const id of registrationIds) {
      await approveRegistration(id);
    }

    revalidatePath(
      "/admin/student-management/registration-list"
    );

    return {
      success: true,
    };

  } catch (error) {

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong.",
    };

  }
}

export async function rejectRegistrationAction(
  registrationId: string,
  rejectionReason: string
) {
  try {
    const result = await rejectRegistration(
      registrationId,
      rejectionReason
    );

    return result;
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to reject registration.",
    };
  }
}

export async function rejectRegistrationsAction(
  registrationIds: string[],
  rejectionReason: string
) {
  try {

    for (const id of registrationIds) {
      await rejectRegistration(
        id,
        rejectionReason
      );
    }

    return {
      success: true,
      message:
        "Registrations rejected successfully.",
    };

  } catch (error) {

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to reject registrations.",
    };

  }
}

export async function restoreRegistrationAction(
  registrationId: string
) {
  try {

    await restoreRegistration(
      registrationId
    );

    revalidatePath(
      "/coordinator/student-management/rejected-applications"
    );

    revalidatePath(
      "/coordinator/student-management/registration-list"
    );

    return {
      success: true,
    };

  } catch (error) {

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to restore registration.",
    };

  }
}

export async function deleteRejectedRegistrationAction(
  registrationId: string
) {
  try {

    await deleteRejectedRegistration(
      registrationId
    );

    revalidatePath(
      "/coordinator/student-management/rejected-applications"
    );

    return {
      success: true,
    };

  } catch (error) {

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete registration.",
    };

  }
}