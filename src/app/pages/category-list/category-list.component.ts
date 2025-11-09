import {Component, inject, OnInit} from '@angular/core';
import {PageHeaderComponent} from '../../shared/page-header/page-header.component';
import {BookService} from '../../service/database/book.service';
import {ConfirmationService} from 'primeng/api';
import {CategoryService} from '../../service/database/category.service';
import {Category} from '../../database/tables/category';
import {TableModule} from 'primeng/table';
import {FormsModule} from '@angular/forms';
import {Button, ButtonDirective} from 'primeng/button';
import {InputText} from 'primeng/inputtext';
import {Ripple} from 'primeng/ripple';
import {ConfirmDialog} from 'primeng/confirmdialog';

export type CategoryWithNumberOfBooks = {
  id?: number;
  category: Category;
  numberOfBooks: number;
};

@Component({
  standalone: true,
  selector: 'category-list',
  templateUrl: './category-list.component.html',
  imports: [
    PageHeaderComponent,
    TableModule,
    FormsModule,
    Button,
    InputText,
    ButtonDirective,
    Ripple,
    ConfirmDialog
  ],
  providers: [ConfirmationService]
})
export class CategoryListComponent implements OnInit {

  categories: Category[] = [];
  categoryIdAndNumberOfBooksMap: Map<number, number> = new Map();

  categoriesWithCounts: CategoryWithNumberOfBooks[] = [];

  isLoading = false;

  isEditing = false;
  clonedCategories: { [id: number]: Category } = {};

  protected readonly categoryService = inject(CategoryService);
  protected readonly bookService = inject(BookService);
  protected readonly confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    void this.loadData()
  }

  addCategory(): void {
    // this.categories.push({
    //   id: undefined,
    //   name: ''
    // });
  }

  onRowEditInit(category: Category): void {
    this.clonedCategories[category.id!] = {...category};
  }

  onRowEditSave(category: Category): void {
    delete this.clonedCategories[category.id!];
    if (category.id) {
      void this.categoryService.update(category.id, category);
    }
    else {
      void this.categoryService.add(category);
    }
  }

  onRowEditCancel(category: Category, index: number) {
    this.categories[index] = this.clonedCategories[category.id!];
    delete this.clonedCategories[category.id!];
  }

  protected deleteCategory(category: Category, event: Event): void {
    const message = `Are you sure you want to delete the category "${category.name}"?`;
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message,
      // header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },
      accept: () => {
        void this.categoryService.delete(category);
        void this.loadData();
      },
    });
  }

  private async loadData(): Promise<void> {
    this.isLoading = true;

    const categories = await this.categoryService.getAll();
    this.categoryIdAndNumberOfBooksMap = await this.buildCategoryMap();

    this.categoriesWithCounts = categories.map(c => ({
      id: c.id,
      category: c,
      numberOfBooks: this.categoryIdAndNumberOfBooksMap.get(c.id!) ?? 0
    }));

    this.isLoading = false;
  }

  private async buildCategoryMap(): Promise<Map<number, number>> {
    const categoryAndNumberOfBooksMap = new Map<number, number>();

    for (const category of this.categories) {
      const categoryId = category.id!;
      const numberOfBooks = await this.bookService.countByCategoryId(categoryId);
      categoryAndNumberOfBooksMap.set(categoryId, numberOfBooks);
    }

    return categoryAndNumberOfBooksMap;
  }
}
