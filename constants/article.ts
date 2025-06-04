export interface Article {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  title: string;
  description: string;
  content: string;
  image: string;
  category: 'hipertensi' | 'diabetes' | 'kanker' | 'nutrisi' | 'diet' | 'kesehatan' | 'gizi seimbang' | 'olahraga' | 'lifestyle' ;
  author: string;
  tags: string[];
  isPublished: boolean;
  viewCount: number;
}
