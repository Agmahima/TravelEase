// src/components/DestinationAutocomplete.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BOOKING_API_URL } from "@/lib/config";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const DestinationAutocomplete = ({ value, onChange, placeholder = "City, country or region", className }: Props) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          `${BOOKING_API_URL}/api/cities/search?query=${encodeURIComponent(query)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setSuggestions(data.data || []);
        setIsOpen(true);
      } catch (err) {
        console.error("City search error:", err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (city: any) => {
    setQuery(city.name);
    onChange(city.name);
    setIsOpen(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
      <Input
        placeholder={placeholder}
        className={`pl-10 ${className || ""}`}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
        }}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
      />
      {isLoading && (
        <Loader2 className="absolute right-3 top-3 h-4 w-4 text-gray-400 animate-spin" />
      )}

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((city, index) => (
            <button
              key={index}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 border-b last:border-0"
              onMouseDown={() => handleSelect(city)}
            >
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{city.name}</p>
                <p className="text-xs text-gray-500">{city.fullName}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DestinationAutocomplete;