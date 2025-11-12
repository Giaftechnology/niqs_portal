import React, { ChangeEvent, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStore } from '../../utils/adminStore';
import { StaffProfile } from '../../types/admin';
import { getCountries } from '../../data/countries';
import Modal from '../../components/Modal';

const AddStaffWizard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [success, setSuccess] = useState<{open:boolean; userId?: string}>({ open:false });
  const [form, setForm] = useState<Omit<StaffProfile,'id'|'createdAt'>>({
    firstName: '',
    lastName: '',
    middleName: '',
    gender: '',
    dateOfBirth: '',
    maritalStatus: '',
    nationality: '',
    stateOfOrigin: '',
    lga: '',
    contactAddress: '',
    phoneNumber: '',
    emailAddress: '',
    employeeId: '',
    department: '',
    jobTitle: '',
    employmentType: '',
    dateHired: '',
    confirmationDate: '',
    employmentStatus: '',
    supervisor: '',
    workLocation: '',
    basicSalary: '',
    bankName: '',
    accountNumber: '',
    pensionPin: '',
    taxId: '',
    nhfNumber: '',
    paymentMethod: '',
    photoBase64: ''
  });
  const countries = useMemo(() => getCountries(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stateOptions = useMemo(() => {
    const c = countries.find(c => c.name === form.nationality);
    return (c?.states || []).map(s => s.name);
  }, [countries, form.nationality]);
  const lgaOptions = useMemo(() => {
    const c = countries.find(c => c.name === form.nationality);
    const st = (c?.states || []).find(s => s.name === form.stateOfOrigin);
    return st?.lgas || [];
  }, [countries, form.nationality, form.stateOfOrigin]);

  const canNext = useMemo(() => {
    if (step === 1) return !!form.firstName && !!form.lastName && !!form.emailAddress;
    if (step === 2) return true;
    if (step === 3) return true;
    if (step === 4) return true;
    if (step === 5) return true;
    return false;
  }, [step, form]);

  const goBack = () => { if (step === 1) navigate(-1); else setStep(s=>s-1); };
  const goNext = () => { if (step < 5) setStep(s=>s+1); };

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'nationality') {
      setForm(prev => ({ ...prev, nationality: value, stateOfOrigin: '', lga: '' } as any));
      return;
    }
    if (name === 'stateOfOrigin') {
      setForm(prev => ({ ...prev, stateOfOrigin: value, lga: '' } as any));
      return;
    }
    setForm(prev => ({ ...prev, [name]: value } as any));
  };

  const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm(prev => ({ ...prev, photoBase64: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm(prev => ({ ...prev, photoBase64: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const onDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      AdminStore.createStaffProfile(form as any);
      const displayName = [form.firstName, form.middleName, form.lastName].filter(Boolean).join(' ').trim() || form.emailAddress;
      AdminStore.addActivity({ userEmail: form.emailAddress, message: `${displayName} signed up to the portal` });
      const u = AdminStore.listUsers().find(x => x.email.toLowerCase() === form.emailAddress.toLowerCase());
      setSuccess({ open: true, userId: u?.id });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Add Staff</h1>
          <p className="text-sm text-gray-500">Step {step} of 5</p>
        </div>
        <button onClick={()=>navigate(-1)} className="px-3 py-1.5 border rounded-md text-sm">Cancel</button>
      </div>

      <div className="flex items-center gap-2 text-xs">
        {[1,2,3,4,5].map(n => (
          <div key={n} className={`flex-1 h-1.5 rounded ${n<=step?'bg-indigo-500':'bg-gray-200'}`} />
        ))}
      </div>

      <div className="bg-white border rounded-xl p-4">
        {step === 1 && (
          <div className="grid grid-cols-1 gap-4">
            <div className="text-sm font-semibold text-gray-800">Step 1 — Personal Information</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name" name="firstName" value={form.firstName} onChange={onChange} required />
              <Field label="Last Name" name="lastName" value={form.lastName} onChange={onChange} required />
              <Field label="Middle Name" name="middleName" value={form.middleName || ''} onChange={onChange} />
              <Select label="Gender" name="gender" value={form.gender || ''} onChange={onChange} options={['Male','Female','Other']} />
              <Field label="Date of Birth" type="date" name="dateOfBirth" value={form.dateOfBirth || ''} onChange={onChange} />
              <Select label="Marital Status" name="maritalStatus" value={form.maritalStatus || ''} onChange={onChange} options={['Single','Married','Divorced','Widowed','Separated']} />
              <Select label="Nationality" name="nationality" value={form.nationality || ''} onChange={onChange} options={countries.map(c=>c.name)} />
              <Select label="State of Origin" name="stateOfOrigin" value={form.stateOfOrigin || ''} onChange={onChange} options={stateOptions} />
              <Select label="LGA" name="lga" value={form.lga || ''} onChange={onChange} options={lgaOptions} />
              <Field label="Phone Number" name="phoneNumber" value={form.phoneNumber || ''} onChange={onChange} />
              <Field label="Email Address" name="emailAddress" value={form.emailAddress} onChange={onChange} required />
              <TextArea label="Contact Address" name="contactAddress" value={form.contactAddress || ''} onChange={onChange} className="sm:col-span-2" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 gap-4">
            <div className="text-sm font-semibold text-gray-800">Step 2 — Employment Information</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Employee ID" name="employeeId" value={form.employeeId || ''} onChange={onChange} />
              <Field label="Department" name="department" value={form.department || ''} onChange={onChange} />
              <Field label="Job Title" name="jobTitle" value={form.jobTitle || ''} onChange={onChange} />
              <Field label="Employment Type" name="employmentType" value={form.employmentType || ''} onChange={onChange} />
              <Field label="Date Hired" type="date" name="dateHired" value={form.dateHired || ''} onChange={onChange} />
              <Field label="Confirmation Date" type="date" name="confirmationDate" value={form.confirmationDate || ''} onChange={onChange} />
              <Select label="Employment Status" name="employmentStatus" value={form.employmentStatus || ''} onChange={onChange} options={[
                'Active','Probation','Confirmed','Suspended','Terminated','Resigned'
              ]} />
              <Field label="Supervisor / Line Manager" name="supervisor" value={form.supervisor || ''} onChange={onChange} />
              <Field label="Work Location" name="workLocation" value={form.workLocation || ''} onChange={onChange} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 gap-4">
            <div className="text-sm font-semibold text-gray-800">Step 3 — Payroll and Benefits</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Basic Salary" name="basicSalary" value={form.basicSalary || ''} onChange={onChange} />
              <Field label="Bank Name" name="bankName" value={form.bankName || ''} onChange={onChange} />
              <Field label="Account Number" name="accountNumber" value={form.accountNumber || ''} onChange={onChange} />
              <Field label="Pension PIN" name="pensionPin" value={form.pensionPin || ''} onChange={onChange} />
              <Field label="Tax ID (TIN)" name="taxId" value={form.taxId || ''} onChange={onChange} />
              <Field label="NHF Number" name="nhfNumber" value={form.nhfNumber || ''} onChange={onChange} />
              <Select label="Payment Method" name="paymentMethod" value={form.paymentMethod || ''} onChange={onChange} options={[
                'Bank Transfer','Cheque','Cash','Mobile Money'
              ]} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="text-sm font-semibold text-gray-800">Step 4 — Upload Image</div>
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${dragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <div className="text-sm text-gray-600">
                Drag & drop an image here, or <span className="text-indigo-600">click to browse</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1">PNG, JPG up to ~5MB</div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={onUpload} className="hidden" />
            </div>
            {form.photoBase64 && (
              <div className="flex items-center gap-3">
                <img src={form.photoBase64} alt="Preview" className="w-24 h-24 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, photoBase64: '' }))}
                  className="px-3 py-1.5 border rounded-md text-xs"
                >Remove</button>
              </div>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div className="text-sm font-semibold text-gray-800">Review & Submit</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Review label="First Name" value={form.firstName} />
              <Review label="Last Name" value={form.lastName} />
              <Review label="Middle Name" value={form.middleName || '—'} />
              <Review label="Gender" value={form.gender || '—'} />
              <Review label="Date of Birth" value={form.dateOfBirth || '—'} />
              <Review label="Marital Status" value={form.maritalStatus || '—'} />
              <Review label="Nationality" value={form.nationality || '—'} />
              <Review label="State of Origin" value={form.stateOfOrigin || '—'} />
              <Review label="LGA" value={form.lga || '—'} />
              <Review label="Phone Number" value={form.phoneNumber || '—'} />
              <Review label="Email Address" value={form.emailAddress} />
              <div className="sm:col-span-2">
                <div className="text-xs text-gray-500">Contact Address</div>
                <div className="text-gray-800">{form.contactAddress || '—'}</div>
              </div>
              <Review label="Employee ID" value={form.employeeId || '—'} />
              <Review label="Department" value={form.department || '—'} />
              <Review label="Job Title" value={form.jobTitle || '—'} />
              <Review label="Employment Type" value={form.employmentType || '—'} />
              <Review label="Date Hired" value={form.dateHired || '—'} />
              <Review label="Confirmation Date" value={form.confirmationDate || '—'} />
              <Review label="Employment Status" value={form.employmentStatus || '—'} />
              <Review label="Supervisor / Line Manager" value={form.supervisor || '—'} />
              <Review label="Work Location" value={form.workLocation || '—'} />
              <Review label="Basic Salary" value={form.basicSalary || '—'} />
              <Review label="Bank Name" value={form.bankName || '—'} />
              <Review label="Account Number" value={form.accountNumber || '—'} />
              <Review label="Pension PIN" value={form.pensionPin || '—'} />
              <Review label="Tax ID (TIN)" value={form.taxId || '—'} />
              <Review label="NHF Number" value={form.nhfNumber || '—'} />
              <Review label="Payment Method" value={form.paymentMethod || '—'} />
              <div className="sm:col-span-2">
                <div className="text-xs text-gray-500 mb-1">Photo</div>
                {form.photoBase64 ? (
                  <img src={form.photoBase64} alt="Preview" className="w-24 h-24 object-cover rounded" />
                ) : (
                  <div className="text-gray-500">—</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button onClick={goBack} className="px-4 py-2 border rounded-md text-sm">{step===1?'Back':'Previous'}</button>
        {step < 5 ? (
          <button onClick={goNext} disabled={!canNext} className={`px-4 py-2 rounded-md text-sm ${canNext?'bg-indigo-600 text-white':'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Next</button>
        ) : (
          <button onClick={submit} disabled={submitting || !canNext} className={`px-4 py-2 rounded-md text-sm ${(!submitting && canNext)?'bg-indigo-600 text-white':'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>{submitting?'Submitting...':'Submit'}</button>
        )}
      </div>

      <Modal
        open={success.open}
        title="Staff created successfully"
        onClose={()=>{ setSuccess({open:false}); navigate('/admin/users'); }}
        onConfirm={()=>{ const id = success.userId; setSuccess({open:false}); if (id) navigate(`/admin/users/${id}`); else navigate('/admin/users'); }}
        confirmText="View Staff"
      >
        The staff record has been saved.
      </Modal>
    </div>
  );
};

const Field = ({ label, name, value, onChange, type='text', required=false, className='' }: { label: string; name: string; value: string; onChange: (e: any)=>void; type?: string; required?: boolean; className?: string }) => (
  <div className={className}>
    <div className="text-xs font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500"> *</span>}</div>
    <input name={name} value={value} onChange={onChange} type={type} className="w-full px-3 py-2 border rounded-md text-sm bg-white" />
  </div>
);

const TextArea = ({ label, name, value, onChange, className='' }: { label: string; name: string; value: string; onChange: (e: any)=>void; className?: string }) => (
  <div className={className}>
    <div className="text-xs font-medium text-gray-700 mb-1">{label}</div>
    <textarea name={name} value={value} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-md text-sm bg-white" />
  </div>
);

const Select = ({ label, name, value, onChange, options=[] as string[], className='' }: { label: string; name: string; value: string; onChange: (e: any)=>void; options?: string[]; className?: string }) => (
  <div className={className}>
    <div className="text-xs font-medium text-gray-700 mb-1">{label}</div>
    <select name={name} value={value} onChange={onChange} className="w-full px-3 py-2 border rounded-md text-sm bg-white">
      <option value="">Select</option>
      {options.map(op => <option key={op} value={op}>{op}</option>)}
    </select>
  </div>
);

const Review = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div>
    <div className="text-xs text-gray-500">{label}</div>
    <div className="text-gray-800">{value}</div>
  </div>
);

export default AddStaffWizard;
