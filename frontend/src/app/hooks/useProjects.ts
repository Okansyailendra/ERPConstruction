import { useState, useEffect } from 'react';
import { projects as initialMockProjects } from '../data/mockData';

export interface ProjectData {
  id: string;
  name: string;
  customer: string;
  company: string;
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
  materialCost: number;
  laborCost: number;
  equipmentCost: number;
  operationalCost: number;
}

export function useProjects() {
  const [projects, setProjects] = useState<ProjectData[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/projects')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error('Failed to fetch projects', err));
  }, []);

  const addProject = (newProject: Omit<ProjectData, 'id'>) => {
    // Generate a random ID like PRJ-XXX
    const id = `PRJ-${Math.floor(Math.random() * 900) + 100}`;
    const project = { ...newProject, id };
    
    setProjects((prev) => {
      const updated = [project, ...prev];
      localStorage.setItem('erp_projects', JSON.stringify(updated));
      return updated;
    });
  };

  const updateProject = (id: string, updatedData: Partial<ProjectData>) => {
    setProjects((prev) => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updatedData } : p);
      localStorage.setItem('erp_projects', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('erp_projects', JSON.stringify(updated));
      return updated;
    });
  };

  return { projects, addProject, updateProject, deleteProject };
}
