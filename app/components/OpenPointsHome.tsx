'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Search, AlertTriangle, Plus, Home, TrendingUp, Users, CheckCircle2, LayoutDashboard } from 'lucide-react';
import { fetchMyProjects, createProject } from '@/lib/services/openPointsService';
import { Project, DialogConfig } from '../types/openPoints';

const ITEMS_PER_PAGE = 9;
const COLORS = {
  Red: '#ef4444',
  Yellow: '#eab308',
  Orange: '#f97316',
  Green: '#10b981'
};

interface ChartData {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

interface User {
  id?: string;
  _id?: string;
  name?: string;
  companyName?: string;
  email?: string;
  userType?: string;
}

const OpenPointsHome: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  const [dialogConfig, setDialogConfig] = useState<DialogConfig>({ 
    open: false, 
    title: '', 
    message: '', 
    type: 'info', 
    onConfirm: undefined 
  });

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
const storedUser = localStorage.getItem('userData');

if (storedUser) {
  setUser(JSON.parse(storedUser));
}


      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }

    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await fetchMyProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects", error);
      showDialog("Error", "Failed to load projects. Please try again.", "alert");
    } finally {
      setLoading(false);
    }
  };

  const showDialog = (title: string, message: string, type: 'info' | 'alert' | 'confirm' = 'info', onConfirm?: () => void) => {
    setDialogConfig({ open: true, title, message, type, onConfirm });
  };

  const closeDialog = () => {
    setDialogConfig({ ...dialogConfig, open: false });
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      showDialog("Error", "Project name is required.", "alert");
      return;
    }

    if (!user?.id && !user?._id) {
      showDialog("Error", "User session not found. Please log in again.", "alert");
      return;
    }

    try {
      await createProject({
        name: newProject.name,
        description: newProject.description
      });
      
      setShowCreateModal(false);
      setNewProject({ name: '', description: '' });
      loadProjects();
      showDialog("Success", "Project created successfully!", "alert");
    } catch (error: any) {
      console.error("Error creating project", error);
      showDialog("Error", "Failed to create project: " + (error.response?.data?.error || error.message), "alert");
    }
  };

  const filteredProjects = projects.filter((p) => {
    const name = p.name?.toLowerCase() || '';
    const description = p.description?.toLowerCase() || '';
    const term = searchTerm.toLowerCase();
    return name.includes(term) || description.includes(term);
  });

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getInitials = (name: any): string => {
    if (!name || typeof name !== 'string') return '?';

    const parts = name.trim().split(' ');
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getMemberName = (member: any): string => {
    if (!member) return '';

    if (member.user) {
      if (typeof member.user === 'string') return member.user;
      if (typeof member.user.name === 'string') return member.user.name;
      if (typeof member.user.username === 'string') return member.user.username;
      if (member.user.email) return member.user.email.split('@')[0];
    }

    if (typeof member.name === 'string') return member.name;
    if (typeof member.username === 'string') return member.username;
    if (typeof member === 'string') return member;

    return '';
  };

  const getChartData = (type: 'stats' | 'myStats'): ChartData[] => {
    const red = projects.reduce((acc, p) => acc + (p[type]?.red || 0), 0);
    const yellow = projects.reduce((acc, p) => acc + (p[type]?.yellow || 0), 0);
    const orange = projects.reduce((acc, p) => acc + (p[type]?.orange || 0), 0);
    const green = projects.reduce((acc, p) => acc + (p[type]?.green || 0), 0);

    const data = [
      { name: 'Overdue', value: red, color: COLORS.Red },
      { name: 'On Track', value: yellow, color: COLORS.Yellow },
      { name: 'Change Req', value: orange, color: COLORS.Orange },
      { name: 'Closed', value: green, color: COLORS.Green }
    ];
    return data.filter(d => d.value > 0);
  };

  const myTasksData = getChartData('myStats');
  const projectHealthData = getChartData('stats');

  const totalMyTasks = projects.reduce((acc, p) => acc + (p.myStats?.total || 0), 0);
  const totalMyPending = projects.reduce((acc, p) => acc + (p.myStats?.red || 0) + (p.myStats?.yellow || 0), 0);

  const getOwnerUsername = (owner: any): string => {
    if (!owner) return '';
    if (typeof owner === 'string') return owner;
    return owner.name || owner.username || '';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200/60">
          <button
            onClick={() => router.push('/seller')}
            className="group flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300"
            title="Go to Dashboard"
          >
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 transition-all">
              <LayoutDashboard size={18} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 hidden sm:inline transition-colors">
              Dashboard
            </span>
          </button>
          
          <button
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center gap-2.5 font-semibold text-sm group"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="hidden sm:inline">Create Project</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        {/* Title Section */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-2">
            Open Points
          </h1>
          <p className="text-slate-600 text-lg font-medium">
            Welcome back, <span className="text-blue-600 font-semibold">{user?.name || 'User'}</span>!
          </p>
        </div>

        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 flex flex-col h-full group">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all">
                  <CheckCircle2 size={22} className="text-white" />
                </div>
                <h3 className="text-lg text-slate-900 font-bold">My Tasks Overview</h3>
              </div>
              {myTasksData.length > 0 ? (
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={myTasksData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={40} outerRadius={60} paddingAngle={5}>
                        {myTasksData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-slate-400 italic text-sm">No assigned tasks yet</div>
              )}
            </div>

            <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-xl hover:shadow-green-100/50 transition-all duration-300 flex flex-col h-full group">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30 group-hover:shadow-green-500/50 transition-all">
                  <TrendingUp size={22} className="text-white" />
                </div>
                <h3 className="text-lg text-slate-900 font-bold">Projects Health</h3>
              </div>
              {projectHealthData.length > 0 ? (
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={projectHealthData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={40} outerRadius={60} paddingAngle={5}>
                        {projectHealthData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-slate-400 italic text-sm">No data available</div>
              )}
            </div>

            <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300 flex flex-col justify-center h-full group">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all">
                  <Users size={22} className="text-white" />
                </div>
                <h3 className="text-lg text-slate-900 font-bold">Quick Stats</h3>
              </div>
              <div className="flex flex-col gap-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <span className="text-slate-600 font-medium text-sm">Total Projects</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">{projects.length}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <span className="text-slate-600 font-medium text-sm">Assigned to Me</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{totalMyTasks}</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-slate-600 font-medium text-sm">My Pending</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">{totalMyPending}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="relative max-w-md w-full mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200/80 outline-none text-sm bg-white shadow-sm hover:border-blue-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
          />
        </div>

        {loading ? (
          <div className="text-center mt-20 text-slate-500 text-lg">Loading projects...</div>
        ) : (
          <>
            {projects.length === 0 ? (
              <div className="text-center mt-20 text-slate-500">
                <h3 className="text-2xl font-bold text-slate-800 mb-3">No Projects Found</h3>
                <p className="mb-8 text-slate-600">You are not assigned to any project yet.</p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
                >
                  Create Your First Project
                </button>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center mt-20 text-slate-500">No projects match your search.</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedProjects.map(project => {
                    const r = project.stats?.red || 0;
                    const y = project.stats?.yellow || 0;
                    const o = project.stats?.orange || 0;
                    const g = project.stats?.green || 0;
                    
                    const totalPoints = r + y + o + g;
                    const safeTotal = totalPoints > 0 ? totalPoints : 1;
                    const completedPoints = g;
                    const percentage = Math.round((completedPoints / safeTotal) * 100);

                    return (
                    <div
                      key={project._id}
                      onClick={() => router.push(`/open-points/project/${project._id}`)}
                      className="group relative bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 hover:border-slate-300/80 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{project.name}</h3>
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm ${
                          getOwnerUsername(project.owner) === user?.name
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {getOwnerUsername(project.owner) === user?.name ? 'Owner' : 'Member'}
                        </span>
                      </div>

                      <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow line-clamp-2 min-h-[40px]">
                        {project.description || 'No description provided.'}
                      </p>

                      <div className="mb-6">
                        <div className="flex justify-between text-xs font-semibold mb-2.5">
                          <span className="text-slate-600">Completion</span>
                          <span className="text-blue-600 font-bold">
                            {percentage}%
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-green-600" 
                            style={{ width: `${(g / safeTotal) * 100}%` }} 
                          />
                          <div 
                            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500" 
                            style={{ width: `${(y / safeTotal) * 100}%` }} 
                          />
                          <div 
                            className="h-full bg-gradient-to-r from-orange-400 to-orange-500" 
                            style={{ width: `${(o / safeTotal) * 100}%` }} 
                          />
                          <div 
                            className="h-full bg-gradient-to-r from-red-400 to-red-500" 
                            style={{ width: `${(r / safeTotal) * 100}%` }} 
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-auto">
                        <div className="flex items-center pl-1">
                          {project.owner && (
                          <div
                              className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-md"
                              title={`Owner: ${getOwnerUsername(project.owner)}`}
                          >
                              {getInitials(getOwnerUsername(project.owner))}
                          </div>
                          )}
  {project.team_members?.slice(0, 3).map((m, i) => {
    const memberName = getMemberName(m);

    if (!memberName) return null;

    return (
      <div
        key={i}
        className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-md -ml-3"
        title={`Member: ${memberName}`}
      >
        {getInitials(memberName)}
      </div>
    );
  })}

                          {project.team_members && project.team_members.length > 3 && (
                            <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold border-2 border-white shadow-md -ml-3">
                              +{project.team_members.length - 3}
                            </div>
                          )}
                        </div>

                        {((project.myStats?.red || 0) > 0 || (project.myStats?.yellow || 0) > 0) && (
                          <span className="bg-gradient-to-r from-red-50 to-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-red-200 shadow-sm">
                            {(project.myStats?.red || 0) + (project.myStats?.yellow || 0)} Pending
                            <AlertTriangle size={13} />
                          </span>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-3 mt-12 mb-6">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="bg-white px-5 py-2.5 rounded-xl shadow-sm border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      Previous
                    </button>
                    <span className="bg-white px-6 py-2.5 rounded-xl shadow-sm border border-slate-200 text-slate-700 font-semibold flex items-center">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="bg-white px-5 py-2.5 rounded-xl shadow-sm border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
              onClick={() => setShowCreateModal(false)}
            ></div>
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-300 border border-slate-200">
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/30">
                <h3 className="text-xl font-bold text-slate-900">Create New Project</h3>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Project Name</label>
                  <input 
                    value={newProject.name} 
                    onChange={e => setNewProject({ ...newProject, name: e.target.value })} 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white hover:border-slate-300"
                    placeholder="e.g. Marketing Campaign"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Description</label>
                  <textarea 
                    value={newProject.description} 
                    onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white resize-none hover:border-slate-300"
                    placeholder="Brief description..."
                  />
                </div>
                <div className="flex justify-end gap-3 pt-3">
                  <button 
                    type="button" 
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2.5 rounded-xl text-slate-700 font-semibold border border-slate-200 hover:bg-slate-50 hover:shadow-md transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateProject} 
                    className="px-7 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
                  >
                    Create Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {dialogConfig.open && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeDialog}></div>
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-7 relative z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-200">
              <h4 className="text-xl font-bold text-slate-900 mb-3">{dialogConfig.title}</h4>
              <p className="text-slate-600 mb-7 leading-relaxed">{dialogConfig.message}</p>
              <div className="flex justify-center gap-3">
                {dialogConfig.type === 'confirm' && (
                  <button 
                    onClick={closeDialog} 
                    className="px-5 py-2.5 rounded-xl text-slate-700 font-semibold border border-slate-200 hover:bg-slate-50 hover:shadow-md transition-all duration-300"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (dialogConfig.onConfirm) dialogConfig.onConfirm();
                    closeDialog();
                  }} 
                  className="px-7 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenPointsHome;