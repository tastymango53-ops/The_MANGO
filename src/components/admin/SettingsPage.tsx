
import { Bell, Shield, Zap, Mail, MessageCircle, Info } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Settings</h1>
        <p className="text-slate-400 text-sm mt-0.5">Configure your admin preferences and integrations</p>
      </div>

      {/* Info Card */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p className="font-bold text-amber-800 text-sm">Read-Only Settings</p>
          <p className="text-amber-700 text-sm mt-1 leading-relaxed">
            These settings are currently configured via environment variables and the Supabase dashboard.
            Contact your developer to update integration keys.
          </p>
        </div>
      </div>

      {/* Settings Sections */}
      {[
        {
          title: 'Notifications',
          icon: Bell,
          items: [
            { label: 'Telegram Bot', desc: 'Order status alerts sent via Telegram', icon: MessageCircle, value: 'Active', color: 'text-green-600 bg-green-50' },
            { label: 'Email (EmailJS)', desc: 'Customer confirmation emails on order confirm', icon: Mail, value: 'Active', color: 'text-green-600 bg-green-50' },
          ],
        },
        {
          title: 'Database',
          icon: Zap,
          items: [
            { label: 'Supabase Realtime', desc: 'Live order updates via postgres_changes', icon: Zap, value: 'Connected', color: 'text-green-600 bg-green-50' },
            { label: 'Product Images', desc: 'Stored in Supabase Storage → product-images bucket', icon: Shield, value: 'Enabled', color: 'text-blue-600 bg-blue-50' },
          ],
        },
      ].map((section) => {
        const SectionIcon = section.icon;
        return (
          <div key={section.title} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <SectionIcon className="w-4 h-4 text-amber-500" />
              <h2 className="font-black text-slate-700 text-sm">{section.title}</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {section.items.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div key={item.label} className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center">
                        <ItemIcon className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{item.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.color}`}>{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* App Info */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-amber-200 text-xl">🥭</div>
        <div>
          <p className="font-black text-slate-800">MangoWala Admin Console</p>
          <p className="text-xs text-slate-400 mt-0.5">Built with React + Tailwind + Supabase · v2.0</p>
        </div>
      </div>
    </div>
  );
}
