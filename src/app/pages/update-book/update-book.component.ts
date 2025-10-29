import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {BookService} from '../../service/book.service';
import {Book} from '../../database/tables/book';
import {InputTextModule} from 'primeng/inputtext';
import {InputNumberModule} from 'primeng/inputnumber';
import {ButtonModule} from 'primeng/button';

@Component({
  standalone: true,
  selector: 'update-book',
  templateUrl: './update-book.component.html',
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, InputNumberModule, ButtonModule]
})
export class UpdateBookComponent implements OnInit {
  form!: FormGroup<{
    title: FormControl<string>;
    author: FormControl<string>;
    rating: FormControl<number | null>;
  }>;
  isUpdate = false;
  private bookId?: number;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly bookService: BookService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: this.fb.control('', { validators: Validators.required, nonNullable: true }),
      author: this.fb.control('', { validators: Validators.required, nonNullable: true }),
      rating: this.fb.control<number | null>(null),
    });

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
      this.form.patchValue({
        title: book.title ?? '',
        author: book.author ?? '',
        rating: book.rating ?? null
      });
    }
  }

  get canSave(): boolean {
    return this.form.valid;
  }

  async save(): Promise<void> {
    if (!this.form.valid) return;
    const { title, author, rating } = this.form.getRawValue();

    if (this.isUpdate && this.bookId != null) {
      const changes: Partial<Book> = { title, author, rating: rating ?? undefined };
      await this.bookService.update(this.bookId, changes);
    } else {
      const toAdd: Omit<Book, 'id'> = { title, author, rating: rating ?? undefined };
      await this.bookService.add(toAdd);
    }

    await this.router.navigate(['/my-books']);
  }
}
