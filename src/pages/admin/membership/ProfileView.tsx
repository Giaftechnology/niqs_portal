import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const lsRead = <T,>(key: string, fallback: T): T => {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; }
};

const buildDemo = (email: string) => ({
  biodata: {
    first_name: 'John',
    last_name: 'Doe',
    other_names: 'A.',
    title: 'Mr',
    gender: 'Male',
    date_of_birth: '1992-05-12',
    nationality: 'Nigeria',
    state_of_origin: 'Lagos',
    lga: 'Ikeja',
    email: email || 'john.doe@example.com',
    phone: '+234 801 234 5678',
    postal_address: 'P.O. Box 1234, Lagos',
    residential_address: '12 Example Street, Victoria Island, Lagos',
    passport_photo: '',
    signature_file: '',
  },
  academics: [
    { institution_name: 'University of Lagos', certification: 'BSc. Quantity Surveying', year_obtained: '2014' },
    { institution_name: 'Ahmadu Bello University', certification: 'MSc. Construction Management', year_obtained: '2018' },
  ],
  olevels: [
    { exam_type: 'WAEC', reg_number: 'WAEC/2010/123456', subjects: [
      { subject: 'Mathematics', score: 'A1' },
      { subject: 'English', score: 'B2' },
      { subject: 'Physics', score: 'B3' },
      { subject: 'Chemistry', score: 'B3' },
      { subject: 'Geography', score: 'A1' },
    ]},
  ],
  profcerts: [
    { organization_name: 'NIQS', exam_passed: 'Graduate Membership Exam' },
    { organization_name: 'RICS', exam_passed: 'APC (Assessment of Professional Competence)' },
  ],
  work: [
    { organization: 'BuildRight Ltd.', position: 'Junior Quantity Surveyor', start_date: '2015-01-01', end_date: '2017-12-31', responsibilities: 'Cost estimation, BOQ preparation' },
    { organization: 'ConstructCo PLC', position: 'Senior Quantity Surveyor', start_date: '2018-01-01', end_date: '2022-08-31', responsibilities: 'Project cost control, procurement, valuations' },
  ],
  seminars: [
    { title: 'Modern QS Techniques', date: '2021-06-15', organised_by: 'NIQS', cod_units: 3 },
    { title: 'Contracts and Claims', date: '2022-03-20', organised_by: 'RICS', cod_units: 2 },
  ],
  referees: [
    { membership_id: 'NIQS-2010-0001', name: 'Engr. Jane Smith', email: 'jane.smith@niqs.org', phone: '+234 802 000 1111' },
    { membership_id: 'NIQS-2008-0020', name: 'QS. Michael Brown', email: 'michael.brown@niqs.org', phone: '+234 803 222 3333' },
  ],
});

const Section = ({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
    <div className="flex items-center justify-between">
      <div className="text-sm font-semibold text-gray-800">{title}</div>
      {right}
    </div>
    {children}
  </div>
);

const Info = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div>
    <div className="text-xs text-gray-500">{label}</div>
    <div className="font-medium text-gray-800 break-words">{value ?? '—'}</div>
  </div>
);

const ProfileView: React.FC = () => {
  const { email = '' } = useParams();
  const navigate = useNavigate();
  const key = `onboarding_${email}`;
  const data = lsRead<any>(key, null) || buildDemo(email);

  const title = useMemo(() => `Membership Profile – ${email}`, [email]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={()=>navigate(-1)} className="px-2 py-1 border rounded">← Back</button>
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        <button onClick={()=>window.print()} className="ml-auto px-2 py-1 border rounded text-sm">Print</button>
      </div>

      {!data ? (
        <div className="text-sm text-gray-600">No onboarding record found for this email.</div>
      ) : (
        <div className="space-y-5">
          <Section title="Biodata">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Info label="First Name" value={data?.biodata?.first_name} />
              <Info label="Last Name" value={data?.biodata?.last_name} />
              <Info label="Other Names" value={data?.biodata?.other_names} />
              <Info label="Title" value={data?.biodata?.title} />
              <Info label="Gender" value={data?.biodata?.gender} />
              <Info label="Date of Birth" value={data?.biodata?.date_of_birth} />
              <Info label="Nationality" value={data?.biodata?.nationality} />
              <Info label="State of Origin" value={data?.biodata?.state_of_origin} />
              <Info label="LGA" value={data?.biodata?.lga} />
              <Info label="Email" value={data?.biodata?.email} />
              <Info label="Phone" value={data?.biodata?.phone} />
              <Info label="Postal Address" value={data?.biodata?.postal_address} />
              <Info label="Residential Address" value={data?.biodata?.residential_address} />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Passport</div>
                {data?.biodata?.passport_photo ? (
                  <img src={data.biodata.passport_photo} alt="passport" className="h-24 w-24 rounded-full object-cover border" />
                ) : (
                  <div className="text-xs text-gray-400">No passport uploaded</div>
                )}
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Signature</div>
                {data?.biodata?.signature_file ? (
                  <img src={data.biodata.signature_file} alt="signature" className="h-16 object-contain border" />
                ) : (
                  <div className="text-xs text-gray-400">No signature uploaded</div>
                )}
              </div>
            </div>
          </Section>

          <Section title="Academic Qualifications">
            <div className="space-y-2 text-sm">
              {(data?.academics || []).map((a: any, i: number) => (
                <div key={i} className="border rounded p-2">
                  <div className="font-medium">{a?.institution_name || '—'}</div>
                  <div className="text-xs text-gray-600">{a?.certification || '—'} {a?.year_obtained ? `(${a.year_obtained})` : ''}</div>
                </div>
              ))}
              {(!data?.academics || data.academics.length === 0) && (<div className="text-xs text-gray-500">No records.</div>)}
            </div>
          </Section>

          <Section title="O Level Results">
            <div className="space-y-3 text-sm">
              {(data?.olevels || []).map((o: any, i: number) => (
                <div key={i} className="border rounded p-2">
                  <div className="font-medium">{o?.exam_type || '—'} {o?.reg_number ? `— ${o.reg_number}` : ''}</div>
                  <div className="text-xs text-gray-600">{Array.isArray(o?.subjects) ? o.subjects.filter(Boolean).map((s: any) => `${s.subject} (${s.score})`).join(', ') : '—'}</div>
                </div>
              ))}
              {(!data?.olevels || data.olevels.length === 0) && (<div className="text-xs text-gray-500">No records.</div>)}
            </div>
          </Section>

          <Section title="Professional Certifications">
            <div className="space-y-2 text-sm">
              {(data?.profcerts || []).map((p: any, i: number) => (
                <div key={i} className="border rounded p-2">
                  <div className="font-medium">{p?.organization_name || '—'}</div>
                  <div className="text-xs text-gray-600">{p?.exam_passed || '—'}</div>
                </div>
              ))}
              {(!data?.profcerts || data.profcerts.length === 0) && (<div className="text-xs text-gray-500">No records.</div>)}
            </div>
          </Section>

          <Section title="Working Experience">
            <div className="space-y-2 text-sm">
              {(data?.work || []).map((w: any, i: number) => (
                <div key={i} className="border rounded p-2">
                  <div className="font-medium">{w?.organization || '—'} — {w?.position || '—'}</div>
                  <div className="text-xs text-gray-600">{w?.start_date || '—'} - {w?.end_date || '—'}</div>
                  {w?.responsibilities && <div className="mt-1">{w.responsibilities}</div>}
                </div>
              ))}
              {(!data?.work || data.work.length === 0) && (<div className="text-xs text-gray-500">No records.</div>)}
            </div>
          </Section>

          <Section title="Seminars">
            <div className="space-y-2 text-sm">
              {(data?.seminars || []).map((s: any, i: number) => (
                <div key={i} className="border rounded p-2">
                  <div className="font-medium">{s?.title || '—'}</div>
                  <div className="text-xs text-gray-600">{s?.date || '—'} {s?.organised_by ? `— ${s.organised_by}` : ''} {s?.cod_units ? `• COD: ${s.cod_units}` : ''}</div>
                </div>
              ))}
              {(!data?.seminars || data.seminars.length === 0) && (<div className="text-xs text-gray-500">No records.</div>)}
            </div>
          </Section>

          <Section title="Referees">
            <div className="space-y-2 text-sm">
              {(data?.referees || []).map((r: any, i: number) => (
                <div key={i} className="border rounded p-2">
                  <div className="font-medium">{r?.membership_id || '—'}</div>
                  <div className="text-xs text-gray-600">{r?.name || '—'} {r?.email ? `• ${r.email}` : ''} {r?.phone ? `• ${r.phone}` : ''}</div>
                </div>
              ))}
              {(!data?.referees || data.referees.length === 0) && (<div className="text-xs text-gray-500">No records.</div>)}
            </div>
          </Section>

          <Section title="Declaration">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Info label="Declaration Date" value={new Date().toISOString().slice(0,10)} />
              <div>
                <div className="text-xs text-gray-500 mb-1">Signature</div>
                {data?.biodata?.signature_file ? (
                  <img src={data.biodata.signature_file} alt="signature" className="h-16 object-contain border" />
                ) : (
                  <div className="text-xs text-gray-400">No signature uploaded</div>
                )}
              </div>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
