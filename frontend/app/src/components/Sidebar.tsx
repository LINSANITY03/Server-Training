'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, MessageSquare, TrendingUp, Settings,
  LogOut, Zap, ChevronRight, Server
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'Training', icon: MessageSquare },
  { href: '/performance', label: 'Performance', icon: TrendingUp },
  { href: '/step-service', label: 'Service', icon: Server },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, #0D1F15 0%, #111D16 100%)', borderRight: '1px solid rgba(45,122,79,0.2)' }}>
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: 'rgba(45,122,79,0.2)' }}>
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2D7A4F, #38966A)' }}>
            <Zap className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2"
              style={{ borderColor: '#0D1F15' }} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight" style={{ color: '#F0F5F0' }}>Servox</h1>
            <p className="text-xs" style={{ color: '#38966A' }}>AI Training Platform</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative"
              style={{
                background: active ? 'linear-gradient(135deg, rgba(45,122,79,0.3), rgba(56,150,106,0.1))' : 'transparent',
                color: active ? '#72CC9E' : '#6B8F7A',
                border: active ? '1px solid rgba(45,122,79,0.4)' : '1px solid transparent',
              }}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{label}</span>
              {active && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t" style={{ borderColor: 'rgba(45,122,79,0.2)' }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-2"
          style={{ background: 'rgba(45,122,79,0.1)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #2D7A4F, #5B21B6)', color: '#F0F5F0' }}>
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: '#F0F5F0' }}>Jamie Doe</p>
            <p className="text-xs truncate" style={{ color: '#38966A' }}>Trainee</p>
          </div>
        </div>
        <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors"
          style={{ color: '#6B8F7A' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#F87171')}
          onMouseLeave={e => (e.currentTarget.style.color = '#6B8F7A')}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
