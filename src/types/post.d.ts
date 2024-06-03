export interface Post {
  id: number;
  title: string;
  content: string | null;
  published: boolean;
  authorId: number;
}
