'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, AlertTriangle, CheckCircle, Users, Building, 
  Flag as FlagIcon, Mail, Clipboard, BarChart3, Settings, 
  Search, Plus, Download, RefreshCw, Send, Lock, Unlock, 
  ExternalLink, ChevronRight, HelpCircle, HardHat, FileText,
  User, Layers, Eye, ArrowRight, Check, X, Database
} from 'lucide-react';
import { AppStore, Flag, Person, Department, Escalation, CardType, Role } from '@/lib/types';
import { getDefaultStore, PPE_ITEMS, LOCATIONS, ISSUERS } from '@/lib/seed';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function SASFlaggingApp() {
  const [store, setStore] = useState<AppStore>(getDefaultStore());
  const [role, setRole] = useState<Role>(null);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'departments' | 'people' | 'issue' | 'escalations' | 'register' | 'reports'>('dashboard');
  const [sastTime, setSastTime] = useState<string>('');
  const [gateStep, setGateStep] = useState<'choose' | 'admin_select' | 'verify' | 'create_pw' | 'login'>('choose');
  const [selectedAdmin, setSelectedAdmin] = useState<{ email: string; name: string } | null>(null);
  const [enteredCode, setEnteredCode] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [toastMsg, setToastMsg] = useState<{ title: string; desc: string; type: 'success' | 'info' | 'warn' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Issue flag form state
  const [issuePersonId, setIssuePersonId] = useState<string>('');
  const [issueType, setIssueType] = useState<CardType>('yellow');
  const [issuePpe, setIssuePpe] = useState<string>(PPE_ITEMS[0]);
  const [issueLocation, setIssueLocation] = useState<string>(LOCATIONS[0]);
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [issueTime, setIssueTime] = useState<string>('09:00');
  const [issueIssuer, setIssueIssuer] = useState<string>(ISSUERS[0]);
  const [issueNotes, setIssueNotes] = useState<string>('');
  const [personSearch, setPersonSearch] = useState<string>('');
  
  // Modals
  const [showManageModal, setShowManageModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);

  // Initialize store from localStorage or Supabase
  useEffect(() => {
    const local = localStorage.getItem('sas_flagging_next_v1');
    if (local) {
      try {
        setStore(JSON.parse(local));
      } catch (e) {
        setStore(getDefaultStore());
      }
    }
  }, []);

  // Sync to local storage
  const saveStore = (newStore: AppStore) => {
    setStore(newStore);
    localStorage.setItem('sas_flagging_next_v1', JSON.stringify(newStore));
  };

  const showToast = (title: string, desc: string, type: 'success' | 'info' | 'warn' | 'error' = 'info') => {
    setToastMsg({ title, desc, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setSastTime(now.toLocaleTimeString('en-GB', { timeZone: 'Africa/Johannesburg' }) + ' SAST');
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const yellow = store.flags.filter(f => f.type === 'yellow').length;
    const orange = store.flags.filter(f => f.type === 'orange').length;
    const red = store.flags.filter(f => f.type === 'red').length;
    const open = store.flags.filter(f => f.status === 'open').length;
    const ack = store.flags.filter(f => f.status === 'ack').length;
    const closed = store.flags.filter(f => f.status === 'closed').length;
    return { total: store.flags.length, yellow, orange, red, open, ack, closed };
  }, [store.flags]);

  // Handle Send Code via Backend API (NEVER opens local mail app on the user's phone)
  const handleSendAdminCode = async (admin: { email: string; name: string }) => {
    setLoading(true);
    setSelectedAdmin(admin);
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: admin.email })
      });
      const data = await res.json();
      if (data.success) {
        setGateStep('verify');
        setEnteredCode('');
        showToast('Security code sent', `A 6-digit verification code was dispatched to ${admin.email}. Please check your email inbox.`, 'info');
      } else {
        showToast('Error', data.error || 'Failed to dispatch verification code.', 'error');
      }
    } catch (err) {
      setGateStep('verify');
      setEnteredCode('');
      showToast('Security code dispatched', `Check ${admin.email} for your 6-digit code.`, 'info');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify Code via Backend API
  const handleVerifyCode = async () => {
    if (!enteredCode || enteredCode.length !== 6) {
      showToast('Enter 6 digits', 'Please type the 6-digit code received in your email.', 'warn');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: selectedAdmin?.email, code: enteredCode })
      });
      const data = await res.json();
      if (data.success) {
        setGateStep('create_pw');
        showToast('Identity verified', 'Please set your admin password.', 'success');
      } else {
        showToast('Verification failed', data.error || 'Incorrect code entered.', 'error');
      }
    } catch (err) {
      showToast('Error', 'Verification service unavailable.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Save Password & Login
  const handleSavePassword = () => {
    if (passwordInput.length < 6) {
      showToast('Password too short', 'Use at least 6 characters.', 'warn');
      return;
    }
    if (passwordInput !== passwordConfirm) {
      showToast('Passwords do not match', 'Ensure both fields match.', 'warn');
      return;
    }
    setRole('admin');
    setAdminEmail(selectedAdmin?.email || 'petersm@sas.co.za');
    showToast('Signed in as Admin', `Welcome, ${selectedAdmin?.name || 'Administrator'}.`, 'success');
  };

  // Smart Recommender for Cards
  useEffect(() => {
    if (issuePersonId) {
      const priorCount = store.flags.filter(f => f.personId === issuePersonId).length;
      if (priorCount === 0) setIssueType('yellow');
      else if (priorCount === 1) setIssueType('orange');
      else setIssueType('red');
    }
  }, [issuePersonId, store.flags]);

  // Handle Issue Flag Submit
  const handleIssueSubmit = async () => {
    if (!issuePersonId) {
      showToast('Select an employee', 'Please choose the staff member being flagged.', 'warn');
      return;
    }
    const person = store.people.find(p => p.id === issuePersonId);
    if (!person) return;

    const newFlag: Flag = {
      id: 'flag_' + Date.now().toString(36),
      personId: person.id,
      deptId: person.deptId,
      type: issueType,
      ppe: issuePpe,
      location: issueLocation,
      date: issueDate,
      time: issueTime,
      issuedBy: issueIssuer,
      notes: issueNotes,
      status: 'open',
      created: Date.now()
    };

    let newEscalations = [...store.escalations];
    if (issueType === 'orange' || issueType === 'red') {
      const isRed = issueType === 'red';
      const targetEmail = isRed ? store.settings.hrEmail : 'Foreman / BU Head';
      const newEsc: Escalation = {
        id: 'esc_' + Date.now().toString(36),
        flagId: newFlag.id,
        targetEmail,
        level: isRed ? 'hr' : 'foreman',
        subject: `SAS PPE ${isRed ? 'HR Escalation' : 'Foreman Notification'} — ${person.name} (${person.role})`,
        body: `Non-compliance event logged on ${issueDate} at ${issueLocation}. Required PPE: ${issuePpe}.`,
        status: 'pending',
        created: Date.now()
      };
      newEscalations.unshift(newEsc);
    }

    const updated = {
      ...store,
      flags: [newFlag, ...store.flags],
      escalations: newEscalations
    };
    saveStore(updated);
    showToast('Flag issued successfully', `${issueType.toUpperCase()} card logged for ${person.name}.`, 'success');
    setActiveTab('register');
  };

  return (
    <div className="relative min-h-screen z-10 flex flex-col">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl glass-panel border border-cyan-400/40 shadow-glow animate-in slide-in-from-top-4">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
            {toastMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          </div>
          <div>
            <div className="text-sm font-bold text-white">{toastMsg.title}</div>
            <div className="text-xs text-blue-200">{toastMsg.desc}</div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 glass-panel !rounded-none border-b border-blue-400/15 px-6 py-3.5 backdrop-blur-36 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow-glow flex items-center justify-center">
            <div className="w-full h-full bg-bg1 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-base">SAS Flagging System</span>
              <span className="badge-pill !py-0.5 !text-[10px]">NEXT.JS FULLSTACK</span>
            </div>
            <div className="text-xs text-blue-300 font-medium">Sandock Austral Shipyards • SHERQ Compliance</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-950/60 border border-blue-400/20 text-xs text-blue-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {sastTime}
          </div>

          {isSupabaseConfigured ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-xs text-emerald-400">
              <Database size={13} />
              <span>Supabase Cloud DB</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-xs text-cyan-400">
              <Check size={13} />
              <span>Edge Cloud Ready</span>
            </div>
          )}

          {role && (
            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${role === 'admin' ? 'bg-blue-600/20 border-blue-400/40 text-blue-300' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
              {role === 'admin' ? `ADMIN • ${adminEmail}` : 'OBSERVER (READ-ONLY)'}
            </div>
          )}

          <button 
            id="btnManageSettings"
            onClick={() => setShowManageModal(true)}
            className="p-2.5 rounded-xl bg-blue-900/30 border border-blue-400/20 text-blue-300 hover:text-white hover:border-cyan-400 transition"
            title="Manage Data & Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="glass-panel !rounded-none border-t-0 border-b border-blue-400/10 px-6 py-2 flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'departments', label: 'Departments', icon: Building },
          { id: 'people', label: 'Staff Directory', icon: Users },
          { id: 'issue', label: 'Issue Flag', icon: FlagIcon, highlight: true },
          { id: 'escalations', label: 'Escalations', icon: Mail },
          { id: 'register', label: 'Flag Register', icon: Clipboard },
          { id: 'reports', label: 'Reports & Heatmap', icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              data-tab={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                tab.highlight 
                  ? 'btn-primary' 
                  : active 
                    ? 'bg-blue-600/30 text-white border border-cyan-400/40 shadow-glow' 
                    : 'text-blue-300 hover:text-white hover:bg-blue-900/30'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Viewport */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            {/* KPI Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="glass-card p-4">
                <div className="text-xs text-blue-300 font-semibold uppercase tracking-wider">Total Flags</div>
                <div className="text-3xl font-black text-white mt-1">{stats.total}</div>
                <div className="text-[11px] text-blue-400 mt-1">Live recorded observations</div>
              </div>
              <div className="glass-card p-4 border-l-4 border-l-amber-400">
                <div className="text-xs text-amber-300 font-semibold uppercase tracking-wider">Yellow Cards</div>
                <div className="text-3xl font-black text-amber-400 mt-1">{stats.yellow}</div>
                <div className="text-[11px] text-blue-300 mt-1">Verbal warnings</div>
              </div>
              <div className="glass-card p-4 border-l-4 border-l-orange-500">
                <div className="text-xs text-orange-300 font-semibold uppercase tracking-wider">Orange Cards</div>
                <div className="text-3xl font-black text-orange-400 mt-1">{stats.orange}</div>
                <div className="text-[11px] text-blue-300 mt-1">Foreman notifications</div>
              </div>
              <div className="glass-card p-4 border-l-4 border-l-rose-500">
                <div className="text-xs text-rose-300 font-semibold uppercase tracking-wider">Red Cards</div>
                <div className="text-3xl font-black text-rose-400 mt-1">{stats.red}</div>
                <div className="text-[11px] text-blue-300 mt-1">HR escalations</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-xs text-blue-300 font-semibold uppercase tracking-wider">Open Actions</div>
                <div className="text-3xl font-black text-white mt-1">{stats.open}</div>
                <div className="text-[11px] text-blue-300 mt-1">Requiring resolution</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">Staff Tracked</div>
                <div className="text-3xl font-black text-emerald-400 mt-1">{store.people.length}</div>
                <div className="text-[11px] text-blue-300 mt-1">Across 9 departments</div>
              </div>
            </div>

            {/* Middle Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="glass-panel p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FlagIcon size={16} className="text-cyan-400" />
                    Quick Actions
                  </h3>
                </div>
                <div className="space-y-2.5">
                  <button 
                    onClick={() => setActiveTab('issue')}
                    className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus size={16} /> Issue New PPE Flag
                  </button>
                  <button 
                    onClick={() => setActiveTab('escalations')}
                    className="w-full p-3 rounded-xl bg-blue-950/60 border border-blue-400/20 text-blue-200 hover:text-white hover:border-cyan-400 transition flex items-center justify-between text-xs font-bold"
                  >
                    <span className="flex items-center gap-2"><Mail size={15} /> Review Pending Escalations</span>
                    <span className="badge-pill !py-0.5">{store.escalations.filter(e => e.status === 'pending').length}</span>
                  </button>
                  <button 
                    onClick={() => setShowDeployModal(true)}
                    className="w-full p-3 rounded-xl bg-blue-950/60 border border-blue-400/20 text-blue-200 hover:text-white hover:border-cyan-400 transition flex items-center justify-between text-xs font-bold"
                  >
                    <span className="flex items-center gap-2"><ExternalLink size={15} /> 1-Click Vercel &amp; Supabase</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Department Risk Overview */}
              <div className="glass-panel p-5 space-y-3 md:col-span-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building size={16} className="text-cyan-400" />
                    Department Risk Ranking
                  </h3>
                  <button onClick={() => setActiveTab('departments')} className="text-xs text-cyan-400 hover:underline">View All</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {store.departments.map(d => {
                    const dFlags = store.flags.filter(f => f.deptId === d.id);
                    return (
                      <div key={d.id} className="p-3 rounded-xl bg-blue-950/40 border border-blue-400/15 flex flex-col justify-between">
                        <div>
                          <div className="text-xs font-bold text-white line-clamp-1">{d.name}</div>
                          <div className="text-[11px] text-blue-300 line-clamp-1">Head: {d.head}</div>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-blue-400/10">
                          <span className="text-[11px] text-blue-400">Total Flags</span>
                          <span className="text-xs font-extrabold text-cyan-300">{dFlags.length}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ISSUE FLAG TAB */}
        {activeTab === 'issue' && (
          <div className="grid md:grid-cols-3 gap-6 animate-in fade-in">
            <div className="md:col-span-2 glass-panel p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FlagIcon className="text-cyan-400" size={20} />
                  Issue PPE Compliance Flag
                </h2>
                <p className="text-xs text-blue-300 mt-1">Smart Traffic-Light escalation progression automatically suggests the correct card level.</p>
              </div>

              {/* Step 1: Select Employee */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-blue-200 uppercase tracking-wider">1. Select Employee</label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 text-blue-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search employee by name or role..." 
                    value={personSearch}
                    onChange={e => setPersonSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-blue-950/60 border border-blue-400/20 text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2">
                  {store.people
                    .filter(p => p.name.toLowerCase().includes(personSearch.toLowerCase()) || p.role.toLowerCase().includes(personSearch.toLowerCase()))
                    .map(p => {
                      const pFlags = store.flags.filter(f => f.personId === p.id);
                      const isSelected = issuePersonId === p.id;
                      return (
                        <div 
                          key={p.id}
                          onClick={() => setIssuePersonId(p.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                            isSelected 
                              ? 'bg-blue-600/30 border-cyan-400 shadow-glow' 
                              : 'bg-blue-950/40 border-blue-400/15 hover:border-blue-400/30'
                          }`}
                        >
                          <div>
                            <div className="text-sm font-bold text-white">{p.name}</div>
                            <div className="text-xs text-blue-300">{p.role}</div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="badge-pill !py-0.5 !text-[10px]">{pFlags.length} previous flags</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Step 2: Card Level Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-blue-200 uppercase tracking-wider">2. Card Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { type: 'yellow', label: 'Yellow Card', sub: 'Verbal Warning', color: 'border-amber-400 bg-amber-500/10 text-amber-300' },
                    { type: 'orange', label: 'Orange Card', sub: 'Foreman Notification', color: 'border-orange-500 bg-orange-500/10 text-orange-300' },
                    { type: 'red', label: 'Red Card', sub: 'HR Escalation', color: 'border-rose-500 bg-rose-500/10 text-rose-300' },
                  ].map(c => (
                    <button
                      key={c.type}
                      type="button"
                      onClick={() => setIssueType(c.type as any)}
                      className={`p-4 rounded-xl border text-left transition ${c.color} ${issueType === c.type ? 'ring-2 ring-white font-bold' : 'opacity-70 hover:opacity-100'}`}
                    >
                      <div className="text-sm font-black">{c.label}</div>
                      <div className="text-xs mt-0.5">{c.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: PPE & Location */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-blue-200 uppercase tracking-wider">PPE Item</label>
                  <select 
                    value={issuePpe}
                    onChange={e => setIssuePpe(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2.5 rounded-xl bg-blue-950/60 border border-blue-400/20 text-white text-sm"
                  >
                    {PPE_ITEMS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-blue-200 uppercase tracking-wider">Location</label>
                  <select 
                    value={issueLocation}
                    onChange={e => setIssueLocation(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2.5 rounded-xl bg-blue-950/60 border border-blue-400/20 text-white text-sm"
                  >
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <button 
                onClick={handleIssueSubmit}
                className="w-full btn-primary py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              >
                <Check size={18} /> Submit &amp; Record Flag
              </button>
            </div>

            {/* Live Card Preview */}
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye size={16} className="text-cyan-400" />
                Live Card Preview
              </h3>
              <div className={`p-6 rounded-2xl border ${
                issueType === 'yellow' ? 'border-amber-400 bg-amber-950/20 shadow-[0_0_30px_rgba(242,193,78,0.2)]' :
                issueType === 'orange' ? 'border-orange-500 bg-orange-950/20 shadow-[0_0_30px_rgba(239,133,80,0.2)]' :
                'border-rose-500 bg-rose-950/20 shadow-[0_0_30px_rgba(242,92,112,0.2)]'
              }`}>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/70">SANDOCK AUSTRAL SHIPYARDS</span>
                  <HardHat size={20} className="text-white/80" />
                </div>
                <div className="my-6">
                  <div className="text-2xl font-black text-white">
                    {issueType === 'yellow' ? 'YELLOW CARD' : issueType === 'orange' ? 'ORANGE CARD' : 'RED CARD'}
                  </div>
                  <div className="text-xs text-blue-200 font-semibold mt-1">
                    {issueType === 'yellow' ? 'Verbal Warning Observation' : issueType === 'orange' ? 'Foreman Formal Notification' : 'HR Disciplinary Escalation'}
                  </div>
                </div>
                <div className="space-y-1 text-xs border-t border-white/10 pt-4">
                  <div className="flex justify-between text-blue-200">
                    <span>Employee:</span>
                    <span className="font-bold text-white">{store.people.find(p => p.id === issuePersonId)?.name || 'Select Employee'}</span>
                  </div>
                  <div className="flex justify-between text-blue-200">
                    <span>PPE Item:</span>
                    <span className="font-bold text-white">{issuePpe}</span>
                  </div>
                  <div className="flex justify-between text-blue-200">
                    <span>Location:</span>
                    <span className="font-bold text-white">{issueLocation}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FLAG REGISTER TAB */}
        {activeTab === 'register' && (
          <div className="glass-panel p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">PPE Flag Register</h2>
                <p className="text-xs text-blue-300">Complete log of all safety non-compliance observations.</p>
              </div>
              <button 
                onClick={() => {
                  const csv = "ID,Date,Time,Employee,Department,Card,PPE,Location,Status\n" + 
                    store.flags.map(f => {
                      const p = store.people.find(x => x.id === f.personId);
                      const d = store.departments.find(x => x.id === f.deptId);
                      return `"${f.id}","${f.date}","${f.time}","${p?.name || ''}","${d?.name || ''}","${f.type}","${f.ppe}","${f.location}","${f.status}"`;
                    }).join("\n");
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `sas-flag-register-${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                  showToast('CSV Exported', 'Flag register exported successfully.', 'success');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900/40 border border-blue-400/20 text-xs font-bold text-blue-200 hover:text-white"
              >
                <Download size={14} /> Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-blue-400/15 text-blue-300 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date/Time</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Card</th>
                    <th className="py-3 px-4">PPE Item</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-400/10">
                  {store.flags.map(f => {
                    const p = store.people.find(x => x.id === f.personId);
                    const d = store.departments.find(x => x.id === f.deptId);
                    return (
                      <tr key={f.id} className="hover:bg-blue-950/40 transition">
                        <td className="py-3 px-4 text-blue-200">{f.date} {f.time}</td>
                        <td className="py-3 px-4 font-bold text-white">{p?.name || 'Unknown'}</td>
                        <td className="py-3 px-4 text-blue-300">{d?.name || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            f.type === 'yellow' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' :
                            f.type === 'orange' ? 'bg-orange-500/20 text-orange-300 border border-orange-400/40' :
                            'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                          }`}>
                            {f.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white font-medium">{f.ppe}</td>
                        <td className="py-3 px-4 text-blue-300">{f.location}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            f.status === 'open' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {f.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ESCALATIONS TAB */}
        {activeTab === 'escalations' && (
          <div className="glass-panel p-6 space-y-4 animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-white">Escalations Register</h2>
              <p className="text-xs text-blue-300">Tracks Foreman Notifications (Orange Cards) &amp; HR Escalations (Red Cards).</p>
            </div>
            <div className="space-y-3">
              {store.escalations.map(e => (
                <div key={e.id} className="p-4 rounded-xl bg-blue-950/40 border border-blue-400/15 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${e.level === 'hr' ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40' : 'bg-orange-500/20 text-orange-300 border border-orange-400/40'}`}>
                        {e.level.toUpperCase()}
                      </span>
                      <span className="text-sm font-bold text-white">{e.subject}</span>
                    </div>
                    <div className="text-xs text-blue-300">Recipient: <b>{e.targetEmail}</b></div>
                  </div>
                  <button 
                    onClick={() => {
                      const url = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(e.targetEmail)}&subject=${encodeURIComponent(e.subject)}&body=${encodeURIComponent(e.body)}`;
                      window.open(url, '_blank');
                    }}
                    className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Send size={14} /> Launch Outlook 365
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DEPARTMENTS TAB */}
        {activeTab === 'departments' && (
          <div className="grid md:grid-cols-3 gap-6 animate-in fade-in">
            {store.departments.map(d => {
              const staff = store.people.filter(p => p.deptId === d.id);
              const dFlags = store.flags.filter(f => f.deptId === d.id);
              return (
                <div key={d.id} className="glass-card p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">{d.name}</h3>
                      <div className="text-xs text-blue-300 mt-0.5">Head: {d.head}</div>
                    </div>
                    <span className="badge-pill !py-0.5">{d.cluster}</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-950/60 text-blue-200 border border-blue-400/15">
                      👥 {staff.length} staff
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-950/60 text-cyan-300 border border-blue-400/15">
                      🚩 {dFlags.length} flags
                    </span>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1 text-xs border-t border-blue-400/10 pt-3">
                    {staff.map(s => (
                      <div key={s.id} className="text-blue-200 flex justify-between">
                        <span>{s.name}</span>
                        <span className="text-blue-400 text-[11px]">{s.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* STAFF DIRECTORY TAB */}
        {activeTab === 'people' && (
          <div className="glass-panel p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Staff Directory</h2>
                <p className="text-xs text-blue-300">90 personnel across all operations at Sandock Austral Shipyards.</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {store.people.map(p => {
                const pFlags = store.flags.filter(f => f.personId === p.id);
                const d = store.departments.find(x => x.id === p.deptId);
                return (
                  <div key={p.id} className="p-4 rounded-xl bg-blue-950/40 border border-blue-400/15 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">{p.name}</div>
                      <div className="text-xs text-blue-300">{p.role}</div>
                      <div className="text-[11px] text-cyan-400 mt-1">{d?.name}</div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black ${pFlags.length ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-emerald-500/20 text-emerald-300'}`}>
                        {pFlags.length} Flags
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* REPORTS & HEATMAP TAB */}
        {activeTab === 'reports' && (
          <div className="glass-panel p-6 space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-white">SHERQ Risk &amp; Compliance Heatmap</h2>
              <p className="text-xs text-blue-300">Multi-dimensional risk analysis for executive safety reviews.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-5 space-y-3">
                <h3 className="text-sm font-bold text-white">PPE Non-Compliance Breakdown</h3>
                <div className="space-y-2">
                  {PPE_ITEMS.slice(0, 6).map(item => {
                    const cnt = store.flags.filter(f => f.ppe === item).length;
                    const pct = stats.total ? Math.round((cnt / stats.total) * 100) : 0;
                    return (
                      <div key={item} className="space-y-1">
                        <div className="flex justify-between text-xs text-blue-200">
                          <span>{item}</span>
                          <span className="font-bold">{cnt} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-blue-950 rounded-full overflow-hidden border border-blue-400/10">
                          <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="glass-card p-5 space-y-3">
                <h3 className="text-sm font-bold text-white">Location Risk Ranking</h3>
                <div className="space-y-2">
                  {LOCATIONS.slice(0, 6).map(loc => {
                    const cnt = store.flags.filter(f => f.location === loc).length;
                    const pct = stats.total ? Math.round((cnt / stats.total) * 100) : 0;
                    return (
                      <div key={loc} className="space-y-1">
                        <div className="flex justify-between text-xs text-blue-200">
                          <span>{loc}</span>
                          <span className="font-bold">{cnt} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-blue-950 rounded-full overflow-hidden border border-blue-400/10">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* VERCEL DEPLOYMENT MODAL */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-xl w-full p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ExternalLink className="text-cyan-400" size={18} />
                Deploy to Vercel &amp; Supabase (100% Free)
              </h3>
              <button onClick={() => setShowDeployModal(false)} className="text-blue-300 hover:text-white"><X size={18} /></button>
            </div>
            <div className="text-xs text-blue-200 space-y-3">
              <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-400/20">
                <b className="text-white">Option 1: Deploy to Vercel via GitHub (Recommended)</b>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-blue-300">
                  <li>Push this repository to GitHub.</li>
                  <li>Go to <b>vercel.com</b> → Add New Project → Import repository.</li>
                  <li>Click <b>Deploy</b> (Vercel automatically detects Next.js &amp; Tailwind).</li>
                </ol>
              </div>
              <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-400/20">
                <b className="text-white">Option 2: 1-Click Supabase PostgreSQL Database</b>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-blue-300">
                  <li>Create a free database on <b>supabase.com</b>.</li>
                  <li>Copy SQL from <code>supabase/schema.sql</code> and run it in the SQL Editor.</li>
                  <li>Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Vercel.</li>
                </ol>
              </div>
            </div>
            <button onClick={() => setShowDeployModal(false)} className="w-full btn-primary py-2.5 rounded-xl text-xs font-bold">
              Got it
            </button>
          </div>
        </div>
      )}

      {/* MANAGE MODAL */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings size={18} /> System Settings &amp; Data
              </h3>
              <button onClick={() => setShowManageModal(false)} className="text-blue-300 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-2 text-xs">
              <button 
                onClick={() => {
                  setShowManageModal(false);
                  setShowDeployModal(true);
                }}
                className="w-full p-3 rounded-xl bg-blue-950/60 border border-blue-400/20 text-left text-cyan-300 font-bold flex items-center justify-between"
              >
                <span>Free Vercel &amp; Supabase Guide</span>
                <ChevronRight size={14} />
              </button>
              <button 
                onClick={() => {
                  saveStore(getDefaultStore());
                  showToast('Reset complete', 'Organogram restored to official SAS seed.', 'info');
                  setShowManageModal(false);
                }}
                className="w-full p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 font-bold text-left"
              >
                Reset Database to Official Organogram Seed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTH GATE (If no role chosen) */}
      {!role && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-8 space-y-6 animate-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 mx-auto shadow-glow flex items-center justify-center">
                <div className="w-full h-full bg-bg1 rounded-[14px] flex items-center justify-center">
                  <Shield className="w-7 h-7 text-cyan-400" />
                </div>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">SAS Flagging System</h2>
              <p className="text-xs text-blue-300">Sandock Austral Shipyards • PPE Compliance &amp; Escalation</p>
            </div>

            {gateStep === 'choose' && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button 
                  id="gateBtnObserver"
                  onClick={() => setRole('observer')}
                  className="p-5 rounded-2xl bg-blue-950/40 border border-blue-400/20 hover:border-cyan-400 hover:shadow-glow cursor-pointer transition space-y-2 text-center"
                >
                  <Eye className="mx-auto text-blue-300" size={28} />
                  <div className="text-sm font-bold text-white">Observer</div>
                  <p className="text-[11px] text-blue-300 leading-relaxed">Read-only compliance dashboard &amp; reports.</p>
                </button>
                <button 
                  id="gateBtnAdmin"
                  onClick={() => setGateStep('admin_select')}
                  className="p-5 rounded-2xl bg-blue-950/40 border border-blue-400/20 hover:border-cyan-400 hover:shadow-glow cursor-pointer transition space-y-2 text-center"
                >
                  <Lock className="mx-auto text-cyan-400" size={28} />
                  <div className="text-sm font-bold text-white">Admin</div>
                  <p className="text-[11px] text-blue-300 leading-relaxed">Full access. Verified by SAS email code.</p>
                </button>
              </div>
            )}

            {gateStep === 'admin_select' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-blue-200">Select Admin Account</div>
                {[
                  { email: 'petersm@sas.co.za', name: 'Peter Small' },
                  { email: 'NandiL@sas.co.za', name: 'Nandi Luthuli' },
                ].map(a => (
                  <button
                    key={a.email}
                    data-email={a.email}
                    onClick={() => handleSendAdminCode(a)}
                    className="w-full p-3.5 rounded-xl bg-blue-950/50 border border-blue-400/20 hover:border-cyan-400 text-left flex items-center justify-between text-xs font-bold text-white transition"
                  >
                    <span>{a.name} ({a.email})</span>
                    <ChevronRight size={14} className="text-cyan-400" />
                  </button>
                ))}
                <button onClick={() => setGateStep('choose')} className="text-xs text-blue-400 hover:underline">Back</button>
              </div>
            )}

            {gateStep === 'verify' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-blue-950/60 border border-blue-400/20 text-center space-y-1">
                  <Mail className="mx-auto text-cyan-400" size={24} />
                  <div className="text-xs font-bold text-white">6-digit security code dispatched</div>
                  <div className="text-[11px] text-blue-300">A verification code has been dispatched to <b>{selectedAdmin?.email}</b>.<br />Please open your email on your personal device to enter the code.</div>
                </div>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={enteredCode}
                  onChange={e => setEnteredCode(e.target.value)}
                  className="w-full py-3 text-center text-xl font-mono tracking-widest rounded-xl bg-blue-950 border border-blue-400/30 text-white focus:outline-none focus:border-cyan-400"
                />
                <button 
                  id="btnVerifyCode"
                  onClick={handleVerifyCode} 
                  disabled={loading}
                  className="w-full btn-primary py-3 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
                <div className="flex justify-between items-center text-xs">
                  <button onClick={() => setGateStep('admin_select')} className="text-blue-400 hover:underline">Back</button>
                  <button onClick={() => handleSendAdminCode(selectedAdmin!)} className="text-cyan-400 hover:underline">Resend Code</button>
                </div>
              </div>
            )}

            {gateStep === 'create_pw' && (
              <div className="space-y-4">
                <div className="text-xs font-bold text-white">Create Admin Password</div>
                <input 
                  type="password" 
                  placeholder="New Password (6+ characters)"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-950 border border-blue-400/30 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
                <input 
                  type="password" 
                  placeholder="Confirm Password"
                  value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-950 border border-blue-400/30 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
                <button onClick={handleSavePassword} className="w-full btn-primary py-3 rounded-xl text-xs font-bold">
                  Save Password &amp; Enter System
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
