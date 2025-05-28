import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { trash, plus } from 'lucide-react';
import { Subject } from '@/types';

interface SubjectManagerProps {
  subjects: Subject[];
  onSubjectCreate: (subject: Omit<Subject, 'id'>) => void;
  onSubjectDelete: (id: string) => void;
}

const PRESET_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

const SubjectManager: React.FC<SubjectManagerProps> = ({
  subjects,
  onSubjectCreate,
  onSubjectDelete
}) => {
  const [subjectName, setSubjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreate = () => {
    if (subjectName.trim()) {
      onSubjectCreate({
        name: subjectName.trim(),
        color: selectedColor
      });
      setSubjectName('');
      setSelectedColor(PRESET_COLORS[0]);
      setShowCreateForm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Existing Subjects */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Existing Subjects</h3>
        <div className="space-y-2">
          {subjects.map((subject) => (
            <Card key={subject.id} className="bg-white/30 border-white/40">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: subject.color }}
                  />
                  <span className="font-medium">{subject.name}</span>
                </div>
                <Button
                  onClick={() => onSubjectDelete(subject.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <trash className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {subjects.length === 0 && (
            <p className="text-gray-500 text-center py-8">No subjects created yet.</p>
          )}
        </div>
      </div>

      {/* Add Subject Button */}
      {!showCreateForm && (
        <Button
          onClick={() => setShowCreateForm(true)}
          className="w-full bg-green-500 hover:bg-green-600 text-white"
        >
          <plus className="w-4 h-4 mr-2" />
          Add Subject
        </Button>
      )}

      {/* Create Subject Form */}
      {showCreateForm && (
        <Card className="bg-white/30 border-white/40">
          <CardHeader>
            <CardTitle>Create New Subject</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subject-name">Subject Name</Label>
              <Input
                id="subject-name"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Enter subject name"
                className="bg-white/50"
              />
            </div>
            
            <div>
              <Label>Choose Color</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate} className="bg-green-500 hover:bg-green-600">
                Create
              </Button>
              <Button 
                onClick={() => setShowCreateForm(false)} 
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubjectManager;
