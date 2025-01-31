export default interface Article {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  link: string;
  author: string;
  date: string;
  isBookmarked:boolean;
  createdAt: string;
}