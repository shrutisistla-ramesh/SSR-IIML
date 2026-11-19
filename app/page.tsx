"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Status = "Not started" | "In progress" | "Completed";
type Task = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
  progress: number;
  status: Status;
  priority: "Low" | "Medium" | "High";
  createdAt: number;
};

const STORAGE_KEY = "taskflow.tasks.v1";
const today = () => new Date().toISOString().slice(0, 10);

const starterTasks: Task[] = [
  { id: "sample-1", title: "Plan the product launch", description: "Outline milestones, owners, and launch-day activities.", startDate: today(), dueDate: addDays(4), progress: 65, status: "In progress", priority: "High", createdAt: Date.now() - 3000 },
  { id: "sample-2", title: "Review project requirements", description: "Check scope and confirm the first release requirements.", startDate: today(), dueDate: addDays(2), progress: 100, status: "Completed", priority: "Medium", createdAt: Date.now() - 2000 },
  { id: "sample-3", title: "Prepare design handoff", description: "Package screens, assets, and notes for development.", startDate: today(), dueDate: addDays(7), progress: 20, status: "In progress", priority: "Low", createdAt: Date.now() - 1000 }
];

function addDays(n: number) {
  const date = new Date();
  date.setDate(date.getDate() + n);
  return date.toISOString().slice(0, 10);
}

function getStatus(progress: number): Status {
  if (progress >= 100) return "Completed";
  if (progress > 0) return "In progress";
  return "Not started";
}

function prettyDate(value: string) {
  if (!value) return "No date";
  return new Date(value + "T00:00:00").toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
}

function isOverdue(task: Task) {
  return task.status !== "Completed" && !!task.dueDate && task.dueDate < today();
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState("All tasks");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setTasks(saved ? JSON.parse(saved) : starterTasks);
    } catch {
      setTasks(starterTasks);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, ready]);

  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === "Completed").length,
    active: tasks.filter(t => t.status === "In progress").length,
    overdue: tasks.filter(isOverdue).length
  }), [tasks]);

  const overall = stats.total ? Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / stats.total) : 0;

  const visibleTasks = useMemo(() => tasks
    .filter(t => filter === "All tasks" || (filter === "Overdue" ? isOverdue(t) : t.status === filter))
    .filter(t => (t.title + " " + t.description).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.status === "Completed" && b.status !== "Completed") return 1;
      if (a.status !== "Completed" && b.status === "Completed") return -1;
      return (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
    }), [tasks, filter, search]);

  function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const progress = Number(data.get("progress"));
    const task: Task = {
      id: editing?.id || crypto.randomUUID(),
      title: String(data.get("title")).trim(),
      description: String(data.get("description")).trim(),
      startDate: String(data.get("startDate")),
      dueDate: String(data.get("dueDate")),
      progress,
      status: getStatus(progress),
      priority: String(data.get("priority")) as Task["priority"],
      createdAt: editing?.createdAt || Date.now()
    };
    if (!task.title) return;
    setTasks(current => editing ? current.map(t => t.id === editing.id ? task : t) : [task, ...current]);
    setModalOpen(false);
    setEditing(null);
    setNotice(editing ? "Task updated" : "Task added");
    window.setTimeout(() => setNotice(""), 2200);
  }

  function updateProgress(id: string, progress: number) {
    setTasks(current => current.map(t => t.id === id ? { ...t, progress, status: getStatus(progress) } : t));
  }

  function removeTask(id: string) {
    if (window.confirm("Delete this task? This cannot be undone.")) {
      setTasks(current => current.filter(t => t.id !== id));
    }
  }

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setModalOpen(true);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">✳</span><span>taskflow</span></div>
        <div className="workspace-label">WORKSPACE</div>
        <button className={`nav-item ${filter === "All tasks" ? "selected" : ""}`} onClick={() => setFilter("All tasks")}><span>▦</span> All tasks <b>{stats.total}</b></button>
        <button className={`nav-item ${filter === "In progress" ? "selected" : ""}`} onClick={() => setFilter("In progress")}><span>◷</span> In progress</button>
        <button className={`nav-item ${filter === "Completed" ? "selected" : ""}`} onClick={() => setFilter("Completed")}><span>✓</span> Completed</button>
        <button className={`nav-item ${filter === "Overdue" ? "selected" : ""}`} onClick={() => setFilter("Overdue")}><span>⚑</span> Overdue {stats.overdue > 0 && <b className="count-alert">{stats.overdue}</b>}</button>
        <div className="sidebar-bottom">
          <div className="avatar">Y</div>
          <div><strong>Your workspace</strong><small>Personal account</small></div>
          <span className="more">···</span>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>{filter}</strong></div>
          <div className="top-actions"><span className="today-label">{new Date().toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}</span><div className="avatar small">Y</div></div>
        </header>

        <div className="content">
          <div className="welcome-row">
            <div><p className="eyebrow">YOUR PERSONAL WORKSPACE</p><h1>Make progress, <em>every day.</em></h1><p className="subheading">A clear view of what matters and what’s moving forward.</p></div>
            <button className="primary-btn" onClick={openNew}><span>＋</span> New task</button>
          </div>

          <div className="stats-grid">
            <div className="stat-card"><div className="stat-top"><span>Total tasks</span><span className="stat-icon lavender">▦</span></div><div className="stat-number">{stats.total}</div><div className="stat-foot">Across your workspace</div></div>
            <div className="stat-card"><div className="stat-top"><span>In progress</span><span className="stat-icon blue">◷</span></div><div className="stat-number">{stats.active}</div><div className="stat-foot">Currently moving forward</div></div>
            <div className="stat-card"><div className="stat-top"><span>Completed</span><span className="stat-icon green">✓</span></div><div className="stat-number">{stats.completed}</div><div className="stat-foot">Tasks finished</div></div>
            <div className="stat-card"><div className="stat-top"><span>Overdue</span><span className="stat-icon orange">⚑</span></div><div className="stat-number">{stats.overdue}</div><div className="stat-foot">Need a little attention</div></div>
          </div>

          <section className="progress-panel">
            <div className="progress-copy"><div><p className="eyebrow">BIG PICTURE</p><h2>Overall progress</h2><p>Keep the momentum going. Every step counts.</p></div><div className="overall-number">{overall}<span>%</span></div></div>
            <div className="overall-track"><div style={{ width: `${overall}%` }} /></div>
            <div className="progress-meta"><span>{stats.completed} of {stats.total} tasks completed</span><span>{100 - overall}% to go</span></div>
          </section>

          <section className="tasks-section">
            <div className="tasks-heading"><div><p className="eyebrow">YOUR PLAN</p><h2>{filter}</h2></div><div className="task-tools"><div className="search-box"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." /></div><button className="filter-button" onClick={() => setFilter("All tasks")}>↕ <span>Reset</span></button></div></div>

            <div className="task-list">
              {!ready ? <div className="empty-state">Loading your workspace…</div> : visibleTasks.length === 0 ? <div className="empty-state"><div className="empty-icon">✳</div><h3>No tasks here yet</h3><p>Add a task or change your filters to see your work.</p><button className="primary-btn" onClick={openNew}>＋ Add your first task</button></div> :
                visibleTasks.map(task => (
                  <article className="task-card" key={task.id}>
                    <div className="task-main">
                      <button className={`task-check ${task.status === "Completed" ? "checked" : ""}`} aria-label="Mark task complete" onClick={() => updateProgress(task.id, task.status === "Completed" ? 0 : 100)}>{task.status === "Completed" ? "✓" : ""}</button>
                      <div className="task-info"><div className="task-title-row"><h3 className={task.status === "Completed" ? "done-title" : ""}>{task.title}</h3><span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span></div><p>{task.description || "No description added."}</p><div className="task-meta"><span>◷ {prettyDate(task.startDate)} – {prettyDate(task.dueDate)}</span><span className={`status status-${task.status.toLowerCase().replace(" ", "-")}`}>{task.status}</span>{isOverdue(task) && <span className="overdue-tag">Overdue</span>}</div></div>
                    </div>
                    <div className="task-progress"><div className="task-progress-label"><span>Progress</span><strong>{task.progress}%</strong></div><input aria-label={`Progress for ${task.title}`} type="range" min="0" max="100" step="5" value={task.progress} onChange={e => updateProgress(task.id, Number(e.target.value))} style={{ "--range-progress": `${task.progress}%` } as React.CSSProperties} /><div className="task-actions"><button onClick={() => openEdit(task)}>Edit</button><button className="delete-action" onClick={() => removeTask(task.id)}>Delete</button></div></div>
                  </article>
                ))
              }
            </div>
          </section>
          <footer>Made for focused work <span>✳</span> Your tasks are saved in this browser.</footer>
        </div>
      </section>

      {notice && <div className="toast">✓ {notice}</div>}
      {modalOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
        <form className="task-modal" onSubmit={saveTask}>
          <div className="modal-heading"><div><p className="eyebrow">{editing ? "KEEP IT MOVING" : "MAKE IT HAPPEN"}</p><h2>{editing ? "Edit task" : "Create a task"}</h2></div><button type="button" className="close-btn" onClick={() => setModalOpen(false)}>×</button></div>
          <label>Task name<input name="title" required maxLength={90} placeholder="e.g. Prepare launch presentation" defaultValue={editing?.title || ""} /></label>
          <label>Description <span className="optional">Optional</span><textarea name="description" rows={3} placeholder="Add a few details about this task..." defaultValue={editing?.description || ""} /></label>
          <div className="form-row"><label>Start date<input name="startDate" type="date" defaultValue={editing?.startDate || today()} /></label><label>Due date<input name="dueDate" type="date" defaultValue={editing?.dueDate || addDays(7)} /></label></div>
          <div className="form-row"><label>Priority<select name="priority" defaultValue={editing?.priority || "Medium"}><option>Low</option><option>Medium</option><option>High</option></select></label><label>Progress <span className="optional">0–100%</span><input name="progress" type="number" min="0" max="100" step="5" defaultValue={editing?.progress ?? 0} /></label></div>
          <div className="modal-actions"><button type="button" className="cancel-btn" onClick={() => setModalOpen(false)}>Cancel</button><button className="primary-btn" type="submit">{editing ? "Save changes" : "Create task"}</button></div>
        </form>
      </div>}
    </main>
  );
}
