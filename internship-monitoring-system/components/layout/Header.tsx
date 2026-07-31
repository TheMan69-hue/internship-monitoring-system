import UserProfileModal from "./UserProfileModal";

export default function Header() {
  return (
    <header className="bg-[#D9D9D9] border-b h-20 flex items-center justify-between px-8">

      <div>
        <UserProfileModal
          role="coordinator"
          containerClassName="w-fit"
          buttonClassName="bg-[#D6D6D6] px-0 py-0 shadow-none hover:bg-[#D6D6D6]"
          buttonTextClassName="text-3xl font-bold text-[#000000]"
          buttonIconClassName="h-7 w-7 text-[#000000]"
        />

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