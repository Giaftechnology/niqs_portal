import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, Users2, GraduationCap, ClipboardList, Briefcase, Banknote, UserCircle2, LogOut, BookOpen, Gavel, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
  }`;

const LogbookGroup: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1">
      <button onClick={()=>setOpen(v=>!v)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
        <span className="flex items-center gap-3">
          <BookOpen size={18} /> Logbook
        </span>
        <ChevronRight size={16} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="pl-8 space-y-1">
          <NavLink to="/app/student-logbook" className={navItemClass as any}>
            <GraduationCap size={18} /> Logbook
          </NavLink>
          <NavLink to="/app/supervisor-logbook" className={navItemClass as any}>
            <ClipboardList size={18} /> Supervised Logbook
          </NavLink>
          <NavLink to="/app/accessor-logbook" className={navItemClass as any}>
            <Briefcase size={18} /> Accessed Logbook
          </NavLink>
        </div>
      )}
    </div>
  );
};

const DashboardLayout: React.FC = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const segments = location.pathname.replace(/^\/app\/?/, '').split('/').filter(Boolean);
  const breadcrumbs = [
    { label: 'Dashboard', to: '/app' },
    ...segments.map((seg, idx) => {
      const to = ['/app', ...segments.slice(0, idx + 1)].join('/');
      const label = seg
        .split('-')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');
      return { label, to };
    }),
  ];

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
        <Link to="/app" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center">
            <BookOpen size={18} color="white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-800">NIQS Logbook</div>
            <div className="text-[11px] text-gray-500">Professional Portal</div>
          </div>
        </Link>
        <div className="flex items-center gap-6">
          <nav aria-label="Breadcrumb" className="hidden md:flex items-center text-xs text-gray-500">
            {breadcrumbs.map((bc, i) => (
              <span key={bc.to} className="flex items-center">
                {i > 0 && <ChevronRight size={14} className="mx-2 text-gray-300" />}
                {i < breadcrumbs.length - 1 ? (
                  <Link to={bc.to} className="hover:text-gray-700">{bc.label}</Link>
                ) : (
                  <span className="text-gray-700">{bc.label}</span>
                )}
              </span>
            ))}
          </nav>
          <div className="text-xs text-gray-500 hidden sm:block">{user?.email}</div>
          <div className="relative group">
            <button className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
              <UserCircle2 className="text-gray-700" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-md p-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition">
              <NavLink to="/profile" className={navItemClass as any}>
                <UserCircle2 size={16} /> Profile
              </NavLink>
              <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="flex">
        <aside className="w-72 bg-white border-r border-gray-200 p-4 min-h-[calc(100vh-4rem)]">
          <nav className="space-y-1" role="menu" aria-label="Main navigation"
            onKeyDown={(e) => {
              const links = Array.from((e.currentTarget as HTMLElement).querySelectorAll('a')) as HTMLAnchorElement[];
              const idx = links.findIndex((el) => el === document.activeElement);
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = links[(idx + 1 + links.length) % links.length];
                next?.focus();
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = links[(idx - 1 + links.length) % links.length];
                prev?.focus();
              }
            }}
          >
            <NavLink to="/app" end className={navItemClass as any}>
              <LayoutGrid size={18} /> Dashboard
            </NavLink>
            {(user?.role === 'admin') && (
              <>
                <NavLink to="/app/admin" className={navItemClass as any}>
                  <Users2 size={18} /> Admin management
                </NavLink>
                <NavLink to="/app/exams" className={navItemClass as any}>
                  <Gavel size={18} /> Exam management
                </NavLink>
                <NavLink to="/app/accounts" className={navItemClass as any}>
                  <Banknote size={18} /> Accounts
                </NavLink>
                <NavLink to="/app/hr" className={navItemClass as any}>
                  <Users2 size={18} /> HR management
                </NavLink>
              </>
            )}
            {/* Logbook group */}
            <LogbookGroup />
          </nav>
        </aside>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
