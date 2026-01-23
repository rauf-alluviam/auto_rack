import axios from "axios";

/**
 * Axios instance with JWT auto-attachment
 */
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// 🔐 Attach JWT automatically
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

/* ================= PROJECT SERVICES ================= */

export const fetchMyProjects = async () => {
  const res = await api.get("/openPoints/my-projects");
  return res.data;
};

export const createProject = async (data: {
  name: string;
  description?: string;
}) => {
  const res = await api.post("/openPoints/projects", data);
  return res.data;
};

/* ================= POINT SERVICES ================= */

export const fetchProjectPoints = async (projectId: string) => {
  const res = await api.get(`/openPoints/projects/${projectId}/points`);
  return res.data;
};

export const createOpenPoint = async (data: {
  project_id: string;
  title: string;
  status: string;
  target_date: string;
  responsible_person?: string | null;
  reviewer?: string | null;
}) => {
  const res = await api.post("/openPoints/points", data);
  return res.data;
};

export const updateOpenPoint = async (
  id: string,
  data: {
    title?: string;
    status?: string;
    target_date?: string;
    responsible_person?: string | null;
    reviewer?: string | null;
  }
) => {
  const res = await api.put(`/openPoints/points/${id}`, data);
  return res.data;
};

export const deleteOpenPoint = async (id: string) => {
  const res = await api.delete(`/openPoints/points/${id}`);
  return res.data;
};

/* ================= TEAM SERVICES ================= */

export const addProjectMember = async (
  projectId: string,
  name: string,
  role: string
) => {
  const res = await api.post(
    `/openPoints/projects/${projectId}/add-member`,
    { name, role }
  );
  return res.data;
};
