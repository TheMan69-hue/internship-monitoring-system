type ConfirmationModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmationModal({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "#DC2626",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {

  if (!open) return null;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

        <h2 className="text-center text-2xl font-semibold text-[#111827]">
          {title}
        </h2>

        <p className="mt-4 text-center text-[#6B7280]">
          {message}
        </p>

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onCancel}
            className="cursor-pointer rounded-lg border border-[#D1D5DB] bg-white px-5 py-2 text-[#374151] transition hover:bg-[#F3F4F6]"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            style={{
              backgroundColor: confirmColor,
            }}
            className="cursor-pointer rounded-lg px-5 py-2 text-white transition hover:opacity-90"
          >
            {confirmText}
          </button>

        </div>

      </div>

    </div>

  );

}