import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, Users2, Settings, Database, LogOut, Shield, Menu, X, Puzzle, Wrench, ShieldCheck, LockKeyhole, Boxes, BookOpen, Calendar, ClipboardList, Store, FileText, GraduationCap, Inbox, UtensilsCrossed, ChevronDown, ChevronRight, UserCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AdminStore } from '../utils/adminStore';

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
  }`;

const AdminLayout: React.FC = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [procureOpen, setProcureOpen] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);
  const [logbookOpen, setLogbookOpen] = useState(false);
  const [membershipOpen, setMembershipOpen] = useState(false);
  const [applicationsOpen, setApplicationsOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  useEffect(() => {
    AdminStore.seed();
    AdminStore.seedMembership();
  }, []);

  useEffect(() => {
    // close sidebar on route change (mobile)
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="md:hidden p-2 rounded-md border border-gray-200" onClick={() => setOpen(true)} aria-label="Open sidebar">
            <Menu size={18} />
          </button>
          <Link to="/admin" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Shield size={18} color="white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-800">Admin Console</div>
            <div className="text-[11px] text-gray-500">NIQS Portal</div>
          </div>
          </Link>
        </div>
        <div className="relative">
          <button onClick={()=>setAvatarOpen(v=>!v)} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
          </button>
          {avatarOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-sm z-50">
              <button onClick={()=>{ setAvatarOpen(false); navigate('/admin/profile'); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50">
                <UserCircle2 size={16}/> Profile
              </button>
              <button onClick={()=>{ setAvatarOpen(false); handleLogout(); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50">
                <LogOut size={16}/> Logout
              </button>
            </div>
          )}
        </div>
      </header>
      <div className="flex">
        {/* Mobile overlay */}
        {open && <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setOpen(false)} />}
        <aside className={`fixed z-50 md:static md:z-auto top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-white border-r border-gray-200 p-4 transition-transform md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="md:hidden flex justify-end mb-2">
            <button onClick={() => setOpen(false)} className="p-2 border rounded-md" aria-label="Close sidebar"><X size={16} /></button>
          </div>
          <nav className="space-y-1">
            <NavLink to="/admin" end className={navItemClass as any}>
              <LayoutGrid size={18} /> Overview
            </NavLink>
            <NavLink to="/admin/users" className={navItemClass as any}>
              <Users2 size={18} /> Staffs
            </NavLink>
            <NavLink to="/admin/logs" className={navItemClass as any}>
              <Database size={18} /> Logs
            </NavLink>
            <button onClick={()=>setAccessOpen(v=>!v)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm mt-4 text-gray-700 hover:bg-gray-50">
              <span className="flex items-center gap-2"><LockKeyhole size={14}/> Access Control</span>
              {accessOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
            </button>
            {accessOpen && (
              <div className="ml-2 space-y-1">
                <NavLink to="/admin/access/modules" className={navItemClass as any}>
                  <Puzzle size={18} /> Modules
                </NavLink>
                <NavLink to="/admin/access/actions" className={navItemClass as any}>
                  <Wrench size={18} /> Actions
                </NavLink>
                <NavLink to="/admin/access/roles" className={navItemClass as any}>
                  <ShieldCheck size={18} /> Roles
                </NavLink>
              </div>
            )}
            <button onClick={()=>setApplicationsOpen(v=>!v)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm mt-4 text-gray-700 hover:bg-gray-50">
              <span className="flex items-center gap-2"><Inbox size={14}/> Applications</span>
              {applicationsOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
            </button>
            {applicationsOpen && (
              <div className="ml-2 space-y-1">
                <NavLink to="/admin/applications" end className={navItemClass as any}>
                  <LayoutGrid size={18} /> Dashboard
                </NavLink>
                <NavLink to="/admin/applications/my" className={navItemClass as any}>
                  <Inbox size={18} /> My Application
                </NavLink>
                <NavLink to="/admin/applications/probationals" className={navItemClass as any}>
                  <Users2 size={18} /> Probationals
                </NavLink>
                <NavLink to="/admin/applications/graduates" className={navItemClass as any}>
                  <GraduationCap size={18} /> Graduates
                </NavLink>
              </div>
            )}
            <NavLink to="/admin/exams" className={navItemClass as any}>
              <ClipboardList size={18} /> Exams
            </NavLink>
            <NavLink to="/admin/events" className={navItemClass as any}>
              <Calendar size={18} /> Events
            </NavLink>
            <button onClick={()=>setManagementOpen(v=>!v)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm mt-4 text-gray-700 hover:bg-gray-50">
              <span className="flex items-center gap-2"><Settings size={14}/> Management</span>
              {managementOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
            </button>
            {managementOpen && (
              <div className="ml-2 space-y-1">
                <NavLink to="/admin/management/departments" className={navItemClass as any}>
                  <Database size={18} /> Departments
                </NavLink>
                <NavLink to="/admin/management/designations" className={navItemClass as any}>
                  <Wrench size={18} /> Designations
                </NavLink>
                <NavLink to="/admin/management/admins" className={navItemClass as any}>
                  <Users2 size={18} /> Admins
                </NavLink>
                <NavLink to="/admin/management/executives" className={navItemClass as any}>
                  <Shield size={18} /> Executive Management
                </NavLink>
              </div>
            )}
            <button onClick={()=>setProcureOpen(v=>!v)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm mt-4 text-gray-700 hover:bg-gray-50">
              <span className="flex items-center gap-2"><Boxes size={14}/> Procurements</span>
              {procureOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
            </button>
            {procureOpen && (
              <div className="ml-2 space-y-1">
                <NavLink to="/admin/procurements" className={navItemClass as any}>
                  <Database size={18} /> Dashboard
                </NavLink>
                <NavLink to="/admin/procurements/vendors" className={navItemClass as any}>
                  <Store size={18} /> Vendors
                </NavLink>
                <NavLink to="/admin/procurements/purchase-orders" className={navItemClass as any}>
                  <ClipboardList size={18} /> Purchase Orders
                </NavLink>
                <NavLink to="/admin/procurements/requisitions" className={navItemClass as any}>
                  <FileText size={18} /> Requisitions
                </NavLink>
              </div>
            )}
            <button onClick={()=>setLogbookOpen(v=>!v)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm mt-4 text-gray-700 hover:bg-gray-50">
              <span className="flex items-center gap-2"><BookOpen size={14}/> Logbook</span>
              {logbookOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
            </button>
            {logbookOpen && (
              <div className="ml-2 space-y-1">
                <NavLink to="/admin/logbook/my-logbook" className={navItemClass as any}>
                  <BookOpen size={18} /> My Logbook
                </NavLink>
                <NavLink to="/admin/logbook/logbooks" className={navItemClass as any}>
                  <BookOpen size={18} /> Logbooks
                </NavLink>
                <NavLink to="/admin/logbook/supervisor-requests" className={navItemClass as any}>
                  <Inbox size={18} /> Supervisor Requests
                </NavLink>
                <NavLink to="/admin/logbook/accessors" className={navItemClass as any}>
                  <ShieldCheck size={18} /> Accessors
                </NavLink>
                <NavLink to="/admin/logbook/diet-management" className={navItemClass as any}>
                  <UtensilsCrossed size={18} /> Diet Management
                </NavLink>
              </div>
            )}
            <button onClick={()=>setMembershipOpen(v=>!v)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm mt-4 text-gray-700 hover:bg-gray-50">
              <span className="flex items-center gap-2"><GraduationCap size={14}/> Membership</span>
              {membershipOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
            </button>
            {membershipOpen && (
              <div className="ml-2 space-y-1">
                <NavLink to="/admin/membership" end className={navItemClass as any}>
                  <LayoutGrid size={18} /> Dashboard
                </NavLink>
                <NavLink to="/admin/membership/probationals" className={navItemClass as any}>
                  <GraduationCap size={18} /> Probationals
                </NavLink>
                <NavLink to="/admin/membership/graduates" className={navItemClass as any}>
                  <GraduationCap size={18} /> Graduates
                </NavLink>
                <NavLink to="/admin/membership/students" className={navItemClass as any}>
                  <GraduationCap size={18} /> Students
                </NavLink>
                <NavLink to="/admin/membership/matured-routes" className={navItemClass as any}>
                  <GraduationCap size={18} /> Matured Routes
                </NavLink>
                <NavLink to="/admin/membership/applications" className={navItemClass as any}>
                  <Inbox size={18} /> Applications
                </NavLink>
                <NavLink to="/admin/membership/members" className={navItemClass as any}>
                  <Users2 size={18} /> Members
                </NavLink>
              </div>
            )}

            <NavLink to="/admin/settings" className={navItemClass as any}>
              <Settings size={18} /> Settings
            </NavLink>
            <NavLink to="/admin/databank" className={navItemClass as any}>
              <Database size={18} /> Databank
            </NavLink>
          </nav>
        </aside>
        <main className="flex-1 p-4 sm:p-6 ml-0 md:ml-0">
          {/* Simple breadcrumbs */}
          <div className="text-xs text-gray-500 mb-4">
            {location.pathname.split('/').filter(Boolean).map((seg, i, arr) => (
              <span key={i}>
                {i > 0 && ' / '} {seg.charAt(0).toUpperCase() + seg.slice(1)}
              </span>
            ))}
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
