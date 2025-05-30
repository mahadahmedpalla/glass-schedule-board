
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Subject } from '@/types';

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSubject = async (subject: Omit<Subject, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert([subject])
        .select()
        .single();

      if (error) throw error;
      setSubjects([...subjects, data]);
      return data;
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSubjects(subjects.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return {
    subjects,
    loading,
    createSubject,
    deleteSubject,
    refetch: fetchSubjects
  };
};
