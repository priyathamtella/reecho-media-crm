import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = "http://localhost:5050/api";

const PLATFORM_COLORS = {
  instagram: "#a78bfa", facebook: "#67b7e8",
  linkedin: "#f59e0b", twitter: "#43e97b",
};
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const TAG_COLORS = { content:"#6c63ff", design:"#f7971e", ads:"#ff6584", seo:"#43e97b", strategy:"#67b7e8" };
const STATUSES = ["To Do","In Progress","In Review","Done"];
const STATUS_DOT = { "To Do":"#6B6B85","In Progress":"#6C63FF","In Review":"#F7971E","Done":"#43E97B" };

function buildCalDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;
  const total = new Date(year, month + 1, 0).getDate();
  const cells = Array(offset).fill(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  return cells;
}

const inputSt = { padding:"10px 12px", borderRadius:"8px", border:"1px solid var(--border)", background:"var(--surface)", color:"var(--text)", fontSize:"13px", width:"100%", boxSizing:"border-box" };
const labelSt = { fontSize:"11px", fontWeight:"600", color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:"4px", display:"block" };

const Field = ({ label, children }) => (
  <div style={{ marginBottom:"14px" }}><label style={labelSt}>{label}</label>{children}</div>
);

const Modal = ({ title, onClose, children }) => (
  <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:3000 }}>
    <div onClick={e => e.stopPropagation()} style={{ background:"var(--surface)", padding:"28px", borderRadius:"14px", width:"440px", border:"1px solid var(--border)", maxHeight:"88vh", overflowY:"auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
        <h3 style={{ margin:0, fontSize:"17px", fontWeight:"700" }}>{title}</h3>
        <button onClick={onClose} style={{ background:"none", border:"none", fontSize:"22px", cursor:"pointer", color:"var(--muted)", lineHeight:1 }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

export default function CrmView({ currentPage, setCurrentPage }) {
  const [taskView, setTaskView] = useState("board");
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [team, setTeam] = useState([]);
  const [calEvents, setCalEvents] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  // Drag state
  const dragTask = useRef(null);
  const [dragOver, setDragOver] = useState(null);

  // Modals
  const [showTask,   setShowTask]   = useState(false);
  const [showClient, setShowClient] = useState(false);
  const [showTeam,   setShowTeam]   = useState(false);
  const [showCal,    setShowCal]    = useState(false);
  const [showInv,    setShowInv]    = useState(false);
  const [showNotif,  setShowNotif]  = useState(false);
  // Edit modals
  const [editTask,   setEditTask]   = useState(null);
  const [editMember, setEditMember] = useState(null);
  // Selected client (for Client Hub detail view)
  const [selectedClient, setSelectedClient] = useState(null);

  // Client page filter
  const [clientFilter, setClientFilter] = useState("All");

  const [fTask,   setFTask]   = useState({ title:"", tag:"Content", client:"", due_date:"", assignees:"", status:"To Do" });
  const [fClient, setFClient] = useState({ name:"", email:"", industry:"", package:"Full Service", status:"Active", monthly_value:"", initials:"", color:"av-purple" });
  const [fTeam,   setFTeam]   = useState({ name:"", email:"", role:"", initials:"", color:"av-blue", working_on:"", tasks_num:"0", tasks_done:"0", clients_num:"0" });
  const [fCal,    setFCal]    = useState({ title:"", client:"", platform:"instagram", date:"" });
  const [fInv,    setFInv]    = useState({ invoice_id:"", client:"", service:"", amount:"", date:"", status:"Pending" });
  
  // Change Password state
  const [showPassModal, setShowPassModal] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passLoading, setPassLoading] = useState(false);
  
  // Payment & Decline Modals
  const [declineModal, setDeclineModal] = useState(null); // { id, type, reason }
  const [payModal, setPayModal] = useState(null); // { id, amount, step: 'init' | 'processing' | 'success' }
  const [payTimer, setPayTimer] = useState(60);

  const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

  const fetchAll = async () => {
    try {
      const [rc, rt, rtm, rce, ri] = await Promise.all([
        axios.get(`${API}/clients`, auth()),
        axios.get(`${API}/tasks`, auth()),
        axios.get(`${API}/team`, auth()),
        axios.get(`${API}/calendar`, auth()),
        axios.get(`${API}/invoices`, auth()),
      ]);
      setClients(rc.data || []);
      setTasks(rt.data || []);
      setTeam(rtm.data || []);
      setCalEvents(rce.data || []);
      setInvoices(ri.data || []);
    } catch (e) { console.error(e); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchAll(); }, []);

  const userRole = localStorage.getItem("userRole") || "admin";
  useEffect(() => {
    if (userRole === "client" && currentPage === "portal" && clients.length > 0 && !selectedClient) {
      setSelectedClient(clients[0]);
    }
  }, [clients, userRole, currentPage, selectedClient]);

  useEffect(() => {
    let interval;
    if (payModal && payModal.step === 'processing' && payTimer > 0) {
      interval = setInterval(() => setPayTimer(t => t - 1), 1000);
    } else if (payTimer === 0 && payModal && payModal.step === 'processing') {
      setPayModal({ ...payModal, step: 'success' });
      updateInvoice(payModal.id, { status: "Paid" });
    }
    return () => clearInterval(interval);
  }, [payModal, payTimer]);

  // Close notification panel when clicking outside
  useEffect(() => {
    if (!showNotif) return;
    const handler = () => setShowNotif(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showNotif]);

  /* ─── API calls ─────────────────────────────── */
  const createTask = async (data) => {
    try { await axios.post(`${API}/tasks`, data, auth()); fetchAll(); } catch(e){console.error(e);}
  };
  const updateTask = async (task) => {
    try { await axios.put(`${API}/tasks/${task.ID}`, task, auth()); fetchAll(); } catch(e){console.error(e);}
  };
  const deleteTask = async (id) => {
    try { await axios.delete(`${API}/tasks/${id}`, auth()); fetchAll(); } catch(e){console.error(e);}
  };
  const deleteTeamMember = async (id) => {
    try { await axios.delete(`${API}/team/${id}`, auth()); fetchAll(); } catch(e){console.error(e);}
  };
  const createInvoice = async (data) => {
    try { await axios.post(`${API}/invoices`, data, auth()); fetchAll(); } catch(e){console.error(e);}
  };
  const updateInvoice = async (id, data) => {
    try { await axios.put(`${API}/invoices/${id}`, data, auth()); fetchAll(); } catch(e){console.error(e);}
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setPassLoading(true);
    try {
      await axios.post(`${API}/change-password`, {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      }, auth());
      alert("Password updated successfully!");
      setShowPassModal(false);
      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update password");
    } finally {
      setPassLoading(false);
    }
  };

  /* ─── Drag & Drop ───────────────────────────── */
  const onDragStart = (e, task) => {
    dragTask.current = task;
    e.dataTransfer.effectAllowed = "move";
  };
  const onDrop = async (e, status) => {
    e.preventDefault();
    setDragOver(null);
    if (dragTask.current && dragTask.current.status !== status) {
      if (userRole === "client") {
        alert("Board view is read-only for clients. Please contact your account manager for status updates.");
        return;
      }
      if (userRole === "member" && status !== "To Do" && status !== "In Progress" && status !== "In Review") {
        alert("Members can only move tasks to 'To Do', 'In Progress', or 'In Review'. Admin review is required for completion.");
        return;
      }
      await updateTask({ ...dragTask.current, status });
    }
    dragTask.current = null;
  };

  /* ─── Status change inline ──────────────────── */
  const changeStatus = async (task, status) => {
    await updateTask({ ...task, status });
  };

  /* ─── Calendar helpers ──────────────────────── */
  const calDays = buildCalDays(calYear, calMonth);
  const padDate = (d) => `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

  // tasks that have a due_date in this month
  const tasksOnDay = (d) => {
    if (!d) return [];
    const ds = padDate(d);
    return tasks.filter(t => t.due_date === ds);
  };
  // calendar events on this day
  const eventsOnDay = (d) => {
    if (!d) return [];
    const ds = padDate(d);
    return calEvents.filter(e => e.date === ds);
  };

  /* ─── Derived stats ─────────────────────────── */
  const paid    = invoices.filter(i => i.status==="Paid").reduce((s,i)=>s+(i.amount||0),0);
  const pending = invoices.filter(i => i.status==="Pending").reduce((s,i)=>s+(i.amount||0),0);
  const overdue = invoices.filter(i => i.status==="Overdue").reduce((s,i)=>s+(i.amount||0),0);

  // upcoming deadlines in next 7 days
  const soon = tasks.filter(t => {
    if (!t.due_date || t.status === "Done") return false;
    const diff = (new Date(t.due_date) - today) / 86400000;
    return diff >= 0 && diff <= 7;
  }).sort((a,b) => new Date(a.due_date)-new Date(b.due_date));

  // overdue tasks (past due, not done)
  const overdueTasks = tasks.filter(t => {
    if (!t.due_date || t.status === "Done") return false;
    return (new Date(t.due_date) - today) < 0;
  });

  // Notification list
  const notifications = [
    ...overdueTasks.map(t => ({ type:"overdue", text:`"${t.title}" is overdue`, sub:t.client, id:`od-${t.ID}` })),
    ...soon.filter(t=>{ const d=(new Date(t.due_date)-today)/86400000; return d<=1; }).map(t=>({ type:"urgent", text:`"${t.title}" due today/tomorrow`, sub:t.client, id:`ug-${t.ID}` })),
    ...invoices.filter(i=>i.status==="Overdue").map(i=>({ type:"invoice", text:`Invoice ${i.invoice_id||"#"+i.ID} overdue`, sub:`₹${(i.amount||0).toLocaleString("en-IN")} from ${i.client}`, id:`inv-${i.ID}` })),
    ...invoices.filter(i=>i.status==="Pending").slice(0,2).map(i=>({ type:"pending", text:`Invoice ${i.invoice_id||"#"+i.ID} pending`, sub:`₹${(i.amount||0).toLocaleString("en-IN")} from ${i.client}`, id:`pnd-${i.ID}` })),
  ];

  // Filtered clients list
  const filteredClients = clientFilter==="All" ? clients : clients.filter(c=>c.status===clientFilter);

  /* ─── Auto-derive member stats from live tasks ───── */
  const getMemberStats = (m) => {
    // assignees is now a comma-separated string e.g. "Zara,Priya,Kiran"
    // so we split and check if this member's name is in the list
    const isMemberAssigned = (t) => {
      if (!t.assignees) return false;
      const names = t.assignees.split(",").map(s => s.trim());
      return names.includes(m.name) || names.includes(m.initials);
    };
    const assigned   = tasks.filter(isMemberAssigned);
    const completed  = assigned.filter(t => t.status === "Done");
    const inProgress = assigned.filter(t => t.status === "In Progress");
    return {
      assigned:   assigned.length   || m.tasks_num  || 0,
      completed:  completed.length  || m.tasks_done || 0,
      inProgress: inProgress.length,
    };
  };

  const titles = { overview:"Overview", tasks:"Task Board", calendar:"Content Calendar", team:"Team Members", clients:"Clients", payments:"Payments & Invoices", portal:"Client Hub" };

  /* ─── Submit handlers ───────────────────────── */
  const submitTask = async (e) => {
    e.preventDefault();
    await createTask(fTask);
    setFTask({ title:"", tag:"Content", client:"", due_date:"", assignees:"", status:"To Do" });
    setShowTask(false);
  };
  const submitEditTask = async (e) => {
    e.preventDefault();
    await updateTask(editTask);
    setEditTask(null);
  };
  const submitClient = async (e) => {
    e.preventDefault();
    const p = { ...fClient, monthly_value: parseInt(fClient.monthly_value)||0, initials: fClient.initials||fClient.name.substring(0,2).toUpperCase() };
    await axios.post(`${API}/clients`, p, auth());
    setFClient({ name:"", email:"", industry:"", package:"Full Service", status:"Active", monthly_value:"", initials:"", color:"av-purple" });
    setShowClient(false); fetchAll();
  };
  const submitTeam = async (e) => {
    e.preventDefault();
    const p = { ...fTeam,
      tasks_num: parseInt(fTeam.tasks_num)||0,
      tasks_done: parseInt(fTeam.tasks_done)||0,
      clients_num: parseInt(fTeam.clients_num)||0,
      initials: fTeam.initials||fTeam.name.substring(0,2).toUpperCase()
    };
    await axios.post(`${API}/team`, p, auth());
    setFTeam({ name:"", email:"", role:"", initials:"", color:"av-blue", working_on:"", tasks_num:"0", tasks_done:"0", clients_num:"0" });
    setShowTeam(false); fetchAll();
  };
  const submitEditMember = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/team/${editMember.ID}`, editMember, auth());
      setEditMember(null); fetchAll();
    } catch(err) { console.error(err); }
  };
  const submitCal = async (e) => {
    e.preventDefault();
    // 1. Save the calendar event
    await axios.post(`${API}/calendar`, { ...fCal, color: PLATFORM_COLORS[fCal.platform]||"#a78bfa" }, auth());
    // 2. Also create a matching task in To Do so it shows on the task board
    await axios.post(`${API}/tasks`, {
      title: `[${fCal.platform.charAt(0).toUpperCase()+fCal.platform.slice(1)}] ${fCal.title}`,
      tag: "Content",
      client: fCal.client,
      due_date: fCal.date,
      status: "To Do",
      assignees: "",
    }, auth());
    setFCal({ title:"", client:"", platform:"instagram", date:"" });
    setShowCal(false);
    fetchAll();
  };
  const submitInv = async (e) => {
    e.preventDefault();
    await axios.post(`${API}/invoices`, { ...fInv, amount:parseInt(fInv.amount)||0 }, auth());
    setFInv({ invoice_id:"", client:"", service:"", amount:"", date:"", status:"Pending" }); setShowInv(false); fetchAll();
  };

  // Open schedule modal with pre-filled date
  const openCalFormForDay = (day) => {
    setFCal(prev => ({ ...prev, date: padDate(day) }));
    setShowCal(true);
  };
  // Open task modal with pre-filled date
  const openTaskForDay = (day) => {
    setFTask(prev => ({ ...prev, due_date: padDate(day) }));
    setShowTask(true);
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor:"var(--bg)", color:"var(--text)" }}>

      {/* ── TOP BAR ── */}
      <div className="topbar">
        <div className="topbar-left">
          <div className="page-title">{titles[currentPage]||"Overview"}</div>
          {currentPage==="tasks" && (
            <div className="view-toggle">
              <button className={`vt-btn${taskView==="board"?" active":""}`} onClick={()=>setTaskView("board")}>Board</button>
              <button className={`vt-btn${taskView==="list"?" active":""}`} onClick={()=>setTaskView("list")}>List</button>
            </div>
          )}
          <button className="btn btn-ghost" style={{fontSize:"11px", marginLeft:"20px", padding:"4px 10px", height:"30px"}} onClick={() => setShowPassModal(true)}>🔑 Change Password</button>
        </div>
        <div className="topbar-right">
          {userRole === "admin" && currentPage === "clients"  && <button className="btn btn-ghost" onClick={()=>setShowClient(true)}>+ New Client</button>}
          {userRole === "admin" && currentPage === "team"     && <button className="btn btn-ghost" onClick={()=>setShowTeam(true)}>+ Invite Member</button>}
          {userRole === "admin" && currentPage === "calendar" && <button className="btn btn-ghost" onClick={()=>setShowCal(true)}>+ Schedule Post</button>}
          {userRole === "admin" && currentPage === "payments" && <button className="btn btn-ghost" onClick={()=>setShowInv(true)}>+ Create Invoice</button>}
          {userRole === "admin" && <button className="btn btn-primary" onClick={()=>setShowTask(true)}>+ New Task</button>}
        </div>
      </div>

      <div className="content-area-main">

        {/* ══ OVERVIEW ══ */}
        {currentPage==="overview" && (
          <div className="page-view active">
            <div className="stats-grid">
              <div className="stat-card s1">
                <div className="stat-icon">👥</div><div className="stat-label">{userRole==="client"?"Your Profile":"Active Clients"}</div>
                <div className="stat-value">{clients.length}</div>
                <div className="stat-change up">{clients.filter(c=>c.status==="Active").length} active</div>
              </div>
              <div className="stat-card s2">
                <div className="stat-icon">📋</div><div className="stat-label">Open Tasks</div>
                <div className="stat-value">{tasks.filter(t=>t.status!=="Done").length}</div>
                <div className="stat-change up">{tasks.filter(t=>t.status==="Done").length} completed</div>
              </div>
              {userRole === "admin" ? (
                <div className="stat-card s3">
                  <div className="stat-icon">💰</div><div className="stat-label">Revenue Collected</div>
                  <div className="stat-value">₹{paid.toLocaleString("en-IN")}</div>
                  <div className="stat-change up">{invoices.filter(i=>i.status==="Paid").length} invoices paid</div>
                </div>
              ) : (
                <div className="stat-card s3">
                  <div className="stat-icon">🏆</div><div className="stat-label">Completion Rate</div>
                  <div className="stat-value">{tasks.length > 0 ? Math.round((tasks.filter(t=>t.status==="Done").length / tasks.length) * 100) : 0}%</div>
                  <div className="stat-change up">{tasks.filter(t=>t.status==="Done").length} tasks finished</div>
                </div>
              )}
              <div className="stat-card s4">
                <div className="stat-icon">📅</div><div className="stat-label">{userRole==="client"?"Scheduled Dates":"Scheduled Posts"}</div>
                <div className="stat-value">{calEvents.length}</div>
                <div className="stat-change up">{tasks.length} tasks tracked</div>
              </div>
            </div>

            <div className="main-aside">
              <div>
                {/* Upcoming Deadlines */}
                <div className="card-main" style={{ marginBottom:"20px" }}>
                  <div className="card-header">
                    <div className="card-title">⏰ Upcoming Deadlines</div>
                    <span className="card-action" style={{cursor:"pointer"}} onClick={()=>setCurrentPage("tasks")}>View all →</span>
                  </div>
                  <div className="card-body">
                    {soon.length===0 ? (
                      <div style={{ textAlign:"center", padding:"24px 0", color:"var(--muted)", fontSize:"13px" }}>
                        {tasks.length===0 ? <><span style={{fontSize:"28px"}}>📋</span><br/>No tasks yet. <span style={{color:"var(--accent)",cursor:"pointer"}} onClick={()=>setShowTask(true)}>Add one →</span></> : "No deadlines in next 7 days 🎉"}
                      </div>
                    ) : soon.map(t => {
                      const daysLeft = Math.ceil((new Date(t.due_date)-today)/86400000);
                      return (
                        <div key={t.ID} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid var(--border)" }}>
                          <div>
                            <div style={{ fontWeight:"600", fontSize:"13px" }}>{t.title}</div>
                            <div style={{ fontSize:"11px", color:"var(--muted)" }}>{t.client} · {t.status}</div>
                          </div>
                          <span style={{ fontSize:"11px", fontWeight:"700", padding:"3px 8px", borderRadius:"20px",
                            background: daysLeft<=1?"rgba(255,101,132,0.15)":"rgba(247,151,30,0.15)",
                            color: daysLeft<=1?"var(--accent2)":"var(--accent4)" }}>
                            {daysLeft===0?"Today":daysLeft===1?"Tomorrow":`${daysLeft}d left`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Active Tasks list */}
                <div className="card-main">
                  <div className="card-header">
                    <div className="card-title">⚡ In Progress</div>
                    <span className="card-action" style={{cursor:"pointer"}} onClick={()=>setCurrentPage("tasks")}>Board →</span>
                  </div>
                  <div className="card-body">
                    {tasks.filter(t=>t.status==="In Progress").slice(0,5).map(t=>(
                      <div key={t.ID} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"8px 0", borderBottom:"1px solid var(--border)" }}>
                        <div className={`avatar av-purple`} style={{width:"28px",height:"28px",fontSize:"9px",flexShrink:0}}>{(t.assignees||"?").substring(0,2).toUpperCase()}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:"600",fontSize:"12px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}</div>
                          <div style={{fontSize:"10px",color:"var(--muted)"}}>{t.client} · Due {t.due_date||"—"}</div>
                        </div>
                        <span style={{fontSize:"10px",background:`${TAG_COLORS[(t.tag||"content").toLowerCase()]}22`,color:TAG_COLORS[(t.tag||"content").toLowerCase()]||"#6c63ff",padding:"2px 7px",borderRadius:"4px",whiteSpace:"nowrap"}}>{t.tag}</span>
                      </div>
                    ))}
                    {tasks.filter(t=>t.status==="In Progress").length===0 && <div style={{textAlign:"center",padding:"20px",color:"var(--muted)",fontSize:"12px"}}>Nothing in progress</div>}
                  </div>
                </div>
              </div>

              <div>
                {/* Revenue (Admin Only) */}
                {userRole === "admin" && (
                  <div className="card-main" style={{marginBottom:"16px"}}>
                    <div className="card-header"><div className="card-title">💳 Revenue</div></div>
                    <div className="card-body">
                      <div className="highlight-box" style={{marginBottom:"10px"}}>
                        <div className="hb-label">Collected</div>
                        <div className="hb-value" style={{color:"var(--accent3)"}}>₹{paid.toLocaleString("en-IN")}</div>
                      </div>
                      <div style={{display:"flex",gap:"10px"}}>
                        <div className="highlight-box" style={{flex:1}}><div className="hb-label">Pending</div><div className="hb-value" style={{fontSize:"17px",color:"var(--accent4)"}}>₹{pending.toLocaleString("en-IN")}</div></div>
                        <div className="highlight-box" style={{flex:1}}><div className="hb-label">Overdue</div><div className="hb-value" style={{fontSize:"17px",color:"var(--accent2)"}}>₹{overdue.toLocaleString("en-IN")}</div></div>
                      </div>
                      {invoices.length===0&&<div style={{textAlign:"center",padding:"10px 0",color:"var(--muted)",fontSize:"12px"}}>No invoices yet. <span style={{color:"var(--accent)",cursor:"pointer"}} onClick={()=>setShowInv(true)}>Create one →</span></div>}
                    </div>
                  </div>
                )}

                {/* Team */}
                <div className="card-main">
                  <div className="card-header"><div className="card-title">👤 Team ({team.length})</div><span className="card-action" style={{cursor:"pointer"}} onClick={()=>setCurrentPage("team")}>Manage</span></div>
                  <div className="card-body">
                    {team.slice(0,5).map(m=>(
                      <div key={m.ID} style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"10px"}}>
                        <div className={`avatar ${m.color||"av-blue"}`} style={{width:"30px",height:"30px",fontSize:"10px",flexShrink:0}}>{m.initials||m.name.substring(0,2).toUpperCase()}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:"600",fontSize:"12px"}}>{m.name}</div>
                          <div style={{fontSize:"10px",color:"var(--muted)"}}>{m.role}</div>
                        </div>
                        <div className="progress-bar" style={{width:"55px"}}><div className="progress-fill" style={{width:`${m.progress||50}%`}}></div></div>
                      </div>
                    ))}
                    {team.length===0&&<div style={{textAlign:"center",padding:"16px 0",color:"var(--muted)",fontSize:"12px"}}>No team yet. <span style={{color:"var(--accent)",cursor:"pointer"}} onClick={()=>setShowTeam(true)}>Invite →</span></div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ TASK BOARD ══ */}
        {currentPage==="tasks" && (
          <div className="page-view active">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
              <div style={{fontSize:"13px",color:"var(--muted)"}}>{tasks.length} tasks · {tasks.filter(t=>t.status!=="Done").length} open · {tasks.filter(t=>t.status==="Done").length} done</div>
              <div style={{display:"flex",gap:"8px"}}>
                <button className="btn btn-ghost" onClick={fetchAll}>↻ Refresh</button>
                {userRole === "admin" && <button className="btn btn-primary" onClick={()=>setShowTask(true)}>+ Add Task</button>}
              </div>
            </div>

            {taskView==="board" && (
              <div className="kanban-board">
                {STATUSES.map(status => (
                  <div key={status} className="kanban-col"
                    onDragOver={e=>{e.preventDefault();setDragOver(status);}}
                    onDragLeave={()=>setDragOver(null)}
                    onDrop={e=>onDrop(e,status)}
                    style={{outline:dragOver===status?"2px dashed var(--accent)":"none",borderRadius:"12px",transition:"outline 0.15s"}}>
                    <div className="kanban-header">
                      <div className="kanban-title"><div className="k-dot" style={{background:STATUS_DOT[status]}}></div>{status}</div>
                      <div className="kanban-count">{tasks.filter(t=>t.status===status).length}</div>
                    </div>
                    <div className="kanban-tasks">
                      {tasks.filter(t=>t.status===status).map(task=>(
                        <div key={task.ID} className="task-card" draggable
                          onDragStart={e=>onDragStart(e,task)}
                          style={{opacity:status==="Done"?0.65:1,cursor:"grab",userSelect:"none"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"6px"}}>
                            <span style={{fontSize:"10px",fontWeight:"700",padding:"2px 8px",borderRadius:"4px",background:`${TAG_COLORS[(task.tag||"content").toLowerCase()]||"#6c63ff"}22`,color:TAG_COLORS[(task.tag||"content").toLowerCase()]||"#6c63ff"}}>{task.tag||"Content"}</span>
                            <div style={{display:"flex",gap:"4px"}}>
                              {userRole === "admin" && (
                                <>
                                  <button onClick={()=>setEditTask({...task})} style={{background:"none",border:"none",cursor:"pointer",fontSize:"13px",color:"var(--muted)",padding:"0 2px"}} title="Edit">✏️</button>
                                  <button onClick={()=>deleteTask(task.ID)} style={{background:"none",border:"none",cursor:"pointer",fontSize:"13px",color:"var(--accent2)",padding:"0 2px"}} title="Delete">✕</button>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="task-name" style={{marginBottom:"4px"}}>{task.title}</div>
                          <div className="task-client">📌 {task.client||"General"}</div>
                          <div className="task-footer" style={{marginTop:"8px"}}>
                            <div className="task-due" style={{color:status==="Done"?"var(--accent3)":"",fontSize:"11px"}}>{status==="Done"?"✓ Done":task.due_date||"—"}</div>
                            {/* Avatar stack for multiple assignees */}
                            <div style={{display:"flex",alignItems:"center"}}>
                              {task.assignees ? [...new Set(task.assignees.split(",").map(s=>s.trim()).filter(Boolean))].map((name,i) => {
                                const mem = team.find(m=>m.name===name.trim()||m.initials===name.trim());
                                return (
                                  <div key={i} className={`avatar ${mem?.color||"av-purple"}`}
                                    style={{width:"20px",height:"20px",fontSize:"7px",marginLeft:i>0?"-6px":"0",border:"1.5px solid var(--surface)",zIndex:i,flexShrink:0}}
                                    title={name.trim()}>
                                    {(mem?.initials||name.trim()).substring(0,2).toUpperCase()}
                                  </div>
                                );
                              }) : null}
                            </div>
                          </div>
                          {/* Role-aware Status selector */}
                          {userRole === "admin" && (
                            <select value={task.status} onChange={e=>changeStatus(task,e.target.value)}
                              style={{marginTop:"8px",width:"100%",padding:"4px 8px",borderRadius:"6px",border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text)",fontSize:"11px",cursor:"pointer"}}>
                              {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                            </select>
                          )}
                          {userRole === "member" && (
                            <select value={task.status} onChange={e=>changeStatus(task,e.target.value)}
                              style={{marginTop:"8px",width:"100%",padding:"4px 8px",borderRadius:"6px",border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text)",fontSize:"11px",cursor:"pointer"}}>
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="In Review">In Review</option>
                            </select>
                          )}
                          {userRole === "client" && (
                            <div style={{marginTop:"8px", padding:"4px 8px", borderRadius:"6px", border:"1px solid var(--border)", background:"rgba(108,99,255,0.05)", color:"var(--accent)", fontSize:"11px", textAlign:"center", fontWeight:"600"}}>
                              {task.status}
                            </div>
                          )}
                          <div style={{fontSize:"9px",color:"var(--muted)",marginTop:"3px",textAlign:"center"}}>↕ Drag or use dropdown to move</div>
                        </div>
                      ))}
                      {tasks.filter(t=>t.status===status).length===0&&(
                        <div style={{margin:"12px 0",padding:"20px",textAlign:"center",borderRadius:"10px",border:"2px dashed var(--border)",color:"var(--muted)",fontSize:"12px"}}>
                          Drop tasks here
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {taskView==="list" && (
              <div className="card-main">
                <div className="client-list">
                  <div className="client-row header"><div>Task</div><div>Client</div><div>Tag</div><div>Status</div><div>Due</div><div>Actions</div></div>
                  {tasks.map(t=>(
                    <div className="client-row" key={t.ID}>
                      <div style={{fontWeight:"600",fontSize:"13px"}}>{t.title}</div>
                      <div style={{fontSize:"12px"}}>{t.client||"—"}</div>
                      <div><span style={{fontSize:"11px",padding:"2px 8px",borderRadius:"4px",background:`${TAG_COLORS[(t.tag||"content").toLowerCase()]||"#6c63ff"}22`,color:TAG_COLORS[(t.tag||"content").toLowerCase()]||"#6c63ff"}}>{t.tag}</span></div>
                      <div>
                        {userRole === "admin" ? (
                          <select value={t.status} onChange={e=>changeStatus(t,e.target.value)}
                            style={{padding:"3px 6px",borderRadius:"6px",border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text)",fontSize:"11px"}}>
                            {STATUSES.map(s=><option key={s}>{s}</option>)}
                          </select>
                        ) : userRole === "member" ? (
                          <select value={t.status} onChange={e=>changeStatus(t,e.target.value)}
                            style={{padding:"3px 6px",borderRadius:"6px",border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text)",fontSize:"11px"}}>
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="In Review">In Review</option>
                          </select>
                        ) : (
                          <span style={{fontSize:"11px", fontWeight:"600", color:"var(--accent)"}}>{t.status}</span>
                        )}
                      </div>
                      <div style={{fontSize:"12px"}}>{t.due_date||"—"}</div>
                      <div style={{display:"flex",gap:"6px"}}>
                        {userRole === "admin" && (
                          <>
                            <button className="btn btn-ghost" style={{fontSize:"11px",padding:"3px 8px"}} onClick={()=>setEditTask({...t})}>Edit</button>
                            <button style={{fontSize:"11px",padding:"3px 8px",background:"rgba(255,101,132,0.1)",color:"var(--accent2)",border:"1px solid rgba(255,101,132,0.2)",borderRadius:"6px",cursor:"pointer"}} onClick={()=>deleteTask(t.ID)}>✕</button>
                          </>
                        )}
                        {userRole === "member" && (
                          <select 
                            style={{fontSize:"11px", padding:"2px 4px", borderRadius:"4px", border:"1px solid var(--border)", background:"var(--surface)"}}
                            value={t.status}
                            onChange={(e) => changeStatus(t, e.target.value)}
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                  {tasks.length===0&&<div style={{padding:"60px",textAlign:"center",color:"var(--muted)"}}>No tasks. <span style={{color:"var(--accent)",cursor:"pointer"}} onClick={()=>setShowTask(true)}>Add one →</span></div>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ CALENDAR ══ */}
        {currentPage==="calendar" && (
          <div className="page-view active">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                <button className="btn btn-ghost" style={{padding:"6px 14px"}} onClick={()=>{ if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1);}}>◀</button>
                <div style={{fontFamily:"'Clash Display'",fontSize:"18px",fontWeight:"700"}}>{MONTHS[calMonth]} {calYear}</div>
                <button className="btn btn-ghost" style={{padding:"6px 14px"}} onClick={()=>{ if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1);}}>▶</button>
              </div>
              <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
                <div style={{display:"flex",gap:"10px",fontSize:"11px"}}>
                  {Object.entries(PLATFORM_COLORS).map(([p,c])=><span key={p} style={{color:c}}>● {p.charAt(0).toUpperCase()+p.slice(1)}</span>)}
                  <span style={{color:"#6c63ff"}}>● Task Deadline</span>
                </div>
                {userRole === "admin" && (
                  <>
                    <button className="btn btn-ghost" onClick={()=>setShowCal(true)}>+ Schedule Post</button>
                    <button className="btn btn-primary" onClick={()=>setShowTask(true)}>+ Add Task</button>
                  </>
                )}
              </div>
            </div>
            <div className="card-main">
              <div className="card-body" style={{padding:"16px"}}>
                <div className="calendar-grid">
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=><div key={d} className="cal-day-header">{d}</div>)}
                  {calDays.map((day,idx)=>{
                    const isToday = day&&day===today.getDate()&&calMonth===today.getMonth()&&calYear===today.getFullYear();
                    const dayTasks = tasksOnDay(day);
                    const dayEvts  = eventsOnDay(day);
                    return (
                      <div key={idx} className={`cal-day${isToday?" today":""}`} style={{cursor:day?"pointer":"default",minHeight:"80px"}}
                        onClick={()=>day&&setSelectedDay(day===selectedDay?null:day)}>
                        {day&&<div className="cal-date" style={{marginBottom:"4px"}}>{day}</div>}
                        {dayEvts.map(ev=>(
                          <div key={ev.ID} style={{fontSize:"10px",padding:"2px 5px",borderRadius:"4px",marginBottom:"2px",background:`${PLATFORM_COLORS[ev.platform]||"#a78bfa"}22`,color:PLATFORM_COLORS[ev.platform]||"#a78bfa",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            📱 {ev.title}
                          </div>
                        ))}
                        {dayTasks.map(t=>(
                          <div key={t.ID} style={{fontSize:"10px",padding:"2px 5px",borderRadius:"4px",marginBottom:"2px",background:`${TAG_COLORS[(t.tag||"content").toLowerCase()]||"#6c63ff"}22`,color:TAG_COLORS[(t.tag||"content").toLowerCase()]||"#6c63ff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            📌 {t.title}
                          </div>
                        ))}
                        {day&&(dayTasks.length+dayEvts.length===0)&&selectedDay!==day&&<div style={{fontSize:"10px",color:"var(--border)",textAlign:"center",paddingTop:"14px"}}>+</div>}
                      </div>
                    );
                  })}
                </div>
                {/* Day popup */}
                {selectedDay&&(
                  <div style={{marginTop:"16px",padding:"16px",borderRadius:"12px",border:"1px solid var(--border)",background:"var(--surface)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
                      <div style={{fontWeight:"700",fontSize:"14px"}}>{MONTHS[calMonth]} {selectedDay}, {calYear}</div>
                      <div style={{display:"flex",gap:"8px"}}>
                        {userRole === "admin" && (
                          <>
                            <button className="btn btn-ghost" style={{fontSize:"11px",padding:"4px 10px"}} onClick={()=>openTaskForDay(selectedDay)}>+ Add Task</button>
                            <button className="btn btn-ghost" style={{fontSize:"11px",padding:"4px 10px"}} onClick={()=>openCalFormForDay(selectedDay)}>+ Schedule Post</button>
                          </>
                        )}
                        <button style={{background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:"18px"}} onClick={()=>setSelectedDay(null)}>×</button>
                      </div>
                    </div>
                    {[...eventsOnDay(selectedDay),...tasksOnDay(selectedDay)].length===0
                      ? <div style={{color:"var(--muted)",fontSize:"12px",textAlign:"center"}}>Nothing on this day</div>
                      : <>
                          {eventsOnDay(selectedDay).map(ev=>(
                            <div key={ev.ID} style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                              <span style={{fontSize:"18px"}}>📱</span>
                              <div style={{flex:1}}><div style={{fontWeight:"600",fontSize:"13px"}}>{ev.title}</div><div style={{fontSize:"11px",color:PLATFORM_COLORS[ev.platform]||"#a78bfa"}}>{ev.platform} · {ev.client}</div></div>
                              {userRole === "admin" && (
                                <button className="btn btn-ghost" style={{padding:"4px 8px", color:"var(--accent2)"}} onClick={async () => {
                                  if(window.confirm("Remove this post?")) {
                                    try { await axios.delete(`${API}/calendar/${ev.ID}`, auth()); fetchAll(); } catch(e) { console.error(e); }
                                  }
                                }}>✕</button>
                              )}
                            </div>
                          ))}
                          {tasksOnDay(selectedDay).map(t=>(
                            <div key={t.ID} style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                              <span style={{fontSize:"18px"}}>📌</span>
                              <div style={{flex:1}}><div style={{fontWeight:"600",fontSize:"13px"}}>{t.title}</div><div style={{fontSize:"11px",color:"var(--muted)"}}>{t.client} · {t.status} · {t.tag}</div></div>
                              <span style={{fontSize:"11px",padding:"2px 8px",borderRadius:"10px",background:`${TAG_COLORS[(t.tag||"content").toLowerCase()]||"#6c63ff"}22`,color:TAG_COLORS[(t.tag||"content").toLowerCase()]||"#6c63ff"}}>{t.status}</span>
                            </div>
                          ))}
                        </>
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ TEAM ══ */}
        {currentPage==="team" && (
          <div className="page-view active">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
              <div style={{fontSize:"13px",color:"var(--muted)"}}>{team.length} member{team.length!==1?"s":""} &middot; stats auto-update from task board</div>
              {userRole === "admin" && <button className="btn btn-primary" onClick={()=>setShowTeam(true)}>+ Invite Member</button>}
            </div>
            <div className="team-grid">
              {team.map(m=>{
                const stats = getMemberStats(m);
                const pct = stats.assigned>0 ? Math.round((stats.completed/stats.assigned)*100) : 0;
                return (
                  <div className="member-card" key={m.ID} style={{position:"relative"}}>
                    {/* Action buttons */}
                    <div style={{position:"absolute",top:"10px",right:"10px",display:"flex",gap:"6px"}}>
                      {userRole === "admin" && (
                        <>
                          <button
                            onClick={()=>setEditMember({...m})}
                            style={{background:"rgba(108,99,255,0.1)",border:"1px solid rgba(108,99,255,0.2)",borderRadius:"6px",cursor:"pointer",fontSize:"11px",color:"var(--accent)",padding:"2px 8px"}}
                          >✏️ Edit</button>
                          <button
                            onClick={()=>{ if(window.confirm(`Remove ${m.name}?`)) deleteTeamMember(m.ID); }}
                            style={{background:"rgba(255,101,132,0.1)",border:"1px solid rgba(255,101,132,0.2)",borderRadius:"6px",cursor:"pointer",fontSize:"11px",color:"var(--accent2)",padding:"2px 8px"}}
                          >✕</button>
                        </>
                      )}
                    </div>
                    <div className="member-top" style={{paddingRight:"80px"}}>
                      <div className={`avatar ${m.color||"av-blue"} member-avatar`}>{m.initials||m.name.substring(0,2).toUpperCase()}</div>
                      <div>
                        <div className="member-name">{m.name}</div>
                        <div className="member-role">{m.role}</div>
                        {m.email&&<div style={{fontSize:"11px",color:"var(--muted)",marginTop:"2px"}}>📧 {m.email}</div>}
                      </div>
                    </div>
                    <div className="member-stats">
                      <div className="ms">
                        <div className="ms-val" style={{color:"var(--accent)"}}>{stats.assigned}</div>
                        <div className="ms-label">Assigned</div>
                      </div>
                      <div className="ms">
                        <div className="ms-val" style={{color:"var(--accent3)"}}>{stats.completed}</div>
                        <div className="ms-label">Completed</div>
                      </div>
                      <div className="ms">
                        <div className="ms-val" style={{color:"var(--accent)"}}>{stats.inProgress}</div>
                        <div className="ms-label">In Progress</div>
                      </div>
                    </div>
                    {m.working_on&&<div className="member-tasks" style={{fontSize:"11px",marginBottom:"10px"}}>📌 {m.working_on}</div>}
                    {stats.assigned>0&&(
                      <div>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:"10px",color:"var(--muted)",marginBottom:"4px"}}>
                          <span>Completion rate</span>
                          <span style={{fontWeight:"700",color:"var(--accent3)"}}>{pct}%</span>
                        </div>
                        <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`}}></div></div>
                      </div>
                    )}
                    {stats.assigned===0&&<div style={{fontSize:"11px",color:"var(--muted)",textAlign:"center",padding:"6px 0"}}>No tasks assigned yet</div>}
                  </div>
                );
              })}
              {team.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:"60px",color:"var(--muted)"}}>
                <div style={{fontSize:"36px",marginBottom:"12px"}}>👤</div>
                <div style={{fontSize:"15px",fontWeight:"600",marginBottom:"8px"}}>No team members yet</div>
                <button className="btn btn-primary" onClick={()=>setShowTeam(true)}>+ Invite First Member</button>
              </div>}
            </div>
          </div>
        )}

        {/* ══ CLIENTS ══ */}
        {currentPage==="clients" && (
          <div className="page-view active">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
              <div className="pill-tabs">
                {["All","Active","Review","Paused"].map(f=>(
                  <div key={f}
                    className={`pill-tab${clientFilter===f?" active":""}`}
                    onClick={()=>setClientFilter(f)}
                    style={{cursor:"pointer"}}
                  >
                    {f} ({f==="All"?clients.length:clients.filter(c=>c.status===f).length})
                  </div>
                ))}
              </div>
              {userRole === "admin" && <button className="btn btn-primary" onClick={()=>setShowClient(true)}>+ Add Client</button>}
            </div>
            <div className="card-main">
              <div className="client-list">
                <div className="client-row header"><div>Client</div><div>Package</div><div>Status</div><div>Monthly Value</div></div>
                {filteredClients.map(c=>(
                  <div className="client-row" key={c.ID}>
                    <div className="client-info">
                      <div className={`client-logo ${c.color||"av-purple"}`}>{c.initials||c.name.substring(0,2).toUpperCase()}</div>
                      <div><div className="client-name">{c.name}</div><div className="client-industry">{c.industry}</div></div>
                    </div>
                    <div style={{fontSize:"13px"}}>{c.package}</div>
                    <div><span className={`status-badge ${c.status==="Active"?"status-active":c.status==="Review"?"status-review":"status-paused"}`}><span className="status-dot"></span>{c.status}</span></div>
                    <div style={{fontFamily:"'Clash Display'",fontSize:"14px",fontWeight:"600"}}>₹{(c.monthly_value||0).toLocaleString("en-IN")}</div>
                  </div>
                ))}
                {filteredClients.length===0&&<div style={{padding:"60px",textAlign:"center",color:"var(--muted)"}}>
                  <div style={{fontSize:"36px",marginBottom:"12px"}}>👥</div>
                  <div style={{marginBottom:"12px"}}>{clientFilter==="All"?"No clients yet":"No clients with this status"}</div>
                  {userRole === "admin" && clientFilter==="All" && <button className="btn btn-primary" onClick={()=>setShowClient(true)}>+ Add First Client</button>}
                </div>}
              </div>
            </div>
          </div>
        )}

        {currentPage==="payments" && (
          <div className="page-view active">
            <div className="stats-grid" style={{gridTemplateColumns:"repeat(3,1fr)",marginBottom:"24px"}}>
              <div className="stat-card s3"><div className="stat-label">Collected</div><div className="stat-value" style={{color:"var(--accent3)"}}>₹{paid.toLocaleString("en-IN")}</div><div className="stat-change up">{invoices.filter(i=>i.status==="Paid").length} paid</div></div>
              <div className="stat-card s4"><div className="stat-label">Pending</div><div className="stat-value" style={{color:"var(--accent4)"}}>₹{pending.toLocaleString("en-IN")}</div><div className="stat-change">{invoices.filter(i=>i.status==="Pending").length} due</div></div>
              <div className="stat-card s2"><div className="stat-label">Overdue</div><div className="stat-value" style={{color:"var(--accent2)"}}>₹{overdue.toLocaleString("en-IN")}</div><div className="stat-change" style={{color:"var(--accent2)"}}>{invoices.filter(i=>i.status==="Overdue").length} overdue</div></div>
            </div>

            {userRole === "admin" && (
              <div style={{display:"flex", flexDirection:"column", gap:"32px"}}>
                {/* Client Invoices Table */}
                <div className="card-main">
                  <div className="card-header">
                    <div className="card-title">💼 Client Billing</div>
                    <button className="btn btn-primary" style={{fontSize:"12px",padding:"6px 14px"}} onClick={()=>setShowInv(true)}>+ New Client Invoice</button>
                  </div>
                  <div className="invoice-list">
                    <div className="invoice-row header"><div>ID</div><div>Client</div><div>Service</div><div>Amount</div><div>Status</div><div>Date</div></div>
                    {invoices.filter(i => i.type === "client").map(inv=>(
                      <div className="invoice-row" key={inv.ID}>
                        <div style={{fontWeight:"600",fontSize:"12px"}}>{inv.invoice_id||`#INV-${inv.ID}`}</div>
                        <div style={{fontSize:"12px"}}>{inv.client}</div>
                        <div style={{fontSize:"12px"}}>{inv.service}</div>
                        <div style={{fontFamily:"'Clash Display'",fontWeight:"600"}}>₹{(inv.amount||0).toLocaleString("en-IN")}</div>
                        <div>
                          <span className={`status-badge ${inv.status==="Paid"?"status-active":inv.status==="Overdue"?"status-review":inv.status==="Declined"?"status-review":"status-paused"}`}>
                            <span className="status-dot"></span>{inv.status}
                          </span>
                          {inv.status === "Declined" && <div style={{fontSize:"10px", color:"var(--accent2)", marginTop:"4px"}}>Reason: {inv.decline_reason}</div>}
                        </div>
                        <div style={{fontSize:"11px",color:"var(--muted)"}}>{inv.date}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Member Payouts Table */}
                <div className="card-main">
                  <div className="card-header">
                    <div className="card-title">👥 Member Payout Requests</div>
                  </div>
                  <div className="invoice-list">
                    <div className="invoice-row header" style={{gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr 1fr 150px"}}><div>ID</div><div>Member</div><div>Service</div><div>Amount</div><div>Status</div><div>Date</div><div>Actions</div></div>
                    {invoices.filter(i => i.type === "payout").map(inv=>(
                      <div className="invoice-row" key={inv.ID} style={{gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr 1fr 150px"}}>
                        <div style={{fontWeight:"600",fontSize:"12px"}}>{inv.invoice_id}</div>
                        <div style={{fontSize:"12px"}}>{inv.client}</div>
                        <div style={{fontSize:"12px"}}>{inv.service}</div>
                        <div style={{fontFamily:"'Clash Display'",fontWeight:"600"}}>₹{(inv.amount||0).toLocaleString("en-IN")}</div>
                        <div>
                          <span className={`status-badge ${inv.status==="Paid"?"status-active":inv.status==="Declined"?"status-review":"status-paused"}`}>
                            <span className="status-dot"></span>{inv.status}
                          </span>
                          {inv.status === "Declined" && <div style={{fontSize:"10px", color:"var(--accent2)", marginTop:"4px"}}>Reason: {inv.decline_reason}</div>}
                        </div>
                        <div style={{fontSize:"11px",color:"var(--muted)"}}>{inv.date}</div>
                        <div style={{display:"flex", gap:"8px"}}>
                          {inv.status === "Pending" && (
                            <>
                              <button className="btn btn-primary" style={{padding:"4px 8px", fontSize:"10px"}} onClick={() => { setPayModal({ id: inv.ID, amount: inv.amount, step: 'init' }); setPayTimer(600); }}>Pay</button>
                              <button className="btn btn-ghost" style={{padding:"4px 8px", fontSize:"10px", color:"var(--accent2)"}} onClick={() => setDeclineModal({ id: inv.ID, type: "payout" })}>Decline</button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {invoices.filter(i => i.type === "payout").length === 0 && <div style={{padding:"40px", textAlign:"center", color:"var(--muted)"}}>No payout requests.</div>}
                  </div>
                </div>
              </div>
            )}

            {userRole === "member" && (
              <div style={{display:"grid", gridTemplateColumns:"320px 1fr", gap:"24px"}}>
                <div className="card-main" style={{padding:"24px"}}>
                  <div style={{fontSize:"16px", fontWeight:"700", marginBottom:"16px"}}>Request Payout</div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    createInvoice({ 
                      service: e.target.service.value, 
                      amount: parseInt(e.target.amount.value), 
                      date: new Date().toLocaleDateString(),
                      invoice_id: `PAY-${Math.floor(1000 + Math.random() * 9000)}` 
                    });
                    e.target.reset();
                  }}>
                    <Field label="Service / Reason">
                      <input name="service" style={inputSt} placeholder="e.g. Monthly Retainer" required />
                    </Field>
                    <Field label="Amount (₹)">
                      <input name="amount" type="number" style={inputSt} placeholder="5000" required />
                    </Field>
                    <button type="submit" className="btn btn-primary" style={{width:"100%", marginTop:"10px"}}>Submit Payout Request</button>
                  </form>
                </div>
                <div className="card-main">
                  <div className="card-header"><div className="card-title">My Payout History</div></div>
                  <div className="invoice-list">
                    <div className="invoice-row header"><div>ID</div><div>Service</div><div>Amount</div><div>Status</div><div>Date</div></div>
                    {invoices.map(inv=>(
                      <div className="invoice-row" key={inv.ID}>
                        <div style={{fontWeight:"600",fontSize:"12px"}}>{inv.invoice_id}</div>
                        <div style={{fontSize:"12px"}}>{inv.service}</div>
                        <div style={{fontFamily:"'Clash Display'",fontWeight:"600"}}>₹{(inv.amount||0).toLocaleString("en-IN")}</div>
                        <div>
                          <span className={`status-badge ${inv.status==="Paid"?"status-active":inv.status==="Declined"?"status-review":"status-paused"}`}>
                            <span className="status-dot"></span>{inv.status}
                          </span>
                          {inv.status === "Declined" && <div style={{fontSize:"10px", color:"var(--accent2)", marginTop:"4px"}}>Reason: {inv.decline_reason}</div>}
                        </div>
                        <div style={{fontSize:"11px",color:"var(--muted)"}}>{inv.date}</div>
                      </div>
                    ))}
                    {invoices.length===0 && <div style={{padding:"40px", textAlign:"center", color:"var(--muted)"}}>No payout requests found.</div>}
                  </div>
                </div>
              </div>
            )}

            {userRole === "client" && (
              <div className="card-main">
                <div className="card-header"><div className="card-title">My Invoices</div></div>
                <div className="invoice-list">
                  <div className="invoice-row header" style={{gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr 1fr"}}><div>ID</div><div>Service</div><div>Amount</div><div>Status</div><div>Date</div><div>Actions</div></div>
                  {invoices.map(inv=>(
                    <div className="invoice-row" key={inv.ID} style={{gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr 1fr"}}>
                      <div style={{fontWeight:"600",fontSize:"12px"}}>{inv.invoice_id}</div>
                      <div style={{fontSize:"12px"}}>{inv.service}</div>
                      <div style={{fontFamily:"'Clash Display'",fontWeight:"600"}}>₹{(inv.amount||0).toLocaleString("en-IN")}</div>
                      <div>
                        <span className={`status-badge ${inv.status==="Paid"?"status-active":inv.status==="Declined"?"status-review":"status-paused"}`}>
                          <span className="status-dot"></span>{inv.status}
                        </span>
                        {inv.status === "Declined" && <div style={{fontSize:"10px", color:"var(--accent2)", marginTop:"4px"}}>Reason: {inv.decline_reason}</div>}
                      </div>
                      <div style={{fontSize:"11px",color:"var(--muted)"}}>{inv.date}</div>
                      <div style={{display:"flex", gap:"8px"}}>
                        {inv.status === "Pending" ? (
                          <>
                            <button className="btn btn-primary" style={{padding:"4px 10px", fontSize:"10px"}} onClick={() => { setPayModal({ id: inv.ID, amount: inv.amount, step: 'init' }); setPayTimer(600); }}>
                              💸 Pay & Accept
                            </button>
                            <button className="btn btn-ghost" style={{padding:"4px 10px", fontSize:"10px", color:"var(--accent2)"}} onClick={() => setDeclineModal({ id: inv.ID, type: "client" })}>
                              Decline
                            </button>
                          </>
                        ) : (
                          <span style={{fontSize:"10px", color:"var(--accent3)", fontWeight:"700"}}>✓ Completed</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {invoices.length===0 && <div style={{padding:"40px", textAlign:"center", color:"var(--muted)"}}>No invoices found.</div>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ CLIENT HUB ══ */}
        {currentPage==="portal" && (
          <div className="page-view active">
            {!selectedClient ? (
              <>
                <div style={{marginBottom:"20px"}}>
                  <div style={{fontSize:"15px",fontWeight:"700",marginBottom:"4px"}}>Client Hub</div>
                  <div style={{fontSize:"13px",color:"var(--muted)"}}>Click any client to view their full project history and progress.</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"16px"}}>
                  {clients.map(c => {
                    const clientTasks = tasks.filter(t=>t.client===c.name);
                    const doneTasks   = clientTasks.filter(t=>t.status==="Done");
                    const clientInvs  = invoices.filter(i=>i.client===c.name);
                    const revenue     = clientInvs.filter(i=>i.status==="Paid").reduce((s,i)=>s+(i.amount||0),0);
                    const pct = clientTasks.length>0?Math.round((doneTasks.length/clientTasks.length)*100):0;
                    return (
                      <div key={c.ID}
                        onClick={()=>setSelectedClient(c)}
                        style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:"14px",padding:"20px",cursor:"pointer",transition:"all 0.2s"}}
                        className="member-card"
                      >
                        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"14px"}}>
                          <div className={`client-logo ${c.color||"av-purple"}`} style={{width:"44px",height:"44px",fontSize:"16px",borderRadius:"10px"}}>{c.initials||c.name.substring(0,2).toUpperCase()}</div>
                          <div>
                            <div style={{fontWeight:"700",fontSize:"14px"}}>{c.name}</div>
                            <div style={{fontSize:"11px",color:"var(--muted)"}}>{c.industry} &middot; {c.package}</div>
                          </div>
                          <span className={`status-badge ${c.status==="Active"?"status-active":c.status==="Review"?"status-review":"status-paused"}`} style={{marginLeft:"auto"}}>
                            <span className="status-dot"></span>{c.status}
                          </span>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",marginBottom:"12px"}}>
                          <div className="ms"><div className="ms-val" style={{color:"var(--accent)"}}>{clientTasks.length}</div><div className="ms-label">Tasks</div></div>
                          <div className="ms"><div className="ms-val" style={{color:"var(--accent3)"}}>{doneTasks.length}</div><div className="ms-label">Done</div></div>
                          <div className="ms"><div className="ms-val" style={{color:"var(--accent4)",fontSize:"13px"}}>₹{revenue.toLocaleString("en-IN")}</div><div className="ms-label">Earned</div></div>
                        </div>
                        {clientTasks.length>0&&(
                          <div>
                            <div style={{display:"flex",justifyContent:"space-between",fontSize:"10px",color:"var(--muted)",marginBottom:"4px"}}>
                              <span>Project completion</span><span style={{fontWeight:"700",color:"var(--accent3)"}}>{pct}%</span>
                            </div>
                            <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`}}></div></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {clients.length===0&&(
                    <div style={{gridColumn:"1/-1",textAlign:"center",padding:"60px",color:"var(--muted)"}}>
                      <div style={{fontSize:"36px",marginBottom:"12px"}}>👥</div>
                      <div style={{marginBottom:"12px"}}>No clients yet</div>
                      {userRole === "admin" && <button className="btn btn-primary" onClick={()=>setCurrentPage("clients")}>+ Add First Client</button>}
                    </div>
                  )}
                </div>
              </>
            ) : (() => {
              // Client detail view
              const c = selectedClient;
              const clientTasks = tasks.filter(t=>t.client===c.name);
              const doneTasks   = clientTasks.filter(t=>t.status==="Done");
              const clientInvs  = invoices.filter(i=>i.client===c.name);
              const clientEvts  = calEvents.filter(e=>e.client===c.name);
              const revenue     = clientInvs.filter(i=>i.status==="Paid").reduce((s,i)=>s+(i.amount||0),0);
              const pending     = clientInvs.filter(i=>i.status==="Pending").reduce((s,i)=>s+(i.amount||0),0);
              const pct = clientTasks.length>0?Math.round((doneTasks.length/clientTasks.length)*100):0;
              return (
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"24px"}}>
                    {userRole !== "client" && <button className="btn btn-ghost" style={{padding:"6px 14px"}} onClick={()=>setSelectedClient(null)}>← Back</button>}
                    <div className={`client-logo ${c.color||"av-purple"}`} style={{width:"42px",height:"42px",fontSize:"16px",borderRadius:"10px"}}>{c.initials||c.name.substring(0,2).toUpperCase()}</div>
                    <div>
                      <div style={{fontFamily:"'Clash Display'",fontSize:"20px",fontWeight:"700"}}>{c.name}</div>
                      <div style={{fontSize:"12px",color:"var(--muted)"}}>{c.industry} &middot; {c.package} &middot; <span className={`status-badge ${c.status==="Active"?"status-active":c.status==="Review"?"status-review":"status-paused"}`}><span className="status-dot"></span>{c.status}</span></div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px",marginBottom:"20px"}}>
                    <div className="stat-card s1"><div className="stat-label">Total Tasks</div><div className="stat-value">{clientTasks.length}</div><div className="stat-change up">{doneTasks.length} completed</div></div>
                    <div className="stat-card s3"><div className="stat-label">Revenue</div><div className="stat-value" style={{fontSize:"22px"}}>₹{revenue.toLocaleString("en-IN")}</div><div className="stat-change up">{clientInvs.filter(i=>i.status==="Paid").length} paid</div></div>
                    <div className="stat-card s4"><div className="stat-label">Pending</div><div className="stat-value" style={{fontSize:"22px"}}>₹{pending.toLocaleString("en-IN")}</div><div className="stat-change">{clientInvs.filter(i=>i.status==="Pending").length} invoices</div></div>
                    <div className="stat-card s2"><div className="stat-label">Scheduled Posts</div><div className="stat-value">{clientEvts.length}</div><div className="stat-change up">{pct}% done</div></div>
                  </div>

                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
                    {/* Tasks */}
                    <div className="card-main">
                      <div className="card-header"><div className="card-title">📋 Projects / Tasks</div></div>
                      <div className="card-body">
                        {clientTasks.length===0&&<div style={{color:"var(--muted)",fontSize:"12px",textAlign:"center",padding:"20px"}}>No tasks yet</div>}
                        {clientTasks.map(t=>(
                          <div key={t.ID} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                            <div>
                              <div style={{fontWeight:"600",fontSize:"12px"}}>{t.title}</div>
                              <div style={{fontSize:"10px",color:"var(--muted)"}}>{t.tag} &middot; Due {t.due_date||"—"}</div>
                            </div>
                            <span style={{fontSize:"10px",padding:"2px 8px",borderRadius:"10px",
                              background:t.status==="Done"?"rgba(67,233,123,0.1)":t.status==="In Progress"?"rgba(108,99,255,0.1)":"rgba(107,107,133,0.1)",
                              color:t.status==="Done"?"var(--accent3)":t.status==="In Progress"?"var(--accent)":"var(--muted)"}}>
                              {t.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Invoices */}
                    <div className="card-main">
                      <div className="card-header"><div className="card-title">💳 Invoices</div></div>
                      <div className="card-body">
                        {clientInvs.length===0&&<div style={{color:"var(--muted)",fontSize:"12px",textAlign:"center",padding:"20px"}}>No invoices yet</div>}
                        {clientInvs.map(i=>(
                          <div key={i.ID} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                            <div>
                              <div style={{fontWeight:"600",fontSize:"12px"}}>{i.invoice_id||`#INV-${i.ID}`}</div>
                              <div style={{fontSize:"10px",color:"var(--muted)"}}>{i.service} &middot; {i.date}</div>
                            </div>
                            <div style={{textAlign:"right"}}>
                              <div style={{fontFamily:"'Clash Display'",fontWeight:"700",fontSize:"13px"}}>₹{(i.amount||0).toLocaleString("en-IN")}</div>
                              <span className={`status-badge ${i.status==="Paid"?"status-active":i.status==="Overdue"?"status-review":"status-paused"}`} style={{fontSize:"10px"}}><span className="status-dot"></span>{i.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Scheduled posts */}
                    {clientEvts.length>0&&(
                      <div className="card-main" style={{gridColumn:"1/-1"}}>
                        <div className="card-header"><div className="card-title">📱 Scheduled Posts</div></div>
                        <div className="card-body" style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
                          {clientEvts.map(e=>(
                            <div key={e.ID} style={{padding:"6px 12px",borderRadius:"8px",background:`${PLATFORM_COLORS[e.platform]||"#a78bfa"}22`,color:PLATFORM_COLORS[e.platform]||"#a78bfa",fontSize:"12px"}}>
                              {e.platform.charAt(0).toUpperCase()+e.platform.slice(1)} · {e.title} · {e.date}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </div>

      {/* ══ MODALS ══ */}

      {(showTask||editTask) && (
        <Modal title={editTask?"Edit Task":"Add New Task"} onClose={()=>{setShowTask(false);setEditTask(null);}}>
          <form onSubmit={editTask?submitEditTask:submitTask}>
            <Field label="Task Title"><input style={inputSt} placeholder="e.g. Instagram Reels — FreshBite" value={editTask?editTask.title:fTask.title} onChange={e=>editTask?setEditTask({...editTask,title:e.target.value}):setFTask({...fTask,title:e.target.value})} required /></Field>
            <Field label="Client">
              <select style={inputSt} value={editTask?editTask.client:fTask.client} onChange={e=>editTask?setEditTask({...editTask,client:e.target.value}):setFTask({...fTask,client:e.target.value})}>
                <option value="">Select client</option>
                {clients.map(c=><option key={c.ID} value={c.name}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Tag">
              <select style={inputSt} value={editTask?editTask.tag:fTask.tag} onChange={e=>editTask?setEditTask({...editTask,tag:e.target.value}):setFTask({...fTask,tag:e.target.value})}>
                {["Content","Design","Ads","SEO","Strategy"].map(t=><option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select style={inputSt} value={editTask?editTask.status:fTask.status} onChange={e=>editTask?setEditTask({...editTask,status:e.target.value}):setFTask({...fTask,status:e.target.value})}>
                {STATUSES.map(s=><option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Due Date"><input style={inputSt} type="date" value={editTask?editTask.due_date:fTask.due_date} onChange={e=>editTask?setEditTask({...editTask,due_date:e.target.value}):setFTask({...fTask,due_date:e.target.value})} /></Field>
            <Field label="Assign Members">
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",maxHeight:"160px",overflowY:"auto",padding:"2px"}}>
                {team.length===0 && <div style={{fontSize:"12px",color:"var(--muted)",gridColumn:"1/-1"}}>No team members yet</div>}
                {/* Build a unique team list (by lowercase name) to avoid duplicate checkboxes */}
                {(() => {
                  const seen = new Set();
                  return team.filter(m => {
                    const key = m.name.trim().toLowerCase();
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                  });
                })().map(m => {
                  const currentVal = editTask ? editTask.assignees : fTask.assignees;
                  // Split, trim, deduplicate (case-insensitive) existing assignee names
                  const rawNames = (currentVal||"").split(",").map(s=>s.trim()).filter(Boolean);
                  // Use canonical m.name when checking — case-insensitive match
                  const checked = rawNames.some(n => n.toLowerCase() === m.name.trim().toLowerCase());
                  return (
                    <label key={m.ID}
                      style={{display:"flex",alignItems:"center",gap:"8px",padding:"7px 10px",borderRadius:"8px",cursor:"pointer",
                        border:`1px solid ${checked?"var(--accent)":"var(--border)"}`,
                        background:checked?"rgba(108,99,255,0.1)":"var(--surface)",transition:"all 0.15s"}}
                    >
                      <input type="checkbox" checked={checked} style={{display:"none"}}
                        onChange={() => {
                          let updated;
                          if (checked) {
                            // Remove ALL case variants of this member's name
                            updated = rawNames
                              .filter(n => n.toLowerCase() !== m.name.trim().toLowerCase())
                              .join(",");
                          } else {
                            // Add, using Set+lowercase-dedup so it's impossible to add twice
                            const withNew = [...rawNames, m.name.trim()];
                            const seen2 = new Set();
                            updated = withNew
                              .filter(n => { const k=n.toLowerCase(); if(seen2.has(k)) return false; seen2.add(k); return true; })
                              .join(",");
                          }
                          editTask ? setEditTask({...editTask,assignees:updated}) : setFTask({...fTask,assignees:updated});
                        }}
                      />
                      <div className={`avatar ${m.color||"av-blue"}`} style={{width:"24px",height:"24px",fontSize:"8px",flexShrink:0}}>
                        {m.initials||m.name.substring(0,2).toUpperCase()}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:"11px",fontWeight:"700",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.name}</div>
                        <div style={{fontSize:"9px",color:"var(--muted)"}}>{m.role}</div>
                      </div>
                      {checked && <span style={{color:"var(--accent)",fontSize:"14px",flexShrink:0}}>✓</span>}
                    </label>
                  );
                })}
              </div>
              {/* Show selected names — deduplicated */}
              {(() => {
                const val = editTask ? editTask.assignees : fTask.assignees;
                const seen3 = new Set();
                const names = (val||"").split(",").map(s=>s.trim()).filter(s => {
                  if(!s) return false;
                  const k=s.toLowerCase(); if(seen3.has(k)) return false; seen3.add(k); return true;
                });
                return names.length>0 ? (
                  <div style={{marginTop:"8px",fontSize:"11px",color:"var(--muted)"}}>
                    Assigned to: <span style={{color:"var(--accent)",fontWeight:"600"}}>{names.join(", ")}</span>
                  </div>
                ) : null;
              })()}
            </Field>
            <button type="submit" className="btn btn-primary" style={{width:"100%",padding:"12px",marginTop:"4px",borderRadius:"8px"}}>{editTask?"Save Changes":"Create Task"}</button>
          </form>
        </Modal>
      )}

      {showClient && (
        <Modal title="Add New Client" onClose={()=>setShowClient(false)}>
          <div style={{fontSize:"12px",color:"var(--muted)",marginBottom:"14px",padding:"10px",background:"rgba(67,233,123,0.08)",borderRadius:"8px",border:"1px solid rgba(67,233,123,0.2)"}}>
            📧 A welcome email will be sent to the client automatically.
          </div>
          <form onSubmit={submitClient}>
            <Field label="Client / Brand Name"><input style={inputSt} placeholder="e.g. FreshBite" value={fClient.name} onChange={e=>setFClient({...fClient,name:e.target.value})} required /></Field>
            <Field label="Client Email"><input style={inputSt} type="email" placeholder="contact@freshbite.com" value={fClient.email} onChange={e=>setFClient({...fClient,email:e.target.value})} /></Field>
            <Field label="Industry"><input style={inputSt} placeholder="e.g. Food & Beverage" value={fClient.industry} onChange={e=>setFClient({...fClient,industry:e.target.value})} /></Field>
            <Field label="Package"><select style={inputSt} value={fClient.package} onChange={e=>setFClient({...fClient,package:e.target.value})}>{["Full Service","Social + Content","Social + Ads","Performance Ads","SEO Only","Social + SEO"].map(p=><option key={p}>{p}</option>)}</select></Field>
            <Field label="Status"><select style={inputSt} value={fClient.status} onChange={e=>setFClient({...fClient,status:e.target.value})}>{["Active","Review","Paused"].map(s=><option key={s}>{s}</option>)}</select></Field>
            <Field label="Monthly Value (₹)"><input style={inputSt} type="number" placeholder="45000" value={fClient.monthly_value} onChange={e=>setFClient({...fClient,monthly_value:e.target.value})} /></Field>
            <Field label="Color"><select style={inputSt} value={fClient.color} onChange={e=>setFClient({...fClient,color:e.target.value})}>{["av-purple","av-blue","av-pink","av-green","av-orange"].map(c=><option key={c} value={c}>{c.replace("av-","")}</option>)}</select></Field>
            <button type="submit" className="btn btn-primary" style={{width:"100%",padding:"12px",marginTop:"4px",borderRadius:"8px"}}>Add Client</button>
          </form>
        </Modal>
      )}

      {showTeam && (
        <Modal title="Invite Team Member" onClose={()=>setShowTeam(false)}>
          <div style={{fontSize:"12px",color:"var(--muted)",marginBottom:"14px",padding:"10px",background:"rgba(108,99,255,0.1)",borderRadius:"8px",border:"1px solid rgba(108,99,255,0.2)"}}>
            📧 Member will receive an invitation email from Reecho Media.
          </div>
          <form onSubmit={submitTeam}>
            <Field label="Full Name"><input style={inputSt} placeholder="e.g. Zara Malik" value={fTeam.name} onChange={e=>setFTeam({...fTeam,name:e.target.value})} required /></Field>
            <Field label="Email"><input style={inputSt} type="email" placeholder="zara@agency.com" value={fTeam.email} onChange={e=>setFTeam({...fTeam,email:e.target.value})} /></Field>
            <Field label="Role"><input style={inputSt} placeholder="e.g. Content Strategist" value={fTeam.role} onChange={e=>setFTeam({...fTeam,role:e.target.value})} required /></Field>
            <Field label="Working on (projects)"><input style={inputSt} placeholder="e.g. FreshBite, Brand Strategy" value={fTeam.working_on} onChange={e=>setFTeam({...fTeam,working_on:e.target.value})} /></Field>
            <Field label="Color"><select style={inputSt} value={fTeam.color} onChange={e=>setFTeam({...fTeam,color:e.target.value})}>{["av-purple","av-blue","av-pink","av-green","av-orange"].map(c=><option key={c} value={c}>{c.replace("av-","")}</option>)}</select></Field>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px"}}>
              <Field label="Projects">
                <input style={inputSt} type="number" min="0" placeholder="0" value={fTeam.tasks_num} onChange={e=>setFTeam({...fTeam,tasks_num:e.target.value})} />
              </Field>
              <Field label="Completed">
                <input style={inputSt} type="number" min="0" placeholder="0" value={fTeam.tasks_done} onChange={e=>setFTeam({...fTeam,tasks_done:e.target.value})} />
              </Field>
              <Field label="Clients">
                <input style={inputSt} type="number" min="0" placeholder="0" value={fTeam.clients_num} onChange={e=>setFTeam({...fTeam,clients_num:e.target.value})} />
              </Field>
            </div>
            <button type="submit" className="btn btn-primary" style={{width:"100%",padding:"12px",marginTop:"4px",borderRadius:"8px"}}>Invite Member</button>
          </form>
        </Modal>
      )}

      {showCal && (
        <Modal title="Schedule Post" onClose={()=>setShowCal(false)}>
          <form onSubmit={submitCal}>
            <Field label="Post Title/Caption"><input style={inputSt} placeholder="e.g. FreshBite Summer Reel" value={fCal.title} onChange={e=>setFCal({...fCal,title:e.target.value})} required /></Field>
            <Field label="Client"><select style={inputSt} value={fCal.client} onChange={e=>setFCal({...fCal,client:e.target.value})}><option value="">Select client</option>{clients.map(c=><option key={c.ID} value={c.name}>{c.name}</option>)}</select></Field>
            <Field label="Platform"><select style={inputSt} value={fCal.platform} onChange={e=>setFCal({...fCal,platform:e.target.value})}><option value="instagram">Instagram</option><option value="facebook">Facebook</option><option value="linkedin">LinkedIn</option><option value="twitter">Twitter / X</option></select></Field>
            <Field label="Date"><input style={inputSt} type="date" value={fCal.date} onChange={e=>setFCal({...fCal,date:e.target.value})} required /></Field>
            <button type="submit" className="btn btn-primary" style={{width:"100%",padding:"12px",marginTop:"4px",borderRadius:"8px"}}>Schedule Post</button>
          </form>
        </Modal>
      )}

      {showInv && (
        <Modal title="Create Invoice" onClose={()=>setShowInv(false)}>
          <form onSubmit={submitInv}>
            <Field label="Invoice ID"><input style={inputSt} placeholder="INV-0042" value={fInv.invoice_id} onChange={e=>setFInv({...fInv,invoice_id:e.target.value})} /></Field>
            <Field label="Client"><select style={inputSt} value={fInv.client} onChange={e=>setFInv({...fInv,client:e.target.value})} required><option value="">Select client</option>{clients.map(c=><option key={c.ID} value={c.name}>{c.name}</option>)}</select></Field>
            <Field label="Service"><input style={inputSt} placeholder="Social Media Management — April" value={fInv.service} onChange={e=>setFInv({...fInv,service:e.target.value})} /></Field>
            <Field label="Amount (₹)"><input style={inputSt} type="number" placeholder="45000" value={fInv.amount} onChange={e=>setFInv({...fInv,amount:e.target.value})} required /></Field>
            <Field label="Date"><input style={inputSt} type="date" value={fInv.date} onChange={e=>setFInv({...fInv,date:e.target.value})} /></Field>
            <Field label="Status"><select style={inputSt} value={fInv.status} onChange={e=>setFInv({...fInv,status:e.target.value})}><option>Pending</option><option>Paid</option><option>Overdue</option></select></Field>
            <button type="submit" className="btn btn-primary" style={{width:"100%",padding:"12px",marginTop:"4px",borderRadius:"8px"}}>Create Invoice</button>
          </form>
        </Modal>
      )}

      {/* ══ EDIT MEMBER MODAL ══ */}
      {editMember && (
        <Modal title="Edit Team Member" onClose={()=>setEditMember(null)}>
          <form onSubmit={submitEditMember}>
            <Field label="Full Name"><input style={inputSt} value={editMember.name} onChange={e=>setEditMember({...editMember,name:e.target.value})} required /></Field>
            <Field label="Email"><input style={inputSt} type="email" value={editMember.email||""} onChange={e=>setEditMember({...editMember,email:e.target.value})} /></Field>
            <Field label="Role"><input style={inputSt} value={editMember.role} onChange={e=>setEditMember({...editMember,role:e.target.value})} required /></Field>
            <Field label="Working on (projects)"><input style={inputSt} value={editMember.working_on||""} placeholder="e.g. FreshBite, Brand Strategy" onChange={e=>setEditMember({...editMember,working_on:e.target.value})} /></Field>
            <Field label="Color">
              <select style={inputSt} value={editMember.color||"av-blue"} onChange={e=>setEditMember({...editMember,color:e.target.value})}>
                {["av-purple","av-blue","av-pink","av-green","av-orange"].map(c=><option key={c} value={c}>{c.replace("av-","")}</option>)}
              </select>
            </Field>
             <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
              <Field label="Clients served">
                <input style={inputSt} type="number" min="0" value={editMember.clients_num||0} onChange={e=>setEditMember({...editMember,clients_num:parseInt(e.target.value)||0})} />
              </Field>
              <Field label="Reset Password (Optional)">
                <input style={inputSt} type="password" placeholder="New password" onChange={e=>setEditMember({...editMember,password:e.target.value})} />
              </Field>
            </div>
            <button type="submit" className="btn btn-primary" style={{width:"100%",padding:"12px",marginTop:"4px",borderRadius:"8px"}}>Save Changes</button>
          </form>
        </Modal>
      )}

      {/* ══ CHANGE PASSWORD MODAL ══ */}
      {showPassModal && (
        <Modal title="Update Security" onClose={() => setShowPassModal(false)}>
          <form onSubmit={handlePasswordChange}>
            <Field label="Current Password">
              <input 
                type="password" 
                style={inputSt} 
                required 
                value={passForm.currentPassword} 
                onChange={e => setPassForm({...passForm, currentPassword: e.target.value})} 
              />
            </Field>
            <Field label="New Password">
              <input 
                type="password" 
                style={inputSt} 
                required 
                value={passForm.newPassword} 
                onChange={e => setPassForm({...passForm, newPassword: e.target.value})} 
              />
            </Field>
            <Field label="Confirm New Password">
              <input 
                type="password" 
                style={inputSt} 
                required 
                value={passForm.confirmPassword} 
                onChange={e => setPassForm({...passForm, confirmPassword: e.target.value})} 
              />
            </Field>
            <button type="submit" className="btn btn-primary" style={{width:"100%", padding:"12px", marginTop:"10px", borderRadius:"10px"}} disabled={passLoading}>
              {passLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </Modal>
      )}

      {/* ══ DECLINE MODAL ══ */}
      {declineModal && (
        <Modal title="Decline Invoice" onClose={() => setDeclineModal(null)}>
          <div style={{marginBottom:"16px", color:"var(--muted)", fontSize:"13px"}}>
            Please provide a reason for declining this {declineModal.type === "payout" ? "payout request" : "invoice"}. This will be visible to the {declineModal.type === "payout" ? "team member" : "admin"}.
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            updateInvoice(declineModal.id, { status: "Declined", decline_reason: e.target.reason.value });
            setDeclineModal(null);
          }}>
            <Field label="Reason for Declining">
              <textarea name="reason" style={{...inputSt, height:"100px", paddingTop:"10px", width:"100%", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"8px", color:"var(--text)"}} placeholder="e.g. Total amount mismatch or incorrect service details..." required />
            </Field>
            <button type="submit" className="btn btn-primary" style={{width:"100%", background:"var(--accent2)", borderColor:"var(--accent2)"}}>Submit & Decline</button>
          </form>
        </Modal>
      )}

      {/* ══ PAYMENT MODAL ══ */}
      {payModal && (
        <Modal title="Secure Payment Gateway" onClose={() => setPayModal(null)} width="400px">
          {payModal.step === 'init' ? (
            <div style={{padding:"10px 5px"}}>
              <div style={{display:"flex", alignItems:"center", gap:"15px", marginBottom:"24px", padding:"16px", background:"rgba(108,99,255,0.05)", borderRadius:"12px", border:"1px solid rgba(108,99,255,0.1)"}}>
                <div style={{width:"48px", height:"48px", borderRadius:"12px", background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px", color:"white"}}>⚡</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:"11px", color:"var(--muted)", textTransform:"uppercase", letterSpacing:"1px"}}>Total Payable</div>
                  <div style={{fontSize:"24px", fontWeight:"700", fontFamily:"'Clash Display'"}}>₹{payModal.amount.toLocaleString("en-IN")}</div>
                </div>
              </div>

              <div style={{marginBottom:"24px", textAlign:"center"}}>
                <div style={{fontSize:"12px", fontWeight:"600", color:"var(--muted)", marginBottom:"16px"}}>SCAN QR TO PAY</div>
                <div style={{background:"white", padding:"12px", borderRadius:"12px", marginBottom:"16px", display:"inline-block", border:"1px solid var(--border)"}}>
                  <img src="https://res.cloudinary.com/deukqrxtt/image/upload/v1773394955/WhatsApp_Image_2026-03-13_at_3.03.41_PM_rixo3n.jpg" 
                       alt="Payment QR Code" 
                       style={{width:"220px", height:"auto", borderRadius:"8px", display:"block"}} />
                </div>
                <div style={{fontSize:"11px", color:"var(--muted)", padding:"10px", border:"1px dashed var(--border)", borderRadius:"8px"}}>
                  UPI ID: <strong style={{color:"var(--text)"}}>priyathamtella@okhdfcbank</strong>
                </div>
              </div>

              <button className="btn btn-primary" style={{width:"100%", padding:"14px", borderRadius:"10px", fontWeight:"700", boxShadow:"0 4px 15px rgba(108,99,255,0.3)"}} onClick={() => {
                setPayModal({...payModal, step: 'processing'});
                setPayTimer(600);
              }}>
                I have Scanned & Paid
              </button>
            </div>
          ) : payModal.step === 'processing' ? (
            <div style={{textAlign:"center", padding:"40px 10px"}}>
              <div style={{position:"relative", width:"80px", height:"80px", margin:"0 auto 30px"}}>
                <div className="spinner" style={{position:"absolute", inset:0, border:"3px solid rgba(108,99,255,0.1)", borderTopColor:"var(--accent)", borderRadius:"50%", animation:"spin 1s linear infinite"}}></div>
                <div style={{position:"absolute", inset:"10px", background:"var(--bg)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"24px"}}>💳</div>
              </div>
              
              <div style={{fontSize:"18px", fontWeight:"700", marginBottom:"10px"}}>Confirming Transaction</div>
              <p style={{fontSize:"13px", color:"var(--muted)", marginBottom:"24px", padding:"0 20px"}}>We are verifying the payment with the bank. This usually takes a few minutes.</p>
              
              <div style={{display:"inline-flex", alignItems:"center", gap:"10px", padding:"8px 20px", background:"rgba(247,151,30,0.1)", borderRadius:"30px", marginBottom:"30px"}}>
                <span className="status-dot" style={{background:"var(--accent4)", animation:"pulse 1.5s infinite"}}></span>
                <span style={{fontSize:"17px", fontWeight:"700", color:"var(--accent4)", fontFamily:"'JetBrains Mono', monospace"}}>
                    {Math.floor(payTimer / 60)}:{String(payTimer % 60).padStart(2, '0')}
                </span>
              </div>

              <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
                <button className="btn btn-ghost" style={{width:"100%", fontSize:"12px"}} onClick={() => { 
                  setPayModal({...payModal, step: 'success'}); 
                  updateInvoice(payModal.id, { status: "Paid" }); 
                }}>Complete Verification Now</button>
                <button className="btn btn-ghost" style={{width:"100%", fontSize:"11px", border:"none", color:"var(--muted)"}} onClick={() => setPayModal(null)}>Cancel Verification</button>
              </div>
            </div>
          ) : (
            <div style={{textAlign:"center", padding:"40px 10px"}}>
              <div style={{width:"80px", height:"80px", background:"rgba(67,233,123,0.1)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:"40px"}}>✅</div>
              <div style={{fontSize:"22px", fontWeight:"700", color:"var(--accent3)", marginBottom:"12px"}}>Payment Received!</div>
              <p style={{fontSize:"14px", color:"var(--muted)", marginBottom:"32px"}}>The transaction was successful. Your invoice has been marked as <strong>Paid</strong>.</p>
              <button className="btn btn-primary" style={{width:"100%", padding:"14px", borderRadius:"10px"}} onClick={() => setPayModal(null)}>Back to Dashboard</button>
            </div>
          )}
        </Modal>
      )}

    </div>
  );
}