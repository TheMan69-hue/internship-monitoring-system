import YearFilter from '@/components/table/YearFilter';

export default function dashboard() {
  return (
    <div>
        <main className=" flex flex-col">
            <h1>Dashboard</h1>
            <YearFilter/>
        </main>
    </div>
  );
}