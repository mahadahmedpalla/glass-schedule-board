
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Subject, Material } from '@/types';

interface MaterialCreatorProps {
  subjects: Subject[];
  onMaterialCreate: (material: Omit<Material, 'id' | 'createdAt'>) => void;
}

const MaterialCreator: React.FC<MaterialCreatorProps> = ({
  subjects,
  onMaterialCreate
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [materials, setMaterials] = useState<Array<{
    title: string;
    description: string;
    subjectId: string;
    file: File | null;
  }>>([]);

  const addMaterial = () => {
    setMaterials([...materials, {
      title: '',
      description: '',
      subjectId: '',
      file: null
    }]);
  };

  const updateMaterial = (index: number, field: string, value: any) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], [field]: value };
    setMaterials(updated);
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleFileChange = (index: number, file: File | null) => {
    updateMaterial(index, 'file', file);
  };

  const handleSubmit = () => {
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }

    materials.forEach((material) => {
      if (material.title.trim()) {
        const materialData: Omit<Material, 'id' | 'createdAt'> = {
          title: material.title.trim(),
          description: material.description.trim() || undefined,
          subjectId: material.subjectId || undefined,
          date: selectedDate.toISOString(),
          fileUrl: material.file ? URL.createObjectURL(material.file) : undefined,
          fileName: material.file?.name
        };
        onMaterialCreate(materialData);
      }
    });

    // Reset form
    setSelectedDate(undefined);
    setMaterials([]);
  };

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <Card className="bg-white/30 border-white/40">
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal bg-white/50",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Add Material Button */}
      <Button
        onClick={addMaterial}
        className="w-full bg-green-500 hover:bg-green-600 text-white"
        disabled={!selectedDate}
      >
        <plus className="w-4 h-4 mr-2" />
        Add Material
      </Button>

      {/* Materials */}
      {materials.map((material, index) => (
        <Card key={index} className="bg-white/30 border-white/40">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Material {index + 1}</CardTitle>
            <Button
              onClick={() => removeMaterial(index)}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              Remove
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor={`title-${index}`}>Title</Label>
              <Input
                id={`title-${index}`}
                value={material.title}
                onChange={(e) => updateMaterial(index, 'title', e.target.value)}
                placeholder="Material title"
                className="bg-white/50"
              />
            </div>

            <div>
              <Label htmlFor={`description-${index}`}>Description (Optional)</Label>
              <Textarea
                id={`description-${index}`}
                value={material.description}
                onChange={(e) => updateMaterial(index, 'description', e.target.value)}
                placeholder="Material description"
                className="bg-white/50"
              />
            </div>

            <div>
              <Label>Subject (Optional)</Label>
              <Select 
                value={material.subjectId} 
                onValueChange={(value) => updateMaterial(index, 'subjectId', value)}
              >
                <SelectTrigger className="bg-white/50">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: subject.color }}
                        />
                        {subject.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor={`file-${index}`}>Upload File (Optional)</Label>
              <Input
                id={`file-${index}`}
                type="file"
                onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                className="bg-white/50"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Submit Button */}
      {materials.length > 0 && (
        <Button 
          onClick={handleSubmit} 
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
        >
          Create Materials
        </Button>
      )}
    </div>
  );
};

export default MaterialCreator;
