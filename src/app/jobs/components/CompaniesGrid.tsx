"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import CompanyCard from "./CompanyCard";
import { CompanyMeta, COMPANIES_META } from "@/src/data/companies";
import { Search, ChevronDown, MapPin, Briefcase, Lock } from "lucide-react";

interface CompaniesGridProps {
  onCompanyClick: (company: CompanyMeta) => void;
}

function GridSelect({
  value,
  onChange,
  options,
  placeholder,
  icon: Icon,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  icon?: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="relative shrink-0 min-w-[150px] lg:min-w-[170px]" ref={ref}>
      <div
        className={`w-full bg-[#111827]/50 border border-white/5 text-neutral-300 text-sm rounded-xl py-3 ${
          Icon ? "pl-10" : "pl-4"
        } pr-9 cursor-pointer flex items-center justify-between transition-all hover:bg-white/10 select-none`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {Icon && (
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none z-10">
            <Icon className="h-4 w-4 text-neutral-400" />
          </div>
        )}
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          className={`absolute right-3.5 h-4 w-4 text-neutral-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#1a2332]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-60 overflow-y-auto custom-scrollbar py-1">
          <div
            className={`px-4 py-2.5 text-sm cursor-pointer transition-colors select-none ${
              value === "" ? "bg-cyan-500/10 text-cyan-400" : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
            }`}
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
          >
            {placeholder}
          </div>
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors select-none truncate ${
                value === opt.value
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-neutral-300 hover:bg-white/5 hover:text-neutral-100"
              }`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CompaniesGrid({ onCompanyClick }: CompaniesGridProps) {
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  const locationOptions = useMemo(() => {
    const locs = Array.from(new Set(COMPANIES_META.map((c) => c.hq))).sort();
    return locs.map((loc) => ({ label: loc, value: loc }));
  }, []);

  const categoryOptions = useMemo(() => {
    const cats = Array.from(new Set(COMPANIES_META.map((c) => c.industry))).sort();
    return cats.map((cat) => ({ label: cat, value: cat }));
  }, []);

  const sizeOptions = useMemo(() => {
    const sizes = Array.from(new Set(COMPANIES_META.map((c) => c.size))).sort();
    return sizes.map((size) => ({ label: size, value: size }));
  }, []);

  const filteredCompanies = useMemo(() => {
    return COMPANIES_META.filter((c) => {
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesSearch =
          c.name.toLowerCase().includes(query) ||
          c.industry.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.hq.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (selectedLocation && c.hq.toLowerCase() !== selectedLocation.toLowerCase()) {
        return false;
      }

      if (selectedCategory && c.industry.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      if (selectedSize && c.size !== selectedSize) {
        return false;
      }

      return true;
    });
  }, [search, selectedLocation, selectedCategory, selectedSize]);

  return (
    <div className="w-full">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight uppercase">
            GLOBAL COMPANIES
          </h1>
          <p className="text-neutral-400 mt-2 text-base sm:text-lg">
            Directory Of VLSI, Embedded Systems, And Tech Companies.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shrink-0 self-start sm:self-center">
          <Briefcase className="w-3.5 h-3.5" />
          <span>{filteredCompanies.length} Companies</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-3 mb-8 bg-[#1a2332]/80 backdrop-blur-md p-2 rounded-2xl border border-white/5 shadow-lg relative z-50">
        {/* Location Dropdown */}
        <GridSelect
          value={selectedLocation}
          onChange={setSelectedLocation}
          options={locationOptions}
          placeholder="Location"
          icon={MapPin}
        />

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search name or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111827]/50 border border-white/5 text-neutral-200 text-sm rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-white/20 placeholder-neutral-500 transition-colors"
          />
        </div>

        {/* Category Dropdown */}
        <GridSelect
          value={selectedCategory}
          onChange={setSelectedCategory}
          options={categoryOptions}
          placeholder="+ Add Category"
        />

        {/* Size Dropdown */}
        <GridSelect
          value={selectedSize}
          onChange={setSelectedSize}
          options={sizeOptions}
          placeholder="Any Size"
        />

        {/* Bookmark / Lock Action Button */}
        <button
          type="button"
          aria-label="Saved filters"
          className="p-3 bg-[#111827]/50 border border-white/5 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-white/10 transition-colors flex items-center justify-center shrink-0 self-stretch sm:self-auto"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>

      {/* 3 Columns on Desktop, 2 on Tablet, 1 on Mobile */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative z-10">
        {filteredCompanies.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            onClick={() => onCompanyClick(company)}
          />
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-20 bg-[#151c2c]/50 rounded-2xl border border-white/5">
          <p className="text-neutral-400 text-lg">No companies found matching your search or filters.</p>
        </div>
      )}
    </div>
  );
}

