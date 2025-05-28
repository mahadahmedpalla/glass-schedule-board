
import React, { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import SettingsPanel from '@/components/SettingsPanel';
import MaterialsView from '@/components/MaterialsView';
import PasscodeModal from '@/components/PasscodeModal';
import { Subject, Material } from '@/types';

type ViewMode = 'dashboard' | 'settings' | 'materials';

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateMaterials, setSelectedDateMaterials] = useState<Material[]>([]);

  // Mock data - in production, this would come from Supabase
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Mathematics', color: '#3B82F6' },
    { id: '2', name: 'Science', color: '#10B981' },
  ]);

  const [materials, setMaterials] = useState<Material[]>([
    {
      id: '1',
      title: 'Algebra Assignment',
      description: 'Complete exercises 1-20 from chapter 5',
      subjectId: '1',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Physics Lab Report',
      description: 'Submit the pendulum experiment report',
      subjectId: '2',
      date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      createdAt: new Date().toISOString()
    }
  ]);

  const handleSettingsClick = () => {
    setShowPasscodeModal(true);
  };

  const handlePasscodeSuccess = () => {
    setShowPasscodeModal(false);
    setViewMode('settings');
  };

  const handleSubjectCreate = (subject: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subject,
      id: Date.now().toString()
    };
    setSubjects([...subjects, newSubject]);
  };

  const handleSubjectDelete = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    // Also remove materials associated with this subject
    setMaterials(materials.filter(m => m.subjectId !== id));
  };

  const handleMaterialCreate = (material: Omit<Material, 'id' | 'createdAt'>) => {
    const newMaterial: Material = {
      ...material,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setMaterials([...materials, newMaterial]);
  };

  const handleDateClick = (date: Date, dateMaterials: Material[]) => {
    setSelectedDate(date);
    setSelectedDateMaterials(dateMaterials);
    setViewMode('materials');
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedDate(null);
    setSelectedDateMaterials([]);
  };

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
