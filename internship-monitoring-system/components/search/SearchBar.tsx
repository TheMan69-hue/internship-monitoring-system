import { Search } from "lucide-react";


type SearchBarProps = {
  placeholder?: string;
};


export default function SearchBar({
  placeholder="Search students, HTE...",
}:SearchBarProps){

return (

<div className="relative w-[240px]">

<Search
size={18}
className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]"
/>


<input

type="text"

placeholder={placeholder}

className="
w-full
rounded-[30px]
border
border-[#D1D5DB]
bg-white
py-1
pl-11
pr-4
text-[#374151]
placeholder:text-[#9CA3AF]
outline-none
transition-all
duration-200
focus:border-[#9CA3AF]
"

/>

</div>

);

}