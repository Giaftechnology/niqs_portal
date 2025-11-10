import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, Users2, Settings, Database, LogOut, Shield, Menu, X, Puzzle, Wrench, ShieldCheck, LockKeyhole, Boxes, BookOpen, Calendar, ClipboardList, Store, FileText, GraduationCap, Inbox, UtensilsCrossed, ChevronDown, ChevronRight } from 'lucide-react';
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
  const [logbookOpen, setLogbookOpen] = useState(false);

  useEffect(() => {
    AdminStore.seed();
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
        <div className="flex items-center gap-4">
          <div className="text-xs text-gray-500 hidden sm:block">{user?.email}</div>
          <button onClick={handleLogout} className="px-3 py-1.5 text-sm rounded-md border border-gray-200 hover:bg-gray-50 flex items-center gap-2">
            <LogOut size={16} /> Logout
          </button>
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
              <Users2 size={18} /> Users
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

            <NavLink to="/admin/exams" className={navItemClass as any}>
              <ClipboardList size={18} /> Exams
            </NavLink>
            <NavLink to="/admin/events" className={navItemClass as any}>
              <Calendar size={18} /> Events
            </NavLink>
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
                <NavLink to="/admin/logbook/supervisors" className={navItemClass as any}>
                  <Users2 size={18} /> Supervisors
                </NavLink>
                <NavLink to="/admin/logbook/supervisor-assignments" className={navItemClass as any}>
                  <Users2 size={18} /> Supervisor Assignments
                </NavLink>
                <NavLink to="/admin/logbook/accessors" className={navItemClass as any}>
                  <ShieldCheck size={18} /> Accessors
                </NavLink>
                <NavLink to="/admin/logbook/students" className={navItemClass as any}>
                  <GraduationCap size={18} /> Students
                </NavLink>
                <NavLink to="/admin/logbook/submissions" className={navItemClass as any}>
                  <Inbox size={18} /> Submissions
                </NavLink>
                <NavLink to="/admin/logbook/diet-management" className={navItemClass as any}>
                  <UtensilsCrossed size={18} /> Diet Management
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
