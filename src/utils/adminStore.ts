import { AdminLogEntry, AdminUser, SupervisorProfile } from '../types/admin';

const USERS_KEY = 'admin_users_v1';
const SUPS_KEY = 'admin_supervisors_v1';
const LOGS_KEY = 'admin_logs_v1';
const MODULES_KEY = 'admin_modules_v1';
const ACTIONS_KEY = 'admin_actions_v1';
const ROLES_KEY = 'admin_roles_v1';
const ACCESSORS_KEY = 'admin_accessors_v1';
const DIETS_KEY = 'admin_diets_v1';
const EXAMS_KEY = 'admin_exams_v1';
const EVENTS_KEY = 'admin_events_v1';
const VENDORS_KEY = 'admin_vendors_v1';
const REQS_KEY = 'admin_requisitions_v1';
const POS_KEY = 'admin_purchase_orders_v1';

const id = () => Math.random().toString(36).slice(2, 10);

export const AdminStore = {
  seed() {
    // Users
    if (!localStorage.getItem(USERS_KEY)) {
      const users: AdminUser[] = [
        { id: 'u1', email: 'admin@niqs.org', name: 'Portal Admin', role: 'admin', active: true },
        { id: 'u2', email: 'student1@niqs.org', name: 'New Student', role: 'student', active: true },
        { id: 'u3', email: 'super1@niqs.org', name: 'Dr. Bello', role: 'supervisor', active: true },
        { id: 'u4', email: 'student2@niqs.org', name: 'Grace Obi', role: 'student', active: true },
      ];
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    // Supervisors
    if (!localStorage.getItem(SUPS_KEY)) {
      const sups: SupervisorProfile[] = [
        { id: 'u3', students: ['student1@niqs.org'] },
      ];
      localStorage.setItem(SUPS_KEY, JSON.stringify(sups));
    }
    // Logs
    if (!localStorage.getItem(LOGS_KEY)) {
      const logs: AdminLogEntry[] = [
        { id: 'l1', studentEmail: 'student1@niqs.org', week: 1, day: 'Monday', text: 'Surveyed plots and recorded data.', status: 'submitted', createdAt: Date.now()-86400000*3 },
        { id: 'l2', studentEmail: 'student1@niqs.org', week: 1, day: 'Tuesday', text: 'Computed quantities with QS tools.', status: 'approved', createdAt: Date.now()-86400000*2 },
        { id: 'l3', studentEmail: 'student2@niqs.org', week: 2, day: 'Wednesday', text: 'Site visit and safety briefing.', status: 'rejected', createdAt: Date.now()-86400000 },
      ];
      localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    }
    // Actions
    if (!localStorage.getItem(ACTIONS_KEY)) {
      const actions = [
        { id: id(), name: 'create', createdAt: new Date('2025-08-17T10:28:42.000Z').toISOString() },
        { id: id(), name: 'assign', createdAt: new Date('2025-08-17T10:31:23.000Z').toISOString() },
        { id: id(), name: 'update', createdAt: new Date('2025-09-02T12:07:22.000Z').toISOString() },
        { id: id(), name: 'delete', createdAt: new Date('2025-09-02T12:07:36.000Z').toISOString() },
        { id: id(), name: 'activate', createdAt: new Date('2025-09-02T12:10:46.000Z').toISOString() },
      ];
      localStorage.setItem(ACTIONS_KEY, JSON.stringify(actions));
    }
    // Modules
    if (!localStorage.getItem(MODULES_KEY)) {
      const modules = [
        'lawyer','service','admin','subservice','unit','request','case','ticket','client','databank',
      ].map((name, i) => ({ id: id(), name, createdAt: new Date(Date.now() - i * 86400000).toISOString() }));
      localStorage.setItem(MODULES_KEY, JSON.stringify(modules));
    }
    // Roles + permissions matrix
    if (!localStorage.getItem(ROLES_KEY)) {
      const roles = [
        { id: id(), name: 'super admin', createdAt: new Date('2025-08-17T10:28:19.000Z').toISOString(), permissions: {} as Record<string, Record<string, boolean>> },
        { id: id(), name: 'secetary', createdAt: new Date('2025-09-02T12:10:03.000Z').toISOString(), permissions: {} as Record<string, Record<string, boolean>> },
        { id: id(), name: 'membership manager', createdAt: new Date('2025-11-06T11:48:58.000Z').toISOString(), permissions: {} as Record<string, Record<string, boolean>> },
      ];
      // default permissions: enable all for super admin
      const modules = JSON.parse(localStorage.getItem(MODULES_KEY) || '[]') as Array<{ id: string; name: string }>;
      const actions = JSON.parse(localStorage.getItem(ACTIONS_KEY) || '[]') as Array<{ id: string; name: string }>;
      const allowAll: Record<string, Record<string, boolean>> = {};
      modules.forEach((m) => {
        allowAll[m.name] = {} as Record<string, boolean>;
        actions.forEach((a) => { allowAll[m.name][a.name] = true; });
      });
      roles[0].permissions = allowAll;
      localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
    }

    // Accessors seed
    if (!localStorage.getItem(ACCESSORS_KEY)) {
      const accessors = [
        { id: id(), name: 'Dr. Adewale', email: 'adewale@niqs.org', active: true, createdAt: new Date().toISOString() },
      ];
      localStorage.setItem(ACCESSORS_KEY, JSON.stringify(accessors));
    }
    // Diets seed
    if (!localStorage.getItem(DIETS_KEY)) {
      const diets = [
        { id: id(), sessionName: '2025 Session', diet: 'Diet 1', year: new Date().getFullYear(), startDate: new Date().toISOString().slice(0,10) },
      ];
      localStorage.setItem(DIETS_KEY, JSON.stringify(diets));
    }
    // Exams seed
    if (!localStorage.getItem(EXAMS_KEY)) {
      const exams = [
        { id: id(), type: 'Foundation', name: 'Measurement I', diet: 'Diet 1', cost: 25000, mode: 'Online', cpd: 5, startDate: new Date().toISOString().slice(0,10), endDate: new Date().toISOString().slice(0,10) },
      ];
      localStorage.setItem(EXAMS_KEY, JSON.stringify(exams));
    }
    // Events seed
    if (!localStorage.getItem(EVENTS_KEY)) {
      const events = [
        { id: id(), name: 'Annual Conference', title: 'Future of QS', tagline: 'Innovate. Measure. Lead.', date: new Date().toISOString().slice(0,10), cost: 0, banner: '' },
      ];
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    }
    // Vendors seed
    if (!localStorage.getItem(VENDORS_KEY)) {
      const vendors = [
        { id: id(), name: 'Acme Supplies', email: 'sales@acme.com', phone: '+2348000000000', address: '42 Broad Street, Lagos', status: 'Pending', createdAt: new Date().toISOString() },
      ];
      localStorage.setItem(VENDORS_KEY, JSON.stringify(vendors));
    }
    // Requisitions seed
    if (!localStorage.getItem(REQS_KEY)) {
      const reqs = [
        { id: id(), title: 'Stationery for Q1', description: 'Pens, papers, markers', department: 'Admin', priority: 'Medium', amount: 100000, createdAt: new Date().toISOString() },
      ];
      localStorage.setItem(REQS_KEY, JSON.stringify(reqs));
    }
    // Purchase Orders seed
    if (!localStorage.getItem(POS_KEY)) {
      const pos = [
        { id: id(), number: 'PO-0001', vendor: 'Acme Supplies', amount: 85000, status: 'Draft', createdAt: new Date().toISOString() },
      ];
      localStorage.setItem(POS_KEY, JSON.stringify(pos));
    }
  },
  // Users
  listUsers(): AdminUser[] {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    try { return JSON.parse(raw) as AdminUser[]; } catch { return []; }
  },
  saveUsers(users: AdminUser[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },
  createUser(user: Omit<AdminUser, 'id'>): AdminUser {
    const all = this.listUsers();
    const u: AdminUser = { id: id(), ...user };
    all.push(u);
    this.saveUsers(all);
    return u;
  },
  updateUser(u: AdminUser) {
    const all = this.listUsers().map((x) => (x.id === u.id ? u : x));
    this.saveUsers(all);
  },
  deleteUser(idStr: string) {
    const all = this.listUsers().filter((x) => x.id !== idStr);
    this.saveUsers(all);
  },

  // Supervisor Users CRUD (profiles in Users table with role='supervisor')
  listSupervisorUsers(): AdminUser[] {
    return this.listUsers().filter(u=>u.role==='supervisor');
  },
  createSupervisor(data: { name: string; email: string; active?: boolean }): AdminUser {
    const all = this.listUsers();
    const u: AdminUser = { id: id(), name: data.name, email: data.email, role: 'supervisor', active: data.active ?? true };
    all.push(u);
    this.saveUsers(all);
    // ensure supervisor profile exists
    const profs = this.listSupervisors();
    if (!profs.find(p=>p.id===u.id)) this.upsertSupervisor({ id: u.id, students: [] });
    return u;
  },
  updateSupervisor(u: AdminUser) {
    if (u.role !== 'supervisor') u.role = 'supervisor';
    this.updateUser(u);
  },
  deleteSupervisor(idStr: string) {
    this.deleteUser(idStr);
    // remove supervisor mapping
    const rest = this.listSupervisors().filter(s=>s.id!==idStr);
    this.saveSupervisors(rest);
  },

  // Student Users CRUD (role='student')
  listStudentUsers(): AdminUser[] { return this.listUsers().filter(u=>u.role==='student'); },
  createStudent(data: { name: string; email: string; active?: boolean }): AdminUser {
    const all = this.listUsers();
    const u: AdminUser = { id: id(), name: data.name, email: data.email, role: 'student', active: data.active ?? true };
    all.push(u);
    this.saveUsers(all);
    return u;
  },
  updateStudent(u: AdminUser) { if (u.role!=='student') u.role='student'; this.updateUser(u); },
  deleteStudent(idStr: string) { this.deleteUser(idStr); },

  // Supervisors
  listSupervisors(): SupervisorProfile[] {
    const raw = localStorage.getItem(SUPS_KEY);
    if (!raw) return [];
    try { return JSON.parse(raw) as SupervisorProfile[]; } catch { return []; }
  },
  saveSupervisors(list: SupervisorProfile[]) {
    localStorage.setItem(SUPS_KEY, JSON.stringify(list));
  },
  upsertSupervisor(sp: SupervisorProfile) {
    const all = this.listSupervisors();
    const idx = all.findIndex((x) => x.id === sp.id);
    if (idx >= 0) all[idx] = sp; else all.push(sp);
    this.saveSupervisors(all);
  },

  // Logs
  listLogs(): AdminLogEntry[] {
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) return [];
    try { return JSON.parse(raw) as AdminLogEntry[]; } catch { return []; }
  },
  saveLogs(list: AdminLogEntry[]) {
    localStorage.setItem(LOGS_KEY, JSON.stringify(list));
  },
  addLog(entry: Omit<AdminLogEntry, 'id' | 'createdAt'>): AdminLogEntry {
    const all = this.listLogs();
    const e: AdminLogEntry = { id: id(), createdAt: Date.now(), ...entry };
    all.push(e);
    this.saveLogs(all);
    return e;
  },
  updateLog(e: AdminLogEntry) {
    const all = this.listLogs().map((x) => (x.id === e.id ? e : x));
    this.saveLogs(all);
  },
  deleteLog(idStr: string) {
    const all = this.listLogs().filter((x) => x.id !== idStr);
    this.saveLogs(all);
  },

  // Modules
  listModules(): Array<{ id: string; name: string; createdAt: string }> {
    try { return JSON.parse(localStorage.getItem(MODULES_KEY) || '[]'); } catch { return []; }
  },
  saveModules(list: Array<{ id: string; name: string; createdAt: string }>) {
    localStorage.setItem(MODULES_KEY, JSON.stringify(list));
  },
  createModule(name: string) {
    const list = this.listModules();
    const item = { id: id(), name, createdAt: new Date().toISOString() };
    list.push(item);
    this.saveModules(list);
    return item;
  },
  updateModule(item: { id: string; name: string; createdAt: string }) {
    const list = this.listModules().map((x) => (x.id === item.id ? item : x));
    this.saveModules(list);
  },
  deleteModule(idStr: string) {
    const list = this.listModules().filter((x) => x.id !== idStr);
    this.saveModules(list);
  },

  // Actions
  listActions(): Array<{ id: string; name: string; createdAt: string }> {
    try { return JSON.parse(localStorage.getItem(ACTIONS_KEY) || '[]'); } catch { return []; }
  },
  saveActions(list: Array<{ id: string; name: string; createdAt: string }>) {
    localStorage.setItem(ACTIONS_KEY, JSON.stringify(list));
  },
  createAction(name: string) {
    const list = this.listActions();
    const item = { id: id(), name, createdAt: new Date().toISOString() };
    list.push(item);
    this.saveActions(list);
    return item;
  },
  updateAction(item: { id: string; name: string; createdAt: string }) {
    const list = this.listActions().map((x) => (x.id === item.id ? item : x));
    this.saveActions(list);
  },
  deleteAction(idStr: string) {
    const list = this.listActions().filter((x) => x.id !== idStr);
    this.saveActions(list);
  },

  // Roles and permissions
  listRoles(): Array<{ id: string; name: string; createdAt: string; permissions: Record<string, Record<string, boolean>> }> {
    try { return JSON.parse(localStorage.getItem(ROLES_KEY) || '[]'); } catch { return []; }
  },
  saveRoles(list: Array<{ id: string; name: string; createdAt: string; permissions: Record<string, Record<string, boolean>> }>) {
    localStorage.setItem(ROLES_KEY, JSON.stringify(list));
  },
  createRole(name: string) {
    const list = this.listRoles();
    const item = { id: id(), name, createdAt: new Date().toISOString(), permissions: {} as Record<string, Record<string, boolean>> };
    this.saveRoles([...list, item]);
    return item;
  },
  updateRole(item: { id: string; name: string; createdAt: string; permissions: Record<string, Record<string, boolean>> }) {
    const list = this.listRoles().map((x) => (x.id === item.id ? item : x));
    this.saveRoles(list);
  },
  deleteRole(idStr: string) {
    const list = this.listRoles().filter((x) => x.id !== idStr);
    this.saveRoles(list);
  },
  togglePermission(roleId: string, moduleName: string, actionName: string, value: boolean) {
    const roles = this.listRoles();
    const idx = roles.findIndex((r) => r.id === roleId);
    if (idx < 0) return;
    const r = roles[idx];
    if (!r.permissions[moduleName]) r.permissions[moduleName] = {} as Record<string, boolean>;
    r.permissions[moduleName][actionName] = value;
    roles[idx] = r;
    this.saveRoles(roles);
  },

  // Accessors
  listAccessors(): Array<{ id: string; name: string; email: string; active: boolean; createdAt: string }> {
    try { return JSON.parse(localStorage.getItem(ACCESSORS_KEY) || '[]'); } catch { return []; }
  },
  saveAccessors(list: Array<{ id: string; name: string; email: string; active: boolean; createdAt: string }>) {
    localStorage.setItem(ACCESSORS_KEY, JSON.stringify(list));
  },
  createAccessor(data: { name: string; email: string }) {
    const list = this.listAccessors();
    const item = { id: id(), name: data.name, email: data.email, active: true, createdAt: new Date().toISOString() };
    list.push(item);
    this.saveAccessors(list);
    return item;
  },
  updateAccessor(item: { id: string; name: string; email: string; active: boolean; createdAt: string }) {
    this.saveAccessors(this.listAccessors().map(x=>x.id===item.id?item:x));
  },
  deleteAccessor(idStr: string) {
    this.saveAccessors(this.listAccessors().filter(x=>x.id!==idStr));
  },

  // Diets
  listDiets(): Array<{ id: string; sessionName: string; diet: string; year: number; startDate: string }> {
    try { return JSON.parse(localStorage.getItem(DIETS_KEY) || '[]'); } catch { return []; }
  },
  saveDiets(list: Array<{ id: string; sessionName: string; diet: string; year: number; startDate: string }>) {
    localStorage.setItem(DIETS_KEY, JSON.stringify(list));
  },
  createDiet(data: { sessionName: string; diet: string; year: number; startDate: string }) {
    const all = this.listDiets();
    const item = { id: id(), ...data };
    all.push(item);
    this.saveDiets(all);
    return item;
  },
  updateDiet(item: { id: string; sessionName: string; diet: string; year: number; startDate: string }) {
    this.saveDiets(this.listDiets().map(x=>x.id===item.id?item:x));
  },
  deleteDiet(idStr: string) {
    this.saveDiets(this.listDiets().filter(x=>x.id!==idStr));
  },

  // Exams
  listExams(): Array<{ id: string; type: string; name: string; diet: string; cost: number; mode: string; cpd: number; startDate: string; endDate: string }> {
    try { return JSON.parse(localStorage.getItem(EXAMS_KEY) || '[]'); } catch { return []; }
  },
  saveExams(list: Array<{ id: string; type: string; name: string; diet: string; cost: number; mode: string; cpd: number; startDate: string; endDate: string }>) {
    localStorage.setItem(EXAMS_KEY, JSON.stringify(list));
  },
  createExam(data: { type: string; name: string; diet: string; cost: number; mode: string; cpd: number; startDate: string; endDate: string }) {
    const all = this.listExams();
    const item = { id: id(), ...data };
    all.push(item);
    this.saveExams(all);
    return item;
  },
  updateExam(item: { id: string; type: string; name: string; diet: string; cost: number; mode: string; cpd: number; startDate: string; endDate: string }) {
    this.saveExams(this.listExams().map(x=>x.id===item.id?item:x));
  },
  deleteExam(idStr: string) {
    this.saveExams(this.listExams().filter(x=>x.id!==idStr));
  },

  // Events
  listEvents(): Array<{ id: string; name: string; title: string; tagline: string; date: string; cost: number; banner: string }> {
    try { return JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]'); } catch { return []; }
  },
  saveEvents(list: Array<{ id: string; name: string; title: string; tagline: string; date: string; cost: number; banner: string }>) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(list));
  },
  createEvent(data: { name: string; title: string; tagline: string; date: string; cost: number; banner: string }) {
    const all = this.listEvents();
    const item = { id: id(), ...data };
    all.push(item);
    this.saveEvents(all);
    return item;
  },
  updateEvent(item: { id: string; name: string; title: string; tagline: string; date: string; cost: number; banner: string }) {
    this.saveEvents(this.listEvents().map(x=>x.id===item.id?item:x));
  },
  deleteEvent(idStr: string) {
    this.saveEvents(this.listEvents().filter(x=>x.id!==idStr));
  },

  // Vendors
  listVendors(): Array<{ id: string; name: string; email: string; phone: string; address: string; status: string; createdAt: string }> {
    try { return JSON.parse(localStorage.getItem(VENDORS_KEY) || '[]'); } catch { return []; }
  },
  saveVendors(list: Array<{ id: string; name: string; email: string; phone: string; address: string; status: string; createdAt: string }>) {
    localStorage.setItem(VENDORS_KEY, JSON.stringify(list));
  },
  createVendor(data: { name: string; email: string; phone: string; address: string; status: string }) {
    const all = this.listVendors();
    const item = { id: id(), createdAt: new Date().toISOString(), ...data };
    all.push(item);
    this.saveVendors(all);
    return item;
  },
  updateVendor(item: { id: string; name: string; email: string; phone: string; address: string; status: string; createdAt: string }) {
    this.saveVendors(this.listVendors().map(x=>x.id===item.id?item:x));
  },
  deleteVendor(idStr: string) {
    this.saveVendors(this.listVendors().filter(x=>x.id!==idStr));
  },

  // Requisitions
  listRequisitions(): Array<{ id: string; title: string; description: string; department: string; priority: 'Low'|'Medium'|'High'; amount: number; status: 'Draft'|'Pending'|'Approved'; createdAt: string }> {
    try {
      const arr = JSON.parse(localStorage.getItem(REQS_KEY) || '[]') as any[];
      // migrate missing status to 'Draft'
      return arr.map((r) => ({ status: 'Draft', ...r }));
    } catch { return []; }
  },
  saveRequisitions(list: Array<{ id: string; title: string; description: string; department: string; priority: 'Low'|'Medium'|'High'; amount: number; status: 'Draft'|'Pending'|'Approved'; createdAt: string }>) {
    localStorage.setItem(REQS_KEY, JSON.stringify(list));
  },
  createRequisition(data: { title: string; description: string; department: string; priority: 'Low'|'Medium'|'High'; amount: number; status?: 'Draft'|'Pending'|'Approved' }) {
    const all = this.listRequisitions();
    const item = { id: id(), createdAt: new Date().toISOString(), status: 'Draft' as const, ...data };
    all.push(item);
    this.saveRequisitions(all);
    return item;
  },
  updateRequisition(item: { id: string; title: string; description: string; department: string; priority: 'Low'|'Medium'|'High'; amount: number; status: 'Draft'|'Pending'|'Approved'; createdAt: string }) {
    this.saveRequisitions(this.listRequisitions().map(x=>x.id===item.id?item:x));
  },
  deleteRequisition(idStr: string) {
    this.saveRequisitions(this.listRequisitions().filter(x=>x.id!==idStr));
  },

  // Purchase Orders
  listPOs(): Array<{ id:string; number:string; vendor:string; amount:number; status:'Draft'|'Sent'|'Received'|'Closed'; createdAt:string }> {
    try { return JSON.parse(localStorage.getItem(POS_KEY) || '[]'); } catch { return []; }
  },
  savePOs(list: Array<{ id:string; number:string; vendor:string; amount:number; status:'Draft'|'Sent'|'Received'|'Closed'; createdAt:string }>) {
    localStorage.setItem(POS_KEY, JSON.stringify(list));
  },
  createPO(data: { number:string; vendor:string; amount:number; status:'Draft'|'Sent'|'Received'|'Closed' }) {
    const all = this.listPOs();
    const item = { id: id(), createdAt: new Date().toISOString(), ...data };
    all.push(item);
    this.savePOs(all);
    return item;
  },
  updatePO(item: { id:string; number:string; vendor:string; amount:number; status:'Draft'|'Sent'|'Received'|'Closed'; createdAt:string }) {
    this.savePOs(this.listPOs().map(x=>x.id===item.id?item:x));
  },
  deletePO(idStr: string) {
    this.savePOs(this.listPOs().filter(x=>x.id!==idStr));
  },
};
