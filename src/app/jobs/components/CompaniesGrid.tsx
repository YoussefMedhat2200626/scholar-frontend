"use client";

import React, { useState } from "react";
import CompanyCard from "./CompanyCard";
import { CompanyMeta, COMPANIES_META } from "@/src/data/companies";
import { Search } from "lucide-react";

interface CompaniesGridProps {
  onCompanyClick: (company: CompanyMeta) => void;
}

export default function CompaniesGrid({ onCompanyClick }: CompaniesGridProps) {
  const [search, setSearch] = useState("");

  const filteredCompanies = COMPANIES_META.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight uppercase">GLOBAL COMPANIES</h1>
        <p className="text-neutral-400 mt-2 text-lg">Directory Of VLSI, Embedded Systems, And Tech Companies.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <input 
            type="text"
            placeholder="Search name or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#151c2c] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#70B5DF] transition-colors placeholder:text-neutral-500"
          />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 relative z-10">
        {filteredCompanies.map(company => (
          <CompanyCard 
            key={company.id} 
            company={company} 
            onClick={() => onCompanyClick(company)} 
          />
        ))}
      </div>
      
      {filteredCompanies.length === 0 && (
        <div className="text-center py-20 bg-[#151c2c]/50 rounded-2xl border border-white/5">
          <p className="text-neutral-400 text-lg">No companies found matching your search.</p>
        </div>
      )}
    </div>
  );
}
