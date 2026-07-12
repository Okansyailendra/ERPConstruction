import { Construction } from "lucide-react";

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-3">
      <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
        <Construction size={28} className="text-gray-400" />
      </div>
      <h2 className="text-base font-semibold text-gray-700">{title}</h2>
      <p className="text-sm text-gray-400">Halaman ini sedang dalam pengembangan</p>
    </div>
  );
}
