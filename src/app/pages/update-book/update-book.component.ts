import {Component, OnInit} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {BookService} from '../../service/book.service';
import {Book} from '../../database/tables/book';
import {InputTextModule} from 'primeng/inputtext';
import {InputNumberModule} from 'primeng/inputnumber';
import {ButtonModule} from 'primeng/button';
import {BookFormGroup, BookFormService} from '../../service/form/book-form.service';

@Component({
  standalone: true,
  selector: 'update-book',
  templateUrl: './update-book.component.html',
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, InputNumberModule, ButtonModule]
})
export class UpdateBookComponent implements OnInit {
  form!: BookFormGroup;
  isUpdate = false;
  private bookId?: number;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly bookService: BookService,
    private readonly bookFormService: BookFormService
  ) {}

  ngOnInit(): void {
    this.form = this.bookFormService.createBookFormGroup();

    const idParam = this.route.snapshot.paramMap.get('id');
    const parsedId: number | undefined = idParam === null ? undefined : Number(idParam);

    if (parsedId !== undefined && !Number.isNaN(parsedId)) {
      this.isUpdate = true;
      this.bookId = parsedId;
      void this.loadBook(parsedId);
    }
  }


  private async loadBook(id: number): Promise<void> {
    const book = await this.bookService.getById(id);
    if (book) {
      this.bookFormService.resetForm(this.form, book);
    }
  }

  get canSave(): boolean {
    return this.form.valid;
  }

  async save(): Promise<void> {
    if (!this.form.valid) return;

    const bookValue = this.bookFormService.getBook(this.form);

    if (this.isUpdate && this.bookId != null) {
      // Build partial changes from current form value
      const { id, ...rest } = bookValue as Book; // in update flow, id is number
      const changes: Partial<Book> = { ...rest };
      await this.bookService.update(this.bookId, changes);
    } else {
      const { id, ...rest } = bookValue as any; // NewBook has id: null, strip it
      const toAdd: Omit<Book, 'id'> = { ...rest };
      await this.bookService.add(toAdd);
    }

    await this.router.navigate(['/my-books']);
  }
}
