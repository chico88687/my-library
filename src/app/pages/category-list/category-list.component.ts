import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {PageHeaderComponent} from '../../shared/page-header/page-header.component';
import {BookService} from '../../service/database/book.service';
import {ConfirmationService} from 'primeng/api';
import {CategoryService} from '../../service/database/category.service';
import {Category} from '../../database/tables/category';
import {Table, TableModule} from 'primeng/table';
import {FormsModule} from '@angular/forms';
import {Button, ButtonDirective} from 'primeng/button';
import {InputText} from 'primeng/inputtext';
import {Ripple} from 'primeng/ripple';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {WishListItemService} from '../../service/database/wish-list-item.service';

export type CategoryWithNumberOfBooks = {
  id?: number;
  category: Category;
  stats: CategoryStats;
};

export type CategoryStats = {
  numberOfBooks: number;
  numberOfWishes: number;
}

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

  @ViewChild(Table) table!: Table;

  categories: Category[] = [];
  categoryIdAndStatsMap: Map<number, { numberOfBooks: number, numberOfWishes: number }> = new Map();

  categoriesWithCounts: CategoryWithNumberOfBooks[] = [];

  isLoading = false;

  clonedCategories: { [key: string]: Category } = {};
  tempRowCounter = 0;

  protected readonly categoryService = inject(CategoryService);
  protected readonly bookService = inject(BookService);
  protected readonly wishListItemService = inject(WishListItemService);
  protected readonly confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    void this.loadData()
  }

  addCategory(): void {
    const isNewRowAlready = this.categoriesWithCounts.some(c => !c.id);
    if (isNewRowAlready) {
      return;
    }

    const newCategory: CategoryWithNumberOfBooks = {
      id: undefined,
      category: {id: undefined, name: ''},
      stats: {numberOfWishes: 0, numberOfBooks: 0}
    };

    this.categoriesWithCounts = [newCategory, ...this.categoriesWithCounts];

    setTimeout(() => {
      this.table.initRowEdit(newCategory);
    });
  }

  onRowEditInit(category: Category): void {
    const key = category.id != null ? String(category.id) : `__tmp__${this.tempRowCounter ?? 0}`;
    // If it's a temporary row with no id we still want to store a clone,
    // so create a temp counter key (optional — we mainly need clones for existing rows).
    this.clonedCategories[key] = {...category};
  }


  async onRowEditSave(category: Category): Promise<void> {
    delete this.clonedCategories[category.id!];

    if (category.id) {
      await this.categoryService.update(category.id, category);
    } else {
      await this.categoryService.add(category);
    }

    await this.loadData();
  }

  onRowEditCancel(category: Category, index: number) {
    if (category.id == null) {
      // This was a new/unsaved row — remove it from the displayed array
      // index is the rowIndex from the table template (ri)
      this.categoriesWithCounts = this.categoriesWithCounts.filter((_, i) => i !== index);
    } else {
      // Existing row — restore the clone
      const key = String(category.id);
      const original = this.clonedCategories[key];
      if (original) {
        // The categoriesWithCounts holds objects of shape {id, category, numberOfBooks}
        // so restore the inner category object
        const target = this.categoriesWithCounts[index];
        if (target) {
          target.category = original;
        }
      }
      delete this.clonedCategories[key];
    }
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
        this.categoryService.delete(category).then();
        void this.loadData();
      },
    });
  }

  private async loadData(): Promise<void> {
    this.isLoading = true;

    const categories = await this.categoryService.getAll();
    this.categories = categories;
    this.categoryIdAndStatsMap = await this.buildCategoryMap();

    this.categoriesWithCounts = categories.map(c => ({
      id: c.id,
      category: c,
      stats: this.categoryIdAndStatsMap.get(c.id ?? -1) ?? {numberOfBooks: 0, numberOfWishes: 0},
    }));

    this.isLoading = false;
  }

  private async buildCategoryMap(): Promise<Map<number, CategoryStats>> {
    const categoryAndNumberOfBooksMap = new Map<number, CategoryStats>();

    for (const category of this.categories) {
      const categoryId = category.id!;
      const numberOfBooks = await this.bookService.countByCategoryId(categoryId);
      const numberOfWishes = await this.wishListItemService.countByCategoryId(categoryId);
      const stats = {
        numberOfBooks: numberOfBooks,
        numberOfWishes: numberOfWishes,
      };
      categoryAndNumberOfBooksMap.set(categoryId, stats);
    }

    return categoryAndNumberOfBooksMap;
  }
}
