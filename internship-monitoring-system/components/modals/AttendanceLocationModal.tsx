"use client";

import Modal from "./Modal";
import type { AttendanceLog } from "@/lib/types";
import LeafletMap from "@/components/maps/LeafletMap";

type AttendanceLocationModalProps = {
  attendance: AttendanceLog;
  onClose: () => void;
};

export default function AttendanceLocationModal({
  attendance,
  onClose,
}: AttendanceLocationModalProps) {
  return (
    <Modal
      title="Time-In Location"
      onClose={onClose}
    >
      <div className="space-y-6 p-6">

        {attendance.gpsCoordinates ? (
          (() => {
            const match = attendance.gpsCoordinates.match(
              /POINT\s*\(([-\d.]+)\s+([-\d.]+)\)/
            );

            if (!match) {
              return (
                <div className="flex h-[350px] items-center justify-center rounded-lg border border-[#D1D5DB] bg-[#F9FAFB]">
                  <p>Invalid GPS coordinates</p>
                </div>
              );
            }

            const longitude = parseFloat(match[1]);
            const latitude = parseFloat(match[2]);

            return (
              <LeafletMap
                latitude={latitude}
                longitude={longitude}
              />
            );
          })()
        ) : (
          <div className="flex h-[350px] items-center justify-center rounded-lg border border-[#D1D5DB] bg-[#F9FAFB]">
            <p>No GPS location available.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">

          <div>
            <p className="text-xs font-semibold uppercase text-[#6B7280]">
              Student
            </p>

            <p className="mt-1 text-[#111827]">
              {attendance.studentName}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-[#6B7280]">
              HTE
            </p>

            <p className="mt-1 text-[#111827]">
              {attendance.hte}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-[#6B7280]">
              Time In
            </p>

            <p className="mt-1 text-[#111827]">
              {attendance.timeIn}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-[#6B7280]">
              Time-In Location
            </p>

            <p className="mt-1 text-[#111827]">
              {attendance.location ?? "Unknown"}
            </p>
          </div>

        </div>

      </div>
    </Modal>
  );
}