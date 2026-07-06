export default function Header() {
  return (
    <header className="bg-[#D9D9D9] border-b h-20 flex items-center justify-between px-8">

      <div>

        <h1 className="text-3xl font-bold text-[#000000]">
          Dashboard
        </h1>

        <p className="text-gray-500 text-[#000000]">
          Good Morning,
          Juan Dela Cruz
        </p>

      </div>

      <div>

        <p className="text-sm text-gray-500">
          Academic Year
        </p>

        <h2 className="font-semibold text-[#000000]">
          Midyear 2026
        </h2>

      </div>

    </header>
  );
}