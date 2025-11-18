import {inject, Injectable} from '@angular/core';
import {BookService} from '../database/book.service';
import {WishListItemService} from '../database/wish-list-item.service';
import {CategoryService} from '../database/category.service';
import {BookPrompt} from '../../dtos/book-prompt';
import {Category} from '../../database/tables/category';
import {SortState} from '../../shared/sort-state/sort-state';
import {BookSimple} from '../../dtos/books-simple';
import {RecommendationInput} from '../../dtos/recommendation-input';
import {TEMPLATE} from './prompt-template';

@Injectable({providedIn: 'root'})
export class PromptService {

  private readonly bookService = inject(BookService);
  private readonly wishListService = inject(WishListItemService);
  private readonly categoryService = inject(CategoryService);

  async buildPrompt(recommendationInput: RecommendationInput): Promise<string> {
    // Get the user's library and wishlist as CSV strings
    const libraryBooks = await this.getFullLibrary();
    const wishListBooks = await this.getWishList();

    // Build the dynamic sections from RecommendationInput
    const categorySection = recommendationInput.categories?.join(', ') || 'None';
    const lookingForSection = recommendationInput.bookWith || 'None';
    const notLookingForSection = recommendationInput.bookWithout || 'None';

    // Replace the placeholders in the TEMPLATE
    return TEMPLATE
      .replace('{libraryBooks}', libraryBooks)
      .replace('{wishListBooks}', wishListBooks)
      .replace('{categorySection}', categorySection)
      .replace('{lookingForSection}', lookingForSection)
      .replace('{notLookingForSection}', notLookingForSection);
  }

  private async getFullLibrary(): Promise<string> {
    const categoryIdMap: Map<number, Category> = new Map();
    const allCategories = await this.categoryService.getAll();
    for (const category of allCategories) {
      categoryIdMap.set(category.id!, category);
    }
    const bookSortState: SortState = {predicate: 'title', order: "asc"}
    const books = await this.bookService.getAll(bookSortState);
    const bookPrompt: BookPrompt[] = books.map(book => ({
      title: book.title,
      author: book.author,
      rating: book.rating ?? 0,
      isFavorite: book.isFavorite,
      category: book.categoryId ? categoryIdMap.get(book.categoryId)?.name ?? '' : ''
    }));
    return this.booksPromptToCSV(bookPrompt);
  }

  private async getWishList(): Promise<string> {
    const wishSortState: SortState = { predicate: 'title', order: "asc" };
    const wishItems = await this.wishListService.getAll(wishSortState, { added: false });

    // Map WishListItem to BookSimple
    const wishBooks: BookSimple[] = wishItems.map(item => ({
      title: item.title,
      author: item.author
    }));

    // Convert to CSV
    return this.bookSimpleToCSV(wishBooks);
  }

  private bookSimpleToCSV(books: BookSimple[]): string {
    // CSV header
    const headers = ['title', 'author'];
    const rows = books.map(book => [
      this.escapeCsvValue(book.title),
      this.escapeCsvValue(book.author)
    ]);

    // Join header + rows
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  private booksPromptToCSV(bookPrompt: BookPrompt[]): string {
    // CSV header
    const headers = ['title', 'author', 'rating', 'isFavorite', 'category'];
    const rows = bookPrompt.map(book => [
      this.escapeCsvValue(book.title),
      this.escapeCsvValue(book.author),
      book.rating.toString(),
      book.isFavorite.toString(),
      this.escapeCsvValue(book.category)
    ]);

    // Join header + rows
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

// Helper to escape commas, quotes, and newlines
  private escapeCsvValue(value: string): string {
    if (/[",\n]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`; // escape quotes by doubling them
    }
    return value;
  }
}
