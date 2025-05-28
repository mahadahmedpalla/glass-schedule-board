
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Material, Subject } from '@/types';

interface MaterialsViewProps {
  date: Date;
  materials: Material[];
  subjects: Subject[];
  onBack: () => void;
}

const MaterialsView: React.FC<MaterialsViewProps> = ({
  date,
  materials,
  subjects,
  onBack
}) => {
  const getSubjectById = (id: string) => subjects.find(s => s.id === id);

  const handleDownload = (material: Material) => {
    if (material.fileUrl) {
      const link = document.createElement('a');
      link.href = material.fileUrl;
      link.download = material.fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="p-6 border-b border-white/20 backdrop-blur-sm bg-white/10">
        <div className="flex items-center gap-4 max-w-7xl mx-auto">
          <Button onClick={onBack} variant="outline" className="bg-white/20 border-white/30">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Calendar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Materials for {format(date, 'MMMM d, yyyy')}</h1>
            <p className="text-gray-600">{materials.length} material(s) scheduled</p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {materials.length === 0 ? (
          <Card className="bg-white/20 border-white/30 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No materials scheduled for this date.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {materials.map((material) => {
              const subject = material.subjectId ? getSubjectById(material.subjectId) : null;
              
              return (
                <Card key={material.id} className="bg-white/20 border-white/30 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-2">{material.title}</CardTitle>
                        {subject && (
                          <Badge 
                            className="text-white"
                            style={{ backgroundColor: subject.color }}
                          >
                            {subject.name}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Created: {format(new Date(material.createdAt), 'MMM d, yyyy HH:mm')}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {material.description && (
                      <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                        {material.description}
                      </p>
                    )}
                    
                    {material.fileUrl && (
                      <div className="flex items-center gap-2 mt-4 p-3 bg-white/30 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="flex-1 truncate">{material.fileName || 'Attached file'}</span>
                        <Button
                          onClick={() => handleDownload(material)}
                          size="sm"
                          variant="outline"
                          className="bg-white/20 border-white/30"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialsView;
