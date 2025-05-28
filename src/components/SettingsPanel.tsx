
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { Subject, Material } from '@/types';
import SubjectManager from './SubjectManager';
import MaterialCreator from './MaterialCreator';

interface SettingsPanelProps {
  subjects: Subject[];
  materials: Material[];
  onBack: () => void;
  onSubjectCreate: (subject: Omit<Subject, 'id'>) => void;
  onSubjectDelete: (id: string) => void;
  onMaterialCreate: (material: Omit<Material, 'id' | 'createdAt'>) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  subjects,
  materials,
  onBack,
  onSubjectCreate,
  onSubjectDelete,
  onMaterialCreate
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="p-6 border-b border-white/20 backdrop-blur-sm bg-white/10">
        <div className="flex items-center gap-4 max-w-7xl mx-auto">
          <Button onClick={onBack} variant="outline" className="bg-white/20 border-white/30">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Settings Panel</h1>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <Card className="bg-white/20 border-white/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Manage Your Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="subjects" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/20">
                <TabsTrigger value="subjects">Subjects</TabsTrigger>
                <TabsTrigger value="materials">Create Material</TabsTrigger>
              </TabsList>
              
              <TabsContent value="subjects" className="mt-6">
                <SubjectManager
                  subjects={subjects}
                  onSubjectCreate={onSubjectCreate}
                  onSubjectDelete={onSubjectDelete}
                />
              </TabsContent>
              
              <TabsContent value="materials" className="mt-6">
                <MaterialCreator
                  subjects={subjects}
                  onMaterialCreate={onMaterialCreate}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPanel;
