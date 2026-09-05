"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import JobModal from './components/JobModal';
import CompanyModal from './components/CompanyModal';
import CompaniesGrid from './components/CompaniesGrid';
import { CompanyMeta } from '@/src/data/companies';
import { Search, ChevronDown, User, Briefcase, Code, Globe, AlertCircle } from 'lucide-react';

const getCompanyColor = (companyName: string) => {
  const colors = [
    'bg-blue-600',
    'bg-cyan-600',
    'bg-red-600',
    'bg-emerald-600',
    'bg-purple-600',
    'bg-orange-600',
    'bg-pink-600',
    'bg-indigo-600'
  ];
  if (!companyName) return colors[0];
  let hash = 0;
  for (let i = 0; i < companyName.length; i++) {
    hash = companyName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

interface JobData {
  id: string | number;
  title: string;
  company?: string;
  tags_json?: string;
  location?: string;
  url?: string;
  job_type?: string;
  first_seen_at?: string;
}

function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  icon: Icon,
  searchable = false
}: {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  icon?: any;
  searchable?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
        inputRef.current.focus();
    }
    if (!isOpen) {
        setSearch('');
    }
  }, [isOpen, searchable]);

  const selectedOption = options.find(o => o.value === value);
  const filteredOptions = searchable 
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div className="relative flex-1 lg:max-w-[280px]" ref={ref}>
      {Icon && (
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
          <Icon className="h-4 w-4 text-neutral-400" />
        </div>
      )}
      <div 
        className={`w-full bg-[#111827]/50 border border-white/5 text-neutral-300 text-sm rounded-xl py-3.5 ${Icon ? 'pl-11' : 'pl-5'} pr-10 cursor-pointer flex items-center justify-between transition-all hover:bg-white/10 select-none`}
        onClick={() => { if (!isOpen) setIsOpen(true); }}
      >
        {searchable && isOpen ? (
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search..." 
            className="w-full bg-transparent border-none text-neutral-200 focus:outline-none focus:ring-0 p-0 m-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        )}
        <ChevronDown 
          className={`absolute right-4 h-4 w-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} 
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#1a2332]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="max-h-60 overflow-y-auto py-2">
            <div 
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors select-none ${value === '' ? 'bg-cyan-500/10 text-cyan-400' : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'}`}
              onClick={() => { onChange(''); setIsOpen(false); }}
            >
              {placeholder}
            </div>
            {filteredOptions.map((opt) => (
              <div 
                key={opt.value}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors select-none ${value === opt.value ? 'bg-cyan-500/10 text-cyan-400' : 'text-neutral-300 hover:bg-white/5 hover:text-neutral-100'}`}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
              >
                {opt.label}
              </div>
            ))}
            {filteredOptions.length === 0 && (
               <div className="px-4 py-2 text-sm text-neutral-500">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobsClient({ initialJobs, serverError }: { initialJobs: JobData[], serverError?: string }) {

  const normalizeCompany = (c: string) => {
      if (!c) return '';
      const lower = c.toLowerCase();
      if (lower.includes("siemens energy")) return "Siemens Energy";
      if (lower.includes("siemens gamesa")) return "Siemens Gamesa";
      if (lower.includes("siemens digital industries software") || lower.includes("siemens dis") || lower.includes("siemens eda")) return "Siemens Digital Industries Software";
      if (lower.includes("siemens")) return "Siemens";
      if (lower.includes("mixel")) return "Mixel-Egypt";
      if (lower.includes("capgemini")) return "Capgemini";
      if (lower.includes("stmicroelectronics")) return "STMicroelectronics";
      if (lower.includes("analog devices")) return "Analog Devices";
      if (lower.includes("infinilink")) return "InfiniLink";
      if (lower.includes("valeo")) return "Valeo";
      if (lower.includes("iss international spa")) return "ISS INTERNATIONAL SpA";
      return c;
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [activeTab, setActiveTab] = useState<'jobs' | 'companies'>('jobs');
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  const [selectedCompanyModal, setSelectedCompanyModal] = useState<CompanyMeta | null>(null);

  const filteredJobs = useMemo(() => {
    let result = (initialJobs || []);

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(job => 
        job.title?.toLowerCase().includes(lowerQuery) || 
        job.company?.toLowerCase().includes(lowerQuery) ||
        job.tags_json?.toLowerCase().includes(lowerQuery)
      );
    }

    if (selectedCompany) {
      result = result.filter(job => {
        return normalizeCompany(job.company || '').toLowerCase() === selectedCompany.toLowerCase();
      });
    }

    if (selectedDiscipline) {
      const lowerDiscipline = selectedDiscipline.toLowerCase();
      
      let searchTerms = [lowerDiscipline];
      if (lowerDiscipline === 'backend development') {
        searchTerms = ['backend', 'back-end', 'back end'];
      } else if (lowerDiscipline === 'frontend development') {
        searchTerms = ['frontend', 'front-end', 'front end'];
      } else if (lowerDiscipline === 'full stack development') {
        searchTerms = ['full stack', 'full-stack', 'fullstack'];
      } else if (lowerDiscipline === 'software engineering') {
        searchTerms = ['software', 'swe'];
      } else if (lowerDiscipline === 'hardware engineering') {
        searchTerms = ['hardware'];
      } else if (lowerDiscipline === 'systems engineering') {
        searchTerms = ['systems engineer', 'system engineer'];
      } else if (lowerDiscipline === 'quality assurance') {
        searchTerms = ['quality assurance', 'qa'];
      } else if (lowerDiscipline === 'embedded systems') {
        searchTerms = ['embedded'];
      } else if (lowerDiscipline === 'digital') {
        searchTerms = ['digital'];
      } else if (lowerDiscipline === 'computer engineering') {
        searchTerms = ['computer'];
      } else if (lowerDiscipline === 'electronics engineering') {
        searchTerms = ['electronic'];
      } else {
        const shortened = lowerDiscipline
          .replace(' development', '')
          .replace(' engineering', '')
          .replace(' systems', '');
        if (shortened !== lowerDiscipline) {
          searchTerms.push(shortened);
        }
      }
      
      result = result.filter(job => {
        const lowerTitle = job.title?.toLowerCase() || '';
        let tags: string[] = [];
        try {
          tags = typeof job.tags_json === 'string' ? JSON.parse(job.tags_json) : (job.tags_json || []);
        } catch {}
        const tagsJoined = tags.join(' ').toLowerCase();

        return searchTerms.some(term => lowerTitle.includes(term) || tagsJoined.includes(term));
      });
    }

    return result;
  }, [initialJobs, searchQuery, selectedCompany, selectedDiscipline]);

  const uniqueDisciplines = useMemo(() => {
    const dSet = new Set<string>([
      "AI",
      "Digital",
      "Testing",
      "Computer Engineering",
      "Electronics Engineering",
      "Software Engineering",
      "Embedded Systems",
      "Physical Design",
      "Frontend Development",
      "Backend Development",
      "Full Stack Development",
      "Quality Assurance",
      "DevOps",
      "Cloud",
      "Data Science",
      "Machine Learning",
      "Hardware Engineering",
      "Systems Engineering",
      "Civil Engineering",
      "Mechanical Engineering",
      "Electrical Engineering",
      "Architecture",
      "IT",
      "UI/UX Design",
      "Product Management",
      "Project Management",
      "Automation Machinery Manufacturing",
      "Engineering",
      "Software Development",
      "Appliance, Electrical, and Electronics Manufacturing",
      "Semiconductor Manufacturing",
      "Computer Hardware Manufacturing, Semiconductor Manufacturing, and Wireless Services",
      "Information Technology & Services",
      "Software Development and Engineering Services",
      "Computer Science & AI",
      "Motor Vehicle Parts Manufacturing",
      "Oil and gas",
      "Uncategorized"
    ]);

    (initialJobs || []).forEach(job => {
      let parsedTags: string[] = [];
      try {
        parsedTags = typeof job.tags_json === 'string' ? JSON.parse(job.tags_json) : (job.tags_json || []);
      } catch {}
      parsedTags.forEach(t => {
        const lower = t.toLowerCase();
        // Ignore generic tags to only keep disciplines/majors
        if (!lower.includes('senior') && !lower.includes('junior') && !lower.includes('mid') &&
            !lower.includes('remote') && !lower.includes('hybrid') && !lower.includes('on-site') &&
            !lower.includes('full-time') && !lower.includes('part-time') && !lower.includes('contract') &&
            !lower.includes('internship') && !lower.includes('temporary') && !lower.includes('volunteer')) {
          dSet.add(t);
        }
      });
    });

    const targetEngineering = [
        "engineering", "software", "embedded", "devops", "cloud", "machine learning", 
        "data", "frontend", "backend", "full stack", "quality", "physical design"
    ];

    // Priority Order: AI, Digital, Testing, Computer, Electronics
    const priorityOrder = ["ai", "digital", "testing", "computer engineering", "electronics engineering"];

    return Array.from(dSet).sort((a, b) => {
      const aName = a.toLowerCase();
      const bName = b.toLowerCase();

      // Check explicit priority
      const aPriorityIdx = priorityOrder.indexOf(aName);
      const bPriorityIdx = priorityOrder.indexOf(bName);

      if (aPriorityIdx !== -1 && bPriorityIdx !== -1) return aPriorityIdx - bPriorityIdx;
      if (aPriorityIdx !== -1) return -1;
      if (bPriorityIdx !== -1) return 1;

      // Then check engineering
      const aIsEng = aName.includes('engineer') || targetEngineering.some(t => aName.includes(t));
      const bIsEng = bName.includes('engineer') || targetEngineering.some(t => bName.includes(t));
      
      if (aIsEng && !bIsEng) return -1;
      if (!aIsEng && bIsEng) return 1;

      // Fallback to alphabetical
      return aName.localeCompare(bName);
    });
  }, [initialJobs]);

  const uniqueCompanies = useMemo(() => {
    const targetOrder = [
      "Siemens", "Capgemini", "Cisco", "Siemens Energy", "STMicroelectronics", 
      "MediaTek", "Brightskies", "HCLTech", "Nawy", "Analog Devices", 
      "InfiniLink", "Valeo", "Siemens Gamesa", "ISS INTERNATIONAL SpA", 
      "Siemens Digital Industries Software", "Mixel-Egypt"
    ];

    const comps = new Set<string>();
    (initialJobs || []).forEach(j => {
      if (j.company) {
        comps.add(normalizeCompany(j.company));
      }
    });

    return Array.from(comps).sort((a, b) => {
      const aIdx = targetOrder.indexOf(a);
      const bIdx = targetOrder.indexOf(b);

      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [initialJobs]);

  return (
    <div className="min-h-screen bg-[#09111e] font-main tracking-eyebrow pt-32 pb-24 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
      
      {/* Background Glows matching Figma */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-900/20 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
      </div>

      <div className="max-w-[1440px] mx-auto relative z-10">
        
        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 mb-8 overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('jobs')}
            className={`pb-4 px-6 font-bold text-lg whitespace-nowrap transition-all border-b-2 ${activeTab === 'jobs' ? 'border-[#70B5DF] text-[#70B5DF]' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
          >
            Career Map
          </button>
          <button 
            onClick={() => setActiveTab('companies')}
            className={`pb-4 px-6 font-bold text-lg whitespace-nowrap transition-all border-b-2 ${activeTab === 'companies' ? 'border-[#70B5DF] text-[#70B5DF]' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
          >
            Companies
          </button>
        </div>

        {activeTab === 'companies' ? (
          <CompaniesGrid onCompanyClick={setSelectedCompanyModal} />
        ) : (
          <>
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-8 tracking-wide uppercase">
              Global Career Map
            </h1>
            {/* Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-12 bg-[#1a2332]/80 backdrop-blur-md p-2 rounded-2xl border border-white/5 shadow-lg relative z-50">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
              <Search className="h-4 w-4 text-neutral-400" />
            </div>
            <input
              type="text"
              className="w-full bg-[#111827]/50 border border-white/5 text-neutral-200 text-sm rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-white/20 placeholder-neutral-500"
              placeholder="Search position, stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Disciplines Dropdown */}
          <CustomSelect
            value={selectedDiscipline}
            onChange={setSelectedDiscipline}
            placeholder="All Disciplines"
            options={uniqueDisciplines.map(d => ({ label: d, value: d }))}
            searchable
          />

          {/* Companies Dropdown */}
          <CustomSelect
            value={selectedCompany}
            onChange={setSelectedCompany}
            placeholder="All Companies"
            options={uniqueCompanies.map(c => ({ label: c, value: c }))}
            searchable
          />
          
        </div>

        {serverError && (
          <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center mb-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-400">Database Connection Error</h3>
            <p className="text-red-300 mt-2">{serverError}</p>
          </div>
        )}

        {/* Job Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative z-10">
          {filteredJobs.map((job: JobData) => {
            
            let parsedTags = [];
            try {
                parsedTags = typeof job.tags_json === 'string' ? JSON.parse(job.tags_json) : (job.tags_json || []);
            } catch {}
            
            // Extract some mockup tags for display matching Figma
            const seniority = parsedTags.find((t: string) => t.toLowerCase().includes('senior') || t.toLowerCase().includes('junior') || t.toLowerCase().includes('mid')) || 'Mid-Level';
            const discipline = parsedTags.filter((t: string) => !t.toLowerCase().includes('senior') && !t.toLowerCase().includes('junior') && !t.toLowerCase().includes('mid') && !t.toLowerCase().includes('remote') && !t.toLowerCase().includes('hybrid') && !t.toLowerCase().includes('on-site') && !t.toLowerCase().includes('full-time') && !t.toLowerCase().includes('part-time')).slice(0, 3).join(', ') || 'Engineering';
            const locationShort = (job.location?.includes('Egypt') || job.location?.includes('Cairo')) ? 'EG' : 'Remote';
            const dateFormatted = job.first_seen_at ? new Date(job.first_seen_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently';
            
            return (
              <div 
                key={job.id} 
                onClick={() => setSelectedJob(job)}
                className="bg-[#151c2c]/80 backdrop-blur-sm border border-white/5 hover:border-[#70B5DF] hover:[box-shadow:0px_0px_15px_rgba(112,181,223,0.3)] hover:bg-[#1a2336] transition-all duration-300 cursor-pointer rounded-2xl p-6 flex flex-col relative group"
              >
                {/* Top Row: Logo and EG Badge */}
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-sm ${getCompanyColor(job.company || '')}`}>
                    {job.company ? job.company.charAt(0).toUpperCase() : 'C'}
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <div className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-neutral-300 text-xs font-bold tracking-wider">
                      EG
                    </div>
                    <span className="text-[10px] text-neutral-500 font-bold">{dateFormatted}</span>
                  </div>
                </div>

                {/* Title and Company */}
                <h3 className="text-white font-bold text-[17px] leading-snug mb-1.5 line-clamp-2">
                  {job.title}
                </h3>
                <p className="text-neutral-400 text-sm mb-6">
                  {job.company || 'Unknown Company'}
                </p>

                {/* Bottom Section: Tags and Apply Button */}
                <div className="mt-auto flex items-end justify-between gap-4 pt-4">
                  <div className="flex flex-wrap gap-2">
                  
                  {/* Seniority */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <User className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold">{seniority}</span>
                  </div>
                  
                  {/* Job Type */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold">{job.job_type || 'Full-time'}</span>
                  </div>
                  
                  {/* Discipline / Tags */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 max-w-[200px]">
                    <Code className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-[11px] font-bold truncate">{discipline}</span>
                  </div>
                  
                  {/* Location Code */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-[11px] font-bold">{locationShort}</span>
                  </div>
                </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); window.open(job.url, '_blank'); }}
                    className="shrink-0 bg-[#70B5DF]/10 hover:bg-[#70B5DF]/20 hover:[box-shadow:0px_0px_10px_#70B5DF] border border-[#70B5DF]/50 text-[#70B5DF] px-5 py-2 rounded-xl font-bold text-sm transition-all duration-300"
                  >
                    Apply
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        </>
        )}
      </div>
      
      <JobModal 
        job={selectedJob} 
        isOpen={!!selectedJob} 
        onClose={() => setSelectedJob(null)} 
        getCompanyColor={getCompanyColor}
      />
      
      <CompanyModal
        company={selectedCompanyModal}
        isOpen={!!selectedCompanyModal}
        onClose={() => setSelectedCompanyModal(null)}
        jobs={initialJobs}
      />
    </div>
  );
}
