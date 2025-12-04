import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Project } from '../types/database';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface ProjectContextType {
  currentProject: Project | null;
  projects: Project[];
  isLoading: boolean;
  setCurrentProject: (project: Project) => void;
  refreshProjects: () => Promise<void>;
  hasMultipleProjects: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const CURRENT_PROJECT_KEY = 'homenest_current_project';

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { currentTenant, isAuthenticated } = useAuth();
  const [currentProject, setCurrentProjectState] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!currentTenant?.id) {
      setProjects([]);
      setCurrentProjectState(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setProjects(data || []);

      // Try to restore last selected project
      const savedProjectId = await AsyncStorage.getItem(CURRENT_PROJECT_KEY);
      const savedProject = data?.find((p) => p.id === savedProjectId);

      if (savedProject) {
        setCurrentProjectState(savedProject);
      } else if (data && data.length > 0) {
        setCurrentProjectState(data[0]);
      } else {
        setCurrentProjectState(null);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    if (isAuthenticated && currentTenant?.id) {
      fetchProjects();
    } else {
      setProjects([]);
      setCurrentProjectState(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, currentTenant?.id, fetchProjects]);

  const setCurrentProject = useCallback(async (project: Project) => {
    setCurrentProjectState(project);
    await AsyncStorage.setItem(CURRENT_PROJECT_KEY, project.id);
  }, []);

  const value: ProjectContextType = {
    currentProject,
    projects,
    isLoading,
    setCurrentProject,
    refreshProjects: fetchProjects,
    hasMultipleProjects: projects.length > 1,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}

export default ProjectContext;
