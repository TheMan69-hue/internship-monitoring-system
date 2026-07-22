"use client";

import Modal from "./Modal";
import LeafletMap from "@/components/maps/LeafletMap";

type AttendanceMapModalProps = {
  latitude: number;
  longitude: number;
  studentName: string;
  onClose: () => void;
};

export default function AttendanceMapModal({
  latitude,
  longitude,
  studentName,
  onClose,
}: AttendanceMapModalProps) {
  return (
    <Modal
      title={`${studentName} - Time-In Location`}
      onClose={onClose}
    >
      <div className="p-6">
        <LeafletMap
          latitude={latitude}
          longitude={longitude}
        />
      </div>
    </Modal>
  );
}