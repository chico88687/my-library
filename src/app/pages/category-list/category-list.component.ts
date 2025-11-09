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
    Ripple
  ],
  providers: [ConfirmationService]
})
export class CategoryListComponent implements OnInit {

  categories: Category[] = [];
  categoryIdAndNumberOfBooksMap: Map<number, number> = new Map()

  isLoading = false;

  isEditing = false;
  clonedCategories: { [id: number]: Category } = {};

  protected readonly categoryService = inject(CategoryService);
  protected readonly bookService = inject(BookService);
  protected readonly confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    this.addingTest().then(() => this.loadData());
    // void this.loadData()
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
  }

  onRowEditCancel(category: Category, index: number) {
    this.categories[index] = this.clonedCategories[category.id!];
    delete this.clonedCategories[category.id!];
  }

  private async loadData(): Promise<void> {
    this.isLoading = true;
    this.categories = await this.categoryService.getAll();
    this.categoryIdAndNumberOfBooksMap = await this.buildCategoryMap();
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

  private async addingTest(): Promise<void> {
    const newCategory = {
      name: 'Test'
    }

    await this.categoryService.add(newCategory);
  }
}
