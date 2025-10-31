export interface WishListItem {
  id?: number;
  title: string;
  author: string;
  description: string;
  notes?: string;
  categoryId?: number;
  bookId?: number;
}
