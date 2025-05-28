
export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface Material {
  id: string;
  title: string;
  description?: string;
  subjectId?: string;
  fileUrl?: string;
  fileName?: string;
  date: string;
  createdAt: string;
}

export interface MaterialSet {
  date: string;
  materials: Material[];
}
