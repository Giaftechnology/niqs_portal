import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCountries } from '../../data/countries';

// Local helpers
const key = (email: string) => `onboarding_${email}`;

type Gender = 'Male' | 'Female' | 'Other';

type Academic = { institution_name: string; certification: string; year_obtained: string; certificate_file?: string };

const Modal = ({ open, title, children, onClose, onConfirm, confirmText = 'OK' }: { open: boolean; title: string; children?: React.ReactNode; onClose: () => void; onConfirm?: () => void; confirmText?: string }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-sm p-5">
        <div className="text-sm font-semibold text-gray-800 mb-2">{title}</div>
        <div className="text-sm text-gray-600 mb-4">{children}</div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 border rounded-md text-sm">Close</button>
          {onConfirm && (
            <button onClick={onConfirm} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm">{confirmText}</button>
          )}
        </div>
      </div>
    </div>
  );
};

type SubjectScore = { subject: string; score: string };
type OLevel = { exam_type: string; reg_number: string; subjects: SubjectScore[] };

type ProfCert = { organization_name: string; exam_passed: string; certificate_file?: string };

type Work = { organization: string; position: string; start_date: string; end_date: string; responsibilities: string };

type Seminar = { title: string; date: string; organised_by: string; cod_units: string };

type Referee = { name?: string; relationship: string; membership_id: string; email?: string; phone?: string };

type Biodata = {
  first_name: string;
  last_name: string;
  other_names: string;
  gender: Gender | '';
  lga: string;
  state_of_origin: string;
  nationality: string;
  title: string;
  postal_address: string;
  residential_address: string;
  email: string;
  phone: string;
  date_of_birth: string;
  passport_photo?: string;
  signature_file?: string;
};

type FormState = {
  role: 'probational' | 'graduate' | 'student';
  step: number;
  biodata: Biodata;
  academics: Academic[];
  olevels: OLevel[];
  profcerts: ProfCert[];
  work: Work[];
  seminars: Seminar[];
  referees: Referee[];
  agreed: boolean;
};

const initialBiodata: Biodata = {
  first_name: '',
  last_name: '',
  other_names: '',
  gender: '',
  lga: '',
  state_of_origin: '',
  nationality: 'Nigeria',
  title: '',
  postal_address: '',
  residential_address: '',
  email: '',
  phone: '',
  date_of_birth: '',
};

// Dummy membership database for referee lookup
const REFEREE_DB: Record<string, { name: string; email: string; phone: string }> = {
  'NIQS-0001': { name: 'John Doe', email: 'john@niqs.org', phone: '+2348000000000' },
  'NIQS-0002': { name: 'Jane Smith', email: 'jane@niqs.org', phone: '+2348111111111' },
  'NIQS-0003': { name: 'Abdul Kareem', email: 'abdul@niqs.org', phone: '+2348222222222' },
};

// UI subcomponents (hoisted to avoid remount/focus loss)
const Section = ({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
    <div className="text-sm font-semibold text-gray-800">{title}</div>
    {children}
    {actions}
  </div>
);

const Input = ({ label, ...rest }: any) => (
  <div>
    <label className="block text-xs text-gray-600 mb-1">{label}</label>
    <input {...rest} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm" />
  </div>
);

const Textarea = ({ label, ...rest }: any) => (
  <div>
    <label className="block text-xs text-gray-600 mb-1">{label}</label>
    <textarea {...rest} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm" />
  </div>
);

const Select = ({ label, children, ...rest }: any) => (
  <div>
    <label className="block text-xs text-gray-600 mb-1">{label}</label>
    <select {...rest} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm">{children}</select>
  </div>
);

const Dropzone = ({ label, onSelect, accept, preview, rounded=false }: { label: string; onSelect: (f: File) => void; accept?: string; preview?: string; rounded?: boolean }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setHover(true); }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => { e.preventDefault(); setHover(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) onSelect(e.dataTransfer.files[0]); }}
      className={`border-2 border-dashed rounded-lg p-4 ${hover ? 'border-indigo-400 bg-indigo-50/40' : 'border-gray-300'}`}
    >
      <div className="text-xs text-gray-600 mb-2">{label}</div>
      <label className="text-xs text-indigo-600 underline cursor-pointer">
        <input type="file" accept={accept} className="hidden" onChange={(e: any) => e.target.files && onSelect(e.target.files[0])} />
        Click to browse or drag & drop here
      </label>
      {preview && (
        <div className="mt-3">
          {String(preview).startsWith('data:image') ? (
            <img src={preview} alt={label} className={`${rounded ? 'rounded-full h-24 w-24' : ''} ${!rounded ? 'h-20' : ''} object-cover border`} />
          ) : (
            <div className="flex items-center gap-3 text-xs">
              <span className="px-2 py-1 border rounded bg-gray-50 text-gray-700">File uploaded</span>
              <a href={preview} target="_blank" rel="noreferrer" className="text-indigo-600 underline">View</a>
              <a href={preview} download className="text-indigo-600 underline">Download</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Onboarding: React.FC = () => {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<FormState>(() => ({
    role: (user?.role as any) || 'probational',
    step: 1,
    biodata: { ...initialBiodata, email: user?.email || '' },
    academics: [{ institution_name: '', certification: '', year_obtained: '' }],
    olevels: [{ exam_type: '', reg_number: '', subjects: [{ subject: '', score: '' }] }],
    profcerts: [{ organization_name: '', exam_passed: '' }],
    work: [{ organization: '', position: '', start_date: '', end_date: '', responsibilities: '' }],
    seminars: [{ title: '', date: '', organised_by: '', cod_units: '' }],
    referees: [{ relationship: '', membership_id: '' }, { relationship: '', membership_id: '' }],
    agreed: false,
  }));
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    if (!user) return;
    const raw = localStorage.getItem(key(user.email));
    if (raw) {
      try {
        const data = JSON.parse(raw);
        // migrate any malformed olevels subjects into arrays
        if (data && Array.isArray(data.olevels)) {
          data.olevels = data.olevels.map((o: any) => ({
            ...o,
            subjects: Array.isArray(o?.subjects) ? o.subjects : [{ subject: '', score: '' }],
          }));
        }
        setState(data);
      } catch {}
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const tid = setTimeout(() => {
      try { localStorage.setItem(key(user.email), JSON.stringify(state)); } catch {}
    }, 350);
    return () => clearTimeout(tid);
  }, [state, user]);

  const countries = useMemo(() => getCountries(), []);
  const country = useMemo(() => countries.find((c) => c.name === state.biodata.nationality), [countries, state.biodata.nationality]);
  const states = country?.states?.map((s) => s.name) || [];
  const lgas = useMemo(() => country?.states?.find((s) => s.name === state.biodata.state_of_origin)?.lgas || [], [country, state.biodata.state_of_origin]);
  const years = useMemo(() => { const now = new Date().getFullYear(); const arr: string[] = []; for (let y = now; y >= 1970; y--) arr.push(String(y)); return arr; }, []);

  const onFile = async (file: File, field: 'passport_photo' | 'signature_file' | 'certificate_file', section?: string, index?: number) => {
    const toDataUrl = (f: File) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(f); });
    const data = await toDataUrl(file);
    if (!section) {
      setState((s) => ({ ...s, biodata: { ...s.biodata, [field]: data } }));
    } else if (section === 'academics' && typeof index === 'number') {
      setState((s) => { const arr = [...s.academics]; arr[index] = { ...arr[index], certificate_file: data }; return { ...s, academics: arr }; });
    } else if (section === 'profcerts' && typeof index === 'number') {
      setState((s) => { const arr = [...s.profcerts]; arr[index] = { ...arr[index], certificate_file: data }; return { ...s, profcerts: arr }; });
    }
  };

  const next = () => setState((s) => ({ ...s, step: Math.min(9, s.step + 1) }));
  const back = () => setState((s) => ({ ...s, step: Math.max(1, s.step - 1) }));

  const addRow = (k: keyof Pick<FormState, 'academics' | 'olevels' | 'profcerts' | 'work' | 'seminars' | 'referees'>) => {
    setState((s) => {
      const copy: any = { ...s };
      const def: any = {
        academics: { institution_name: '', certification: '', year_obtained: '' },
        olevels: { exam_type: '', reg_number: '', subjects: [{ subject: '', score: '' }] },
        profcerts: { organization_name: '', exam_passed: '' },
        work: { organization: '', position: '', start_date: '', end_date: '', responsibilities: '' },
        seminars: { title: '', date: '', organised_by: '', cod_units: '' },
        referees: { relationship: '', membership_id: '' },
      };
      if (k === 'referees' && (s as any)[k].length >= 2) return s;
      copy[k] = [...(s as any)[k], def[k]];
      return copy;
    });
  };

  const removeRow = (k: keyof Pick<FormState, 'academics' | 'olevels' | 'profcerts' | 'work' | 'seminars' | 'referees'>, idx: number) => {
    setState((s) => { const copy: any = { ...s }; copy[k] = (s as any)[k].filter((_: any, i: number) => i !== idx); return copy; });
  };

  const finish = async () => {
    if (!user) return;
    await completeOnboarding({ fullName: `${state.biodata.first_name} ${state.biodata.last_name}`, phone: state.biodata.phone, department: undefined });
    setShowDone(true);
  };

  

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Registration – Onboarding</h1>
          <p className="text-sm text-gray-500">Step {state.step} of 9</p>
        </div>

        {state.step === 1 && (
          <Section title="Biodata">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input label="First Name" value={state.biodata.first_name} onChange={(e: any) => setState((s) => ({ ...s, biodata: { ...s.biodata, first_name: e.target.value } }))} />
              <Input label="Last Name" value={state.biodata.last_name} onChange={(e: any) => setState((s) => ({ ...s, biodata: { ...s.biodata, last_name: e.target.value } }))} />
              <Input label="Other Names" value={state.biodata.other_names} onChange={(e: any) => setState((s) => ({ ...s, biodata: { ...s.biodata, other_names: e.target.value } }))} />
              <Select label="Title" value={state.biodata.title} onChange={(e: any) => setState((s) => ({ ...s, biodata: { ...s.biodata, title: e.target.value } }))}>
                <option value="">Select</option>
                <option>Mr</option>
                <option>Mrs</option>
                <option>Miss</option>
                <option>Dr</option>
              </Select>
              <Select label="Gender" value={state.biodata.gender} onChange={(e: any) => setState((s) => ({ ...s, biodata: { ...s.biodata, gender: e.target.value } }))}>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </Select>
              <Input label="Date of Birth" type="date" value={state.biodata.date_of_birth} onChange={(e: any) => setState((s) => ({ ...s, biodata: { ...s.biodata, date_of_birth: e.target.value } }))} />
              <Select label="Nationality" value={state.biodata.nationality} onChange={(e: any) => setState((s) => ({ ...s, biodata: { ...s.biodata, nationality: e.target.value, state_of_origin: '', lga: '' } }))}>
                {countries.map((c) => (<option key={c.name}>{c.name}</option>))}
              </Select>
              <Select label="State of Origin" value={state.biodata.state_of_origin} onChange={(e: any) => setState((s) => ({ ...s, biodata: { ...s.biodata, state_of_origin: e.target.value, lga: '' } }))}>
                <option value="">Select</option>
                {states.map((s) => (<option key={s}>{s}</option>))}
              </Select>
              <Select label="LGA" value={state.biodata.lga} onChange={(e: any) => setState((s) => ({ ...s, biodata: { ...s.biodata, lga: e.target.value } }))}>
                <option value="">Select</option>
                {lgas.map((l) => (<option key={l}>{l}</option>))}
              </Select>
              <Input label="Postal Address" value={state.biodata.postal_address} onChange={(e: any) => setState((s) => ({ ...s, biodata: { ...s.biodata, postal_address: e.target.value } }))} />
              <Input label="Residential Address" value={state.biodata.residential_address} onChange={(e: any) => setState((s) => ({ ...s, biodata: { ...s.biodata, residential_address: e.target.value } }))} />
              <div>
                <label className="block text-xs text-gray-600 mb-1">Email</label>
                <input type="email" value={state.biodata.email} readOnly disabled className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-100 text-gray-500" />
              </div>
              <Input label="Phone" value={state.biodata.phone} onChange={(e: any) => setState((s) => ({ ...s, biodata: { ...s.biodata, phone: e.target.value } }))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Dropzone label="Passport Photo" accept="image/*" onSelect={(f) => onFile(f, 'passport_photo')} preview={state.biodata.passport_photo} rounded />
              <Dropzone label="Signature" accept="image/*" onSelect={(f) => onFile(f, 'signature_file')} preview={state.biodata.signature_file} />
            </div>
          </Section>
        )}

        {state.step === 9 && (
          <Section title="Preview & Submit">
            <div className="space-y-6 text-sm">
              <div>
                <div className="font-medium text-gray-800 mb-2 flex items-center justify-between">Biodata <button className="text-indigo-600 text-xs underline" onClick={() => setState(s=>({...s, step:1}))}>Edit</button></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-gray-700">
                  <div>Name: {`${state.biodata.first_name} ${state.biodata.last_name}`.trim()}</div>
                  <div>Email: {state.biodata.email}</div>
                  <div>Phone: {state.biodata.phone}</div>
                  <div>Gender: {state.biodata.gender}</div>
                  <div>Nationality: {state.biodata.nationality}</div>
                  <div>State/LGA: {state.biodata.state_of_origin} {state.biodata.lga ? `- ${state.biodata.lga}` : ''}</div>
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-800 mb-2 flex items-center justify-between">Academic Qualifications <button className="text-indigo-600 text-xs underline" onClick={() => setState(s=>({...s, step:2}))}>Edit</button></div>
                <div className="space-y-1 text-gray-700">
                  {state.academics.map((a,i)=>(<div key={i}>• {a.institution_name} — {a.certification} ({a.year_obtained})</div>))}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-800 mb-2 flex items-center justify-between">O Level Results <button className="text-indigo-600 text-xs underline" onClick={() => setState(s=>({...s, step:3}))}>Edit</button></div>
                <div className="space-y-2 text-gray-700">
                  {state.olevels.map((o,i)=>(
                    <div key={i}>
                      <div>{o.exam_type} — {o.reg_number}</div>
                      <div className="text-xs text-gray-600">{(o.subjects||[]).filter(Boolean).map(s=>`${s.subject} (${s.score})`).join(', ')}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-800 mb-2 flex items-center justify-between">Professional Certifications <button className="text-indigo-600 text-xs underline" onClick={() => setState(s=>({...s, step:4}))}>Edit</button></div>
                <div className="space-y-1 text-gray-700">
                  {state.profcerts.map((p,i)=>(<div key={i}>• {p.organization_name} — {p.exam_passed}</div>))}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-800 mb-2 flex items-center justify-between">Working Experience <button className="text-indigo-600 text-xs underline" onClick={() => setState(s=>({...s, step:5}))}>Edit</button></div>
                <div className="space-y-1 text-gray-700">
                  {state.work.map((w,i)=>(<div key={i}>• {w.organization} — {w.position} ({w.start_date} - {w.end_date})</div>))}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-800 mb-2 flex items-center justify-between">Seminars <button className="text-indigo-600 text-xs underline" onClick={() => setState(s=>({...s, step:6}))}>Edit</button></div>
                <div className="space-y-1 text-gray-700">
                  {state.seminars.map((sm,i)=>(<div key={i}>• {sm.title} — {sm.date} ({sm.organised_by})</div>))}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-800 mb-2 flex items-center justify-between">Referees <button className="text-indigo-600 text-xs underline" onClick={() => setState(s=>({...s, step:7}))}>Edit</button></div>
                <div className="space-y-1 text-gray-700">
                  {state.referees.map((r,i)=>(<div key={i}>• {r.membership_id} {r.name ? `— ${r.name}` : ''} {r.email ? `(${r.email})` : ''}</div>))}
                </div>
              </div>
              <div className="text-xs text-gray-500">Declaration date: {new Date().toISOString().slice(0,10)}</div>
            </div>
          </Section>
        )}

        {state.step === 2 && (
          <Section title="Academic Qualifications" actions={<button onClick={() => addRow('academics')} className="px-3 py-1.5 border rounded-md text-xs">Add more</button>}>
            <div className="space-y-4">
              {state.academics.map((a, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <Input label="Institution Name" value={a.institution_name} onChange={(e: any) => setState((s) => { const arr = [...s.academics]; arr[i].institution_name = e.target.value; return { ...s, academics: arr }; })} />
                  <Input label="Certification" value={a.certification} onChange={(e: any) => setState((s) => { const arr = [...s.academics]; arr[i].certification = e.target.value; return { ...s, academics: arr }; })} />
                  <Select label="Year Obtained" value={a.year_obtained} onChange={(e: any) => setState((s) => { const arr = [...s.academics]; arr[i].year_obtained = e.target.value; return { ...s, academics: arr }; })}>
                    <option value="">Select</option>
                    {years.map(y => (<option key={y}>{y}</option>))}
                  </Select>
                  <div>
                    <Dropzone label="Certificate File" accept="image/*,application/pdf" onSelect={(f) => onFile(f, 'certificate_file', 'academics', i)} preview={state.academics[i].certificate_file} />
                  </div>
                  {state.academics.length > 1 && (
                    <div>
                      <button onClick={() => removeRow('academics', i)} className="px-2 py-1 border rounded-md text-xs">Remove</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {state.step === 3 && (
          <Section title="O Level Results" actions={<button onClick={() => addRow('olevels')} className="px-3 py-1.5 border rounded-md text-xs">Add Exam Type</button>}>
            <div className="space-y-4">
              {state.olevels.map((o, i) => (
                <div key={i} className="space-y-3 bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <Select label="Exam Type" value={o.exam_type} onChange={(e: any) => setState((s) => { const arr = [...s.olevels]; arr[i].exam_type = e.target.value; return { ...s, olevels: arr }; })}>
                      <option value="">Select</option>
                      <option>WAEC</option>
                      <option>NECO</option>
                      <option>NABTEB</option>
                    </Select>
                    <Input label="Reg Number" value={o.reg_number} onChange={(e: any) => setState((s) => { const arr = [...s.olevels]; arr[i].reg_number = e.target.value; return { ...s, olevels: arr }; })} />
                    {state.olevels.length > 1 && (
                      <div>
                        <button onClick={() => removeRow('olevels', i)} className="mt-6 px-2 py-1 border rounded-md text-xs">Remove Exam</button>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-2">Subjects and Scores (up to 10)</div>
                    <div className="space-y-2">
                      {(Array.isArray(o.subjects) ? o.subjects : []).map((sbs, j) => (
                        <div key={j} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                          <Input label="Subject" value={sbs.subject} onChange={(e: any) => setState((st) => { const arr = [...st.olevels]; arr[i].subjects[j].subject = e.target.value; return { ...st, olevels: arr }; })} />
                          <Input label="Score/Grade" value={sbs.score} onChange={(e: any) => setState((st) => { const arr = [...st.olevels]; arr[i].subjects[j].score = e.target.value; return { ...st, olevels: arr }; })} />
                          <div>
                            {(Array.isArray(o.subjects) ? o.subjects.length : 0) > 1 && (
                              <button onClick={() => setState((st) => { const arr = [...st.olevels]; arr[i].subjects = arr[i].subjects.filter((_, idx) => idx !== j); return { ...st, olevels: arr }; })} className="px-2 py-1 border rounded-md text-xs">Remove</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {(Array.isArray(o.subjects) ? o.subjects.length : 0) < 10 && (
                      <div className="mt-2">
                        <button onClick={() => setState((st) => { const arr = [...st.olevels]; arr[i].subjects = [...arr[i].subjects, { subject: '', score: '' }]; return { ...st, olevels: arr }; })} className="px-3 py-1.5 border rounded-md text-xs">Add Subject</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {state.step === 4 && (
          <Section title="Professional Certifications" actions={<button onClick={() => addRow('profcerts')} className="px-3 py-1.5 border rounded-md text-xs">Add more</button>}>
            <div className="space-y-4">
              {state.profcerts.map((p, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <Input label="Organization Name" value={p.organization_name} onChange={(e: any) => setState((s) => { const arr = [...s.profcerts]; arr[i].organization_name = e.target.value; return { ...s, profcerts: arr }; })} />
                  <Input label="Exam Passed" value={p.exam_passed} onChange={(e: any) => setState((s) => { const arr = [...s.profcerts]; arr[i].exam_passed = e.target.value; return { ...s, profcerts: arr }; })} />
                  <div>
                    <Dropzone label="Certificate File" accept="image/*,application/pdf" onSelect={(f) => onFile(f, 'certificate_file', 'profcerts', i)} preview={state.profcerts[i].certificate_file} />
                  </div>
                  {state.profcerts.length > 1 && (
                    <div>
                      <button onClick={() => removeRow('profcerts', i)} className="px-2 py-1 border rounded-md text-xs">Remove</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {state.step === 5 && (
          <Section title="Working Experience" actions={<button onClick={() => addRow('work')} className="px-3 py-1.5 border rounded-md text-xs">Add more</button>}>
            <div className="space-y-4">
              {state.work.map((w, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                  <Input label="Organization" value={w.organization} onChange={(e: any) => setState((s) => { const arr = [...s.work]; arr[i].organization = e.target.value; return { ...s, work: arr }; })} />
                  <Input label="Position" value={w.position} onChange={(e: any) => setState((s) => { const arr = [...s.work]; arr[i].position = e.target.value; return { ...s, work: arr }; })} />
                  <Input label="Start Date" type="date" value={w.start_date} onChange={(e: any) => setState((s) => { const arr = [...s.work]; arr[i].start_date = e.target.value; return { ...s, work: arr }; })} />
                  <Input label="End Date" type="date" value={w.end_date} onChange={(e: any) => setState((s) => { const arr = [...s.work]; arr[i].end_date = e.target.value; return { ...s, work: arr }; })} />
                  <Textarea label="Responsibilities" value={w.responsibilities} onChange={(e: any) => setState((s) => { const arr = [...s.work]; arr[i].responsibilities = e.target.value; return { ...s, work: arr }; })} />
                  {state.work.length > 1 && (
                    <div>
                      <button onClick={() => removeRow('work', i)} className="px-2 py-1 border rounded-md text-xs">Remove</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {state.step === 6 && (
          <Section title="Seminars Attended" actions={<button onClick={() => addRow('seminars')} className="px-3 py-1.5 border rounded-md text-xs">Add more</button>}>
            <div className="space-y-4">
              {state.seminars.map((smm, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <Input label="Title" value={smm.title} onChange={(e: any) => setState((s) => { const arr = [...s.seminars]; arr[i].title = e.target.value; return { ...s, seminars: arr }; })} />
                  <Input label="Date" type="date" value={smm.date} onChange={(e: any) => setState((s) => { const arr = [...s.seminars]; arr[i].date = e.target.value; return { ...s, seminars: arr }; })} />
                  <Input label="Organised By" value={smm.organised_by} onChange={(e: any) => setState((s) => { const arr = [...s.seminars]; arr[i].organised_by = e.target.value; return { ...s, seminars: arr }; })} />
                  <Input label="COD Units" value={smm.cod_units} onChange={(e: any) => setState((s) => { const arr = [...s.seminars]; arr[i].cod_units = e.target.value; return { ...s, seminars: arr }; })} />
                  {state.seminars.length > 1 && (
                    <div>
                      <button onClick={() => removeRow('seminars', i)} className="px-2 py-1 border rounded-md text-xs">Remove</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {state.step === 7 && (
          <Section title="Referees" actions={state.referees.length < 2 ? (<button onClick={() => addRow('referees')} className="px-3 py-1.5 border rounded-md text-xs">Add more</button>) : null}>
            <div className="space-y-4">
              {state.referees.map((r, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <Input label="Relationship" value={r.relationship} onChange={(e: any) => setState((s) => { const arr = [...s.referees]; arr[i].relationship = e.target.value; return { ...s, referees: arr }; })} />
                  <Input label="Membership ID" value={r.membership_id} onChange={(e: any) => {
                    const id = e.target.value; setState((s) => { const arr = [...s.referees]; arr[i].membership_id = id; return { ...s, referees: arr }; });
                  }} onBlur={(e: any) => {
                    const id = String(e.target.value || '').trim().toUpperCase();
                    setState((s) => {
                      const arr = [...s.referees];
                      const rec = REFEREE_DB[id];
                      if (rec) { arr[i].name = rec.name; arr[i].email = rec.email; arr[i].phone = rec.phone; }
                      else { delete arr[i].name; delete arr[i].email; delete arr[i].phone; }
                      return { ...s, referees: arr };
                    });
                  }} />
                  <div className="text-xs text-gray-500">
                    {r.name ? (
                      <div className="space-y-1">
                        <div className="text-gray-800">{r.name}</div>
                        <div>{r.email} · {r.phone}</div>
                      </div>
                    ) : (
                      <div>Enter membership ID to fetch details</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {state.step === 8 && (
          <Section title="Declaration">
            <p className="text-sm text-gray-700">I, {`${state.biodata.first_name} ${state.biodata.last_name}`.trim() || '________________'}, pledge to conduct myself strictly in compliance with the rules of conduct and to abide by the laws of the Nigerian Institute of Quantity Surveyors and as may be amended thereafter.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mt-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Signature</div>
                {state.biodata.signature_file ? (
                  <img src={state.biodata.signature_file} alt="signature" className="h-16 object-contain border" />
                ) : (
                  <div className="text-xs text-gray-400">No signature uploaded</div>
                )}
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Passport</div>
                {state.biodata.passport_photo ? (
                  <img src={state.biodata.passport_photo} alt="passport" className="h-20 w-20 rounded-full object-cover border" />
                ) : (
                  <div className="text-xs text-gray-400">No passport uploaded</div>
                )}
              </div>
              <div>
                <Input label="Date" type="date" value={new Date().toISOString().slice(0,10)} readOnly />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <input type="checkbox" checked={state.agreed} onChange={(e) => setState((s) => ({ ...s, agreed: e.target.checked }))} />
              <span className="text-sm text-gray-700">I agree to the terms and conditions</span>
            </div>
          </Section>
        )}

        <div className="flex justify-between">
          <button onClick={back} className="px-4 py-2 border rounded-md" disabled={state.step === 1}>Back</button>
          {state.step < 9 ? (
            <button onClick={next} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Next</button>
          ) : (
            <button onClick={finish} disabled={!state.agreed} className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-60">Finish</button>
          )}
        </div>
        <Modal
          open={showDone}
          title="Profile Saved"
          onClose={() => { setShowDone(false); navigate('/app'); }}
          onConfirm={() => { setShowDone(false); navigate('/app'); }}
          confirmText="Go to Dashboard"
        >
          Your application profile has been saved successfully.
        </Modal>
      </div>
    </div>
  );
};

export default Onboarding;
