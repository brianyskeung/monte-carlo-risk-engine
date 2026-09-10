import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  "aria-label": string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  className = "",
  ...rest
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={15}
        strokeWidth={2.5}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted/60"
      />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-black/10 bg-white/70 py-2 pr-3 pl-9 text-sm outline-none transition-colors placeholder:text-text-muted/60 focus:border-mint focus:ring-2 focus:ring-mint/20"
        {...rest}
      />
    </div>
  );
}
