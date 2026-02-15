export interface Book {
  id?: number;
  title: string;
  author: string;
  rating?: number;
  notes?: string;
  isFavorite: boolean;
  wasRead: boolean;
  categoryId?: number;
  wishId?: number;

  addedDate?: Date;
  bookCover?: string;
}
