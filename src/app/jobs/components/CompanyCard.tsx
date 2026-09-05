"use client";

import React from "react";
import { Users, MapPin } from "lucide-react";
import { CompanyMeta } from "@/src/data/companies";

interface CompanyCardProps {
  company: CompanyMeta;
  onClick: () => void;
}

export default function CompanyCard({ company, onClick }: CompanyCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-[#151c2c]/80 backdrop-blur-sm border border-white/5 hover:border-[#70B5DF] hover:bg-[#1a2336] transition-all duration-300 cursor-pointer rounded-2xl p-6 flex flex-col hover:[box-shadow:0px_0px_15px_rgba(112,181,223,0.3)] h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-sm shrink-0 ${company.color}`}>
          {company.shortName}
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-neutral-300 text-[10px] font-bold tracking-wider uppercase text-right max-w-[150px] truncate">
            {company.industry}
          </div>
          <div className="flex items-center gap-1 text-neutral-400 text-xs">
            <Users className="w-3 h-3" />
            <span>{company.size}</span>
          </div>
        </div>
      </div>

      <h3 className="text-white font-bold text-[17px] leading-snug mb-2 line-clamp-1">
        {company.name}
      </h3>
      
      <p className="text-neutral-400 text-sm mb-6 line-clamp-2 min-h-[40px]">
        {company.description}
      </p>

      <div className="mt-auto space-y-4">
        <div className="flex items-center gap-1.5 text-neutral-400 text-sm">
          <MapPin className="w-4 h-4" />
          <span>HQ: {company.hq}</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {company.globalPresence.slice(0, 3).map((loc, i) => (
            <div key={i} className="inline-flex items-center px-2 py-1 rounded-md bg-white/5 border border-white/10 text-neutral-300 text-xs">
              {loc}
            </div>
          ))}
          {company.globalPresence.length > 3 && (
            <div className="inline-flex items-center px-2 py-1 rounded-md bg-white/5 border border-white/10 text-neutral-300 text-xs">
              +{company.globalPresence.length - 3}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
