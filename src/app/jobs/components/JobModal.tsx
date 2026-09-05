"use client";

import React, { useEffect, useState } from "react";
import { X, Briefcase, Globe, Code, User, Clock } from "lucide-react";

export interface JobData {
  id: string | number;
  title: string;
  company?: string;
  location?: string;
  url?: string;
  tags_json?: string;
  job_type?: string;
  first_seen_at?: string;
}

interface JobModalProps {
  job: JobData | null;
  isOpen: boolean;
  onClose: () => void;
  getCompanyColor: (companyName: string) => string;
}

export default function JobModal({ job, isOpen, onClose, getCompanyColor }: JobModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      setTimeout(() => setIsVisible(false), 300); // match transition duration
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;
  if (!job) return null;

  let parsedTags: string[] = [];
  try {
    parsedTags = typeof job.tags_json === "string" ? JSON.parse(job.tags_json) : job.tags_json || [];
  } catch {}

  const seniority = parsedTags.find((t) => t.toLowerCase().includes("senior") || t.toLowerCase().includes("junior") || t.toLowerCase().includes("mid") || t.toLowerCase().includes("lead")) || "Mid-Level";
  const disciplines = parsedTags.filter((t) => !t.toLowerCase().includes("senior") && !t.toLowerCase().includes("junior") && !t.toLowerCase().includes("mid") && !t.toLowerCase().includes("remote") && !t.toLowerCase().includes("hybrid") && !t.toLowerCase().includes("on-site") && !t.toLowerCase().includes("full-time") && !t.toLowerCase().includes("part-time"));
  const locationShort = (job.location?.includes("Egypt") || job.location?.includes("Cairo")) ? "EG" : (job.location || "Remote");

  let formattedDate = "Recently";
  if (job.first_seen_at) {
    const d = new Date(job.first_seen_at);
    formattedDate = d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0a0f18]/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-2xl bg-[#151c2c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        <div className="p-6 sm:p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-5 mb-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-sm shrink-0 ${getCompanyColor(job.company || "")}`}>
              {job.company ? job.company.charAt(0).toUpperCase() : "C"}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 leading-tight">{job.title}</h2>
              <p className="text-lg text-neutral-300 mb-2">{job.company || "Unknown Company"}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400 mt-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Posted {formattedDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Job Details</h3>
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <User className="w-4 h-4" />
                <span className="text-sm font-bold">{seniority}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Briefcase className="w-4 h-4" />
                <span className="text-sm font-bold">{job.job_type || "Full-time"}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Globe className="w-4 h-4" />
                <span className="text-sm font-bold">{locationShort}</span>
              </div>
            </div>

            {disciplines.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">Technologies / Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {disciplines.map((d, i) => (
                    <div key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                      <Code className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-bold">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-auto">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { if (job.url) window.open(job.url, "_blank") }}
              className="bg-[#70B5DF] hover:bg-[#5da0c9] text-[#0a0f18] px-8 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-[0_0_15px_rgba(112,181,223,0.3)] hover:shadow-[0_0_20px_rgba(112,181,223,0.5)]"
            >
              Apply on LinkedIn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
