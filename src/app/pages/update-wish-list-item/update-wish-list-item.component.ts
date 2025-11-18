import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {Textarea} from 'primeng/textarea';
import {AutoComplete, AutoCompleteCompleteEvent} from 'primeng/autocomplete';
import {BookAvatarComponent} from '../../shared/book-avatar/book-avatar.component';
import {Category} from '../../database/tables/category';
import {CategoryService} from '../../service/database/category.service';
import {WishListItemService} from '../../service/database/wish-list-item.service';
import {WishListItemFormGroup, WishListItemFormService} from '../../service/form/wish-list-item.form.service';

@Component({
  standalone: true,
  selector: 'update-wish-list-item',
  templateUrl: './update-wish-list-item.component.html',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, InputTextModule, ButtonModule, Textarea, AutoComplete, BookAvatarComponent]
})
export class UpdateWishListItemComponent implements OnInit {
  form!: WishListItemFormGroup;

  isUpdate = false;
  private wishId?: number;

  categoryIdMap: Map<number, Category> = new Map<number, Category>();
  categories: Category[] = [];
  filteredCategories: Category[] = [];

  private readonly categoryService: CategoryService = inject(CategoryService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly wishService: WishListItemService = inject(WishListItemService);
  private readonly wishFormService: WishListItemFormService = inject(WishListItemFormService);

  ngOnInit(): void {
    this.categoryService.getAll().then(categories => this.initializeCategories(categories));
    this.form = this.wishFormService.createWishListItemFormGroup();

    const idParam = this.route.snapshot.paramMap.get('id');
    const parsedId: number | undefined = idParam === null ? undefined : Number(idParam);
    if (parsedId !== undefined && !Number.isNaN(parsedId)) {
      this.isUpdate = true;
      this.wishId = parsedId;
      void this.loadWish(parsedId);
    }
  }

  private async loadWish(id: number): Promise<void> {
    const item = await this.wishService.getById(id);
    if (item) {
      this.wishFormService.resetForm(this.form, item, this.categoryIdMap.get(item.categoryId!) ?? null);
    }
  }

  get canSave(): boolean {
    return this.form.valid;
  }

  async save(): Promise<void> {
    if (!this.form.valid) return;

    const value = this.wishFormService.getWishListItem(this.form);

    if (this.isUpdate && this.wishId != null) {
      const {id, ...rest} = value as any;
      await this.wishService.update(this.wishId, {...rest});
    } else {
      const {id, ...rest} = value as any;
      await this.wishService.add({...rest});
    }

    await this.router.navigate(['/wish-list']);
  }

  protected changeAdded(): void {
    const current = this.form.get('added')?.value;
    this.form.patchValue({added: !current});
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
