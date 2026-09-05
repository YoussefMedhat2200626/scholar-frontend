"use client";

import React, { useEffect, useState, useMemo } from "react";
import { X, Users, MapPin, Globe, Briefcase } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { CompanyMeta } from "@/src/data/companies";
import { JobData } from "./JobModal";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CompanyModalProps {
  company: CompanyMeta | null;
  isOpen: boolean;
  onClose: () => void;
  jobs: JobData[];
}

export default function CompanyModal({ company, isOpen, onClose, jobs }: CompanyModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const companyJobs = useMemo(() => {
    if (!company) return [];
    return jobs.filter(
      (j) => j.company && j.company.toLowerCase().includes(company.shortName.toLowerCase()) || 
             (j.company && j.company.toLowerCase().includes(company.name.split(" ")[0].toLowerCase()))
    );
  }, [jobs, company]);

  const chartData = useMemo(() => {
    // Group jobs by month-year
    const counts: Record<string, number> = {};
    companyJobs.forEach((job) => {
      if (job.first_seen_at) {
        const d = new Date(job.first_seen_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        counts[key] = (counts[key] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [companyJobs]);

  if (!isOpen && !isVisible) return null;
  if (!company) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
    >
      <div className="absolute inset-0 bg-[#0a0f18]/80 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#151c2c] border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-5 mb-8">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-sm shrink-0 ${company.color}`}>
              {company.shortName}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1 leading-tight">{company.name}</h2>
              <p className="text-neutral-400">{company.industry} • {company.size}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Graph Section */}
            <div>
              <h3 className="text-sm font-bold text-white mb-4">Hiring Timeline (Opened Positions)</h3>
              <div className="h-[200px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a3441" vertical={false} />
                      <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickMargin={10} />
                      <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(tick) => Math.floor(tick).toString()} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1a2336", borderColor: "#2a3441", borderRadius: "8px", color: "#fff" }}
                        itemStyle={{ color: "#70B5DF" }}
                      />
                      <Line type="monotone" dataKey="count" name="Jobs" stroke="#70B5DF" strokeWidth={2} dot={{ r: 4, fill: "#70B5DF", strokeWidth: 2, stroke: "#151c2c" }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center border border-white/5 rounded-xl">
                    <p className="text-neutral-500 text-sm">No timeline data available.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Latest Positions Section */}
            <div>
              <h3 className="text-sm font-bold text-white mb-4">Latest Positions</h3>
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {companyJobs.length > 0 ? (
                  companyJobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="bg-white/5 border border-white/5 rounded-xl p-3 hover:bg-white/10 transition-colors">
                      <a href={job.url} target="_blank" rel="noreferrer" className="flex justify-between items-start group">
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-[#70B5DF] transition-colors line-clamp-1">{job.title}</h4>
                          <p className="text-xs text-neutral-400 mt-1">
                            {job.first_seen_at ? new Date(job.first_seen_at).toISOString().split('T')[0] : "Recently"} • {job.job_type || "Full-time"}
                          </p>
                        </div>
                        <Briefcase className="w-4 h-4 text-neutral-500 group-hover:text-[#70B5DF] shrink-0 ml-2" />
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-neutral-500 text-sm italic">No active positions tracked recently.</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#1a2336] rounded-xl p-5 mb-8">
            <h3 className="text-sm font-bold text-white mb-2">About</h3>
            <p className="text-neutral-300 text-sm leading-relaxed">{company.description}</p>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-white mb-3">Global Presence</h3>
            <div className="flex flex-wrap gap-2">
              {company.globalPresence.map((loc, i) => (
                <div key={i} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-300 text-sm">
                  {loc}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {company.website && (
              <a href={company.website} target="_blank" rel="noreferrer" className="flex-1 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-colors">
                <Globe className="w-5 h-5" />
                Website
              </a>
            )}
            {company.linkedin && (
              <a href={company.linkedin} target="_blank" rel="noreferrer" className="flex-1 flex justify-center items-center gap-2 bg-[#0a66c2] hover:bg-[#004182] text-white py-3 rounded-xl font-bold transition-colors">
                <FaLinkedin className="w-5 h-5" />
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
