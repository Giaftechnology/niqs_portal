import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiFetch, getToken, API_BASE } from '../../../utils/api';

// A simple 8-step wizard for creating a Probationer application
const ProbationerNew: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [appId, setAppId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
 
  const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
  const MAX_CERT_BYTES = 10 * 1024 * 1024;
  const IMAGE_TYPES = ['image/jpeg','image/png','image/webp'];
  const CERT_TYPES = ['application/pdf','image/jpeg','image/png','image/webp'];
  const TITLES = ['Mr','Mrs','Miss','Ms','Dr','Prof','Engr','Arch','Rev','Sir','Lady'];
  const COUNTRIES = [
    'Nigeria','Ghana','Kenya','South Africa','United Kingdom','United States','Canada','India','China','Germany','France','Spain','Italy','Ireland','Netherlands','Egypt','Ethiopia','Tanzania','Uganda','Rwanda','Cameroon','Benin','Togo','Niger','Cote d\'Ivoire','Liberia','Sierra Leone','Senegal','Morocco','Algeria','Tunisia','Zimbabwe','Zambia','Botswana','Namibia','Malawi'
  ];
  const EXAM_TYPE_OPTIONS = [
    { value: 'waec', label: 'WAEC' },
    { value: 'neco', label: 'NECO' },
    { value: 'nabteb', label: 'NABTEB' },
    { value: 'gce', label: 'GCE' },
  ];
  const RELATIONSHIPS = ['Employer','Supervisor','Lecturer','Mentor','Colleague','Other'];
  const YEARS = useMemo(() => {
    const now = new Date().getFullYear();
    const out: string[] = [];
    for (let y = now; y >= 1950; y--) out.push(String(y));
    return out;
  }, []);
  const STEP_TITLES: Record<number, string> = {
    1: 'Personal Information',
    2: 'Educational Qualifications',
    3: 'O-Level Results',
    4: 'Professional Memberships',
    5: 'Employment / Work Experience',
    6: 'Seminars / Workshops',
    7: 'Referees',
    8: 'Review & Submit',
  };
  const toAbsoluteUrl = (p?: string | null): string => {
    const v = String(p || '').trim();
    if (!v) return '';
    if (v.startsWith('http://') || v.startsWith('https://')) return v;
    const base = API_BASE || '';
    if (!base) return v;
    if (v.startsWith('/')) return `${base}${v}`;
    return `${base}/${v}`;
  };
 
  const normalizeError = (e: any): string => {
    try {
      if (typeof e === 'string') return e;
      if (e?.message) return e.message as string;
    } catch {}
    return 'Request failed';
  };
  const validateEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
  const normalizeExamType = (v: string) => {
    const t = String(v || '').trim().toLowerCase();
    if (['waec','wassce','ssce'].includes(t)) return 'waec';
    if (['neco'].includes(t)) return 'neco';
    if (['nabteb'].includes(t)) return 'nabteb';
    if (['gce','waec gce','g.c.e'].includes(t)) return 'gce';
    return '';
  };
  const isDev = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)/.test(window.location.hostname);
  const getJSONViaXHR = (url: string) => new Promise<any>((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      const t = getToken();
      if (t) xhr.setRequestHeader('Authorization', `Bearer ${t}`);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          let data: any = xhr.responseText || '';
          try { data = data ? JSON.parse(data) : null; } catch {}
          resolve(data);
        }
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send();
    } catch (e) { reject(e as any); }
  });
 
  // Step 1 state (multipart)
  const [s1, setS1] = useState({
    surname: '', other_names: '', title: '', postal_address: '', residential_address: '',
    email: '', phone: '', date_of_birth: '', nationality: '',
    pro_pic: null as File | null,
    signature: null as File | null,
    pro_pic_name: '' as string,
    signature_name: '' as string,
    pro_pic_preview: '' as string,
    signature_preview: '' as string,
  });

  // Step 2 state (multipart qualifications + files)
  const [s2, setS2] = useState<Array<{ institution: string; qualification: string; year: string; certFile: File | null; certPreview?: string; certName?: string }>>([
    { institution: '', qualification: '', year: '', certFile: null }
  ]);

  // Step 3 results JSON
  const [s3, setS3] = useState<Array<{ exam_type: string; exam_year: string; exam_number: string; subjectsCSV: string }>>([
    { exam_type: '', exam_year: '', exam_number: '', subjectsCSV: '' }
  ]);

  // Step 4 memberships JSON
  const [s4, setS4] = useState<Array<{ body_name: string; stage_passed: string; certificate_path: string }>>([
    { body_name: '', stage_passed: '', certificate_path: '' }
  ]);

  // Step 5 experiences JSON
  const [s5, setS5] = useState<Array<{ organization: string; position: string; start_date: string; end_date: string | null; responsibilities: string }>>([
    { organization: '', position: '', start_date: '', end_date: '', responsibilities: '' }
  ]);

  // Step 6 seminars JSON
  const [s6, setS6] = useState<Array<{ title: string; date: string; location: string }>>([
    { title: '', date: '', location: '' }
  ]);

  // Step 7 referees JSON
  const [s7, setS7] = useState<Array<{ user_id: string; relationship: string }>>([
    { user_id: '', relationship: '' }
  ]);
  const [refSearch, setRefSearch] = useState<Array<{ q: string; loading: boolean; results: any[]; error: string | null; selected?: any }>>([]);

  // Ensure at least one seminar & referee row always exist
  useEffect(() => {
    setS6(prev => (prev && prev.length ? prev : [{ title: '', date: '', location: '' }]));
  }, []);
  useEffect(() => {
    setS7(prev => (prev && prev.length ? prev : [{ user_id: '', relationship: '' }]));
  }, []);
  // Keep refSearch array in sync with s7 length so first referee row always has search state
  useEffect(() => {
    setRefSearch(prev => {
      const next = [...prev];
      while (next.length < s7.length) {
        next.push({ q: '', loading: false, results: [], error: null, selected: undefined });
      }
      if (next.length > s7.length) next.length = s7.length;
      return next;
    });
  }, [s7.length]);

  const canGoNext = useMemo(() => !busy, [busy]);
  const resumeId = useMemo(() => {
    try { return new URLSearchParams(location.search).get('id'); } catch { return null; }
  }, [location.search]);
  const gotoStep = useMemo(() => {
    try {
      const raw = new URLSearchParams(location.search).get('goto');
      const n = raw ? parseInt(raw, 10) : NaN;
      if (!isNaN(n)) return Math.max(1, Math.min(8, n));
    } catch {}
    return null as number | null;
  }, [location.search]);
  const storageKey = useMemo(() => appId ? `probationer_wizard_${appId}` : 'probationer_wizard_draft', [appId]);
  const saveDraft = () => {
    try {
      const payload = { step, appId, s1: { ...s1, pro_pic: undefined, signature: undefined }, s2: s2.map(q => ({ ...q, certFile: undefined })), s3, s4, s5, s6, s7, ts: Date.now() };
      localStorage.setItem(storageKey, JSON.stringify(payload));
      localStorage.setItem('probationer_wizard_last', storageKey);
    } catch {}
  };
  useEffect(() => { saveDraft(); }, [s1, s2, s3, s4, s5, s6, s7, step, appId]);
  const loadDraftByKey = (key: string) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (data?.s1) setS1((prev: any) => ({ ...prev, ...data.s1, pro_pic: null, signature: null }));
      if (Array.isArray(data?.s2)) setS2(data.s2.map((q: any) => ({ ...q, certFile: null })));
      if (Array.isArray(data?.s3)) setS3(data.s3);
      if (Array.isArray(data?.s4)) setS4(data.s4);
      if (Array.isArray(data?.s5)) setS5(data.s5);
      if (Array.isArray(data?.s6)) setS6(data.s6.length ? data.s6 : [{ title: '', date: '', location: '' }]);
      if (Array.isArray(data?.s7)) setS7(data.s7.length ? data.s7 : [{ user_id: '', relationship: '' }]);
      if (data?.step) setStep(Number(data.step) || 1);
      if (data?.appId) setAppId(String(data.appId));
      return true;
    } catch { return false; }
  };
  useEffect(() => {
    if (resumeId) {
      const ok = loadDraftByKey(`probationer_wizard_${resumeId}`);
      if (!ok) {
        setAppId(resumeId);
        if (gotoStep) setStep(gotoStep);
      }
      return;
    }
    const last = localStorage.getItem('probationer_wizard_last');
    if (last) loadDraftByKey(last);
    else loadDraftByKey('probationer_wizard_draft');
  }, [resumeId, gotoStep]);
  // Prefill from server by id
  useEffect(() => {
    const id = resumeId || appId;
    if (!id) return;
    let cancelled = false;
    const prefill = async () => {
      try {
        setBusy(true);
        const endpoints = [
          `/api/probationer/${id}`,
          `/api/probationer/applications/${id}`,
        ];
        let data: any = null;
        for (const url of endpoints) {
          try {
            let resObj: any = null;
            if (isDev) {
              // XHR to relative /api first (through CRA proxy)
              resObj = await getJSONViaXHR(url);
              let obj = (resObj && (resObj.data?.data || resObj.data || resObj)) || null;
              if (!(obj && typeof obj === 'object')) {
                // try absolute API_BASE fallback
                const abs = url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`;
                resObj = await getJSONViaXHR(abs);
              }
            } else {
              // production: use apiFetch, fallback to XHR absolute
              try {
                resObj = await apiFetch<any>(url);
              } catch (e) {
                const abs = url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`;
                resObj = await getJSONViaXHR(abs);
              }
            }
            const obj = (resObj && (resObj.data?.data || resObj.data || resObj)) || null;
            if (obj && typeof obj === 'object') { data = obj; break; }
          } catch {}
        }
        if (!data || cancelled) return;
        // Step 1 fields
        setS1(prev => {
          if (cancelled) return prev;
          const n = { ...prev } as any;
          const setIfEmpty = (k: string, v: any) => { if (!String(n[k] || '').trim() && v !== undefined && v !== null) n[k] = String(v); };
          setIfEmpty('surname', data.surname);
          setIfEmpty('other_names', data.other_names);
          setIfEmpty('title', data.title);
          setIfEmpty('postal_address', data.postal_address);
          setIfEmpty('residential_address', data.residential_address);
          setIfEmpty('email', data.email);
          setIfEmpty('phone', data.phone);
          setIfEmpty('date_of_birth', data.date_of_birth);
          setIfEmpty('nationality', data.nationality);
          if (!n.pro_pic && !n.pro_pic_preview && data.passport_photo) {
            const url = toAbsoluteUrl(String(data.passport_photo));
            n.pro_pic_preview = url;
            n.pro_pic_name = (String(data.passport_photo).split('/').pop()) || 'photo';
          }
          if (!n.signature && !n.signature_preview && data.signature) {
            const url = toAbsoluteUrl(String(data.signature));
            n.signature_preview = url;
            n.signature_name = (String(data.signature).split('/').pop()) || 'signature';
          }
          return n;
        });
        // Step 2: qualifications from main object or dedicated endpoint
        const hasQualsOnMain = Array.isArray(data.qualifications) && data.qualifications.length > 0;
        if (hasQualsOnMain) {
          const nq = data.qualifications.map((q: any) => ({
            institution: String(q?.institution || ''),
            qualification: String(q?.qualification || ''),
            year: String(q?.year || ''),
            certFile: null,
            certName: q?.certificate_path ? String(q.certificate_path).split('/').pop() : undefined,
            certPreview: typeof q?.certificate_path === 'string' ? toAbsoluteUrl(q.certificate_path) : undefined,
          }));
          setS2(prev => {
            if (cancelled) return prev;
            const isEmpty = prev.length === 1 && !prev[0].institution && !prev[0].qualification && !prev[0].year && !prev[0].certFile;
            return isEmpty ? nq : prev;
          });
        } else {
          try {
            const qRes = await apiFetch<any>(`/api/probationer/${id}/step2/qualifications`);
            const qRaw = Array.isArray(qRes) ? qRes : Array.isArray(qRes?.data) ? qRes.data : Array.isArray(qRes?.data?.data) ? qRes.data.data : [];
            if (Array.isArray(qRaw) && qRaw.length && !cancelled) {
              const nq = qRaw.map((q: any) => ({
                institution: String(q?.institution || ''),
                qualification: String(q?.qualification || ''),
                year: String(q?.year || ''),
                certFile: null,
                certName: q?.certificate_path ? String(q.certificate_path).split('/').pop() : undefined,
                certPreview: typeof q?.certificate_path === 'string' ? toAbsoluteUrl(q.certificate_path) : undefined,
              }));
              setS2(prev => {
                if (cancelled) return prev;
                const isEmpty = prev.length === 1 && !prev[0].institution && !prev[0].qualification && !prev[0].year && !prev[0].certFile;
                return isEmpty ? nq : prev;
              });
            }
          } catch {}
        }
        // Step 3: o-level results from main object or dedicated endpoint
        const hasResultsOnMain = Array.isArray(data.o_level_results) && data.o_level_results.length > 0;
        if (hasResultsOnMain) {
          const nr = data.o_level_results.map((r: any) => {
            const subs = Array.isArray(r?.subjects) ? r.subjects.map((s: any) => (typeof s === 'string' ? s : (s?.name || s?.subject || ''))).filter(Boolean) : [];
            return {
              exam_type: normalizeExamType(String(r?.exam_type || '')),
              exam_year: String(r?.exam_year || ''),
              exam_number: String(r?.exam_number || ''),
              subjectsCSV: subs.join(', '),
            };
          });
          setS3(prev => {
            if (cancelled) return prev;
            const isEmpty = prev.length === 1 && !prev[0].exam_type && !prev[0].exam_year && !prev[0].exam_number && !prev[0].subjectsCSV;
            return isEmpty ? nr : prev;
          });
        } else {
          try {
            const rRes = await apiFetch<any>(`/api/probationer/${id}/step3/olevel-results`);
            const rRaw = Array.isArray(rRes) ? rRes : Array.isArray(rRes?.data) ? rRes.data : Array.isArray(rRes?.data?.data) ? rRes.data.data : [];
            if (Array.isArray(rRaw) && rRaw.length && !cancelled) {
              const nr = rRaw.map((r: any) => {
                const subs = Array.isArray(r?.subjects) ? r.subjects.map((s: any) => (typeof s === 'string' ? s : (s?.name || s?.subject || ''))).filter(Boolean) : [];
                return {
                  exam_type: normalizeExamType(String(r?.exam_type || '')),
                  exam_year: String(r?.exam_year || ''),
                  exam_number: String(r?.exam_number || ''),
                  subjectsCSV: subs.join(', '),
                };
              });
              setS3(prev => {
                if (cancelled) return prev;
                const isEmpty = prev.length === 1 && !prev[0].exam_type && !prev[0].exam_year && !prev[0].exam_number && !prev[0].subjectsCSV;
                return isEmpty ? nr : prev;
              });
            }
          } catch {}
        }
        // Step 4: memberships (if present)
        if (Array.isArray((data as any).memberships)) {
          const ms = (data as any).memberships.map((m: any) => ({
            body_name: String(m?.body_name || m?.name || ''),
            stage_passed: String(m?.stage_passed || m?.stage || ''),
            certificate_path: String(m?.certificate_path || ''),
          }));
          setS4(prev => {
            if (cancelled) return prev;
            const isEmpty = prev.length === 1 && !prev[0].body_name && !prev[0].stage_passed && !prev[0].certificate_path;
            return isEmpty ? ms : prev;
          });
        }
        // Step 5: experiences (if present)
        if (Array.isArray((data as any).experiences)) {
          const exps = (data as any).experiences.map((e: any) => ({
            organization: String(e?.organization || e?.company || ''),
            position: String(e?.position || e?.role || ''),
            start_date: String(e?.start_date || ''),
            end_date: e?.end_date ? String(e.end_date) : '',
            responsibilities: String(e?.responsibilities || ''),
          }));
          setS5(prev => {
            if (cancelled) return prev;
            const isEmpty = prev.length === 1 && !prev[0].organization && !prev[0].position && !prev[0].start_date && !prev[0].end_date && !prev[0].responsibilities;
            return isEmpty ? exps : prev;
          });
        }
        // Step 6: seminars
        if (Array.isArray(data.seminars)) {
          const sems = data.seminars.map((s: any) => ({
            title: String(s?.title || ''),
            date: String(s?.date || ''),
            location: String(s?.location || ''),
          }));
          setS6(prev => {
            if (cancelled) return prev;
            const isEmpty = prev.length === 1 && !prev[0].title && !prev[0].date && !prev[0].location;
            const next = isEmpty ? sems : prev;
            return next.length ? next : [{ title: '', date: '', location: '' }];
          });
        }
        // Step 7: referees
        if (Array.isArray(data.referees)) {
          const refs = data.referees.map((r: any) => ({
            user_id: String(r?.user_id || ''),
            relationship: String(r?.relationship || ''),
          }));
          setS7(prev => {
            if (cancelled) return prev;
            const isEmpty = prev.length === 1 && !prev[0].user_id && !prev[0].relationship;
            const next = isEmpty ? refs : prev;
            return next.length ? next : [{ user_id: '', relationship: '' }];
          });
        }
        // Step jump
        if (gotoStep && gotoStep >= 1 && gotoStep <= 8) {
          setStep(gotoStep);
        } else if (typeof data.completion_step === 'number' && data.completion_step >= 1 && data.completion_step < 8) {
          setStep(data.completion_step + 1);
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    };
    prefill();
    return () => { cancelled = true; };
  }, [resumeId, appId, gotoStep]);
  useEffect(() => {
    if (!appId) return;
    try {
      const draft = localStorage.getItem('probationer_wizard_draft');
      if (draft) {
        localStorage.setItem(`probationer_wizard_${appId}`, draft);
        localStorage.removeItem('probationer_wizard_draft');
        localStorage.setItem('probationer_wizard_last', `probationer_wizard_${appId}`);
      }
    } catch {}
  }, [appId]);
  const validateStep1 = (): string[] => {
    const errs: string[] = [];
    if (!s1.surname.trim()) errs.push('Surname is required');
    if (!s1.other_names.trim()) errs.push('Other names are required');
    if (!s1.email.trim() || !validateEmail(s1.email)) errs.push('Valid email is required');
    if (s1.pro_pic) {
      if (!IMAGE_TYPES.includes(s1.pro_pic.type)) errs.push('Passport photo must be JPG, PNG, or WebP');
      if (s1.pro_pic.size > MAX_IMAGE_BYTES) errs.push('Passport photo must be 5MB or less');
    }
    if (s1.signature) {
      if (!IMAGE_TYPES.includes(s1.signature.type)) errs.push('Signature must be JPG, PNG, or WebP');
      if (s1.signature.size > MAX_IMAGE_BYTES) errs.push('Signature must be 5MB or less');
    }
    return errs;
  };
  const validateStep2 = (): string[] => {
    const errs: string[] = [];
    if (!s2.length) errs.push('At least one qualification is required');
    s2.forEach((q, i) => {
      if (!q.institution.trim() || !q.qualification.trim() || !q.year.trim()) errs.push(`Qualification #${i+1} is incomplete`);
      if (q.certFile) {
        const t = q.certFile.type;
        if (!(CERT_TYPES.includes(t) || IMAGE_TYPES.includes(t))) errs.push(`Qualification #${i+1} certificate must be PDF or image`);
        if (q.certFile.size > MAX_CERT_BYTES) errs.push(`Qualification #${i+1} certificate must be 10MB or less`);
      }
    });
    return errs;
  };
  const updateRefSearch = (idx: number, patch: Partial<{ q: string; loading: boolean; results: any[]; error: string | null; selected?: any }>) => {
    setRefSearch(prev => {
      const next = [...prev];
      const base = next[idx] || { q: '', loading: false, results: [], error: null as string | null, selected: undefined };
      next[idx] = { ...base, ...patch };
      return next;
    });
  };
  const searchMembers = async (idx: number, raw: string) => {
    const term = String(raw || '').trim();
    if (!term) { updateRefSearch(idx, { results: [], error: null }); return; }
    // we expect membership numbers like M-8291, but allow typing digits only
    const suffix = term.toUpperCase().startsWith('M-') ? term.toUpperCase().slice(2) : term.replace(/^M-/i, '');
    if (suffix.length < 3) return; // avoid spamming API
    const path = `/api/members/search/M-${encodeURIComponent(suffix)}`;
    updateRefSearch(idx, { loading: true, error: null });
    try {
      const res = await apiFetch<any>(path);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      updateRefSearch(idx, { results: list.slice(0, 10), loading: false, error: null });
    } catch (e: any) {
      updateRefSearch(idx, { loading: false, error: normalizeError(e), results: [] });
    }
  };
  const validateStep3 = (): string[] => {
    const errs: string[] = [];
    if (!s3.length) errs.push('At least one exam result is required');
    s3.forEach((r, i) => {
      if (!r.exam_type.trim() || !r.exam_year.trim() || !r.exam_number.trim()) errs.push(`Result #${i+1} is incomplete`);
      if (r.exam_year && !/^[0-9]{4}$/.test(r.exam_year)) errs.push(`Result #${i+1} year must be 4 digits`);
      const subs = r.subjectsCSV.split(',').map(s => s.trim()).filter(Boolean);
      if (subs.length === 0) errs.push(`Result #${i+1} subjects are required`);
    });
    return errs;
  };
  const validateStep5 = (): string[] => {
    const errs: string[] = [];
    s5.forEach((row, i) => {
      const any = [row.organization, row.position, row.start_date, row.end_date || '', row.responsibilities].some(v => String(v || '').trim());
      if (any) {
        if (!row.organization.trim() || !row.position.trim() || !row.start_date.trim()) errs.push(`Experience #${i+1} requires organization, position and start date`);
        if (row.start_date && row.end_date && row.end_date < row.start_date) errs.push(`Experience #${i+1} end date cannot be before start date`);
      }
    });
    return errs;
  };
  const validateStep6 = (): string[] => {
    const errs: string[] = [];
    s6.forEach((row, i) => {
      const any = [row.title, row.date, row.location].some(v => String(v || '').trim());
      if (any && (!row.title.trim() || !row.date.trim() || !row.location.trim())) errs.push(`Seminar #${i+1} requires title, date and location`);
    });
    return errs;
  };
  const validateStep7 = (): string[] => {
    const errs: string[] = [];
    s7.forEach((row, i) => {
      const any = [row.user_id, row.relationship].some(v => String(v || '').trim());
      if (any) {
        if (!row.user_id.trim() || !row.relationship.trim()) errs.push(`Referee #${i+1} is incomplete`);
        if (row.user_id && !/^[0-9]+$/.test(row.user_id)) errs.push(`Referee #${i+1} user id must be numeric`);
      }
    });
    return errs;
  };
  const onPickFile = (field: 'pro_pic' | 'signature') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setS1(prev => {
      const prevPreview = (prev as any)[`${field}_preview`] as string;
      if (prevPreview) { try { URL.revokeObjectURL(prevPreview); } catch {} }
      const preview = file && file.type?.startsWith('image') ? URL.createObjectURL(file) : '';
      return ({ ...(prev as any), [field]: file, [`${field}_name`]: file ? file.name : '', [`${field}_preview`]: preview } as any);
    });
  };
  const onDropFile = (field: 'pro_pic' | 'signature') => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] || null;
    if (file) setS1(prev => {
      const prevPreview = (prev as any)[`${field}_preview`] as string;
      if (prevPreview) { try { URL.revokeObjectURL(prevPreview); } catch {} }
      const preview = file && file.type?.startsWith('image') ? URL.createObjectURL(file) : '';
      return ({ ...(prev as any), [field]: file, [`${field}_name`]: file.name, [`${field}_preview`]: preview } as any);
    });
  };
  const onPickCert = (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setS2(arr => arr.map((r, i) => {
      if (i !== idx) return r;
      if (r.certPreview) { try { URL.revokeObjectURL(r.certPreview); } catch {} }
      const preview = file && file.type?.startsWith('image') ? URL.createObjectURL(file) : undefined;
      return { ...r, certFile: file, certName: file ? file.name : undefined, certPreview: preview };
    }));
  };
  const onDropCert = (idx: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] || null;
    if (file) setS2(arr => arr.map((r, i) => {
      if (i !== idx) return r;
      if (r.certPreview) { try { URL.revokeObjectURL(r.certPreview); } catch {} }
      const preview = file && file.type?.startsWith('image') ? URL.createObjectURL(file) : undefined;
      return { ...r, certFile: file, certName: file.name, certPreview: preview };
    }));
  };
  const removeS2 = (idx: number) => setS2(arr => {
    const row = arr[idx];
    if (row?.certPreview) { try { URL.revokeObjectURL(row.certPreview); } catch {} }
    return arr.filter((_, i) => i !== idx);
  });
  useEffect(() => {
    return () => {
      try {
        if (s1.pro_pic_preview) URL.revokeObjectURL(s1.pro_pic_preview);
        if (s1.signature_preview) URL.revokeObjectURL(s1.signature_preview);
        s2.forEach(r => { if (r?.certPreview) URL.revokeObjectURL(r.certPreview); });
      } catch {}
    };
  }, [s1.pro_pic_preview, s1.signature_preview, s2]);
  const selectReferee = (idx: number, rec: any) => {
    const userId = rec && (rec.user_id ?? rec.id);
    if (!userId) return;
    setS7(arr => arr.map((r, i) => i === idx ? { ...r, user_id: String(userId) } : r));
    updateRefSearch(idx, { selected: rec, q: rec.membership_no || rec.membership_no?.toString?.() || '', results: [] });
  };
  const goBack = () => { if (busy) return; setError(null); setSuccess(null); setStep(s => Math.max(1, s - 1)); };

  const next = async () => {
    if (busy) return; setError(null); setSuccess(null);
    try {
      if (step === 1) {
        const errs = validateStep1();
        if (errs.length) { setError(errs.join(' • ')); return; }
        const fd = new FormData();
        fd.append('surname', s1.surname);
        fd.append('other_names', s1.other_names);
        fd.append('title', s1.title);
        fd.append('postal_address', s1.postal_address);
        fd.append('residential_address', s1.residential_address);
        fd.append('email', s1.email);
        fd.append('phone', s1.phone);
        fd.append('date_of_birth', s1.date_of_birth);
        fd.append('nationality', s1.nationality);
        if (s1.pro_pic) fd.append('pro_pic', s1.pro_pic);
        if (s1.signature) fd.append('signature', s1.signature);
        setBusy(true);
        const res = await apiFetch<any>('/api/probationer/step1', { method: 'POST', body: fd });
        const id = String(res?.data?.id ?? res?.id ?? '');
        if (!id) throw new Error(res?.message || 'Could not create application (no id)');
        setAppId(id);
        setSuccess('Step 1 submitted');
        setStep(2);
      } else if (step === 2) {
        if (!appId) { setError('Please complete Step 1 first'); return; }
        const errs = validateStep2();
        if (errs.length) { setError(errs.join(' • ')); return; }
        // Build FormData with qualifications[i][field] and cert_files[i]
        const fd = new FormData();
        s2.forEach((q, i) => {
          fd.append(`qualifications[${i}][institution]`, q.institution);
          fd.append(`qualifications[${i}][qualification]`, q.qualification);
          fd.append(`qualifications[${i}][year]`, q.year);
          if (q.certFile) fd.append(`cert_files[${i}]`, q.certFile);
        });
        setBusy(true);
        await apiFetch(`/api/probationer/${appId}/step2`, { method: 'POST', body: fd });
        setSuccess('Step 2 submitted');
        setStep(3);
      } else if (step === 3) {
        if (!appId) { setError('Please complete Step 1 first'); return; }
        const v3 = validateStep3();
        if (v3.length) { setError(v3.join(' • ')); return; }
        const results = s3.map(r => ({
          exam_type: normalizeExamType(r.exam_type), exam_year: r.exam_year, exam_number: r.exam_number,
          subjects: r.subjectsCSV.split(',').map(s => s.trim()).filter(Boolean)
        }));
        setBusy(true);
        await apiFetch(`/api/probationer/${appId}/step3`, { method: 'POST', body: { results } });
        setSuccess('Step 3 submitted');
        setStep(4);
      } else if (step === 4) {
        if (!appId) { setError('Please complete Step 1 first'); return; }
        setBusy(true);
        await apiFetch(`/api/probationer/${appId}/step4`, { method: 'POST', body: { memberships: s4 } });
        setSuccess('Step 4 submitted');
        setStep(5);
      } else if (step === 5) {
        if (!appId) { setError('Please complete Step 1 first'); return; }
        const v5 = validateStep5();
        if (v5.length) { setError(v5.join(' • ')); return; }
        setBusy(true);
        await apiFetch(`/api/probationer/${appId}/step5`, { method: 'POST', body: { experiences: s5 } });
        setSuccess('Step 5 submitted');
        setStep(6);
      } else if (step === 6) {
        if (!appId) { setError('Please complete Step 1 first'); return; }
        const v6 = validateStep6();
        if (v6.length) { setError(v6.join(' • ')); return; }
        setBusy(true);
        await apiFetch(`/api/probationer/${appId}/step6`, { method: 'POST', body: { seminars: s6 } });
        setSuccess('Step 6 submitted');
        setStep(7);
      } else if (step === 7) {
        if (!appId) { setError('Please complete Step 1 first'); return; }
        const v7 = validateStep7();
        if (v7.length) { setError(v7.join(' • ')); return; }
        setBusy(true);
        await apiFetch(`/api/probationer/${appId}/step7`, { method: 'POST', body: { referees: s7 } });
        setSuccess('Step 7 submitted');
        setStep(8);
      } else if (step === 8) {
        if (!appId) { setError('Please complete Step 1 first'); return; }
        setBusy(true);
        const res = await apiFetch(`/api/probationer/${appId}/step8`, { method: 'POST' });
        setSuccess('Application acknowledged');
        try { localStorage.removeItem(storageKey); localStorage.removeItem('probationer_wizard_draft'); } catch {}
        try { const ev = new CustomEvent('global-alert', { detail: { title: 'Success', message: 'Application submitted and acknowledged.' } }); window.dispatchEvent(ev); document.dispatchEvent(ev); } catch {}
        // Navigate back to list after short delay
        setTimeout(() => navigate('/admin/applications/probationals'), 500);
      }
    } catch (e: any) {
      setError(normalizeError(e));
      try { const ev = new CustomEvent('global-alert', { detail: { title: 'Error', message: e?.message || 'Request failed' } }); window.dispatchEvent(ev); document.dispatchEvent(ev); } catch {}
    } finally {
      setBusy(false);
    }
  };

  const addRow = (setter: Function, emptyRow: any) => setter((rows: any[]) => [...rows, emptyRow]);
  const removeRow = (setter: Function, idx: number) => setter((rows: any[]) => rows.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-semibold">New Probationer Application</div>
        <div className="text-sm text-gray-500">Step {step} of 8 {appId ? `• ID: ${appId}` : ''}</div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {Array.from({ length: 8 }, (_, idx) => idx + 1).map(n => (
          <button
            key={n}
            type="button"
            onClick={() => { if (!busy && n <= step) setStep(n); }}
            disabled={busy || n > step}
            className={`px-2 py-1 rounded border ${n === step ? 'bg-indigo-600 text-white border-indigo-600' : n < step ? 'bg-white text-gray-800 border-gray-300' : 'bg-gray-100 text-gray-400 border-gray-200'}`}
          >
            Step {n}
          </button>
        ))}
      </div>

      {success && (<div className="p-3 border rounded-md bg-green-50 text-green-700 border-green-200 text-sm">{success}</div>)}
      {error && (<div className="p-3 border rounded-md bg-red-50 text-red-700 border-red-200 text-sm">{error}</div>)}
      <div className="text-base font-medium text-gray-800">{STEP_TITLES[step]}</div>

      {/* Steps */}
      {step === 1 && (
        <div className="bg-white border rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Surname</label>
            <input value={s1.surname} onChange={e=>setS1({...s1, surname: e.target.value})} className="w-full px-3 py-2 border rounded-md" disabled={busy} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Other Names</label>
            <input value={s1.other_names} onChange={e=>setS1({...s1, other_names: e.target.value})} className="w-full px-3 py-2 border rounded-md" disabled={busy} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Title</label>
            <select value={s1.title} onChange={e=>setS1({...s1, title: e.target.value})} className="w-full px-3 py-2 border rounded-md bg-white" disabled={busy}>
              <option value="">Select title</option>
              {TITLES.map(t => (<option key={t} value={t}>{t}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Postal Address</label>
            <input value={s1.postal_address} onChange={e=>setS1({...s1, postal_address: e.target.value})} className="w-full px-3 py-2 border rounded-md" disabled={busy} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Residential Address</label>
            <input value={s1.residential_address} onChange={e=>setS1({...s1, residential_address: e.target.value})} className="w-full px-3 py-2 border rounded-md" disabled={busy} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Email</label>
            <input value={s1.email} onChange={e=>setS1({...s1, email: e.target.value})} type="email" className="w-full px-3 py-2 border rounded-md" disabled={busy} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Phone</label>
            <input value={s1.phone} onChange={e=>setS1({...s1, phone: e.target.value})} className="w-full px-3 py-2 border rounded-md" disabled={busy} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Date of Birth</label>
            <input value={s1.date_of_birth} onChange={e=>setS1({...s1, date_of_birth: e.target.value})} type="date" className="w-full px-3 py-2 border rounded-md" disabled={busy} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Nationality</label>
            <select value={s1.nationality} onChange={e=>setS1({...s1, nationality: e.target.value})} className="w-full px-3 py-2 border rounded-md bg-white" disabled={busy}>
              <option value="">Select nationality</option>
              {COUNTRIES.map(c => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Passport Photo</label>
            <div className="border-2 border-dashed rounded-md p-3 text-center text-xs text-gray-600 cursor-pointer" onDragOver={e=>e.preventDefault()} onDrop={onDropFile('pro_pic')} onClick={()=> (document.getElementById('file_pro_pic') as HTMLInputElement)?.click()}>
              {s1.pro_pic_name || (s1.pro_pic ? s1.pro_pic.name : 'Drag & drop image, or click to select (JPG/PNG/WebP, max 5MB)')}
            </div>
            <input id="file_pro_pic" type="file" accept="image/*" onChange={onPickFile('pro_pic')} className="hidden" disabled={busy} />
            {s1.pro_pic_preview && (
              <div className="mt-2">
                <img src={s1.pro_pic_preview} alt="Passport preview" className="h-24 object-cover rounded border" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Signature</label>
            <div className="border-2 border-dashed rounded-md p-3 text-center text-xs text-gray-600 cursor-pointer" onDragOver={e=>e.preventDefault()} onDrop={onDropFile('signature')} onClick={()=> (document.getElementById('file_signature') as HTMLInputElement)?.click()}>
              {s1.signature_name || (s1.signature ? s1.signature.name : 'Drag & drop image, or click to select (JPG/PNG/WebP, max 5MB)')}
            </div>
            <input id="file_signature" type="file" accept="image/*" onChange={onPickFile('signature')} className="hidden" disabled={busy} />
            {s1.signature_preview && (
              <div className="mt-2">
                <img src={s1.signature_preview} alt="Signature preview" className="h-24 object-contain rounded border" />
              </div>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white border rounded-xl p-4 space-y-3">
          {s2.map((row, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Institution</label>
                <input value={row.institution} onChange={e=>setS2(arr=>arr.map((r,idx)=> idx===i ? { ...r, institution: e.target.value } : r))} className="w-full px-3 py-2 border rounded-md" disabled={busy} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Qualification</label>
                <input value={row.qualification} onChange={e=>setS2(arr=>arr.map((r,idx)=> idx===i ? { ...r, qualification: e.target.value } : r))} className="w-full px-3 py-2 border rounded-md" disabled={busy} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Year</label>
                <select value={row.year} onChange={e=>setS2(arr=>arr.map((r,idx)=> idx===i ? { ...r, year: e.target.value } : r))} className="w-full px-3 py-2 border rounded-md bg-white" disabled={busy}>
                  <option value="">Select year</option>
                  {YEARS.map(y => (<option key={y} value={y}>{y}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Certificate File</label>
                <div className="border-2 border-dashed rounded-md p-3 text-center text-xs text-gray-600 cursor-pointer" onDragOver={e=>e.preventDefault()} onDrop={onDropCert(i)} onClick={()=> (document.getElementById(`cert_file_${i}`) as HTMLInputElement)?.click()}>
                  {row.certName || (row.certFile ? row.certFile.name : 'Drag & drop image/PDF, or click to select (PDF, JPG/PNG/WebP, max 10MB)')}
                </div>
                <input id={`cert_file_${i}`} type="file" accept="image/*,application/pdf" onChange={onPickCert(i)} className="hidden" disabled={busy} />
                {row.certPreview && (
                  <div className="mt-2">
                    <img src={row.certPreview} alt="Certificate preview" className="h-24 object-contain rounded border" />
                  </div>
                )}
              </div>
              <div className="md:col-span-4">
                <button onClick={()=>removeS2(i)} className="px-2 py-1 text-xs border rounded" disabled={busy}>Remove</button>
              </div>
            </div>
          ))}
          <button onClick={()=>addRow(setS2, { institution: '', qualification: '', year: '', certFile: null })} className="px-3 py-2 border rounded-md text-sm" disabled={busy}>+ Add Qualification</button>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white border rounded-xl p-4 space-y-3">
          {s3.map((row, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Exam Type</label>
                <select value={normalizeExamType(row.exam_type)} onChange={e=>setS3(arr=>arr.map((r,idx)=> idx===i ? { ...r, exam_type: String(e.target.value) } : r))} className="w-full px-3 py-2 border rounded-md bg-white" disabled={busy}>
                  <option value="">Select exam type</option>
                  {EXAM_TYPE_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Exam Year</label>
                <select value={row.exam_year} onChange={e=>setS3(arr=>arr.map((r,idx)=> idx===i ? { ...r, exam_year: e.target.value } : r))} className="w-full px-3 py-2 border rounded-md bg-white" disabled={busy}>
                  <option value="">Select year</option>
                  {YEARS.map(y => (<option key={y} value={y}>{y}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Exam Number</label>
                <input value={row.exam_number} onChange={e=>setS3(arr=>arr.map((r,idx)=> idx===i ? { ...r, exam_number: e.target.value } : r))} className="w-full px-3 py-2 border rounded-md" disabled={busy} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Subjects (CSV)</label>
                <input value={row.subjectsCSV} onChange={e=>setS3(arr=>arr.map((r,idx)=> idx===i ? { ...r, subjectsCSV: e.target.value } : r))} placeholder="A1, B3, ..." className="w-full px-3 py-2 border rounded-md" disabled={busy} />
              </div>
              <div className="md:col-span-4">
                <button onClick={()=>removeRow(setS3, i)} className="px-2 py-1 text-xs border rounded" disabled={busy}>Remove</button>
              </div>
            </div>
          ))}
          <button onClick={()=>addRow(setS3, { exam_type: '', exam_year: '', exam_number: '', subjectsCSV: '' })} className="px-3 py-2 border rounded-md text-sm" disabled={busy}>+ Add Result</button>
        </div>
      )}

      {step === 4 && (
        <div className="bg-white border rounded-xl p-4 space-y-3">
          {s4.map((row, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Body Name</label>
                <input value={row.body_name} onChange={e=>setS4(arr=>arr.map((r,idx)=> idx===i ? { ...r, body_name: e.target.value } : r))} className="w-full px-3 py-2 border rounded-md" disabled={busy} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Stage Passed</label>
                <input value={row.stage_passed} onChange={e=>setS4(arr=>arr.map((r,idx)=> idx===i ? { ...r, stage_passed: e.target.value } : r))} className="w-full px-3 py-2 border rounded-md" disabled={busy} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Certificate Path</label>
                <input value={row.certificate_path} onChange={e=>setS4(arr=>arr.map((r,idx)=> idx===i ? { ...r, certificate_path: e.target.value } : r))} className="w-full px-3 py-2 border rounded-md" disabled={busy} />
              </div>
              <div className="md:col-span-3">
                <button onClick={()=>removeRow(setS4, i)} className="px-2 py-1 text-xs border rounded" disabled={busy}>Remove</button>
              </div>
            </div>
          ))}
          <button onClick={()=>addRow(setS4, { body_name: '', stage_passed: '', certificate_path: '' })} className="px-3 py-2 border rounded-md text-sm" disabled={busy}>+ Add Membership</button>
        </div>
      )}

      {step === 5 && (
        <div className="bg-white border rounded-xl p-4 space-y-3">
          {s5.map((row, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Organization</label>
                <input value={row.organization} onChange={e=>setS5(arr=>arr.map((r,idx)=> idx===i ? { ...r, organization: e.target.value } : r))} className="w-full px-3 py-2 border rounded-md" disabled={busy} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Position</label>
                <input value={row.position} onChange={e=>setS5(arr=>arr.map((r,idx)=> idx===i ? { ...r, position: e.target.value } : r))} className="w-full px-3 py-2 border rounded-md" disabled={busy} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                <input type="date" value={row.start_date} onChange={e=>setS5(arr=>arr.map((r,idx)=> idx===i ? { ...r, start_date: e.target.value } : r))} className="w-full px-3 py-2 border rounded-md" disabled={busy} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">End Date</label>
                <input type="date" value={row.end_date || ''} onChange={e=>setS5(arr=>arr.map((r,idx)=> idx===i ? { ...r, end_date: e.target.value || null } : r))} className="w-full px-3 py-2 border rounded-md" disabled={busy} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Responsibilities</label>
                <input value={row.responsibilities} onChange={e=>setS5(arr=>arr.map((r,idx)=> idx===i ? { ...r, responsibilities: e.target.value } : r))} className="w-full px-3 py-2 border rounded-md" disabled={busy} />
              </div>
              <div className="md:col-span-5">
                <button onClick={()=>removeRow(setS5, i)} className="px-2 py-1 text-xs border rounded" disabled={busy}>Remove</button>
              </div>
            </div>
          ))}
          <button onClick={()=>addRow(setS5, { organization: '', position: '', start_date: '', end_date: '', responsibilities: '' })} className="px-3 py-2 border rounded-md text-sm" disabled={busy}>+ Add Experience</button>
        </div>
      )}

      {step === 6 && (
        <div className="bg-white border rounded-xl p-4 space-y-3">
          {s6.map((row, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Title</label>
                <input value={row.title} onChange={e=>setS6(arr=>arr.map((r,idx)=> idx===i ? { ...r, title: e.target.value } : r))} className="w-full px-3 py-2 border rounded-md" disabled={busy} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Date</label>
                <input type="date" value={row.date} onChange={e=>setS6(arr=>arr.map((r,idx)=> idx===i ? { ...r, date: e.target.value } : r))} className="w-full px-3 py-2 border rounded-md" disabled={busy} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Location</label>
                <input value={row.location} onChange={e=>setS6(arr=>arr.map((r,idx)=> idx===i ? { ...r, location: e.target.value } : r))} className="w-full px-3 py-2 border rounded-md" disabled={busy} />
              </div>
              <div className="md:col-span-3">
                <button onClick={()=>removeRow(setS6, i)} className="px-2 py-1 text-xs border rounded" disabled={busy}>Remove</button>
              </div>
            </div>
          ))}
          <button onClick={()=>addRow(setS6, { title: '', date: '', location: '' })} className="px-3 py-2 border rounded-md text-sm" disabled={busy}>+ Add Seminar</button>
        </div>
      )}

      {step === 7 && (
        <div className="bg-white border rounded-xl p-4 space-y-3">
          {s7.map((row, i) => {
            const s = refSearch[i] || { q: '', loading: false, results: [], error: null as string | null, selected: undefined };
            return (
              <div key={i} className="space-y-2 border rounded-md p-3 bg-gray-50/60">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Referee Membership No (e.g. M-8291)</label>
                    <input
                      value={s.q}
                      onChange={e=>{
                        const v = e.target.value;
                        updateRefSearch(i, { q: v });
                        // fire search after basic length guard
                        searchMembers(i, v);
                      }}
                      placeholder="Type membership number"
                      className="w-full px-3 py-2 border rounded-md"
                      disabled={busy}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Relationship</label>
                    <select value={row.relationship} onChange={e=>setS7(arr=>arr.map((r,idx)=> idx===i ? { ...r, relationship: e.target.value } : r))} className="w-full px-3 py-2 border rounded-md bg-white" disabled={busy}>
                      <option value="">Select relationship</option>
                      {RELATIONSHIPS.map(rp => (<option key={rp} value={rp}>{rp}</option>))}
                    </select>
                  </div>
                  <div className="flex items-end justify-end gap-2">
                    <button onClick={()=>removeRow(setS7, i)} className="px-2 py-1 text-xs border rounded" disabled={busy}>Remove</button>
                  </div>
                </div>
                {s.selected && (
                  <div className="text-xs bg-white border rounded-md p-2 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{s.selected.title} {s.selected.surname} {s.selected.firstname}</div>
                      <div className="text-gray-600">{s.selected.membership_no} • {s.selected.email}</div>
                      <div className="text-gray-500">User ID: {s.selected.user_id}</div>
                    </div>
                    <div className="text-green-600 text-xs font-semibold">Selected</div>
                  </div>
                )}
                {s.error && (
                  <div className="text-xs text-red-600">{s.error}</div>
                )}
                {!!s.results.length && !s.selected && (
                  <div className="bg-white border rounded-md p-2 space-y-1 max-h-40 overflow-y-auto text-xs">
                    {s.results.map((m:any) => (
                      <div key={m.id} className="flex items-center justify-between gap-2 border-b last:border-b-0 py-1">
                        <div>
                          <div className="font-medium">{m.title} {m.surname} {m.firstname}</div>
                          <div className="text-gray-600">{m.membership_no} • {m.email}</div>
                          <div className="text-gray-500">User ID: {m.user_id}</div>
                        </div>
                        <button
                          type="button"
                          className="px-2 py-1 text-xs bg-indigo-600 text-white rounded"
                          onClick={()=>selectReferee(i, m)}
                          disabled={busy}
                        >
                          Add Referee
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <button onClick={()=>addRow(setS7, { user_id: '', relationship: '' })} className="px-3 py-2 border rounded-md text-sm" disabled={busy}>+ Add Referee</button>
        </div>
      )}

      {step === 8 && (
        <div className="bg-white border rounded-xl p-4 space-y-4">
          <div className="text-sm text-gray-700">Review your application. Use Edit to jump back to a section if needed.</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="border rounded p-3">
              <div className="flex items-center justify-between"><div className="font-medium">Personal</div><button type="button" className="text-xs underline" onClick={()=>setStep(1)}>Edit</button></div>
              <div className="mt-2 space-y-1">
                <div><span className="text-gray-500">Name:</span> {[s1.title, s1.surname, s1.other_names].filter(Boolean).join(' ') || '-'}</div>
                <div><span className="text-gray-500">Email:</span> {s1.email || '-'}</div>
                <div><span className="text-gray-500">Phone:</span> {s1.phone || '-'}</div>
                <div><span className="text-gray-500">DOB:</span> {s1.date_of_birth || '-'}</div>
                <div><span className="text-gray-500">Nationality:</span> {s1.nationality || '-'}</div>
                <div>
                  <span className="text-gray-500">Photo:</span> {s1.pro_pic_name || (s1.pro_pic ? s1.pro_pic.name : '-')}
                  {s1.pro_pic_preview && (
                    <div className="mt-2">
                      <img src={s1.pro_pic_preview} alt="Photo preview" className="h-20 w-20 rounded border object-cover" />
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-gray-500">Signature:</span> {s1.signature_name || (s1.signature ? s1.signature.name : '-')}
                  {s1.signature_preview && (
                    <div className="mt-2">
                      <img src={s1.signature_preview} alt="Signature preview" className="h-16 object-contain rounded border bg-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="border rounded p-3">
              <div className="flex items-center justify-between"><div className="font-medium">Qualifications</div><button type="button" className="text-xs underline" onClick={()=>setStep(2)}>Edit</button></div>
              <div className="mt-2 space-y-1">
                {s2.length ? s2.map((q, i)=> (
                  <div key={i} className="border rounded p-2 space-y-1">
                    <div className="text-xs text-gray-500 mb-1 font-semibold">Qualification #{i+1}</div>
                    <div><span className="text-gray-500">Institution:</span> {q.institution || '-'}</div>
                    <div><span className="text-gray-500">Qualification:</span> {q.qualification || '-'}</div>
                    <div><span className="text-gray-500">Year:</span> {q.year || '-'}</div>
                    <div><span className="text-gray-500">Certificate File:</span> {q.certFile ? q.certFile.name : (q.certName || '-')}</div>
                  </div>
                )) : <div>-</div>}
              </div>
            </div>
            <div className="border rounded p-3">
              <div className="flex items-center justify-between"><div className="font-medium">Exam Results</div><button type="button" className="text-xs underline" onClick={()=>setStep(3)}>Edit</button></div>
              <div className="mt-2 space-y-1">
                {s3.length ? s3.map((r, i)=> (
                  <div key={i} className="border rounded p-2 space-y-1">
                    <div className="text-xs text-gray-500 mb-1 font-semibold">Result #{i+1}</div>
                    <div><span className="text-gray-500">Exam Type:</span> {r.exam_type?.toUpperCase() || '-'}</div>
                    <div><span className="text-gray-500">Exam Year:</span> {r.exam_year || '-'}</div>
                    <div><span className="text-gray-500">Exam Number:</span> {r.exam_number || '-'}</div>
                    <div><span className="text-gray-500">Subjects:</span> {r.subjectsCSV || '-'}</div>
                  </div>
                )) : <div>-</div>}
              </div>
            </div>
            <div className="border rounded p-3">
              <div className="flex items-center justify-between"><div className="font-medium">Memberships</div><button type="button" className="text-xs underline" onClick={()=>setStep(4)}>Edit</button></div>
              <div className="mt-2 space-y-1">
                {s4.length ? s4.map((m, i)=> (
                  <div key={i} className="border rounded p-2 space-y-1">
                    <div className="text-xs text-gray-500 mb-1 font-semibold">Membership #{i+1}</div>
                    <div><span className="text-gray-500">Body Name:</span> {m.body_name || '-'}</div>
                    <div><span className="text-gray-500">Stage Passed:</span> {m.stage_passed || '-'}</div>
                    <div><span className="text-gray-500">Certificate Path:</span> {m.certificate_path || '-'}</div>
                  </div>
                )) : <div>-</div>}
              </div>
            </div>
            <div className="border rounded p-3">
              <div className="flex items-center justify-between"><div className="font-medium">Experience</div><button type="button" className="text-xs underline" onClick={()=>setStep(5)}>Edit</button></div>
              <div className="mt-2 space-y-1">
                {s5.length ? s5.map((e, i)=> (
                  <div key={i} className="border rounded p-2 space-y-1">
                    <div className="text-xs text-gray-500 mb-1 font-semibold">Experience #{i+1}</div>
                    <div><span className="text-gray-500">Organization:</span> {e.organization || '-'}</div>
                    <div><span className="text-gray-500">Position:</span> {e.position || '-'}</div>
                    <div><span className="text-gray-500">Start Date:</span> {e.start_date || '-'}</div>
                    <div><span className="text-gray-500">End Date:</span> {e.end_date || '-'}</div>
                  </div>
                )) : <div>-</div>}
              </div>
            </div>
            <div className="border rounded p-3">
              <div className="flex items-center justify-between"><div className="font-medium">Seminars</div><button type="button" className="text-xs underline" onClick={()=>setStep(6)}>Edit</button></div>
              <div className="mt-2 space-y-1">
                {s6.length ? s6.map((e, i)=> (
                  <div key={i} className="border rounded p-2 space-y-1">
                    <div className="text-xs text-gray-500 mb-1 font-semibold">Seminar #{i+1}</div>
                    <div><span className="text-gray-500">Title:</span> {e.title || '-'}</div>
                    <div><span className="text-gray-500">Date:</span> {e.date || '-'}</div>
                    <div><span className="text-gray-500">Location:</span> {e.location || '-'}</div>
                  </div>
                )) : <div>-</div>}
              </div>
            </div>
            <div className="border rounded p-3">
              <div className="flex items-center justify-between"><div className="font-medium">Referees</div><button type="button" className="text-xs underline" onClick={()=>setStep(7)}>Edit</button></div>
              <div className="mt-2 space-y-1">
                {s7.length ? s7.map((r, i)=> (
                  <div key={i} className="border rounded p-2 space-y-1">
                    <div className="text-xs text-gray-500 mb-1 font-semibold">Referee #{i+1}</div>
                    <div><span className="text-gray-500">User ID:</span> {r.user_id || '-'}</div>
                    <div><span className="text-gray-500">Relationship:</span> {r.relationship || '-'}</div>
                  </div>
                )) : <div>-</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <button onClick={()=>navigate(-1)} className="px-3 py-2 border rounded-md text-sm" disabled={busy}>Cancel</button>
        </div>
        <div className="space-x-2">
          <button onClick={goBack} className="px-3 py-2 border rounded-md text-sm" disabled={busy || step===1}>Back</button>
          <button onClick={next} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm" disabled={!canGoNext}>{busy ? (step===8 ? 'Submitting…' : 'Saving…') : (step===8 ? 'Submit & Acknowledge' : 'Save & Continue')}</button>
        </div>
      </div>
    </div>
  );
};

export default ProbationerNew;
