import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Stethoscope, BookOpen, GraduationCap, Clock } from 'lucide-react';

const navItems = [
  { to: '/', label: '首页', icon: BarChart3 },
  { to: '/diagnosis', label: '广告诊断', icon: Stethoscope },
  { to: '/scenarios', label: '场景SOP', icon: BookOpen },
  { to: '/tutorial', label: '新手教程', icon: GraduationCap },
  { to: '/history', label: '历史记录', icon: Clock },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-56 bg-slate-900 text-white flex-shrink-0 flex flex-col">
        <div className="px-5 py-5 border-b border-slate-700">
          <h1 className="text-base font-bold tracking-wide">亚马逊广告波动</h1>
          <p className="text-xs text-slate-400 mt-0.5">应对助手</p>
        </div>
        <nav className="flex-1 py-3">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-slate-700 text-white font-medium'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-slate-700">
          <p className="text-[10px] text-slate-500">v1.0 诊断 + 决策指导</p>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
