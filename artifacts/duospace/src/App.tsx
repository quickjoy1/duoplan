import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  Activity as ActivityIcon, ArrowRight, Bell, BookOpen, CalendarDays,
  Check, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Flame, Focus, Home,
  ListTodo, LockKeyhole, LogOut, Moon, NotebookPen, Plus, Search, Settings as SettingsIcon,
  Pencil, Sparkles, Sun, Target, Trash2, X,
} from 'lucide-react';
import {
  getGetAuthSessionQueryKey, getGetDashboardQueryKey, getGetWorkspaceSettingsQueryKey,
  getListTasksQueryKey, getListCalendarEventsQueryKey, getListSubjectsQueryKey,
  getListChaptersQueryKey, getListGoalsQueryKey, getListHabitsQueryKey,
  getListJournalEntriesQueryKey, getListFocusSessionsQueryKey, getListNotificationsQueryKey,
  getListActivityQueryKey, useGetAuthSession, useLoginToWorkspace, useLogoutOfWorkspace,
  useSelectProfile, useGetDashboard, useGetWorkspaceSettings, useUpdateWorkspaceSettings,
  useListTasks, useCreateTask, useUpdateTask, useDeleteTask, useListCalendarEvents,
  useCreateCalendarEvent, useUpdateCalendarEvent, useDeleteCalendarEvent,
  useListSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject,
  useListChapters, useCreateChapter, useUpdateChapter, useDeleteChapter,
  useListGoals, useCreateGoal, useUpdateGoal, useDeleteGoal,
  useListHabits, useCreateHabit, useUpdateHabit, useDeleteHabit, useCreateHabitCheckIn,
  useListJournalEntries, useCreateJournalEntry, useUpdateJournalEntry, useDeleteJournalEntry,
  useListFocusSessions, useCreateFocusSession, useUpdateFocusSession,
  useListNotifications, useMarkNotificationRead, useListActivity,
  useChangeWorkspacePassword, useRevokeWorkspaceSessions,
} from '@workspace/api-client-react';
import type { AuthSession } from '@workspace/api-client-react';
import NotFound from '@/pages/not-found';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import './index.css';

const client = new QueryClient({ defaultOptions: { queries: { staleTime: 20_000, retry: 1 } } });
const routes = [
  { path: '/', label: 'Overview', icon: Home },
  { path: '/tasks', label: 'Tasks', icon: ListTodo },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/academics', label: 'Academics', icon: BookOpen },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/habits', label: 'Habits', icon: Flame },
  { path: '/journal', label: 'Journal', icon: NotebookPen },
  { path: '/focus', label: 'Focus', icon: Focus },
  { path: '/notifications', label: 'Reminders', icon: Bell },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
];

const dateOnly = () => new Date().toISOString().slice(0, 10);
const stamp = (value?: string | null, opts?: Intl.DateTimeFormatOptions) =>
  value ? new Date(value).toLocaleDateString(undefined, opts ?? { month: 'short', day: 'numeric' }) : 'No date';
const niceError = (e: unknown) => e instanceof Error ? e.message : 'Something went wrong. Please try again.';
const applyTheme = (theme: string, systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches) => {
  document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && systemDark));
};

function Button({ children, onClick, kind = 'quiet', type = 'button', disabled = false, testId }: {
  children: React.ReactNode; onClick?: () => void; kind?: 'quiet' | 'primary' | 'danger' | 'outline';
  type?: 'button' | 'submit'; disabled?: boolean; testId?: string;
}) {
  return <button type={type} onClick={onClick} disabled={disabled} data-testid={testId} className={`button button-${kind}`}><span>{children}</span></button>;
}
function PageTitle({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail?: string; action?: React.ReactNode }) {
  return <header className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{detail && <p>{detail}</p>}</div>{action}</header>;
}
function Skeleton({ rows = 3 }: { rows?: number }) {
  return <div className="skeleton-stack" aria-label="Loading"><div className="skeleton skel-heading" />{Array.from({ length: rows }, (_, i) => <div className="skeleton skel-row" key={i} />)}</div>;
}
function QueryState({ loading, error, retry, children }: { loading: boolean; error: unknown; retry: () => void; children: React.ReactNode }) {
  if (loading) return <Skeleton />;
  if (error) return <div className="state-card state-error"><div className="state-icon"><ActivityIcon size={20} /></div><h3>Couldn’t load this view</h3><p>{niceError(error)}</p><Button onClick={retry} kind="outline">Try again</Button></div>;
  return <>{children}</>;
}
function Empty({ title, detail, action }: { title: string; detail: string; action?: React.ReactNode }) {
  return <div className="empty-state"><div className="empty-mark"><Sparkles size={18} /></div><h3>{title}</h3><p>{detail}</p>{action}</div>;
}
function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <label className={`field ${wide ? 'field-wide' : ''}`}><span>{label}</span>{children}</label>;
}
function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`text-input ${props.className ?? ''}`} />;
}
function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`text-input text-area ${props.className ?? ''}`} />;
}
function FormModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true" aria-label={title}><header className="modal-head"><div><span className="eyebrow">A little planning</span><h2>{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close dialog" data-testid="button-close-modal"><X size={18} /></button></header>{children}</section></div>;
}
function Progress({ value, color = 'var(--violet)' }: { value: number; color?: string }) {
  return <div className="progress-track" aria-label={`${value}% complete`}><span style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} /></div>;
}

function WorkspaceGate() {
  const session = useGetAuthSession();
  const settings = useGetWorkspaceSettings({
    query: {
      enabled: session.data?.authenticated === true,
      queryKey: getGetWorkspaceSettingsQueryKey(),
    },
  });
  const login = useLoginToWorkspace();
  const select = useSelectProfile();
  const logout = useLogoutOfWorkspace();
  const qc = useQueryClient();
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [profileBusy, setProfileBusy] = useState(false);
  useEffect(() => {
    const theme = settings.data?.theme;
    if (!theme) return;
    applyTheme(theme);
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = (event: MediaQueryListEvent) => applyTheme('system', event.matches);
    media.addEventListener('change', updateSystemTheme);
    return () => media.removeEventListener('change', updateSystemTheme);
  }, [settings.data?.theme]);
  useEffect(() => {
    if (!session.data?.authenticated || !session.data.selectedProfileId) return;
    const source = new EventSource('/api/events');
    const refreshSharedData = () => { void qc.invalidateQueries(); };
    source.addEventListener('change', refreshSharedData);
    return () => {
      source.removeEventListener('change', refreshSharedData);
      source.close();
    };
  }, [session.data?.authenticated, session.data?.selectedProfileId, qc]);
  const signIn = (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    login.mutate({ data: { password } }, {
      onSuccess: async data => {
        setPassword('');
        await Promise.all([
          qc.invalidateQueries({ queryKey: getGetAuthSessionQueryKey() }),
          qc.invalidateQueries({ queryKey: getGetWorkspaceSettingsQueryKey() }),
        ]);
        if (data.selectedProfileId) await qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      },
      onError: err => setFormError(niceError(err)),
    });
  };
  const chooseProfile = (profileId: string) => {
    setProfileBusy(true);
    select.mutate({ data: { profileId } }, {
      onSuccess: async () => {
        await qc.invalidateQueries();
        setProfileBusy(false);
      },
      onError: err => { setFormError(niceError(err)); setProfileBusy(false); },
    });
  };
  if (session.isLoading) return <div className="entry-page"><div className="entry-shell"><Skeleton rows={2} /></div></div>;
  const auth = session.data;
  if (!auth?.authenticated) return <main className="entry-page">
    <div className="entry-ambient ambient-orb orb-a" /><div className="entry-ambient ambient-orb orb-b" />
    <section className="entry-shell page-enter">
      <div className="brand"><span className="brand-symbol"><span /><span /></span><span>duospace</span></div>
      <div className="entry-copy"><span className="eyebrow">A shared place to begin</span><h1>Study side<br />by side.</h1><p>A little structure for the things you’re working toward — and the life around them.</p></div>
      <form className="entry-form" onSubmit={signIn}>
        <label className="entry-label" htmlFor="workspace-password">Workspace password</label>
        <div className="password-wrap"><LockKeyhole size={17} /><input id="workspace-password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your shared password" required data-testid="input-workspace-password" /></div>
        {formError && <p className="form-error" role="alert" data-testid="text-login-error">{formError}</p>}
        {session.error && <p className="muted-copy">Your shared space is ready when you are.</p>}
        <Button type="submit" kind="primary" disabled={login.isPending} testId="button-enter-workspace">{login.isPending ? 'Opening your space…' : <>Enter workspace <ArrowRight size={16} /></>}</Button>
      </form>
      <div className="entry-foot"><span className="signal-dot" /> Just the two of you. No leaderboards, no noise.</div>
    </section>
  </main>;
  if (!auth.selectedProfileId) return <main className="entry-page"><section className="profile-chooser page-enter">
    <div className="brand"><span className="brand-symbol"><span /><span /></span><span>duospace</span></div>
    <span className="eyebrow">Welcome to {auth.workspaceName}</span><h1>Who’s here?</h1><p>Choose a profile to make this space feel like yours.</p>
    <div className="profile-grid">{auth.profiles.map((profile, i) => <button disabled={profileBusy} className="profile-choice" key={profile.id} onClick={() => chooseProfile(profile.id)} data-testid={`button-select-profile-${profile.id}`}><span className="profile-avatar" style={{ '--profile-accent': profile.accent } as React.CSSProperties}>{profile.avatar || profile.name.slice(0, 1)}</span><strong>{profile.name}</strong><span className="profile-pick">{profileBusy ? 'Opening…' : 'Choose profile'} <ArrowRight size={14} /></span><span className={`profile-line line-${i}`} /></button>)}</div>
    {formError && <p className="form-error" role="alert">{formError}</p>}
  </section></main>;
  return <AppShell
    auth={auth}
    onLogout={() => logout.mutate(undefined, { onSuccess: () => { qc.clear(); } })}
    onSwitchProfile={(profileId) => chooseProfile(profileId)}
  />;
}

function AppShell({ auth, onLogout, onSwitchProfile }: { auth: AuthSession; onLogout: () => void; onSwitchProfile: (profileId: string) => void }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = auth.profiles.find(p => p.id === auth.selectedProfileId);
  const otherProfile = auth.profiles.find(p => p.id !== auth.selectedProfileId);
  return <div className="app-frame">
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <Link href="/" className="brand side-brand" onClick={() => setMobileOpen(false)}><span className="brand-symbol"><span /><span /></span><span>duospace</span></Link>
      <div className="space-label">YOUR SHARED SPACE</div>
      <nav className="main-nav" aria-label="Main navigation">{routes.map(({ path, label, icon: Icon }) => <Link key={path} href={path} onClick={() => setMobileOpen(false)} className={`nav-link ${location === path ? 'nav-active' : ''}`} data-testid={`link-nav-${path.slice(1) || 'overview'}`}><Icon size={17} strokeWidth={1.8} /><span>{label}</span>{label === 'Reminders' && <span className="nav-indicator" />}</Link>)}</nav>
      <div className="sidebar-bottom">
        <div className="sidebar-note"><span className="note-orbit"><Sparkles size={14} /></span><div><strong>Move at your pace.</strong><span>Small steps still count.</span></div></div>
        <div className="sidebar-profile"><span className="mini-avatar" style={{ '--profile-accent': current?.accent } as React.CSSProperties}>{current?.avatar || current?.name.slice(0, 1)}</span><div className="sidebar-person"><strong>{current?.name || 'Study partner'}</strong><span>{auth.workspaceName}</span></div>{otherProfile && <button className="icon-button" title={`Switch to ${otherProfile.name}`} aria-label={`Switch profile to ${otherProfile.name}`} onClick={() => onSwitchProfile(otherProfile.id)} data-testid="button-switch-profile"><Sparkles size={15} /></button>}<button className="icon-button logout-button" title="Leave workspace" aria-label="Leave workspace" onClick={onLogout} data-testid="button-logout"><LogOut size={16} /></button></div>
      </div>
    </aside>
    <div className="app-main">
      <header className="topbar"><button className="mobile-menu icon-button" onClick={() => setMobileOpen(v => !v)} aria-label="Toggle navigation" data-testid="button-mobile-menu"><ListTodo size={18} /></button><div className="breadcrumbs">DuoSpace <span>/</span> {routes.find(r => r.path === location)?.label || 'Overview'}</div><div className="topbar-right"><Link href="/notifications" className="top-icon" aria-label="Notifications" data-testid="link-notifications"><Bell size={17} /><span /></Link><span className="topbar-divider" /><span className="today-label">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span></div></header>
      <main className="page-content"><Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/tasks" component={TasksPage} />
        <Route path="/calendar" component={CalendarPage} />
        <Route path="/academics" component={AcademicsPage} />
        <Route path="/goals" component={GoalsPage} />
        <Route path="/habits" component={HabitsPage} />
        <Route path="/journal" component={JournalPage} />
        <Route path="/focus" component={FocusPage} />
        <Route path="/notifications" component={NotificationsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch></main>
    </div>
  </div>;
}

function DashboardPage() {
  const query = useGetDashboard();
  const activity = useListActivity();
  const data = query.data;
  return <QueryState loading={query.isLoading} error={query.error} retry={() => query.refetch()}><div className="page-enter">
    <PageTitle eyebrow={stamp(data?.date, { weekday: 'long', month: 'long', day: 'numeric' })} title={data?.greeting || 'A good day to begin'} detail="Your shared workspace, at a glance." action={<Link href="/focus" className="button button-primary"><Focus size={16} /> Begin a focus session</Link>} />
    {data && <div className="dashboard-grid">
      <section className="feature-panel glass"><div className="feature-shine" /><div className="feature-top"><span className="feature-icon"><Sparkles size={16} /></span><span className="eyebrow">The rhythm today</span><span className={`workload workload-${data.workload}`}>{data.workload}</span></div><div className="feature-big">{data.tasksDueToday.length.toString().padStart(2, '0')}<span>things in reach</span></div><p className="feature-description">A plan is a guide, not a score. Start wherever feels right.</p><div className="feature-bottom"><span><Clock3 size={15} /> {data.plannedMinutes} planned minutes</span><Link href="/tasks">See today <ArrowRight size={14} /></Link></div></section>
      <section className="metric-panel card"><span className="metric-mark mark-blue"><CheckCircle2 size={18} /></span><span className="metric-label">Tasks completed</span><strong>{data.completedTasks}</strong><span className="metric-caption">shared, not scored</span></section>
      <section className="metric-panel card"><span className="metric-mark mark-violet"><ListTodo size={18} /></span><span className="metric-label">Still open</span><strong>{data.openTasks}</strong><span className="metric-caption">one step at a time</span></section>
      <section className="metric-panel card"><span className="metric-mark mark-cyan"><Focus size={18} /></span><span className="metric-label">Focus this week</span><strong>{Math.floor(data.focusMinutesThisWeek / 60)}<small>h</small> {data.focusMinutesThisWeek % 60}<small>m</small></strong><span className="metric-caption">time well spent</span></section>
      <section className="wide-panel card"><div className="section-head"><div><span className="eyebrow">For today</span><h2>A few things to hold</h2></div><Link href="/tasks" className="text-link">All tasks <ArrowRight size={14} /></Link></div>
        {data.tasksDueToday.length ? <div className="task-list">{data.tasksDueToday.slice(0, 5).map(t => <div className="task-row" key={t.id}><span className={`status-dot ${t.status === 'Completed' ? 'dot-done' : ''}`} /> <div className="task-main"><strong>{t.title}</strong><span>{t.category}{t.dueAt ? ` · ${stamp(t.dueAt)}` : ''}</span></div><span className={`priority priority-${t.priority.toLowerCase()}`}>{t.priority}</span></div>)}</div> : <Empty title="A little breathing room" detail="Nothing is due today. It’s okay to enjoy the space." action={<Link href="/tasks" className="text-link">Add a task <ArrowRight size={14} /></Link>} />}
      </section>
      <section className="side-panel card"><div className="section-head"><div><span className="eyebrow">Your direction</span><h2>Goals in motion</h2></div><Link href="/goals" className="text-link" aria-label="See goals"><ArrowRight size={15} /></Link></div>
        {data.goals.length ? <div className="goal-preview-list">{data.goals.slice(0, 3).map(g => <div className="goal-preview" key={g.id}><div><strong>{g.title}</strong><span>{g.category}</span></div><div className="goal-preview-progress"><Progress value={g.progress} /><small>{g.progress}%</small></div></div>)}</div> : <Empty title="Nothing set in stone" detail="Choose something meaningful to work toward." />}
      </section>
      <section className="wide-panel card activity-panel"><div className="section-head"><div><span className="eyebrow">Little by little</span><h2>Recent activity</h2></div><ActivityIcon size={18} className="subtle-icon" /></div>
        {activity.isLoading ? <div className="skeleton skel-row" /> : activity.error ? <p className="muted-copy">Activity is temporarily unavailable.</p> : activity.data?.items.length ? <div className="activity-list">{activity.data.items.slice(0, 4).map(item => <div className="activity-row" key={item.id}><span className="activity-avatar">{item.profileName?.slice(0, 1) || 'D'}</span><div><strong>{item.description}</strong><span>{item.profileName || 'Workspace'} · {stamp(item.createdAt)}</span></div></div>)}</div> : <Empty title="The story starts here" detail="Shared updates will find a home in this space." />}
      </section>
    </div>}
  </div></QueryState>;
}

function TasksPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Study');
  const [priority, setPriority] = useState('Medium');
  const [dueAt, setDueAt] = useState('');
  const params = { search: search || undefined, status: status ? status as 'Not Started' | 'In Progress' | 'Completed' | 'Cancelled' : undefined };
  const query = useListTasks(params);
  const settings = useGetWorkspaceSettings();
  const create = useCreateTask(); const update = useUpdateTask(); const del = useDeleteTask();
  const qc = useQueryClient();
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: getListTasksQueryKey() }), qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() })]);
  const add = (e: React.FormEvent) => { e.preventDefault(); create.mutate({ data: { title, category, priority: priority as 'Low' | 'Medium' | 'High' | 'Urgent', status: 'Not Started', estimatedMinutes: settings.data?.defaultTaskDuration ?? 30, dueAt: dueAt ? new Date(`${dueAt}T12:00:00`).toISOString() : null } }, { onSuccess: () => { void refresh(); setModal(false); setTitle(''); setDueAt(''); } }); };
  return <div className="page-enter"><PageTitle eyebrow="Plan together" title="Tasks" detail="A shared list, with room for each person’s pace." action={<Button kind="primary" onClick={() => setModal(true)} testId="button-add-task"><Plus size={16} /> New task</Button>} />
    <div className="toolbar card"><label className="search-field"><Search size={16} /><input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Find a task…" aria-label="Search tasks" data-testid="input-search-tasks" /></label><label className="filter-select"><span className="sr-only">Filter by status</span><select value={status} onChange={e => setStatus(e.target.value)} aria-label="Filter tasks by status" data-testid="select-task-status"><option value="">All statuses</option><option>Not Started</option><option>In Progress</option><option>Completed</option><option>Cancelled</option></select></label></div>
    <QueryState loading={query.isLoading} error={query.error} retry={() => query.refetch()}>{query.data?.items.length ? <div className="card task-table"><div className="table-head"><span>Task</span><span>Due</span><span>Priority</span><span>Status</span><span>Manage</span></div>{query.data.items.map(task => <div className="table-row" key={task.id} data-testid={`row-task-${task.id}`}><div className="task-table-name"><span className={`status-dot ${task.status === 'Completed' ? 'dot-done' : ''}`} /><div><strong>{task.title}</strong><span>{task.category}{task.description ? ` · ${task.description}` : ''}</span></div></div><span className="table-date">{stamp(task.dueAt)}</span><span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span><select className="status-select" aria-label={`Status for ${task.title}`} value={task.status} onChange={e => update.mutate({ taskId: task.id, data: { status: e.target.value as 'Not Started' | 'In Progress' | 'Completed' | 'Cancelled' } }, { onSuccess: () => void refresh() })} data-testid={`select-task-status-${task.id}`}><option>Not Started</option><option>In Progress</option><option>Completed</option><option>Cancelled</option></select><button className="icon-button delete-button" onClick={() => { if (confirm(`Remove “${task.title}” from shared tasks?`)) del.mutate({ taskId: task.id }, { onSuccess: () => void refresh() }); }} aria-label={`Delete ${task.title}`} data-testid={`button-delete-task-${task.id}`}><Trash2 size={15} /></button></div>)}</div> : <Empty title="An uncluttered list" detail={search || status ? 'Nothing matches those filters. Try another search.' : 'Add one small next step and make it easier to begin.'} action={!search && !status ? <Button kind="outline" onClick={() => setModal(true)}><Plus size={15} /> Add a task</Button> : undefined} />}</QueryState>
    {modal && <FormModal title="Add a shared task" onClose={() => setModal(false)}><form className="form-grid" onSubmit={add}><Field label="What needs doing?"><TextInput value={title} onChange={e => setTitle(e.target.value)} required maxLength={200} autoFocus placeholder="e.g. Review vectors" data-testid="input-task-title" /></Field><Field label="Category"><select className="text-input" value={category} onChange={e => setCategory(e.target.value)}><option>Study</option><option>Personal</option><option>Routine</option><option>Other</option></select></Field><Field label="Priority"><select className="text-input" value={priority} onChange={e => setPriority(e.target.value)}><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select></Field><Field label="Due date"><TextInput type="date" value={dueAt} onChange={e => setDueAt(e.target.value)} /></Field><div className="form-actions"><Button kind="outline" onClick={() => setModal(false)}>Cancel</Button><Button kind="primary" type="submit" disabled={create.isPending}>{create.isPending ? 'Saving…' : 'Add task'}</Button></div>{create.error && <p className="form-error">{niceError(create.error)}</p>}</form></FormModal>}
  </div>;
}

function CalendarPage() {
  const [month, setMonth] = useState(new Date());
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(dateOnly());
  const [category, setCategory] = useState('Study');
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const params = { from: start.toISOString(), to: new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59).toISOString() };
  const query = useListCalendarEvents(params);
  const create = useCreateCalendarEvent(); const update = useUpdateCalendarEvent(); const del = useDeleteCalendarEvent(); const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: getListCalendarEventsQueryKey() });
  const events = query.data?.items ?? [];
  const cells: Array<{ empty: boolean; key: string; day?: number }> = Array.from({ length: start.getDay() }, (_, i) => ({ empty: true, key: `e${i}` })).concat(Array.from({ length: end.getDate() }, (_, i) => ({ empty: false, day: i + 1, key: `d${i + 1}` })));
  const add = (e: React.FormEvent) => { e.preventDefault(); const startAt = new Date(`${date}T09:00:00`); create.mutate({ data: { title, category, startAt: startAt.toISOString(), endAt: new Date(startAt.getTime() + 60 * 60_000).toISOString(), allDay: false } }, { onSuccess: () => { void refresh(); setModal(false); setTitle(''); } }); };
  return <div className="page-enter"><PageTitle eyebrow="Make room for what matters" title="Calendar" detail="Your plans, deadlines, and shared moments." action={<Button kind="primary" onClick={() => setModal(true)}><Plus size={16} /> Add event</Button>} />
    <QueryState loading={query.isLoading} error={query.error} retry={() => query.refetch()}><div className="calendar-layout"><section className="card calendar-card"><div className="calendar-controls"><div><span className="eyebrow">MONTHLY VIEW</span><h2>{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2></div><div className="month-buttons"><button className="icon-button" aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={18} /></button><button className="icon-button" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={18} /></button></div></div><div className="calendar-grid">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div className="calendar-weekday" key={day}>{day}</div>)}{cells.map(cell => cell.empty ? <div key={cell.key} className="calendar-day calendar-empty" /> : <div key={cell.key} className={`calendar-day ${cell.day === new Date().getDate() && month.getMonth() === new Date().getMonth() ? 'calendar-today' : ''}`}><span>{cell.day}</span>{events.filter(ev => new Date(ev.startAt).getDate() === cell.day).slice(0, 2).map(ev => <button className="event-chip" key={ev.id} onClick={() => { const title = prompt('Edit event title', ev.title); if (title?.trim()) update.mutate({ eventId: ev.id, data: { title: title.trim() } }, { onSuccess: () => void refresh() }); }} title={ev.title} data-testid={`event-${ev.id}`}>{ev.title}</button>)}</div>)}</div></section><aside className="card agenda-panel"><div className="section-head"><div><span className="eyebrow">IN THIS MONTH</span><h2>Agenda</h2></div><CalendarDays size={18} className="subtle-icon" /></div>{events.length ? <div className="agenda-list">{events.sort((a,b) => a.startAt.localeCompare(b.startAt)).map(ev => <article className="agenda-item" key={ev.id}><span className="agenda-date">{new Date(ev.startAt).getDate()}</span><div className="agenda-info"><strong>{ev.title}</strong><span>{stamp(ev.startAt, { weekday: 'short', month: 'short', day: 'numeric' })} · {ev.category}</span></div><button className="icon-button delete-button" aria-label={`Delete ${ev.title}`} onClick={() => { if (confirm(`Delete “${ev.title}”?`)) del.mutate({ eventId: ev.id }, { onSuccess: () => void refresh() }); }}><Trash2 size={14} /></button></article>)}</div> : <Empty title="Open dates ahead" detail="Your events will settle in here." />}</aside></div></QueryState>
    {modal && <FormModal title="Add to the calendar" onClose={() => setModal(false)}><form className="form-grid" onSubmit={add}><Field label="Event name"><TextInput value={title} onChange={e => setTitle(e.target.value)} required data-testid="input-event-title" /></Field><Field label="Date"><TextInput type="date" value={date} onChange={e => setDate(e.target.value)} required /></Field><Field label="Category"><select className="text-input" value={category} onChange={e => setCategory(e.target.value)}><option>Study</option><option>Personal</option><option>School</option><option>Other</option></select></Field><div className="form-actions"><Button kind="outline" onClick={() => setModal(false)}>Cancel</Button><Button kind="primary" type="submit" disabled={create.isPending}>Save event</Button></div>{create.error && <p className="form-error">{niceError(create.error)}</p>}</form></FormModal>}
  </div>;
}

function AcademicsPage() {
  const subjects = useListSubjects(); const chapters = useListChapters();
  const createSubject = useCreateSubject(); const updateSubject = useUpdateSubject(); const deleteSubject = useDeleteSubject();
  const createChapter = useCreateChapter(); const updateChapter = useUpdateChapter(); const deleteChapter = useDeleteChapter();
  const qc = useQueryClient(); const [adding, setAdding] = useState<'subject' | 'chapter' | ''>(''); const [name, setName] = useState(''); const [chapterTitle, setChapterTitle] = useState(''); const [subjectId, setSubjectId] = useState('');
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: getListSubjectsQueryKey() }), qc.invalidateQueries({ queryKey: getListChaptersQueryKey() })]);
  const addSubject = (e: React.FormEvent) => { e.preventDefault(); createSubject.mutate({ data: { name, color: '#9380ff' } }, { onSuccess: () => { void refresh(); setName(''); setAdding(''); } }); };
  const addChapter = (e: React.FormEvent) => { e.preventDefault(); createChapter.mutate({ data: { subjectId, title: chapterTitle, status: 'Not Started' } }, { onSuccess: () => { void refresh(); setChapterTitle(''); setAdding(''); } }); };
  return <div className="page-enter"><PageTitle eyebrow="Learn without the rush" title="Academics" detail="Subjects, chapters, and the progress that belongs to you." action={<Button kind="primary" onClick={() => setAdding('subject')}><Plus size={16} /> Add subject</Button>} />
    <QueryState loading={subjects.isLoading || chapters.isLoading} error={subjects.error || chapters.error} retry={() => { void subjects.refetch(); void chapters.refetch(); }}><div className="subject-grid">{subjects.data?.items.length ? subjects.data.items.map((subject, i) => { const group = chapters.data?.items.filter(ch => ch.subjectId === subject.id) ?? []; const percent = subject.chapterCount ? Math.round(subject.completedCount / subject.chapterCount * 100) : 0; return <section className="subject-card card" key={subject.id} style={{ '--subject-color': subject.color } as React.CSSProperties}><div className="subject-heading"><span className={`subject-symbol subject-symbol-${i % 4}`}><BookOpen size={19} /></span><div><h2>{subject.name}</h2><span>{subject.chapterCount} chapters · {subject.completedCount} revised</span></div><button className="icon-button" onClick={() => { const name = prompt('Rename subject', subject.name); if (name?.trim()) updateSubject.mutate({ subjectId: subject.id, data: { name: name.trim() } }, { onSuccess: () => void refresh() }); }} aria-label={`Rename ${subject.name}`} data-testid={`button-rename-subject-${subject.id}`}><Pencil size={14} /></button><button className="icon-button delete-button" onClick={() => { if (confirm(`Remove ${subject.name} and its chapters?`)) deleteSubject.mutate({ subjectId: subject.id }, { onSuccess: () => void refresh() }); }} aria-label={`Delete ${subject.name}`}><Trash2 size={15} /></button></div><div className="subject-progress"><Progress value={percent} color={subject.color} /><span>{percent}%</span></div><div className="chapter-list">{group.length ? group.map(ch => <div className="chapter-row" key={ch.id}><button className={`chapter-check ${ch.status === 'Revised' ? 'chapter-checked' : ''}`} aria-label={`Mark ${ch.title} ${ch.status === 'Revised' ? 'learning' : 'revised'}`} onClick={() => updateChapter.mutate({ chapterId: ch.id, data: { status: ch.status === 'Revised' ? 'Learning' : 'Revised' } }, { onSuccess: () => void refresh() })}>{ch.status === 'Revised' && <Check size={12} />}</button><div className="chapter-copy"><strong>{ch.title}</strong><span>{ch.status}</span></div><button className="icon-button delete-button" aria-label={`Remove ${ch.title}`} onClick={() => deleteChapter.mutate({ chapterId: ch.id }, { onSuccess: () => void refresh() })}><X size={14} /></button></div>) : <p className="muted-copy chapter-none">Add a chapter when you’re ready to break it down.</p>}</div><button className="add-chapter" onClick={() => { setSubjectId(subject.id); setAdding('chapter'); }}><Plus size={14} /> Add chapter</button></section>; }) : <Empty title="Make a home for your subjects" detail="Add the subjects you’re studying, then break them into chapters." action={<Button kind="outline" onClick={() => setAdding('subject')}><Plus size={15} /> Add subject</Button>} />}</div></QueryState>
    {adding && <FormModal title={adding === 'subject' ? 'Add a subject' : 'Add a chapter'} onClose={() => setAdding('')}><form className="form-grid" onSubmit={adding === 'subject' ? addSubject : addChapter}><Field label={adding === 'subject' ? 'Subject name' : 'Chapter title'}><TextInput autoFocus required value={adding === 'subject' ? name : chapterTitle} onChange={e => adding === 'subject' ? setName(e.target.value) : setChapterTitle(e.target.value)} data-testid="input-academic-name" /></Field>{adding === 'chapter' && <Field label="Subject"><select className="text-input" required value={subjectId} onChange={e => setSubjectId(e.target.value)}>{subjects.data?.items.map(s => <option value={s.id} key={s.id}>{s.name}</option>)}</select></Field>}<div className="form-actions"><Button kind="outline" onClick={() => setAdding('')}>Cancel</Button><Button kind="primary" type="submit">Save</Button></div></form></FormModal>}
  </div>;
}

function GoalsPage() {
  const query = useListGoals(); const create = useCreateGoal(); const update = useUpdateGoal(); const del = useDeleteGoal(); const qc = useQueryClient();
  const [modal, setModal] = useState(false); const [title, setTitle] = useState(''); const [category, setCategory] = useState('Study'); const [description, setDescription] = useState(''); const [targetDate, setTargetDate] = useState('');
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: getListGoalsQueryKey() }), qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() })]);
  const add = (e: React.FormEvent) => { e.preventDefault(); create.mutate({ data: { title, category, description: description || null, targetDate: targetDate || null, progress: 0 } }, { onSuccess: () => { void refresh(); setModal(false); setTitle(''); setDescription(''); } }); };
  return <div className="page-enter"><PageTitle eyebrow="A direction, not a deadline" title="Goals" detail="Shared intentions, revisited when you need them." action={<Button kind="primary" onClick={() => setModal(true)}><Plus size={16} /> Add a goal</Button>} /><QueryState loading={query.isLoading} error={query.error} retry={() => query.refetch()}>{query.data?.items.length ? <div className="goal-grid">{query.data.items.map((goal, i) => <article className="goal-card card" key={goal.id}><div className="goal-card-top"><span className={`goal-icon goal-icon-${i % 3}`}><Target size={18} /></span><span className="eyebrow">{goal.category}</span><button className="icon-button delete-button" aria-label={`Delete ${goal.title}`} onClick={() => { if (confirm(`Remove goal “${goal.title}”?`)) del.mutate({ goalId: goal.id }, { onSuccess: () => void refresh() }); }}><Trash2 size={15} /></button></div><h2>{goal.title}</h2>{goal.description && <p>{goal.description}</p>}<div className="goal-target">{goal.targetDate ? `Target · ${stamp(goal.targetDate)}` : 'No target date'}</div><div className="goal-percent"><strong>{goal.progress}<small>%</small></strong><span>in its own time</span></div><Progress value={goal.progress} /><div className="goal-control"><span>Progress</span><input type="range" min="0" max="100" step="5" value={goal.progress} aria-label={`Progress for ${goal.title}`} onChange={e => update.mutate({ goalId: goal.id, data: { progress: Number(e.target.value) } }, { onSuccess: () => void refresh() })} data-testid={`input-goal-progress-${goal.id}`} /></div></article>)}</div> : <Empty title="Choose something worth tending" detail="A goal can be a small shared milestone or a longer horizon." action={<Button kind="outline" onClick={() => setModal(true)}><Plus size={15} /> Add a goal</Button>} />}</QueryState>{modal && <FormModal title="Set a shared goal" onClose={() => setModal(false)}><form className="form-grid" onSubmit={add}><Field label="What are you working toward?"><TextInput value={title} onChange={e => setTitle(e.target.value)} required maxLength={200} autoFocus data-testid="input-goal-title" /></Field><Field label="Category"><select className="text-input" value={category} onChange={e => setCategory(e.target.value)}><option>Study</option><option>Personal</option><option>Wellbeing</option><option>Other</option></select></Field><Field label="A little more context" wide><TextArea value={description} onChange={e => setDescription(e.target.value)} rows={3} /></Field><Field label="Target date"><TextInput type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} /></Field><div className="form-actions"><Button kind="outline" onClick={() => setModal(false)}>Cancel</Button><Button kind="primary" type="submit" disabled={create.isPending}>Save goal</Button></div></form></FormModal>}</div>;
}

function HabitsPage() {
  const query = useListHabits(); const create = useCreateHabit(); const update = useUpdateHabit(); const del = useDeleteHabit(); const checkin = useCreateHabitCheckIn(); const qc = useQueryClient();
  const [title, setTitle] = useState(''); const [modal, setModal] = useState(false);
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: getListHabitsQueryKey() }), qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() })]);
  const add = (e: React.FormEvent) => { e.preventDefault(); create.mutate({ data: { title, frequency: 'Weekly', targetDays: [1, 2, 3, 4, 5] } }, { onSuccess: () => { void refresh(); setTitle(''); setModal(false); } }); };
  const today = dateOnly(); const weekday = (new Date().getDay() + 6) % 7;
  return <div className="page-enter"><PageTitle eyebrow="Routines, with room to flex" title="Habits" detail="Check in when it helps. There’s no streak to protect." action={<Button kind="primary" onClick={() => setModal(true)}><Plus size={16} /> Add routine</Button>} /><QueryState loading={query.isLoading} error={query.error} retry={() => query.refetch()}>{query.data?.items.length ? <div className="habit-list">{query.data.items.map(habit => { const completed = habit.checkIns.includes(today); return <article className="habit-card card" key={habit.id}><div className="habit-icon"><Flame size={18} /></div><div className="habit-main"><h2>{habit.title}</h2><span>{habit.frequency} · {habit.targetDays.length} days a week</span><div className="habit-week">{['M','T','W','T','F','S','S'].map((d, i) => <span key={i} className={`${habit.targetDays.includes(i) ? 'habit-day-target' : ''} ${i === weekday ? 'habit-day-today' : ''} ${habit.checkIns.includes(today) && i === weekday ? 'habit-day-done' : ''}`}>{d}</span>)}</div></div><div className="habit-actions"><button className={`checkin-button ${completed ? 'checked-in' : ''}`} onClick={() => checkin.mutate({ habitId: habit.id, data: { date: today, completed: !completed } }, { onSuccess: () => void refresh() })} data-testid={`button-checkin-${habit.id}`}><Check size={15} /> {completed ? 'Checked in' : 'Check in'}</button><button className="icon-button" aria-label={`Rename ${habit.title}`} onClick={() => { const name = prompt('Rename routine', habit.title); if (name?.trim()) update.mutate({ habitId: habit.id, data: { title: name.trim() } }, { onSuccess: () => void refresh() }); }} data-testid={`button-rename-habit-${habit.id}`}><Pencil size={14} /></button><button className="icon-button delete-button" aria-label={`Delete ${habit.title}`} onClick={() => { if (confirm(`Remove routine “${habit.title}”?`)) del.mutate({ habitId: habit.id }, { onSuccess: () => void refresh() }); }}><Trash2 size={15} /></button></div></article>; })}</div> : <Empty title="Build a routine that fits" detail="Start with something small enough to come back to." action={<Button kind="outline" onClick={() => setModal(true)}><Plus size={15} /> Add a routine</Button>} />}</QueryState>{modal && <FormModal title="Add a routine" onClose={() => setModal(false)}><form className="form-grid" onSubmit={add}><Field label="Routine"><TextInput value={title} onChange={e => setTitle(e.target.value)} required autoFocus placeholder="e.g. Read for ten minutes" data-testid="input-habit-title" /></Field><p className="muted-copy">You can adjust the routine’s schedule later. Check-ins are shared across your workspace.</p><div className="form-actions"><Button kind="outline" onClick={() => setModal(false)}>Cancel</Button><Button kind="primary" type="submit">Add routine</Button></div></form></FormModal>}</div>;
}

function JournalPage() {
  const query = useListJournalEntries(); const create = useCreateJournalEntry(); const update = useUpdateJournalEntry(); const del = useDeleteJournalEntry(); const qc = useQueryClient();
  const [modal, setModal] = useState(false); const [title, setTitle] = useState(''); const [content, setContent] = useState(''); const [mood, setMood] = useState(''); const [editing, setEditing] = useState<string | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: getListJournalEntriesQueryKey() });
  const save = (e: React.FormEvent) => { e.preventDefault(); const data = { title, content, entryDate: dateOnly(), mood: mood || null }; if (editing) update.mutate({ entryId: editing, data }, { onSuccess: () => { void refresh(); setModal(false); setEditing(null); } }); else create.mutate({ data }, { onSuccess: () => { void refresh(); setModal(false); } }); };
  const openEdit = (entry: NonNullable<typeof query.data>['items'][number]) => { setTitle(entry.title); setContent(entry.content); setMood(entry.mood || ''); setEditing(entry.id); setModal(true); };
  return <div className="page-enter"><PageTitle eyebrow="A place to put the day down" title="Journal" detail="Thoughts, milestones, and the small things worth remembering." action={<Button kind="primary" onClick={() => { setTitle(''); setContent(''); setMood(''); setEditing(null); setModal(true); }}><Plus size={16} /> New entry</Button>} /><div className="privacy-banner"><LockKeyhole size={17} /><div><strong>Visible to everyone in this workspace</strong><span>Journal entries are shared with both profiles. Please don’t add anything you’d like to keep private.</span></div></div><QueryState loading={query.isLoading} error={query.error} retry={() => query.refetch()}>{query.data?.items.length ? <div className="journal-grid">{query.data.items.map(entry => <article className="journal-card card" key={entry.id} data-testid={`card-journal-${entry.id}`}><div className="journal-meta"><span>{stamp(entry.entryDate, { weekday: 'long', month: 'long', day: 'numeric' })}</span><div><button className="icon-button" aria-label={`Edit ${entry.title}`} onClick={() => openEdit(entry)}><NotebookPen size={15} /></button><button className="icon-button delete-button" aria-label={`Delete ${entry.title}`} onClick={() => { if (confirm(`Delete journal entry “${entry.title}”?`)) del.mutate({ entryId: entry.id }, { onSuccess: () => void refresh() }); }}><Trash2 size={15} /></button></div></div><h2>{entry.title}</h2>{entry.mood && <span className="journal-mood">{entry.mood}</span>}<p>{entry.content}</p>{entry.tags.length > 0 && <div className="tag-row">{entry.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}</article>)}</div> : <Empty title="A blank page, just for now" detail="Leave a note about what went well, or what’s on your mind." action={<Button kind="outline" onClick={() => setModal(true)}><Plus size={15} /> Write an entry</Button>} />}</QueryState>{modal && <FormModal title={editing ? 'Edit journal entry' : 'Write a journal entry'} onClose={() => setModal(false)}><form className="form-grid" onSubmit={save}><Field label="A title for this moment"><TextInput value={title} onChange={e => setTitle(e.target.value)} required autoFocus maxLength={200} data-testid="input-journal-title" /></Field><Field label="What’s on your mind?" wide><TextArea value={content} onChange={e => setContent(e.target.value)} rows={7} required data-testid="input-journal-content" /></Field><Field label="Mood (optional)"><TextInput value={mood} onChange={e => setMood(e.target.value)} placeholder="A word or two" /></Field><div className="form-actions"><Button kind="outline" onClick={() => setModal(false)}>Cancel</Button><Button kind="primary" type="submit" disabled={create.isPending || update.isPending}>Save entry</Button></div></form></FormModal>}</div>;
}

function FocusPage() {
  const query = useListFocusSessions(); const create = useCreateFocusSession(); const update = useUpdateFocusSession(); const settings = useGetWorkspaceSettings(); const qc = useQueryClient();
  const [seconds, setSeconds] = useState(0); const [running, setRunning] = useState(false); const [sessionId, setSessionId] = useState<string | null>(null);
  const duration = (settings.data?.focusMinutes || 25) * 60;
  useEffect(() => { if (!running) return; const timer = window.setInterval(() => setSeconds(s => s + 1), 1000); return () => window.clearInterval(timer); }, [running]);
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: getListFocusSessionsQueryKey() }), qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() })]);
  const begin = () => { const now = new Date().toISOString(); create.mutate({ data: { startedAt: now } }, { onSuccess: session => { setSessionId(session.id); setSeconds(session.elapsedSeconds || 0); setRunning(true); void qc.invalidateQueries({ queryKey: getListFocusSessionsQueryKey() }); } }); };
  const finish = (status: 'completed' | 'interrupted') => { if (!sessionId) return; update.mutate({ sessionId, data: { status, endedAt: new Date().toISOString(), elapsedSeconds: seconds } }, { onSuccess: () => { setRunning(false); setSessionId(null); setSeconds(0); void refresh(); } }); };
  useEffect(() => {
    if (!query.data || sessionId) return;
    const active = query.data.items.find(s => s.status === 'running' || s.status === 'paused');
    if (!active) return;
    setSessionId(active.id);
    const elapsed = active.status === 'running'
      ? active.elapsedSeconds + Math.max(0, Math.floor((Date.now() - new Date(active.startedAt).getTime()) / 1000))
      : active.elapsedSeconds;
    setSeconds(elapsed);
    setRunning(active.status === 'running');
  }, [query.data, sessionId]);
  const toggleTimer = () => {
    if (!sessionId) return;
    const next = running ? 'paused' : 'running';
    update.mutate({ sessionId, data: { status: next, elapsedSeconds: seconds } }, {
      onSuccess: () => setRunning(next === 'running'),
    });
  };
  const remaining = Math.max(0, duration - seconds);
  useEffect(() => { if (running && seconds >= duration && sessionId) finish('completed'); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, duration, running, sessionId]);
  const mins = Math.floor(remaining / 60).toString().padStart(2, '0'); const secs = (remaining % 60).toString().padStart(2, '0');
  return <div className="page-enter"><PageTitle eyebrow="One thing at a time" title="Focus" detail="A quiet timer for making a little progress." /><div className="focus-layout"><section className="focus-main card"><div className="focus-top"><span className="eyebrow">{sessionId ? 'SESSION IN PROGRESS' : 'YOUR FOCUS SPACE'}</span><span className="focus-status"><span className={running ? 'signal-dot' : 'signal-dot signal-muted'} />{running ? 'In focus' : sessionId ? 'Paused' : `${settings.data?.focusMinutes || 25} minute session`}</span></div><div className="timer-ring"><div className="timer-inner"><span className="timer-time">{mins}:{secs}</span><span>{running ? 'stay with it' : sessionId ? 'take your time' : 'make a start'}</span></div></div><p className="focus-encouragement">{running ? 'You don’t have to hurry. Just keep this one moment.' : 'Choose one small thing. The rest can wait.'}</p><div className="focus-controls">{sessionId ? <><Button kind="outline" onClick={toggleTimer} disabled={update.isPending}>{running ? 'Pause timer' : 'Resume timer'}</Button><Button kind="primary" onClick={() => finish('completed')} disabled={update.isPending}><Check size={16} /> Finish session</Button><Button kind="quiet" onClick={() => finish('interrupted')} disabled={update.isPending}>End early</Button></> : <Button kind="primary" onClick={begin} disabled={create.isPending}><Focus size={16} /> {create.isPending ? 'Starting…' : 'Begin focus'}</Button>}</div></section><aside className="focus-aside"><section className="focus-tip card"><span className="tip-symbol"><Sparkles size={17} /></span><span className="eyebrow">A gentle reminder</span><h2>Rest is part of the work.</h2><p>When the timer ends, step away for a moment before choosing what’s next.</p></section><section className="card focus-history"><div className="section-head"><div><span className="eyebrow">RECENT SESSIONS</span><h2>Your focus log</h2></div><Clock3 size={17} className="subtle-icon" /></div>{query.isLoading ? <div className="skeleton skel-row" /> : query.error ? <p className="muted-copy">Session history is unavailable right now.</p> : query.data?.items.length ? query.data.items.slice(0, 5).map(s => <div className="session-row" key={s.id}><span className="session-mark"><Check size={13} /></span><div><strong>{Math.round(s.elapsedSeconds / 60)} minutes</strong><span>{stamp(s.startedAt, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span></div><span className={`session-status session-${s.status}`}>{s.status}</span></div>) : <Empty title="Your first session awaits" detail="A little focus, whenever you’re ready." />}</section></aside></div></div>;
}

function NotificationsPage() {
  const query = useListNotifications(); const mark = useMarkNotificationRead(); const qc = useQueryClient();
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: getListNotificationsQueryKey() }), qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() })]);
  return <div className="page-enter"><PageTitle eyebrow="A friendly nudge" title="Reminders" detail="A quiet record of things the workspace wants you to know." /><QueryState loading={query.isLoading} error={query.error} retry={() => query.refetch()}>{query.data?.items.length ? <div className="notifications-wrap"><div className="notification-summary card"><span className="metric-mark mark-violet"><Bell size={18} /></span><div><strong>{query.data.unreadCount}</strong><span>unread reminder{query.data.unreadCount === 1 ? '' : 's'}</span></div>{query.data.unreadCount > 0 && <span className="unread-pill">Needs a look</span>}</div><div className="notification-list">{query.data.items.map(note => <article key={note.id} className={`notification-row card ${note.readAt ? 'notification-read' : ''}`} data-testid={`notification-${note.id}`}><span className={`notification-icon kind-${note.kind.toLowerCase()}`}><Bell size={17} /></span><div className="notification-copy"><div><strong>{note.title}</strong>{!note.readAt && <span className="unread-dot" />}</div><p>{note.message}</p><span>{stamp(note.createdAt, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span></div>{!note.readAt && <Button kind="outline" onClick={() => mark.mutate({ notificationId: note.id }, { onSuccess: () => void refresh() })} testId={`button-read-${note.id}`}>Mark read</Button>}</article>)}</div></div> : <Empty title="Nothing asking for attention" detail="When something needs a gentle nudge, it’ll show up here." />}</QueryState></div>;
}

function SettingsPage() {
  const query = useGetWorkspaceSettings(); const update = useUpdateWorkspaceSettings(); const qc = useQueryClient();
  const changePassword = useChangeWorkspacePassword(); const revokeSessions = useRevokeWorkspaceSessions();
  const [name, setName] = useState(''); const [timezone, setTimezone] = useState(''); const [theme, setTheme] = useState('dark'); const [focus, setFocus] = useState(25); const [short, setShort] = useState(5); const [long, setLong] = useState(15); const [defaultTaskDuration, setDefaultTaskDuration] = useState(30);
  const [profiles, setProfiles] = useState<Array<{ id: string; name: string; avatar: string; accent: string }>>([]);
  const [currentPassword, setCurrentPassword] = useState(''); const [newPassword, setNewPassword] = useState(''); const [securityMessage, setSecurityMessage] = useState('');
  useEffect(() => { if (!query.data) return; setName(query.data.name); setTimezone(query.data.timezone); setTheme(query.data.theme); setFocus(query.data.focusMinutes); setShort(query.data.shortBreakMinutes); setLong(query.data.longBreakMinutes); setDefaultTaskDuration(query.data.defaultTaskDuration); setProfiles(query.data.profiles.map(profile => ({ ...profile }))); }, [query.data]);
  const save = (e: React.FormEvent) => { e.preventDefault(); update.mutate({ data: { name, timezone, theme: theme as 'dark' | 'light' | 'system', focusMinutes: Number(focus), shortBreakMinutes: Number(short), longBreakMinutes: Number(long), defaultTaskDuration: Number(defaultTaskDuration), profiles } }, { onSuccess: async () => { applyTheme(theme); await Promise.all([qc.invalidateQueries({ queryKey: getGetWorkspaceSettingsQueryKey() }), qc.invalidateQueries({ queryKey: getGetAuthSessionQueryKey() })]); } }); };
  const chooseTheme = (value: string) => { setTheme(value); applyTheme(value); };
  const submitPasswordChange = (e: React.FormEvent) => { e.preventDefault(); setSecurityMessage(''); changePassword.mutate({ data: { currentPassword, newPassword } }, { onSuccess: async () => { setCurrentPassword(''); setNewPassword(''); setSecurityMessage('Password changed. You’ll need to sign in again with the new password.'); await qc.invalidateQueries({ queryKey: getGetAuthSessionQueryKey() }); }, onError: err => setSecurityMessage(niceError(err)) }); };
  const updateProfile = (profileId: string, key: 'name' | 'avatar' | 'accent', value: string) => setProfiles(current => current.map(profile => profile.id === profileId ? { ...profile, [key]: value } : profile));
  return (
    <div className="page-enter">
      <PageTitle eyebrow="Make this space yours" title="Settings" detail="A few shared preferences for your workspace." />
      <QueryState loading={query.isLoading} error={query.error} retry={() => query.refetch()}>
        {query.data && <>
          <form className="settings-layout" onSubmit={save}>
            <section className="settings-card card">
              <div className="settings-section-head"><span className="settings-icon"><SettingsIcon size={18} /></span><div><h2>Workspace</h2><p>Shared name and local time.</p></div></div>
              <div className="settings-fields">
                <Field label="Workspace name"><TextInput value={name} onChange={e => setName(e.target.value)} required maxLength={100} data-testid="input-workspace-name" /></Field>
                <Field label="Timezone"><select className="text-input" value={timezone} onChange={e => setTimezone(e.target.value)} data-testid="select-timezone">{[timezone, 'Asia/Kolkata', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'UTC'].filter((v, i, a) => v && a.indexOf(v) === i).map(tz => <option key={tz}>{tz}</option>)}</select></Field>
              </div>
            </section>
            <section className="settings-card card">
              <div className="settings-section-head"><span className="settings-icon"><Sun size={18} /></span><div><h2>Appearance</h2><p>Choose the atmosphere that feels right.</p></div></div>
              <div className="theme-options">{[['dark', Moon, 'Midnight'], ['light', Sun, 'Daylight'], ['system', Sparkles, 'System']].map(([val, Icon, label]) => { const I = Icon as typeof Sun; return <button type="button" className={`theme-option ${theme === val ? 'theme-selected' : ''}`} key={val as string} onClick={() => chooseTheme(val as string)} aria-pressed={theme === val} data-testid={`button-theme-${val as string}`}><I size={18} /><span>{label as string}</span>{theme === val && <Check size={14} />}</button>; })}</div>
            </section>
            <section className="settings-card card">
              <div className="settings-section-head"><span className="settings-icon"><Focus size={18} /></span><div><h2>Planning rhythm</h2><p>Set a useful starting length for tasks, focus, and breaks.</p></div></div>
              <div className="settings-fields settings-timers">
                <Field label="Default task minutes"><TextInput type="number" min="5" max="600" value={defaultTaskDuration} onChange={e => setDefaultTaskDuration(Number(e.target.value))} data-testid="input-default-task-duration" /></Field>
                <Field label="Focus minutes"><TextInput type="number" min="1" max="180" value={focus} onChange={e => setFocus(Number(e.target.value))} data-testid="input-focus-minutes" /></Field>
                <Field label="Short break"><TextInput type="number" min="1" max="60" value={short} onChange={e => setShort(Number(e.target.value))} data-testid="input-short-break" /></Field>
                <Field label="Long break"><TextInput type="number" min="1" max="120" value={long} onChange={e => setLong(Number(e.target.value))} data-testid="input-long-break" /></Field>
              </div>
            </section>
            <section className="settings-card card">
              <div className="settings-section-head"><span className="settings-icon"><LockKeyhole size={18} /></span><div><h2>Profiles</h2><p>Both profiles have access to the same workspace data.</p></div></div>
              <div className="settings-profiles">{profiles.map(profile => <div className="settings-profile" key={profile.id}>
                <span className="mini-avatar" style={{ '--profile-accent': profile.accent } as React.CSSProperties}>{profile.avatar || profile.name.slice(0, 1)}</span>
                <Field label="Profile name"><TextInput value={profile.name} maxLength={80} onChange={e => updateProfile(profile.id, 'name', e.target.value)} data-testid={`input-profile-name-${profile.id}`} /></Field>
                <Field label="Avatar label"><TextInput value={profile.avatar} maxLength={3} onChange={e => updateProfile(profile.id, 'avatar', e.target.value)} data-testid={`input-profile-avatar-${profile.id}`} /></Field>
                <Field label="Accent"><TextInput type="color" value={profile.accent} onChange={e => updateProfile(profile.id, 'accent', e.target.value)} data-testid={`input-profile-accent-${profile.id}`} /></Field>
              </div>)}</div>
            </section>
            <div className="settings-save"><span className="muted-copy">Changes apply to the shared workspace.</span><Button kind="primary" type="submit" disabled={update.isPending} testId="button-save-settings">{update.isPending ? 'Saving…' : 'Save settings'}</Button>{update.error && <span className="form-error">{niceError(update.error)}</span>}</div>
          </form>
          <section className="settings-card card security-settings">
            <div className="settings-section-head"><span className="settings-icon"><LockKeyhole size={18} /></span><div><h2>Workspace security</h2><p>Changing the shared password signs both profiles out on all devices.</p></div></div>
            <form className="settings-fields" onSubmit={submitPasswordChange}>
              <Field label="Current shared password"><TextInput type="password" autoComplete="current-password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} data-testid="input-current-password" /></Field>
              <Field label="New password (12 characters minimum)"><TextInput type="password" autoComplete="new-password" minLength={12} maxLength={256} required value={newPassword} onChange={e => setNewPassword(e.target.value)} data-testid="input-new-password" /></Field>
              <Button kind="primary" type="submit" disabled={changePassword.isPending} testId="button-change-password">{changePassword.isPending ? 'Updating…' : 'Change password'}</Button>
            </form>
            {securityMessage && <p className={changePassword.error ? 'form-error' : 'muted-copy'} role="status" data-testid="text-security-message">{securityMessage}</p>}
            <div className="security-actions"><p className="muted-copy">Use this if a device should no longer have access.</p><Button kind="outline" disabled={revokeSessions.isPending} onClick={() => { if (confirm('Sign out all devices from this workspace?')) revokeSessions.mutate(undefined, { onSuccess: async () => { await qc.invalidateQueries({ queryKey: getGetAuthSessionQueryKey() }); } }); }} testId="button-revoke-sessions">{revokeSessions.isPending ? 'Signing out…' : 'Sign out all devices'}</Button></div>
          </section>
          <section className="settings-card card export-settings">
            <div className="settings-section-head"><span className="settings-icon"><NotebookPen size={18} /></span><div><h2>Workspace data</h2><p>Export includes tasks, schedules, goals, routines, focus sessions, and journal entries.</p></div></div>
            <p className="muted-copy">All workspace data, including journal entries, can be seen by both authorized profiles.</p>
            <a className="button button-outline export-link" href="/api/workspace/export" data-testid="link-export-workspace"><span>Download workspace JSON</span></a>
          </section>
        </>}
      </QueryState>
    </div>
  );
}

function App() {
  return <QueryClientProvider client={client}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><ErrorBoundary><WorkspaceGate /></ErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
