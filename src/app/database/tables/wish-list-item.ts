export interface WishListItem {
  id?: number;
  title: string;
  author: string;
  description?: string;
  why?: string;
  notes?: string;
  added: boolean
  categoryId?: number;
  bookId?: number;
}
