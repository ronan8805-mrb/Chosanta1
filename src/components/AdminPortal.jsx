import React, { useState, useEffect } from 'react';
import { api } from '../App';
import { useAuth } from '../App';

export default function AdminPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [data, setData] = useState({
    users: [], sites: [], roles: [], recurring: [], tasks: [], overdue: [], audit: [], settings: []
  });
  const [loading, setLoading] = useState(true);

  const [showUserModal, setShowUserModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showRecModal, setShowRecModal] = useState(false);
  const [editRec, setEditRec] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const responses = await Promise.all([
        api('/api/admin/users'),
        api('/api/admin/sites'),
        api('/api/admin/roles'),
        api('/api/admin/recurring'),
        api('/api/admin/task-instances'),
        api('/api/admin/overdue'),
        user.role_level >= 3 ? api('/api/admin/audit?limit=50') : Promise.resolve([])
      ]);
      setData({
        users: responses[0],
        sites: responses[1],
        roles: responses[2],
        recurring: responses[3],
        tasks: responses[4],
        overdue: responses[5],
        audit: responses[6]
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd.entries());
    body.role_id = parseInt(body.role_id);
    body.site_id = body.site_id ? parseInt(body.site_id) : null;
    body.supervisor_id = body.supervisor_id ? parseInt(body.supervisor_id) : null;

    // Password validation on create
    if (!editUser?.id) {
      if (!body.password || body.password.length < 8) {
        alert('Password must be at least 8 characters.');
        return;
      }
      if (body.password !== body.confirm_password) {
        alert('Passwords do not match.');
        return;
      }
      delete body.confirm_password;
    } else {
      // On edit, only send password if filled in
      if (body.password && body.password !== body.confirm_password) {
        alert('Passwords do not match.');
        return;
      }
      if (!body.password) {
        delete body.password;
      }
      delete body.confirm_password;
    }

    try {
      if (editUser?.id) {
        body.reason = 'Admin update';
        await api(`/api/admin/users/${editUser.id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await api('/api/admin/users', { method: 'POST', body: JSON.stringify(body) });
        alert(`User created successfully! They can now log in with the password you set.`);
      }
      setShowUserModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const saveRec = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd.entries());
    body.assigned_role_id = body.assigned_role_id ? parseInt(body.assigned_role_id) : null;
    body.assigned_user_id = body.assigned_user_id ? parseInt(body.assigned_user_id) : null;
    body.site_id = body.site_id ? parseInt(body.site_id) : null;
    body.evidence_required = body.evidence_required === 'true' ? 1 : 0;
    
    try {
      if (editRec?.id) {
        body.reason = "Admin update";
        await api(`/api/admin/recurring/${editRec.id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await api('/api/admin/recurring', { method: 'POST', body: JSON.stringify(body) });
      }
      setShowRecModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (user.role_level < 3) return <div className="page-content"><h2>Access Denied</h2></div>;

  return (
    <div className="admin-portal">
      <div className="page-header">
        <h1>Board & Director Admin Portal</h1>
      </div>

      <div className="toolbar" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 24 }}>
        <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('users')}>Users & Roles</button>
        <button className={`btn ${activeTab === 'sites' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('sites')}>Sites & Centres</button>
        <button className={`btn ${activeTab === 'recurring' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('recurring')}>Recurring Compliance</button>
        <button className={`btn ${activeTab === 'overdue' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('overdue')}>Overdue Actions</button>
        <button className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('audit')}>System Audit Trail</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <>
          {activeTab === 'users' && (
            <div className="card">
              <div className="card-header">
                <h3>User Management</h3>
                {user.role_level >= 4 && <button className="btn btn-primary btn-sm" onClick={() => { setEditUser(null); setShowUserModal(true); }}>+ Add User</button>}
              </div>
              <table className="data-table">
                <thead><tr><th>Name</th><th>Role</th><th>Site</th><th>Job Title</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead>
                <tbody>
                  {data.users.map(u => (
                    <tr key={u.id}>
                      <td>{u.full_name}<br/><small style={{color:'var(--text-muted)'}}>{u.email}</small></td>
                      <td><span className="badge" style={{background: 'var(--navy-light)', color: 'white'}}>{u.role_name} (L{u.role_level})</span></td>
                      <td>{u.site_name || 'All Sites'}</td>
                      <td>{u.job_title || '-'}</td>
                      <td><span className={`badge ${u.active ? 'badge-active' : 'badge-closed'}`}>{u.active ? 'Active' : 'Inactive'}</span></td>
                      <td>{u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}</td>
                      <td>
                        {user.role_level >= 4 && (
                          <div style={{display:'flex',gap:6}}>
                            <button className="btn btn-ghost btn-sm" onClick={() => { setEditUser(u); setShowUserModal(true); }}>Edit</button>
                            {u.active ? 
                              <button className="btn btn-danger btn-sm" onClick={() => api(`/api/admin/users/${u.id}/deactivate`, {method:'POST',body:JSON.stringify({reason:'Admin manual deactivate'})}).then(fetchData)}>Deactivate</button> :
                              <button className="btn btn-primary btn-sm" onClick={() => api(`/api/admin/users/${u.id}/activate`, {method:'POST',body:JSON.stringify({reason:'Admin manual reactivate'})}).then(fetchData)}>Activate</button>
                            }
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'recurring' && (
            <div className="card">
              <div className="card-header">
                <h3>Recurring Compliance Schedule</h3>
                <button className="btn btn-primary btn-sm" onClick={() => { setEditRec(null); setShowRecModal(true); }}>+ Add Recurring Task</button>
              </div>
              <table className="data-table">
                <thead><tr><th>Task Name</th><th>Category</th><th>Frequency</th><th>Assigned To</th><th>Site</th><th>Next Due</th><th>Actions</th></tr></thead>
                <tbody>
                  {data.recurring.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.task_name}</strong></td>
                      <td><span className="badge badge-minor">{r.category}</span></td>
                      <td>{r.frequency}</td>
                      <td>{r.assigned_role_name || r.assigned_user_name || 'Unassigned'}</td>
                      <td>{r.site_name || 'All Sites'}</td>
                      <td>{r.due_date ? new Date(r.due_date).toLocaleDateString() : '-'}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditRec(r); setShowRecModal(true); }}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'overdue' && (
            <div className="card">
              <div className="card-header">
                <h3>Overdue Action Items</h3>
              </div>
              <table className="data-table">
                <thead><tr><th>Task Name</th><th>Category</th><th>Assigned To</th><th>Site</th><th>Due Date</th><th>Escalation</th></tr></thead>
                <tbody>
                  {data.overdue.length === 0 ? <tr><td colSpan="6" style={{textAlign:'center',padding:24}}>No overdue items! 🎉</td></tr> : 
                    data.overdue.map(o => (
                    <tr key={o.id}>
                      <td><strong>{o.task_name}</strong></td>
                      <td><span className="badge badge-critical">{o.category}</span></td>
                      <td>{o.assigned_user_name || 'Unassigned'}</td>
                      <td>{o.site_name || 'All Sites'}</td>
                      <td style={{color:'var(--danger)',fontWeight:600}}>{new Date(o.due_date).toLocaleDateString()}</td>
                      <td>{o.escalation_route || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="card">
              <div className="card-header">
                <h3>System Audit Trail</h3>
              </div>
              <table className="data-table">
                <thead><tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Table</th><th>Record ID</th><th>Changes</th></tr></thead>
                <tbody>
                  {data.audit.map(a => (
                    <tr key={a.id}>
                      <td style={{whiteSpace:'nowrap'}}>{new Date(a.timestamp).toLocaleString()}</td>
                      <td>{a.actor_name}</td>
                      <td><strong>{a.action}</strong></td>
                      <td>{a.table_name}</td>
                      <td>{a.record_id || '-'}</td>
                      <td>
                        {a.new_value && <pre style={{fontSize:10,background:'#f5f5f5',padding:4,borderRadius:4,maxWidth:300,overflowX:'auto'}}>{a.new_value}</pre>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'sites' && (
            <div className="card">
              <div className="card-header">
                <h3>Sites & Centres</h3>
              </div>
              <table className="data-table">
                <thead><tr><th>Name</th><th>Address</th><th>Tusla Reg</th><th>Capacity</th></tr></thead>
                <tbody>
                  {data.sites.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.address || '-'}</td>
                      <td>{s.tusla_reg || '-'}</td>
                      <td>{s.capacity || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editUser ? 'Edit User' : 'Create User'}</h2>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>×</button>
            </div>
            <form onSubmit={saveUser}>
              <div className="modal-body form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input name="full_name" defaultValue={editUser?.full_name} required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input name="email" type="email" defaultValue={editUser?.email} required />
                </div>
                <div className="form-group">
                  <label>Role Level</label>
                  <select name="role_id" defaultValue={editUser?.role_id || 1} required>
                    {data.roles.map(r => <option key={r.id} value={r.id}>{r.name} (L{r.level})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Job Title</label>
                  <input name="job_title" defaultValue={editUser?.job_title} />
                </div>
                <div className="form-group">
                  <label>Assigned Site</label>
                  <select name="site_id" defaultValue={editUser?.site_id || ''}>
                    <option value="">Organisation Wide</option>
                    {data.sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Supervisor</label>
                  <select name="supervisor_id" defaultValue={editUser?.supervisor_id || ''}>
                    <option value="">None</option>
                    {data.users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{borderTop:'2px solid var(--border)',paddingTop:12,marginTop:4}}>
                  <label>{editUser ? 'New Password (leave blank to keep current)' : 'Set Password ✱'}</label>
                  <input
                    name="password"
                    type="password"
                    placeholder={editUser ? 'Leave blank to keep unchanged' : 'Min. 8 characters'}
                    required={!editUser}
                    autoComplete="new-password"
                  />
                </div>
                <div className="form-group" style={{paddingTop: editUser ? 0 : 12}}>
                  <label>Confirm Password {!editUser && '✱'}</label>
                  <input
                    name="confirm_password"
                    type="password"
                    placeholder="Re-enter password"
                    required={!editUser}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowUserModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recurring Task Modal */}
      {showRecModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editRec ? 'Edit Recurring Task' : 'Create Recurring Task'}</h2>
              <button className="modal-close" onClick={() => setShowRecModal(false)}>×</button>
            </div>
            <form onSubmit={saveRec}>
              <div className="modal-body form-grid">
                <div className="form-group full">
                  <label>Task Name</label>
                  <input name="task_name" defaultValue={editRec?.task_name} required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" defaultValue={editRec?.category || 'General'}>
                    <option>Governance</option>
                    <option>Staffing</option>
                    <option>Safety</option>
                    <option>Medication</option>
                    <option>Care Planning</option>
                    <option>Risk Management</option>
                    <option>General</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Frequency</label>
                  <select name="frequency" defaultValue={editRec?.frequency || 'Monthly'}>
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                    <option>Every 6 Weeks</option>
                    <option>Quarterly</option>
                    <option>Every 6 Months</option>
                    <option>Annually</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Assign to Role (Optional)</label>
                  <select name="assigned_role_id" defaultValue={editRec?.assigned_role_id || ''}>
                    <option value="">Specific User Instead</option>
                    {data.roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Assign to User (Optional)</label>
                  <select name="assigned_user_id" defaultValue={editRec?.assigned_user_id || ''}>
                    <option value="">Role Based Instead</option>
                    {data.users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Specific Site</label>
                  <select name="site_id" defaultValue={editRec?.site_id || ''}>
                    <option value="">Organisation Wide</option>
                    {data.sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Escalation Route</label>
                  <input name="escalation_route" defaultValue={editRec?.escalation_route} placeholder="e.g. Director" />
                </div>
                <div className="form-group">
                  <label>Requires Evidence Upload</label>
                  <select name="evidence_required" defaultValue={editRec?.evidence_required ? 'true' : 'false'}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowRecModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
