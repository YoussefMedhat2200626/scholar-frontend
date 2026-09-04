"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`absolute right-4 h-4 w-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#1a2332]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-white/10">
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Search..." 
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-cyan-500/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');

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
      result = result.filter(job => job.company?.toLowerCase() === selectedCompany.toLowerCase());
    }

    if (selectedDiscipline) {
      const lowerDiscipline = selectedDiscipline.toLowerCase();
      result = result.filter(job => {
        const inTitle = job.title?.toLowerCase().includes(lowerDiscipline);
        
        let tags: string[] = [];
        try {
          tags = typeof job.tags_json === 'string' ? JSON.parse(job.tags_json) : (job.tags_json || []);
        } catch {}
        const inTags = tags.some(t => t.toLowerCase().includes(lowerDiscipline));
        
        return inTitle || inTags;
      });
    }

    return result;
  }, [initialJobs, searchQuery, selectedCompany, selectedDiscipline]);

  const uniqueDisciplines = useMemo(() => {
    const dSet = new Set<string>([
      "Software Engineering",
      "Digital Design",
      "Digital Verification",
      "Embedded Systems",
      "Physical Design",
      "Frontend Development",
      "Backend Development",
      "Full Stack Development",
      "Quality Assurance",
      "Testing",
      "DevOps",
      "Cloud",
      "Data Science",
      "Machine Learning",
      "AI",
      "Hardware Engineering",
      "Systems Engineering",
      "Civil Engineering",
      "Mechanical Engineering",
      "Electrical Engineering",
      "Architecture",
      "IT",
      "UI/UX Design",
      "Product Management",
      "Project Management"
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
        "engineering", "software", "digital design", "digital verification", 
        "embedded", "testing", "devops", "cloud", "ai", "machine learning", 
        "data", "frontend", "backend", "full stack", "quality", "physical design"
    ];

    return Array.from(dSet).sort((a, b) => {
      const aName = a.toLowerCase();
      const bName = b.toLowerCase();
      const aIsEng = aName.includes('engineer') || targetEngineering.some(t => aName.includes(t));
      const bIsEng = bName.includes('engineer') || targetEngineering.some(t => bName.includes(t));
      
      if (aIsEng && !bIsEng) return -1;
      if (!aIsEng && bIsEng) return 1;
      return aName.localeCompare(bName);
    });
  }, [initialJobs]);

  const uniqueCompanies = useMemo(() => {
    const comps = new Set((initialJobs || []).map(j => j.company).filter(Boolean));
    const targetCompanies = [
      "siemens", "capgemini", "cisco", "siemens energy", "stmicroelectronics", 
      "mediatek", "brightskies", "hcltech", "nawy", "analog devices", 
      "infinilink", "valeo", "siemens gamesa", "iss international spa", 
      "siemens digital industries software", "mixel-egypt", "si vision", "global foundaries", "si bits"
    ];

    return Array.from(comps).sort((a, b) => {
      const aName = (a as string).toLowerCase();
      const bName = (b as string).toLowerCase();
      const aIsTarget = targetCompanies.some(tc => aName.includes(tc));
      const bIsTarget = targetCompanies.some(tc => bName.includes(tc));
      
      if (aIsTarget && !bIsTarget) return -1;
      if (!aIsTarget && bIsTarget) return 1;
      return aName.localeCompare(bName);
    }) as string[];
  }, [initialJobs]);

  return (
    <div className="min-h-screen bg-[#09111e] font-main tracking-eyebrow pt-32 pb-24 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
      
      {/* Background Glows matching Figma */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-900/20 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
      </div>

      <div className="max-w-[1440px] mx-auto relative z-10">
        
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
            
            return (
              <div 
                key={job.id} 
                onClick={() => window.open(job.url, '_blank')}
                className="bg-[#151c2c]/80 backdrop-blur-sm border border-white/5 hover:border-white/10 hover:bg-[#1a2336] transition-all cursor-pointer rounded-2xl p-6 flex flex-col relative group"
              >
                {/* Top Row: Logo and EG Badge */}
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-sm ${getCompanyColor(job.company || '')}`}>
                    {job.company ? job.company.charAt(0).toUpperCase() : 'C'}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-neutral-300 text-xs font-bold tracking-wider">
                      EG
                    </div>
                  </div>
                </div>

                {/* Title and Company */}
                <h3 className="text-white font-bold text-[17px] leading-snug mb-1.5 line-clamp-2">
                  {job.title}
                </h3>
                <p className="text-neutral-400 text-sm mb-6">
                  {job.company || 'Unknown Company'}
                </p>

                {/* Tags (Bottom) */}
                <div className="mt-auto flex flex-wrap gap-2">
                  
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
              </div>
            );
          })}
        </div>
        
      </div>
    </div>
  );
}
