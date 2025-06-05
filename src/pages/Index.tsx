
import React, { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import SettingsPanel from '@/components/SettingsPanel';
import MaterialsView from '@/components/MaterialsView';
import PasscodeModal from '@/components/PasscodeModal';
import { Material, Subject } from '@/types';
import { useSubjects } from '@/hooks/useSubjects';
import { useMaterials } from '@/hooks/useMaterials';

type ViewMode = 'dashboard' | 'settings' | 'materials';

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateMaterials, setSelectedDateMaterials] = useState<Material[]>([]);

  // Use custom hooks for data management
  const { subjects, loading: subjectsLoading, createSubject, deleteSubject } = useSubjects();
  const { materials, loading: materialsLoading, createMaterial, refetch: refetchMaterials } = useMaterials();

  const handleSettingsClick = () => {
    setShowPasscodeModal(true);
  };

  const handlePasscodeSuccess = () => {
    setShowPasscodeModal(false);
    setViewMode('settings');
  };

  const handleSubjectCreate = async (subject: Omit<Subject, 'id'>) => {
    try {
      await createSubject(subject);
    } catch (error) {
      console.error('Failed to create subject:', error);
    }
  };

  const handleSubjectDelete = async (id: string) => {
    try {
      await deleteSubject(id);
      // Refetch materials to update the calendar since associated materials were cascaded deleted
      await refetchMaterials();
    } catch (error) {
      console.error('Failed to delete subject:', error);
    }
  };

  const handleMaterialCreate = async (material: Omit<Material, 'id' | 'createdAt'>) => {
    try {
      await createMaterial(material);
      // Refetch materials to ensure the calendar is updated with new materials
      await refetchMaterials();
    } catch (error) {
      console.error('Failed to create material:', error);
    }
  };

  const handleDateClick = (date: Date, dateMaterials: Material[]) => {
    // Only navigate to materials view if there are materials for this date
    if (dateMaterials.length > 0) {
      setSelectedDate(date);
      setSelectedDateMaterials(dateMaterials);
      setViewMode('materials');
    }
  };

  const handleBackToDashboard = async () => {
    setViewMode('dashboard');
    setSelectedDate(null);
    setSelectedDateMaterials([]);
    // Refetch materials when returning to dashboard to ensure calendar is up to date
    await refetchMaterials();
  };

  // Show loading state while data is being fetched
  if (subjectsLoading || materialsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700">Loading...</div>
          <div className="text-sm text-gray-500 mt-2">Fetching your schedule data</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {viewMode === 'dashboard' && (
        <Dashboard
          subjects={subjects}
          materials={materials}
          onSettingsClick={handleSettingsClick}
          onDateClick={handleDateClick}
        />
      )}

      {viewMode === 'settings' && (
        <SettingsPanel
          subjects={subjects}
          materials={materials}
          onBack={handleBackToDashboard}
          onSubjectCreate={handleSubjectCreate}
          onSubjectDelete={handleSubjectDelete}
          onMaterialCreate={handleMaterialCreate}
        />
      )}

      {viewMode === 'materials' && selectedDate && (
        <MaterialsView
          date={selectedDate}
          materials={selectedDateMaterials}
          subjects={subjects}
          onBack={handleBackToDashboard}
        />
      )}

      <PasscodeModal
        isOpen={showPasscodeModal}
        onClose={() => setShowPasscodeModal(false)}
        onSuccess={handlePasscodeSuccess}
      />
    </>
  );
};

export default Index;
