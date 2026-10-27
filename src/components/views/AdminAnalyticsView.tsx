import React, { useState } from 'react';
import { AdminLog, User, UserRole } from '../../types/hotel';
import { useHotel } from '../../context/HotelContext';
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  DollarSign,
  FileSpreadsheet,
  Globe,
  Percent,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  UserCog,
  Users,
} from 'lucide-react';

export const AdminAnalyticsView: React.FC = () => {
  const {
    metrics,
    users,
    updateUserRole,
    updateUserStatus,
    logs,
    config,
    updateConfig,
    rooms,
    bookings,
  } = useHotel();

  const [activeAdminTab, setActiveAdminTab] = useState<'analytics' | 'users' | 'security' | 'settings'>('analytics');
  const [logSearch, setLogSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Settings form state
  const [hotelName, setHotelName] = useState(config.hotelName);
  const [tagline, setTagline] = useState(config.tagline);
  const [address, setAddress] = useState(config.address);
  const [phone, setPhone] = useState(config.phone);
  const [email, setEmail] = useState(config.email);
  const [taxRatePercent, setTaxRatePercent] = useState(config.taxRatePercent);
  const [cancellationFreeDays, setCancellationFreeDays] = useState(config.cancellationFreeDays);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // 7-day revenue mock points calculated from bookings
  const dayStats = [
    { day: 'Mon', revenue: 2450, occupancy: 70 },
    { day: 'Tue', revenue: 2890, occupancy: 75 },
    { day: 'Wed', revenue: 3120, occupancy: 80 },
    { day: 'Thu', revenue: 3600, occupancy: 85 },
    { day: 'Fri', revenue: 4500, occupancy: 100 },
    { day: 'Sat', revenue: 4750, occupancy: 100 },
    { day: 'Sun', revenue: 3800, occupancy: 88 },
  ];

  const maxRevenue = Math.max(...dayStats.map((d) => d.revenue));

  const filteredLogs = logs.filter((l) => {
    const q = logSearch.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.user.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q)
    );
  });

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.includes(q);
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      hotelName,
      tagline,
      address,
      phone,
      email,
      taxRatePercent,
      cancellationFreeDays,
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-5">
        <div>
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
            Executive Command Console
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-950">
            Hotel Analytics & Platform Admin
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Monitor real-time hospitality yield (ADR/RevPAR), manage staff roles, audit security activity, and configure system rules.
          </p>
        </div>

        {/* Admin Navigation */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl overflow-x-auto">
          {[
            { id: 'analytics', label: 'Yield & KPIs' },
            { id: 'users', label: `Users (${users.length})` },
            { id: 'security', label: `Audit Log (${logs.length})` },
            { id: 'settings', label: 'Hotel Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                activeAdminTab === tab.id
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Analytics & KPIs */}
      {activeAdminTab === 'analytics' && (
        <div className="space-y-8">
          
          {/* Top KPI Cards with Tabular Numerals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                Total Gross Revenue
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tabular-nums">
                  ${metrics.totalRevenue.toLocaleString()}
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                +14.8% vs last month
              </span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                ADR (Avg Daily Rate)
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tabular-nums">
                  ${metrics.adr}
                </span>
                <span className="text-xs text-neutral-400">/ night</span>
              </div>
              <span className="text-[11px] text-neutral-500 font-medium mt-1 block">
                Across {metrics.totalRooms} room keys
              </span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                RevPAR (Yield Index)
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tabular-nums">
                  ${metrics.revpar}
                </span>
                <span className="text-xs text-neutral-400">/ room</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                Healthy yield ratio
              </span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                Occupancy Rate
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tabular-nums">
                  {metrics.occupancyRate}%
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 font-medium mt-1 block">
                {metrics.occupiedRooms} occupied · {metrics.availableRooms} vacant
              </span>
            </div>
          </div>

          {/* Interactive Chart Section: 7-Day Revenue Trend */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Weekly Revenue & Yield Progression
                </h3>
                <p className="text-xs text-neutral-500">
                  Daily settlement trajectory across standard and peak rates
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                <span className="inline-block w-2.5 h-2.5 bg-neutral-900 rounded-xs" />
                <span>Gross Settlement ($)</span>
              </div>
            </div>

            {/* Custom Bar Graph */}
            <div className="pt-6 pb-2">
              <div className="h-52 flex items-end gap-3 sm:gap-6 justify-between px-2 border-b border-neutral-100">
                {dayStats.map((item, idx) => {
                  const heightPercent = Math.round((item.revenue / maxRevenue) * 100);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="opacity-0 group-hover:opacity-100 transition text-[10px] font-mono font-bold text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded -mb-1">
                        ${item.revenue}
                      </div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full max-w-[48px] bg-neutral-900 rounded-t-lg group-hover:bg-amber-600 transition duration-200 relative"
                      />
                      <span className="text-xs font-semibold text-neutral-600 group-hover:text-neutral-900">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Secondary Stats: Category Breakdown & Payment Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Category Performance */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">
                Room Portfolio Occupancy by Category
              </h3>
              <div className="space-y-3 text-xs">
                {[
                  { name: 'Presidential Penthouse Suites', count: '2 Units', rate: '50% Occupied', color: 'bg-amber-500' },
                  { name: 'Deluxe Ocean View Terraces', count: '2 Units', rate: '50% Occupied', color: 'bg-emerald-500' },
                  { name: 'Executive Double Studios', count: '2 Units', rate: '0% (Turnover)', color: 'bg-blue-500' },
                  { name: 'Superior King Garden Rooms', count: '2 Units', rate: '50% Occupied', color: 'bg-purple-500' },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between font-medium text-neutral-800">
                      <span>{item.name}</span>
                      <span className="text-neutral-500">{item.rate}</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: item.rate.split('%')[0] + '%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Gateway Distribution */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">
                Payment Channel Distribution
              </h3>
              <div className="space-y-3 text-xs">
                {[
                  { channel: 'Visa / Mastercard Credit Card', pct: '68%', amount: '$4,115.80' },
                  { channel: 'UPI / Direct QR Settlement', pct: '18%', amount: '$1,088.00' },
                  { channel: 'Net Banking & Wire Transfers', pct: '14%', amount: '$831.40' },
                ].map((pm, i) => (
                  <div key={i} className="p-3 rounded-xl bg-neutral-50 border border-neutral-150 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-neutral-900 block">{pm.channel}</span>
                      <span className="text-[11px] text-neutral-500">{pm.pct} of all transactions</span>
                    </div>
                    <span className="font-mono font-bold text-neutral-900 tabular-nums">
                      {pm.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tab 2: User Directory & RBAC */}
      {activeAdminTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                User Accounts & Access Control (RBAC)
              </h2>
              <p className="text-xs text-neutral-500">
                Assign roles (Guest, Staff, Manager, Admin) and toggle account activation status.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Filter users by name or email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-200 rounded-lg"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold">
                  <tr>
                    <th className="px-5 py-3">User Profile</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Assigned Role</th>
                    <th className="px-5 py-3">Account Status</th>
                    <th className="px-5 py-3 text-right">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-neutral-50/80 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center text-xs">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-neutral-900 block">{user.name}</span>
                            <span className="text-[11px] text-neutral-400 font-mono">{user.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-neutral-800 block">{user.email}</span>
                        <span className="text-[11px] text-neutral-500 font-mono">{user.phone}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                          className="px-2 py-1 text-xs font-semibold rounded border border-neutral-200 bg-neutral-50 capitalize cursor-pointer"
                        >
                          <option value="guest">Guest</option>
                          <option value="staff">Staff</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => updateUserStatus(user.id, !user.active)}
                          className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                            user.active
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-red-50 text-red-800 border border-red-200'
                          }`}
                        >
                          {user.active ? 'Active' : 'Suspended'}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-neutral-500 text-[11px]">
                        {user.registeredAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Security & Activity Logs */}
      {activeAdminTab === 'security' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Security Audit & Activity Ledger</span>
              </h2>
              <p className="text-xs text-neutral-500">
                Tamper-resistant audit trails tracking operational events, pricing modifications, and logins.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search audit records..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-200 rounded-lg"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold font-mono">
                  <tr>
                    <th className="px-5 py-3">Timestamp</th>
                    <th className="px-5 py-3">Operator</th>
                    <th className="px-5 py-3">Action Type</th>
                    <th className="px-5 py-3">Audit Details</th>
                    <th className="px-5 py-3 text-right">Client IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50/80 transition">
                      <td className="px-5 py-3 text-neutral-500 whitespace-nowrap text-[11px]">
                        {log.timestamp}
                      </td>
                      <td className="px-5 py-3 font-sans font-semibold text-neutral-900">
                        {log.user} <span className="text-[10px] text-neutral-400 font-mono">({log.role})</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-sans text-neutral-700 max-w-md truncate">
                        {log.details}
                      </td>
                      <td className="px-5 py-3 text-right text-neutral-400 text-[11px]">
                        {log.ip}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Platform Settings */}
      {activeAdminTab === 'settings' && (
        <div className="max-w-2xl bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-2xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Hotel & Platform Configuration
            </h2>
            <p className="text-xs text-neutral-500">
              Manage hotel brand particulars, hospitality taxes, and guest stay rules.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Hotel Property Name</label>
              <input
                type="text"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Tagline & Subtitle</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Property Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Reservations Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Occupancy Tax Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.5"
                  value={taxRatePercent}
                  onChange={(e) => setTaxRatePercent(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Free Cancellation Window (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="14"
                  value={cancellationFreeDays}
                  onChange={(e) => setCancellationFreeDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            {settingsSaved && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Hotel configurations updated and logged successfully.</span>
              </div>
            )}

            <div className="pt-3 border-t border-neutral-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-2xs transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
