
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Material } from '@/types';

export const useMaterials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      
      // Transform data to match our interface
      const transformedData = data?.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        subjectId: item.subject_id,
        fileUrl: item.file_url,
        fileName: item.file_name,
        date: item.date,
        createdAt: item.created_at
      })) || [];
      
      setMaterials(transformedData);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMaterial = async (material: Omit<Material, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .insert([{
          title: material.title,
          description: material.description,
          subject_id: material.subjectId,
          file_url: material.fileUrl,
          file_name: material.fileName,
          date: material.date
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Transform response to match our interface
      const transformedMaterial: Material = {
        id: data.id,
        title: data.title,
        description: data.description,
        subjectId: data.subject_id,
        fileUrl: data.file_url,
        fileName: data.file_name,
        date: data.date,
        createdAt: data.created_at
      };
      
      setMaterials([...materials, transformedMaterial]);
      return transformedMaterial;
    } catch (error) {
      console.error('Error creating material:', error);
      throw error;
    }
  };

  const deleteMaterial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMaterials(materials.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  return {
    materials,
    loading,
    createMaterial,
    deleteMaterial,
    refetch: fetchMaterials
  };
};
