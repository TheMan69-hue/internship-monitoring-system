type ActionModalProps = {
  open: boolean;
  type?: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
};

export default function ActionModal({
  open,
  type = "success",
  title,
  message,
  buttonText = "OK",
  onClose,
}: ActionModalProps) {

  if (!open) return null;

  const icon = {
    success: "✓",
    error: "✕",
    warning: "!",
    info: "i",
  }[type];

  const iconBackground = {
    success: "bg-green-100",
    error: "bg-red-100",
    warning: "bg-yellow-100",
    info: "bg-blue-100",
  }[type];

  const iconColor = {
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

        <div className="mb-4 flex justify-center">

          <div className={`flex h-16 w-16 items-center justify-center rounded-full ${iconBackground}`}>

            <span className={`text-3xl ${iconColor}`}>
              {icon}
            </span>

          </div>

        </div>

        <h2 className="text-center text-2xl font-semibold text-[#111827]">
          {title}
        </h2>

        <p className="mt-3 text-center text-[#6B7280]">
          {message}
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full cursor-pointer rounded-lg bg-[#2563EB] py-3 text-white transition hover:bg-[#1D4ED8]"
        >
          {buttonText}
        </button>

      </div>

    </div>
  );
}