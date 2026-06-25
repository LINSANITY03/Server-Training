'use client';
import { Bell, Shield, User, Palette } from 'lucide-react';

const sections = [
  {
    icon: User, label: 'Profile', desc: 'Name, email, and account details',
    fields: [
      { label: 'Full name', value: 'Jamie Doe', type: 'text' },
      { label: 'Email', value: 'jamie@restaurant.com', type: 'email' },
      { label: 'Role', value: 'Trainee Server', type: 'text' },
    ],
  },
  {
    icon: Bell, label: 'Notifications', desc: 'Session reminders and performance updates',
    toggles: [
      { label: 'Session completion alerts', on: true },
      { label: 'Weekly performance summary', on: true },
      { label: 'New scenario available', on: false },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#F0F5F0' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: '#6B8F7A' }}>Manage your account and preferences</p>
      </div>

      {sections.map(({ icon: Icon, label, desc, fields, toggles }) => (
        <div key={label} className="p-6 rounded-2xl" style={{ background: '#1A3A2A', border: '1px solid rgba(45,122,79,0.2)' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(45,122,79,0.2)' }}>
              <Icon className="w-5 h-5" style={{ color: '#4DB882' }} />
            </div>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: '#F0F5F0' }}>{label}</h3>
              <p className="text-xs" style={{ color: '#6B8F7A' }}>{desc}</p>
            </div>
          </div>

          {fields && (
            <div className="space-y-3">
              {fields.map(f => (
                <div key={f.label}>
                  <label className="block text-xs mb-1.5" style={{ color: '#6B8F7A' }}>{f.label}</label>
                  <input type={f.type} defaultValue={f.value}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: '#0D1F15', border: '1px solid rgba(45,122,79,0.25)', color: '#F0F5F0' }} />
                </div>
              ))}
              <button className="mt-2 px-5 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'linear-gradient(135deg, #2D7A4F, #38966A)', color: '#F0F5F0' }}>
                Save changes
              </button>
            </div>
          )}

          {toggles && (
            <div className="space-y-3">
              {toggles.map(t => (
                <div key={t.label} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#A8E0C1' }}>{t.label}</span>
                  <div className="w-10 h-5 rounded-full relative cursor-pointer transition-colors"
                    style={{ background: t.on ? '#2D7A4F' : 'rgba(45,122,79,0.2)' }}>
                    <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                      style={{ background: '#F0F5F0', left: t.on ? '1.25rem' : '0.125rem' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
