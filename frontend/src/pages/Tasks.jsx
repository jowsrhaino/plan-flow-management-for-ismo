import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Plus, Search, CheckCircle2, Trash2, Edit2, Loader2, CheckSquare } from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({ projectId: '', name: '', description: '', priority: 'Medium', status: 'Pending', dueDate: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [taskRes, projRes] = await Promise.all([
        api.get('/tasks', { params: { search, status: statusFilter, priority: priorityFilter } }),
        api.get('/projects')
      ]);
      setTasks(taskRes.data.data);
      setProjects(projRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter, priorityFilter]);

  const handleOpenCreate = () => {
    setEditingTask(null);
    setFormData({ projectId: projects[0]?.id || '', name: '', description: '', priority: 'Medium', status: 'Pending', dueDate: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTask(t);
    setFormData({ projectId: t.projectId, name: t.name, description: t.description || '', priority: t.priority, status: t.status, dueDate: t.dueDate || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, formData);
      } else {
        await api.post('/tasks', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to save task');
    }
  };

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    await api.put(`/tasks/${task.id}`, { status: nextStatus });
    fetchData();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
      await api.delete(`/tasks/${id}`);
      fetchData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tasks</h1>
          <p className="text-sm text-slate-500">Filter, prioritize, and manage project tasks.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          disabled={projects.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center shadow-sm disabled:opacity-50"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Create Task
        </button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
        >
          <option value="">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 font-medium">No tasks found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <div key={task.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                <div className="flex items-center space-x-3">
                  <button onClick={() => handleToggleStatus(task)}>
                    <CheckCircle2 className={`w-5 h-5 ${task.status === 'Completed' ? 'text-emerald-500 fill-emerald-100' : 'text-slate-300'}`} />
                  </button>
                  <div>
                    <h4 className={`text-sm font-semibold ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>{task.name}</h4>
                    <p className="text-xs text-slate-500">{task.Project?.name} • Due: {task.dueDate || 'None'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${task.priority === 'High' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                    {task.priority}
                  </span>
                  <button onClick={() => handleOpenEdit(task)} className="text-slate-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(task.id)} className="text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTask ? 'Edit Task' : 'Create Task'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Project *</label>
            <select
              required
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Task Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="mt-1 block w-full px-2 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full px-2 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="mt-1 block w-full px-2 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;