
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Subject, Material } from '@/types';
import { format, isSameDay } from 'date-fns';

interface DashboardProps {
  subjects: Subject[];
  materials: Material[];
  onSettingsClick: () => void;
  onDateClick: (date: Date, filteredMaterials: Material[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  subjects,
  materials,
  onSettingsClick,
  onDateClick
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Filter materials based on selected subject
  const filteredMaterials = selectedSubjectFilter === 'all' 
    ? materials 
    : materials.filter(m => m.subjectId === selectedSubjectFilter);

  // Get dates that have materials (filtered)
  const datesWithMaterials = filteredMaterials.map(m => new Date(m.date));

  // Get subject color for filtered dates
  const getDateColor = (date: Date) => {
    if (selectedSubjectFilter === 'all') {
      return '#10B981'; // Green for all subjects
    }
    
    const subject = subjects.find(s => s.id === selectedSubjectFilter);
    return subject ? subject.color : '#10B981';
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      const dateMaterials = filteredMaterials.filter(m => 
        isSameDay(new Date(m.date), date)
      );
      if (dateMaterials.length > 0) {
        onDateClick(date, dateMaterials);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="p-6 border-b border-white/20 backdrop-blur-sm bg-white/10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800">Schedule Dashboard</h1>
          <Button 
            onClick={onSettingsClick}
            variant="outline" 
            className="bg-white/20 border-white/30 hover:bg-white/30 backdrop-blur-sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Filters */}
        <Card className="mb-6 bg-white/20 border-white/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter by Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedSubjectFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedSubjectFilter('all')}
                className={selectedSubjectFilter === 'all' 
                  ? "bg-black text-white hover:bg-gray-800" 
                  : "bg-white/20 border-white/30 hover:bg-white/30"
                }
              >
                All Subjects
              </Button>
              {subjects.map((subject) => (
                <Button
                  key={subject.id}
                  variant={selectedSubjectFilter === subject.id ? 'default' : 'outline'}
                  onClick={() => setSelectedSubjectFilter(subject.id)}
                  className="bg-white/20 border-white/30 hover:bg-white/30"
                  style={{ 
                    backgroundColor: selectedSubjectFilter === subject.id ? subject.color : undefined,
                    borderColor: subject.color 
                  }}
                >
                  {subject.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card className="bg-white/20 border-white/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border border-white/30 bg-white/10 backdrop-blur-sm p-3 pointer-events-auto"
              modifiers={{
                hasMaterials: datesWithMaterials
              }}
              modifiersStyles={{
                hasMaterials: { 
                  backgroundColor: getDateColor(selectedDate || new Date()), 
                  color: 'white',
                  fontWeight: 'bold'
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="bg-white/20 border-white/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-800">{subjects.length}</div>
              <p className="text-sm text-gray-600">Total Subjects</p>
            </CardContent>
          </Card>
          <Card className="bg-white/20 border-white/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-800">{filteredMaterials.length}</div>
              <p className="text-sm text-gray-600">Filtered Materials</p>
            </CardContent>
          </Card>
          <Card className="bg-white/20 border-white/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-800">{datesWithMaterials.length}</div>
              <p className="text-sm text-gray-600">Active Dates</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
