'use client'
import React, { useState, useCallback } from 'react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils/open-points';
import { useParams, useRouter } from 'next/navigation'; // Added useRouter
import { ArrowLeft, Trash2 } from 'lucide-react'; // Added Icons

// Types
interface TeamMember {
  _id: string;        // USER ID (not projectMemberId)
  username: string;
  role: string;
}


interface OpenPoint {
  _id: string;
  title: string;
  responsibility: string; // this will store USER ID
  level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  gap_action: string;
  target_date: string;
  status: 'Red' | 'Yellow' | 'Green' | 'Orange';
  review_date: string;
  remarks: string;
  priority: 'Emergency' | 'High' | 'Medium' | 'Low';
}

interface SummaryStats {
  name: string;
  total: number;
  green: number;
  yellow: number;
  red: number;
  orange: number;
}

interface DialogConfig {
  open: boolean;
  title: string;
  message: string;
  type: 'info' | 'confirm' | 'alert';
  onConfirm: (() => void) | null;
}

interface Filters {
  status: string;
  priority: string;
  responsibility: string;
}

// Demo Data (kept as is)
const demoTeam: TeamMember[] = [
  { _id: '1', username: 'John Smith', role: 'Owner' },
  { _id: '2', username: 'Sarah Johnson', role: 'L2' },
  { _id: '3', username: 'Mike Davis', role: 'L3' },
  { _id: '4', username: 'Emily Chen', role: 'L4' },
];

const demoPoints: OpenPoint[] = [
  {
    _id: '1',
    title: 'Implement user authentication module',
    responsibility: 'John Smith',
    level: 'L2',
    gap_action: 'Need to integrate with SSO provider',
    target_date: '2024-02-15',
    status: 'Yellow',
    review_date: '2024-02-10',
    remarks: 'Waiting for API credentials',
    priority: 'High',
  },
  {
    _id: '2',
    title: 'Database schema design review',
    responsibility: 'Sarah Johnson',
    level: 'L3',
    gap_action: 'Complete ERD documentation',
    target_date: '2024-02-12',
    status: 'Green',
    review_date: '2024-02-08',
    remarks: 'Approved by stakeholders',
    priority: 'Medium',
  },
  {
    _id: '3',
    title: 'Security audit for payment gateway',
    responsibility: 'Mike Davis',
    level: 'L4',
    gap_action: 'Pending third-party review',
    target_date: '2024-02-20',
    status: 'Red',
    review_date: '',
    remarks: 'Critical - high priority',
    priority: 'Emergency',
  },
  {
    _id: '4',
    title: 'UI/UX improvements for dashboard',
    responsibility: 'Emily Chen',
    level: 'L1',
    gap_action: 'Design mockups in progress',
    target_date: '2024-02-18',
    status: 'Orange',
    review_date: '2024-02-14',
    remarks: 'Change request from client',
    priority: 'Medium',
  },
];

const ProjectWorkspace: React.FC = () => {
  const router = useRouter(); // Added Router Hook
  const [points, setPoints] = useState<OpenPoint[]>([]);
  const [projectTeam, setProjectTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');

  const [showLegend, setShowLegend] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [filters, setFilters] = useState<Filters>({ status: '', priority: '', responsibility: '' });
  const [modifiedPoints, setModifiedPoints] = useState<Set<string>>(new Set());
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('L2');
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const [newPoint, setNewPoint] = useState<Omit<OpenPoint, '_id'>>({
    title: '',
    responsibility: '',
    level: 'L2',
    gap_action: '',
    target_date: '',
    status: 'Red',
    review_date: '',
    remarks: '',
    priority: 'Low',
  });

  const [dialogConfig, setDialogConfig] = useState<DialogConfig>({
    open: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
  });

  const showDialog = (title: string, message: string, type: 'info' | 'confirm' | 'alert' = 'info', onConfirm: (() => void) | null = null) => {
    setDialogConfig({ open: true, title, message, type, onConfirm });
  };

  const closeDialog = () => {
    setDialogConfig({ ...dialogConfig, open: false });
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const calculateSummary = useCallback(
    (data: OpenPoint[]): SummaryStats[] => {
      const stats: Record<string, SummaryStats> = {};

      data.forEach((p) => {
        const member = projectTeam.find(m => m._id === p.responsibility);
        const person = member?.username || 'Unassigned';

        if (!stats[person]) {
          stats[person] = {
            name: person,
            total: 0,
            green: 0,
            yellow: 0,
            red: 0,
            orange: 0,
          };
        }

        stats[person].total++;
        if (p.status === 'Green') stats[person].green++;
        else if (p.status === 'Yellow') stats[person].yellow++;
        else if (p.status === 'Red') stats[person].red++;
        else if (p.status === 'Orange') stats[person].orange++;
      });

      return Object.values(stats);
    },
    [projectTeam] 
  );

  const summary = calculateSummary(points);

  const handleUpdate = (pointId: string, field: keyof OpenPoint, value: string) => {
    const updatedPoints = points.map((p) =>
      p._id === pointId ? { ...p, [field]: value } : p
    );
    setPoints(updatedPoints);
    setModifiedPoints((prev) => new Set(prev).add(pointId));
  };

  const handleDeleteRow = (pointId: string) => {
    showDialog('Confirm Delete', 'Are you sure you want to delete this point?', 'confirm', async () => {
      try {
        const res = await fetch(`/api/openPoints/points/${pointId}`, {
          method: 'DELETE',
        });

        if (!res.ok) throw new Error();

        setPoints(prev => prev.filter(p => p._id !== pointId));
      } catch {
        showDialog('Error', 'Failed to delete point', 'alert');
      }
    });
  };

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await fetch("/api/openPoints/users");
        if (!res.ok) throw new Error();

        const data = await res.json();
        setAllUsers(data);
      } catch {
        showDialog("Error", "Failed to load suppliers", "alert");
      }
    };

    fetchSuppliers();
  }, []);

  const validateFields = (data: Partial<OpenPoint>): string[] => {
    const missing: string[] = [];
    if (!data.title?.trim()) missing.push('Discussion Points');
    if (!data.responsibility) missing.push('Responsibility');
    if (!data.level) missing.push('Approval Level');
    if (!data.target_date) missing.push('Target Date');
    if (!data.priority) missing.push('Priority');
    return missing;
  };

  const handleSaveRow = async (pointId: string) => {
    const point = points.find(p => p._id === pointId);
    if (!point) return;

    const missingFields = validateFields(point);
    if (missingFields.length > 0) {
      showDialog('Action Required', `Please provide:\n\n• ${missingFields.join('\n• ')}`, 'alert');
      return;
    }

    try {
      const res = await fetch(`/api/openPoints/points/${pointId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: point.title,
          status: point.status,
          target_date: point.target_date,
          responsible_person: point.responsibility || null,
        }),
      });

      if (!res.ok) throw new Error('Update failed');

      showDialog('Success', 'Saved successfully!', 'alert');

      setModifiedPoints(prev => {
        const next = new Set(prev);
        next.delete(pointId);
        return next;
      });
    } catch (err) {
      showDialog('Error', 'Failed to save changes', 'alert');
    }
  };

   const createPoint = async () => {
    const missingFields = validateFields(newPoint);
    if (missingFields.length > 0) {
      showDialog('Action Required', `Please provide:\n\n• ${missingFields.join('\n• ')}`, 'alert');
      return;
    }

    try {
      const res = await fetch('/api/openPoints/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          title: newPoint.title,
          status: newPoint.status,
          target_date: newPoint.target_date,
          responsible_person: newPoint.responsibility || null,
          reviewer: null
        }),
      });

      if (!res.ok) throw new Error('Create failed');

      const createdPoint = await res.json();

      // ✅ FIX: Robustly extract the ID regardless of API response format (String vs Object)
      const getResponsibilityId = (data: any) => {
        if (!data) return '';
        // If API returns a string ID directly
        if (typeof data === 'string') return data;
        // If API returns a populated object
        if (typeof data === 'object' && data._id) return data._id;
        return '';
      };

      const mappedCreatedPoint: OpenPoint = {
        _id: createdPoint._id,
        title: createdPoint.title,
        // ✅ Apply the safe logic here
        responsibility: getResponsibilityId(createdPoint.responsible_person),
        level: 'L2',
        gap_action: '',
        target_date: createdPoint.target_date,
        status: createdPoint.status,
        review_date: '',
        remarks: '',
        priority: 'Medium',
      };

      setPoints(prev => [...prev, mappedCreatedPoint]);

      setNewPoint({
        title: '',
        responsibility: '',
        level: 'L2',
        gap_action: '',
        target_date: '',
        status: 'Red',
        review_date: '',
        remarks: '',
        priority: 'Low',
      });

    } catch (error) {
      showDialog('Error', 'Failed to create open point', 'alert');
    }
  };

  const handleAddMember = async () => {
    if (!newMemberName) {
      showDialog("Error", "Please select a user", "alert");
      return;
    }

    const selectedUser = allUsers.find(u => u._id === newMemberName);
    if (!selectedUser) {
      showDialog("Error", "User not found", "alert");
      return;
    }

    try {
      const res = await fetch(
        `/api/openPoints/projects/${projectId}/members`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: selectedUser._id,
          username: selectedUser.name,
          role: newMemberRole
        })

        }
      );

      if (!res.ok) throw new Error();

      await fetchMembers();

      setNewMemberName("");
      setShowAddMember(false);
      showDialog("Success", "Member added successfully!", "alert");

    } catch {
      showDialog("Error", "Failed to add member", "alert");
    }
  };

  const filteredPoints = points.filter((p) => {
    if (filters.status && p.status !== filters.status) return false;
    if (filters.priority && p.priority !== filters.priority) return false;
    if (filters.responsibility && p.responsibility !== filters.responsibility) return false;
    return true;
  });

  const getStatusCellClass = (status: string) => {
    switch (status) {
      case 'Green':
        return 'bg-[#00FF00] text-black';
      case 'Red':
        return 'bg-[#FF0000] text-white';
      case 'Yellow':
        return 'bg-[#FFFF00] text-black';
      case 'Orange':
        return 'bg-[#FFA500] text-black';
      default:
        return '';
    }
  };
  
  const params = useParams();
  const projectId = params.id as string;

  const fetchMembers = async () => {
    const res = await fetch(`/api/openPoints/projects/${projectId}/members`);
    const data = await res.json();
    setProjectTeam(data);
  };

  useEffect(() => {
    if (!projectId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [pointsRes, membersRes] = await Promise.all([
          fetch(`/api/openPoints/projects/${projectId}/points`),
          fetch(`/api/openPoints/projects/${projectId}/members`)
        ]);

        if (!pointsRes.ok || !membersRes.ok) throw new Error();

        const pointsData = await pointsRes.json();
        const membersData = await membersRes.json();

        const mappedPoints = pointsData.map((p: any) => ({
          _id: p._id,
          title: p.title,
          responsibility: p.responsible_person?._id || '',
          level: 'L2',
          gap_action: '',
          target_date: p.target_date,
          status: p.status,
          review_date: '',
          remarks: '',
          priority: 'Medium',
        }));

        setPoints(mappedPoints);
        setProjectTeam(membersData);
      } catch {
        showDialog("Error", "Failed to load project data", "alert");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // --- NEW: Delete Project Handler ---
  const handleDeleteProject = () => {
    showDialog('Delete Project', 'Are you sure you want to delete this project? This action cannot be undone.', 'confirm', async () => {
      try {
        const res = await fetch(`/api/openPoints/projects/${projectId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        router.push('/open-points'); // Redirect to dashboard after delete
      } catch {
        showDialog('Error', 'Failed to delete project', 'alert');
      }
    });
  };
useEffect(() => {
  if (!projectId) return;

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/openPoints/projects/${projectId}`);
      if (!res.ok) throw new Error();

      const data = await res.json();
      setProjectName(data.name); // ✅ REAL PROJECT NAME
    } catch {
      showDialog("Error", "Failed to load project details", "alert");
    }
  };

  fetchProject();
}, [projectId]);

  return (
    <div className="min-h-screen bg-background p-2.5 font-['Arial',sans-serif]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 bg-[#f8fafc] p-2.5 px-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          {/* NEW: Back Button */}
          <button 
            onClick={() => router.back()}
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} />
          </button>

          <h3 className="m-0 font-bold text-foreground text-xl">
            <span className="font-normal text-muted-foreground text-base mr-2">Project Title:</span>
            {projectName}
          </h3>
        </div>

        <div className="flex items-center gap-4">
          {/* Filters */}
          <span className="text-[13px] font-semibold text-muted-foreground">Filters:</span>
          <div className="flex items-center gap-2">
            <select
              className="w-28 h-8 text-xs px-2 border border-border rounded bg-card"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Status</option>
              <option value="Red">Red</option>
              <option value="Yellow">Yellow</option>
              <option value="Green">Green</option>
              <option value="Orange">Orange</option>
            </select>
            <select
              className="w-28 h-8 text-xs px-2 border border-border rounded bg-card"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <option value="">Priority</option>
              <option value="Emergency">Emergency</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              className="w-36 h-8 text-xs px-2 border border-border rounded bg-card"
              value={filters.responsibility}
              onChange={(e) => setFilters({ ...filters, responsibility: e.target.value })}
            >
              <option value="">Members</option>
              {projectTeam.map((m) => (
                <option key={m._id} value={m._id}>

                  {m.username}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-l border-border pl-4 ml-1 items-center">
            <button
              className="text-xs px-3 py-1.5 font-medium bg-[#0ea5e9] text-white rounded hover:bg-[#0284c7] transition-colors"
              onClick={() => setShowLegend(true)}
            >
              ℹ Legend
            </button>
            <button
              className="text-xs px-3 py-1.5 font-medium bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
              onClick={() => setShowAddMember(true)}
            >
              + Add Member
            </button>
            
            {/* NEW: Delete Project Button */}
            <button
              onClick={handleDeleteProject}
              className="text-xs px-3 py-1.5 font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors flex items-center gap-1.5"
              title="Delete Project"
            >
              <Trash2 size={14} /> Delete Project
            </button>
          </div>
        </div>
      </div>

      {/* Legend Modal */}
      {showLegend && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex justify-center items-center">
          <div className="bg-white p-5 rounded-lg max-w-[90%] max-h-[90%] overflow-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-foreground">Status Legend</h3>
              <button
                className="text-xs px-3 py-1.5 bg-secondary text-secondary-foreground rounded hover:opacity-80"
                onClick={() => setShowLegend(false)}
              >
                Close
              </button>
            </div>
            <div className="grid gap-3 min-w-[300px]">
              {/* Levels */}
              <h5 className="m-0 mb-1 border-b border-border pb-1 font-semibold">Levels</h5>
              <div className="flex items-center gap-4">
                <div className="w-10 h-6 bg-[#bef264] rounded border border-border"></div>
                <span><strong>L1</strong> - Development Team</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-6 bg-[#22c55e] rounded border border-border"></div>
                <span><strong>L2</strong> - HoD</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-6 bg-[#0ea5e9] rounded border border-border"></div>
                <span><strong>L3</strong> - Stakeholder HoD</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-6 bg-[#94a3b8] rounded border border-border"></div>
                <span><strong>L4</strong> - MD/Chairman</span>
              </div>

              {/* Status */}
              <h5 className="m-0 mt-4 mb-1 border-b border-border pb-1 font-semibold">Status</h5>
              <div className="flex items-center gap-4">
                <div className="w-10 h-6 bg-[#ef4444] rounded border border-border"></div>
                <span><strong>Red</strong> - Not yet started</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-6 bg-[#eab308] rounded border border-border"></div>
                <span><strong>Yellow</strong> - In Progress</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-6 bg-[#f97316] rounded border border-border"></div>
                <span><strong>Orange</strong> - Change Request</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-6 bg-[#22c55e] rounded border border-border"></div>
                <span><strong>Green</strong> - Completed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Panel */}
      {showAddMember && (
        <div className="mb-2.5 p-2.5 bg-[#e0f2fe] rounded flex gap-2.5 items-center">
          <select
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            className="max-w-[220px] h-8 px-2 border border-border rounded bg-card text-sm"
          >
            <option value="">Select user</option>
            {allUsers.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} 
              </option>
            ))}
          </select>

          <select
            value={newMemberRole}
            onChange={(e) => setNewMemberRole(e.target.value)}
            className="max-w-[140px] h-8 px-2 border border-border rounded bg-card text-sm"
          >
            <option value="L1">L1</option>
            <option value="L2">L2</option>
            <option value="L3">L3</option>
            <option value="L4">L4</option>
          </select>
          <button
            className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded hover:opacity-90"
            onClick={handleAddMember}
          >
            Add to Project
          </button>
          <button
            className="text-xs px-3 py-1.5 bg-secondary text-secondary-foreground rounded hover:opacity-80"
            onClick={() => setShowAddMember(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Excel Table Container */}
      <div className="overflow-x-auto mt-5 bg-white p-2.5 shadow-md rounded">
        <table className="w-full border-collapse font-['Arial',sans-serif] text-[13px]">
          <thead>
            <tr>
              <th className="bg-[#FFFF00] border border-black p-2 text-center font-bold whitespace-nowrap w-10">
                Sr. No
              </th>
              <th className="bg-[#FFFF00] border border-black p-2 text-center font-bold whitespace-nowrap w-[20%]">
                Discussion Points
              </th>
              <th className="bg-[#FFFF00] border border-black p-2 text-center font-bold whitespace-nowrap w-[120px]">
                Responsibility
              </th>
              <th className="bg-[#FFFF00] border border-black p-2 text-center font-bold whitespace-nowrap w-20">
                Approval
              </th>
              <th className="bg-[#FFFF00] border border-black p-2 text-center font-bold whitespace-nowrap w-[20%]">
                Gap / Action Point
              </th>
              <th className="bg-[#FFFF00] border border-black p-2 text-center font-bold whitespace-nowrap w-[100px]">
                Target Date
              </th>
              <th className="bg-[#FFFF00] border border-black p-2 text-center font-bold whitespace-nowrap w-[140px]">
                Status
              </th>
              <th className="bg-[#FFFF00] border border-black p-2 text-center font-bold whitespace-nowrap w-[100px]">
                Review
              </th>
              <th className="bg-[#FFFF00] border border-black p-2 text-center font-bold whitespace-nowrap w-[15%]">
                Remarks
              </th>
              <th className="bg-[#FFFF00] border border-black p-2 text-center font-bold whitespace-nowrap w-[110px]">
                Priority
              </th>
              <th className="bg-[#FFFF00] border border-black p-2 text-center font-bold whitespace-nowrap w-20">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPoints.map((point, index) => (
              <tr key={point._id}>
                <td className="border border-[#ccc] px-2 py-1 text-center align-middle">
                  {index + 1}
                </td>
                <td className="border border-[#ccc] px-2 py-1 align-middle">
                  <textarea
                    value={point.title || ''}
                    onChange={(e) => handleUpdate(point._id, 'title', e.target.value)}
                    onInput={autoResize}
                    className="w-full border-none bg-transparent p-1 text-inherit font-inherit outline-none resize-none overflow-hidden min-h-[32px] focus:bg-[#e6f7ff]"
                  />
                </td>
                <td className="border border-[#ccc] px-2 py-1 align-middle">
                  <select
                    value={point.responsibility || ''}
                    onChange={(e) => handleUpdate(point._id, 'responsibility', e.target.value)}
                    className="w-full border-none bg-transparent p-1 text-inherit font-inherit outline-none focus:bg-[#e6f7ff]"
                  >
                    <option value="">Select</option>
                    {projectTeam.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.username}
                      </option>

                    ))}
                  </select>
                </td>
                <td className="border border-[#ccc] px-2 py-1 align-middle">
                  <select
                    value={point.level || 'L2'}
                    onChange={(e) => handleUpdate(point._id, 'level', e.target.value)}
                    className="w-full border-none bg-transparent p-1 text-inherit font-inherit outline-none focus:bg-[#e6f7ff]"
                  >
                    <option value="L1">L1</option>
                    <option value="L2">L2</option>
                    <option value="L3">L3</option>
                    <option value="L4">L4</option>
                    <option value="L5">L5</option>
                  </select>
                </td>
                <td className="border border-[#ccc] px-2 py-1 align-middle">
                  <textarea
                    value={point.gap_action || ''}
                    onChange={(e) => handleUpdate(point._id, 'gap_action', e.target.value)}
                    onInput={autoResize}
                    className="w-full border-none bg-transparent p-1 text-inherit font-inherit outline-none resize-none overflow-hidden min-h-[32px] focus:bg-[#e6f7ff]"
                  />
                </td>
                <td className="border border-[#ccc] px-2 py-1 align-middle">
                  <input
                    type="date"
                    value={point.target_date ? point.target_date.split('T')[0] : ''}
                    onChange={(e) => handleUpdate(point._id, 'target_date', e.target.value)}
                    className="w-full border-none bg-transparent p-1 text-inherit font-inherit outline-none focus:bg-[#e6f7ff]"
                  />
                </td>
                <td
                  className={cn(
                    'border border-[#ccc] px-2 py-1 align-middle text-center font-bold',
                    getStatusCellClass(point.status)
                  )}
                >
                  <select
                    value={point.status || 'Red'}
                    onChange={(e) => handleUpdate(point._id, 'status', e.target.value)}
                    className="w-full border-none bg-transparent p-1 font-inherit outline-none text-transparent focus:text-inherit cursor-pointer"
                  >
                    <option value="Red" className="text-black">Red</option>
                    <option value="Yellow" className="text-black">Yellow</option>
                    <option value="Green" className="text-black">Green</option>
                    <option value="Orange" className="text-black">Orange</option>
                  </select>
                </td>
                <td className="border border-[#ccc] px-2 py-1 align-middle">
                  <input
                    type="date"
                    value={point.review_date ? point.review_date.split('T')[0] : ''}
                    onChange={(e) => handleUpdate(point._id, 'review_date', e.target.value)}
                    className="w-full border-none bg-transparent p-1 text-inherit font-inherit outline-none focus:bg-[#e6f7ff]"
                  />
                </td>
                <td className="border border-[#ccc] px-2 py-1 align-middle">
                  <textarea
                    value={point.remarks || ''}
                    onChange={(e) => handleUpdate(point._id, 'remarks', e.target.value)}
                    onInput={autoResize}
                    className="w-full border-none bg-transparent p-1 text-inherit font-inherit outline-none resize-none overflow-hidden min-h-[32px] focus:bg-[#e6f7ff]"
                  />
                </td>
                <td className="border border-[#ccc] px-2 py-1 align-middle">
                  <select
                    value={point.priority || 'Medium'}
                    onChange={(e) => handleUpdate(point._id, 'priority', e.target.value)}
                    className="w-full border-none bg-transparent p-1 text-inherit font-inherit outline-none focus:bg-[#e6f7ff]"
                  >
                    <option value="Emergency">Emergency</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </td>
                <td className="border border-[#ccc] px-2 py-1 align-middle">
                  <div className="flex gap-1 justify-center">
                    {modifiedPoints.has(point._id) && (
                      <button
                        className="px-1.5 py-0.5 text-[11px] bg-[#10b981] text-white rounded hover:bg-[#059669]"
                        onClick={() => handleSaveRow(point._id)}
                        title="Save Changes"
                      >
                        ✔️
                      </button>
                    )}
                    <button
                      className="px-1.5 py-0.5 text-[11px] bg-[#ef4444] text-white rounded hover:bg-[#dc2626]"
                      onClick={() => handleDeleteRow(point._id)}
                      title="Delete Point"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {/* Quick Add Row */}
            <tr className="bg-[#f0f9ff]">
              <td className="border border-[#ccc] px-2 py-1 text-center align-middle">
                <button
                  className="px-1.5 py-0.5 text-[10px] bg-primary text-primary-foreground rounded hover:opacity-90"
                  onClick={createPoint}
                >
                  Add
                </button>
              </td>
              <td className="border border-[#ccc] px-2 py-1 align-middle">
                <textarea
                  placeholder="Add new point..."
                  value={newPoint.title}
                  onChange={(e) => setNewPoint({ ...newPoint, title: e.target.value })}
                  onInput={autoResize}
                  className="w-full border-none bg-transparent p-1 text-inherit font-inherit outline-none resize-none overflow-hidden min-h-[32px] focus:bg-[#e6f7ff]"
                />
              </td>
              <td className="border border-[#ccc] px-2 py-1 align-middle">
                <select
                  value={newPoint.responsibility}
                  onChange={(e) => setNewPoint({ ...newPoint, responsibility: e.target.value })}
                  className="w-full border-none bg-transparent p-1 text-inherit font-inherit outline-none focus:bg-[#e6f7ff]"
                >
                  <option value="">Select</option>
                  {projectTeam.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.username}
                    </option>

                  ))}
                </select>
              </td>
              <td className="border border-[#ccc] px-2 py-1 align-middle">
                <select
                  value={newPoint.level}
                  onChange={(e) => setNewPoint({ ...newPoint, level: e.target.value as OpenPoint['level'] })}
                  className="w-full border-none bg-transparent p-1 text-inherit font-inherit outline-none focus:bg-[#e6f7ff]"
                >
                  <option value="L1">L1</option>
                  <option value="L2">L2</option>
                  <option value="L3">L3</option>
                  <option value="L4">L4</option>
                  <option value="L5">L5</option>
                </select>
              </td>
              <td className="border border-[#ccc] px-2 py-1 align-middle">
                <textarea
                  placeholder="Gap / Action"
                  value={newPoint.gap_action}
                  onChange={(e) => setNewPoint({ ...newPoint, gap_action: e.target.value })}
                  onInput={autoResize}
                  className="w-full border-none bg-transparent p-1 text-inherit font-inherit outline-none resize-none overflow-hidden min-h-[32px] focus:bg-[#e6f7ff]"
                />
              </td>
              <td className="border border-[#ccc] px-2 py-1 align-middle">
                <input
                  type="date"
                  value={newPoint.target_date}
                  onChange={(e) => setNewPoint({ ...newPoint, target_date: e.target.value })}
                  className="w-full border-none bg-transparent p-1 text-inherit font-inherit outline-none focus:bg-[#e6f7ff]"
                />
              </td>
              <td className="border border-[#ccc] px-2 py-1 align-middle">
                <select
                  value={newPoint.status}
                  onChange={(e) => setNewPoint({ ...newPoint, status: e.target.value as OpenPoint['status'] })}
                  className="w-full border-none bg-transparent p-1 text-inherit font-inherit outline-none focus:bg-[#e6f7ff]"
                >
                  <option value="Red">Red</option>
                  <option value="Yellow">Yellow</option>
                  <option value="Green">Green</option>
                  <option value="Orange">Orange</option>
                </select>
              </td>
              <td className="border border-[#ccc] px-2 py-1 align-middle">
                <input
                  type="date"
                  value={newPoint.review_date}
                  onChange={(e) => setNewPoint({ ...newPoint, review_date: e.target.value })}
                  className="w-full border-none bg-transparent p-1 text-inherit font-inherit outline-none focus:bg-[#e6f7ff]"
                />
              </td>
              <td className="border border-[#ccc] px-2 py-1 align-middle">
                <textarea
                  placeholder="Remarks"
                  value={newPoint.remarks}
                  onChange={(e) => setNewPoint({ ...newPoint, remarks: e.target.value })}
                  onInput={autoResize}
                  className="w-full border-none bg-transparent p-1 text-inherit font-inherit outline-none resize-none overflow-hidden min-h-[32px] focus:bg-[#e6f7ff]"
                />
              </td>
              <td className="border border-[#ccc] px-2 py-1 align-middle">
                <select
                  value={newPoint.priority}
                  onChange={(e) => setNewPoint({ ...newPoint, priority: e.target.value as OpenPoint['priority'] })}
                  className="w-full border-none bg-transparent p-1 text-inherit font-inherit outline-none focus:bg-[#e6f7ff]"
                >
                  <option value="Emergency">Emergency</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </td>
              <td className="border border-[#ccc] px-2 py-1 align-middle"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="mt-10 bg-white p-2.5">
        <div className="bg-[#663399] text-white text-center font-bold p-2 border border-black">
          Summary
        </div>
        <table className="w-full border-collapse text-[13px] mb-5">
          <thead>
            <tr className="bg-white">
              <th className="border border-black p-2 text-center font-bold">S.No</th>
              <th className="border border-black p-2 text-center font-bold">Responsible Person</th>
              <th className="border border-black p-2 text-center font-bold">Total Open Points</th>
              <th className="border border-black p-2 text-center font-bold bg-[#00FF00]">
                Total Green Points [ Completed ]
              </th>
              <th className="border border-black p-2 text-center font-bold bg-[#FFFF00]">
                Total Yellow Points [ In Progress ]
              </th>
              <th className="border border-black p-2 text-center font-bold bg-[#FF0000] text-white">
                Total Red Points [ Not Started - Pending ]
              </th>
              <th className="border border-black p-2 text-center font-bold bg-[#FFA500]">
                Total Orange Points [ New Update ]
              </th>
              <th className="border border-black p-2 text-center font-bold">
                Total Yellow + Red + Orange
              </th>
            </tr>
          </thead>
          <tbody>
            {summary.map((stat, index) => (
              <tr key={index}>
                <td className="border border-black p-2 text-center">{index + 1}</td>
                <td className="border border-black p-2 text-center">{stat.name}</td>
                <td className="border border-black p-2 text-center">{stat.total}</td>
                <td className="border border-black p-2 text-center">{stat.green}</td>
                <td className="border border-black p-2 text-center">{stat.yellow}</td>
                <td className="border border-black p-2 text-center">{stat.red}</td>
                <td className="border border-black p-2 text-center">{stat.orange}</td>
                <td className="border border-black p-2 text-center">
                  {stat.yellow + stat.red + stat.orange}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Team Members Section */}
      <div className="mt-5 bg-white">
        <div className="bg-[#663399] text-white text-center font-bold p-2 border border-black">
          Team Members
        </div>
        <div className="p-2.5 border border-[#ccc] bg-white">
          <div className="flex flex-wrap gap-2.5">
            {projectTeam.map((member, index) => (
              <div
                key={index}
                className={cn(
                  'px-2.5 py-1.5 rounded-full border border-border text-[13px] flex items-center gap-2',
                  member.role === 'Owner' ? 'bg-[#e0f2fe]' : 'bg-[#f3f4f6]'
                )}
              >
                <span className="font-bold cursor-pointer underline text-[#1e40af] hover:text-[#1d4ed8]">
                  {member.username}
                </span>
                <span className="text-muted-foreground">({member.role || 'Member'})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Dialog */}
      {dialogConfig.open && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex justify-center items-center">
          <div className="bg-white p-5 rounded-lg min-w-[300px] max-w-[400px] shadow-xl">
            <h4 className="m-0 mb-2.5 text-foreground font-bold">{dialogConfig.title}</h4>
            <p className="m-0 mb-5 text-muted-foreground whitespace-pre-line">{dialogConfig.message}</p>
            <div className="flex justify-end gap-2.5">
              {dialogConfig.type === 'confirm' && (
                <button
                  className="text-xs px-3 py-1.5 bg-secondary text-secondary-foreground rounded hover:opacity-80"
                  onClick={closeDialog}
                >
                  Cancel
                </button>
              )}
              <button
                className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded hover:opacity-90"
                onClick={() => {
                  if (dialogConfig.onConfirm) dialogConfig.onConfirm();
                  closeDialog();
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectWorkspace;