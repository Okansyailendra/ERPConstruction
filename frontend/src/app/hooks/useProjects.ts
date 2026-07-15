import { useState, useEffect } from 'react';
import { projects as initialMockProjects } from '../data/mockData';

export interface ProjectData {
  id: string;
  name: string;
  customer: string;
  company: string;
  email?: string;
  phone?: string;
  type: string;
  pm: string;
  budget: number;
  contractValue: number;
  dp: number;
  progress: number;
  deadline: string;
  startDate: string;
  status: string;
  location: string;
  floors: number;
  area: number;
  materialClass: string;
  laborType: string;
  locationCondition?: string;
  paymentScheme?: string[];
  scopes?: string[];
  uploadedFiles?: Record<string, string>;
  materialCost: number;
  laborCost: number;
  equipmentCost: number;
  operationalCost: number;
}

export function useProjects() {
  const [projects, setProjects] = useState<ProjectData[]>([]);

  const fetchProjects = () => {
    fetch('http://localhost:5000/api/projects')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error('Failed to fetch projects', err));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const addProject = async (newProject: Omit<ProjectData, 'id'>) => {
    try {
      const res = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      });
      if (res.ok) {
        fetchProjects();
        const data = await res.json();
        return data.code;
      }
      return false;
    } catch (err) {
      console.error('Failed to add project', err);
      return false;
    }
  };

  const updateProject = async (id: string, updatedData: Partial<ProjectData>) => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        fetchProjects();
      }
      return res.ok;
    } catch (err) {
      console.error('Failed to update project', err);
      return false;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProjects(); // Refresh from backend
      }
    } catch (err) {
      console.error('Failed to delete project', err);
    }
  };

  return { projects, addProject, updateProject, deleteProject, fetchProjects };
}
