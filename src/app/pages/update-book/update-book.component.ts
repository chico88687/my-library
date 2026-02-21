import {Component, inject, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {BookService} from '../../service/database/book.service';
import {Book} from '../../database/tables/book';
import {InputTextModule} from 'primeng/inputtext';
import {InputNumberModule} from 'primeng/inputnumber';
import {ButtonModule} from 'primeng/button';
import {BookFormGroup, BookFormService} from '../../service/form/book-form.service';
import {BookAvatarComponent} from '../../shared/book-avatar/book-avatar.component';
import {Rating} from 'primeng/rating';
import {Textarea} from 'primeng/textarea';
import {Category} from '../../database/tables/category';
import {CategoryService} from '../../service/database/category.service';
import {AutoComplete, AutoCompleteCompleteEvent} from 'primeng/autocomplete';
import {DatePicker} from 'primeng/datepicker';

@Component({
  standalone: true,
  selector: 'update-book',
  templateUrl: './update-book.component.html',
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, InputNumberModule, ButtonModule, BookAvatarComponent, Rating, Textarea, AutoComplete, FormsModule, DatePicker]
})
export class UpdateBookComponent implements OnInit {
  form!: BookFormGroup;

  isUpdate = false;

  categoryIdMap: Map<number, Category> = new Map<number, Category>();
  categories: Category[] = [];
  filteredCategories: Category[] = [];

  private bookId?: number;

  private readonly categoryService: CategoryService = inject(CategoryService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly bookService: BookService = inject(BookService);
  private readonly bookFormService: BookFormService = inject(BookFormService);

  ngOnInit(): void {
    this.categoryService.getAll().then(categories => this.initializeCategories(categories));
    this.form = this.bookFormService.createBookFormGroup();

    const idParam = this.route.snapshot.paramMap.get('id');
    const parsedId: number | undefined = idParam === null ? undefined : Number(idParam);

    if (parsedId !== undefined && !Number.isNaN(parsedId)) {
      this.isUpdate = true;
      this.bookId = parsedId;
      void this.loadBook(parsedId);
    }
  }

  protected addBookPicture(): void {

  }

  private async loadBook(id: number): Promise<void> {
    const book = await this.bookService.getById(id);
    if (book) {
      this.bookFormService.resetForm(this.form, book, this.categoryIdMap.get(book.categoryId!) ?? null);
    }
  }

  get canSave(): boolean {
    return this.form.valid;
  }

  async save(): Promise<void> {
    if (!this.form.valid) return;

    const bookValue = this.bookFormService.getBook(this.form);

    if (this.isUpdate && this.bookId != null) {
      // Build partial changes from the current form value
      const {id, ...rest} = bookValue as Book; // in the update flow, id is number
      const changes: Partial<Book> = {...rest};
      await this.bookService.update(this.bookId, changes);
    } else {
      const {id, ...rest} = bookValue as any; // NewBook has id: null, strip it
      const toAdd: Omit<Book, 'id'> = {...rest};
      await this.bookService.add(toAdd);
    }

    await this.router.navigate(['/my-books']);
  }

  protected changeFavorite(): void {
    const currentFavorite = this.form.get('isFavorite')?.value;
    this.form.patchValue({isFavorite: !currentFavorite});
  }

  protected changeWasRead(): void {
    const currentWasRead = this.form.get('wasRead')?.value;
    this.form.patchValue({wasRead: !currentWasRead});
    if (this.form.get('wasRead')?.value === false) {
      this.form.patchValue({finishedReadingDate: undefined})
    }
  }

  private initializeCategories(categories: Category[]): void {
    this.categories = categories;
    for (const category of categories) {
      this.categoryIdMap.set(category.id!, category);
    }
  }

  protected filterCategories(event: AutoCompleteCompleteEvent): void {
    const query = event.query?.toLowerCase() ?? '';
    if (query.length === 0) {
      this.filteredCategories = this.categories.filter(c => this.form.value.category?.name !== c.name);
      return;
    }
    this.filteredCategories = (this.categories || []).filter(category => {
      return category.name?.toLowerCase().startsWith(query);
    });
  }
}
