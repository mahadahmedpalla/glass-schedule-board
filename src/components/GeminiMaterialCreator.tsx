
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Key, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Subject, Material } from '@/types';
import { format, parseISO } from 'date-fns';

interface GeminiMaterialCreatorProps {
  subjects: Subject[];
  onMaterialCreate: (material: Omit<Material, 'id' | 'createdAt'>) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GeneratedMaterial {
  title: string;
  description?: string;
  subjectId?: string;
  date: string;
}

const GeminiMaterialCreator: React.FC<GeminiMaterialCreatorProps> = ({
  subjects,
  onMaterialCreate
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedMaterials, setGeneratedMaterials] = useState<GeneratedMaterial[]>([]);

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      setIsConnected(true);
      setChatMessages([{
        id: '1',
        role: 'assistant',
        content: 'Hello! I\'m ready to help you create materials from your text. Please share any context about your study materials, assignments, or schedule, and I\'ll intelligently extract and organize them into material sets.',
        timestamp: new Date()
      }]);
    }
  };

  const callGeminiAPI = async (prompt: string): Promise<GeneratedMaterial[]> => {
    const currentDate = new Date();
    const currentDateString = format(currentDate, 'PPP'); // e.g., "December 5, 2025"
    const currentYear = currentDate.getFullYear();
    const currentMonth = format(currentDate, 'MMMM'); // e.g., "December"
    
    const systemPrompt = `You are an intelligent study material organizer. 

CURRENT DATE CONTEXT:
- Today's date: ${currentDateString}
- Current year: ${currentYear}
- Current month: ${currentMonth}

Based on the user's text input, extract and create study materials with the following guidelines:

1. Identify subjects, topics, assignments, deadlines, and study materials
2. Create appropriate titles and descriptions
3. Determine dates from context using these rules:
   - If a specific date is mentioned, use that date
   - If only a day is mentioned (e.g., "Monday", "next Tuesday"), calculate from today's date
   - If a relative date is mentioned (e.g., "next week", "in 3 days", "tomorrow"), calculate from today's date
   - If a month is mentioned without year, assume current year (${currentYear})
   - If no date is specified but it seems like an assignment/exam, suggest a reasonable future date within the next few weeks
   - NEVER use dates from 2024 or past years unless explicitly mentioned
   - Always use ${currentYear} as the default year
   - IMPORTANT: Always return dates in YYYY-MM-DD format to avoid timezone issues
4. Return JSON array with materials in this format:
[
  {
    "title": "Material title",
    "description": "Detailed description",
    "subjectId": "subject_name_or_null",
    "date": "YYYY-MM-DD"
  }
]

Available subjects: ${subjects.map(s => `${s.name} (${s.id})`).join(', ')}

If a subject mentioned doesn't match available subjects, set subjectId to null.
Be intelligent about extracting multiple materials from context.
Focus on actionable study items, assignments, readings, etc.

IMPORTANT: 
- All dates MUST be in ${currentYear} or later, never use 2024 or earlier years unless explicitly mentioned by the user.
- Always return dates in YYYY-MM-DD format exactly as specified to prevent timezone conversion issues.
- When user mentions "June 3rd" or "3rd June", return "2025-06-03" exactly.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nUser input: ${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get response from Gemini API');
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[([\s\S]*?)\]/);
    if (jsonMatch) {
      const materials = JSON.parse(jsonMatch[0]);
      
      // Validate and fix dates to ensure they're not in the past and handle timezone issues
      const currentYear = new Date().getFullYear();
      const validatedMaterials = materials.map((material: GeneratedMaterial) => {
        // Parse the date string directly without timezone conversion
        const dateStr = material.date;
        
        // Ensure the date is in YYYY-MM-DD format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateStr)) {
          // If not in correct format, try to parse and reformat
          const parsedDate = new Date(dateStr);
          const year = parsedDate.getFullYear();
          const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
          const day = String(parsedDate.getDate()).padStart(2, '0');
          const formattedDate = `${year >= currentYear ? year : currentYear}-${month}-${day}`;
          
          return {
            ...material,
            date: formattedDate
          };
        }
        
        // If already in correct format, just validate the year
        const year = parseInt(dateStr.split('-')[0]);
        if (year < currentYear) {
          return {
            ...material,
            date: dateStr.replace(/^\d{4}/, currentYear.toString())
          };
        }
        
        return material;
      });
      
      return validatedMaterials;
    }
    
    throw new Error('Could not parse materials from response');
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsLoading(true);

    try {
      const materials = await callGeminiAPI(currentInput);
      
      // Match subject names to IDs
      const processedMaterials = materials.map(material => ({
        ...material,
        subjectId: material.subjectId ? 
          subjects.find(s => 
            s.name.toLowerCase().includes(material.subjectId!.toLowerCase()) ||
            s.id === material.subjectId
          )?.id || undefined : undefined
      }));

      setGeneratedMaterials(processedMaterials);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I've analyzed your input and generated ${processedMaterials.length} material(s). Please review them below and create the ones you'd like to add to your schedule.`,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key and try again.`,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMaterial = (material: GeneratedMaterial) => {
    // Create a date object from the YYYY-MM-DD string without timezone conversion
    const dateParts = material.date.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed in Date constructor
    const day = parseInt(dateParts[2]);
    
    // Create date in local timezone to avoid shifts
    const materialDate = new Date(year, month, day);
    
    onMaterialCreate({
      title: material.title,
      description: material.description,
      subjectId: material.subjectId,
      date: materialDate.toISOString()
    });
    
    // Remove from generated materials
    setGeneratedMaterials(prev => prev.filter(m => m !== material));
  };

  const getSubjectName = (subjectId?: string) => {
    if (!subjectId) return 'No Subject';
    return subjects.find(s => s.id === subjectId)?.name || 'Unknown Subject';
  };

  const getSubjectColor = (subjectId?: string) => {
    if (!subjectId) return '#9CA3AF';
    return subjects.find(s => s.id === subjectId)?.color || '#9CA3AF';
  };

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/30 border-white/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Connect to Gemini 2.0 Flash
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="apiKey">Gemini API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="bg-white/50"
              />
              <p className="text-sm text-gray-600 mt-2">
                Get your API key from the Google AI Studio
              </p>
            </div>
            <Button 
              onClick={handleApiKeySubmit}
              disabled={!apiKey.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Connect
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="bg-white/30 border-white/40">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Connected to Gemini 2.0 Flash</span>
            <span className="text-sm text-gray-600 ml-4">
              Current date: {format(new Date(), 'PPP')}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="bg-white/30 border-white/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Material Generation Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-64 w-full border rounded-md p-4 bg-white/20">
            <div className="space-y-4">
              {chatMessages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                      {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`rounded-lg p-3 ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white/50'}`}>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {format(message.timestamp, 'HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex gap-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="rounded-lg p-3 bg-white/50">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Analyzing your input...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Describe your study materials, assignments, or schedule..."
              className="bg-white/50 resize-none"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!currentInput.trim() || isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Materials */}
      {generatedMaterials.length > 0 && (
        <Card className="bg-white/30 border-white/40">
          <CardHeader>
            <CardTitle>Generated Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedMaterials.map((material, index) => (
                <Card key={index} className="bg-white/40 border-white/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <h4 className="font-semibold text-lg">{material.title}</h4>
                        {material.description && (
                          <p className="text-sm text-gray-600">{material.description}</p>
                        )}
                        <div className="flex items-center gap-3">
                          <Badge 
                            className="text-white"
                            style={{ backgroundColor: getSubjectColor(material.subjectId) }}
                          >
                            {getSubjectName(material.subjectId)}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {format(parseISO(material.date + 'T00:00:00'), 'PPP')}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleCreateMaterial(material)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        Create Material
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GeminiMaterialCreator;
