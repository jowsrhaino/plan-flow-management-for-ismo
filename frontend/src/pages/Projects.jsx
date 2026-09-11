import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Plus, Search, Trash2, Edit2, FolderKanban, Calendar, Loader2 } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'Not Started', startDate: '', endDate: '' });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects', { params: { search, status: statusFilter } });
      setProjects(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter]);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({ name: '', description: '', status: 'Not Started', startDate: '', endDate: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProject(p);
    setFormData({ name: p.name, description: p.description || '', status: p.status, startDate: p.startDate || '', endDate: p.endDate || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, formData);
      } else {
        await api.post('/projects', formData);
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      alert('Failed to save project');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this project and all its tasks?')) {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500">Manage and track your project deliverables.</p>
        </div>
        <button onClick={handleOpenCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center shadow-sm">
          <Plus className="w-4 h-4 mr-1.5" /> Create Project
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 font-medium">No projects found. Create your first project!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div key={p.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${p.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : p.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}`}>
                    {p.status}
                  </span>
                  <div className="flex space-x-1">
                    <button onClick={() => handleOpenEdit(p)} className="p-1 text-slate-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description || 'No description provided.'}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Progress</span>
                  <span className="font-semibold">{p.progressPercentage || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${p.progressPercentage || 0}%` }} />
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-3">
                  <span>{p.completedTasks} of {p.totalTasks} tasks done</span>
                  <span>{p.startDate ? new Date(p.startDate).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProject ? 'Edit Project' : 'Create Project'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Project Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full px-2 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-1 block w-full px-2 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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

export default Projects;
