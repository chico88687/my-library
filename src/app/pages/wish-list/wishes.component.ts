import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {PageHeaderComponent} from '../../shared/page-header/page-header.component';
import {Button} from 'primeng/button';
import {FormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {ListOptionsComponent} from '../../shared/list-options/list-options.component';
import {RouterLink} from '@angular/router';
import {WishListComponent} from '../../shared/list-wish/wish-list.component';
import {WishListItem} from '../../database/tables/wish-list-item';
import {WishListFilter, WishListItemService} from '../../service/database/wish-list-item.service';
import {SortState} from '../../shared/sort-state/sort-state';
import {debounceTime, distinctUntilChanged, Subject, takeUntil} from 'rxjs';
import {Category} from '../../database/tables/category';
import {CategoryService} from '../../service/database/category.service';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {ConfirmationService} from 'primeng/api';

@Component({
  standalone: true,
  selector: 'wishes-component',
  templateUrl: './wishes.component.html',
  imports: [
    PageHeaderComponent,
    Button,
    FormsModule,
    InputText,
    ListOptionsComponent,
    RouterLink,
    WishListComponent,
    ConfirmDialog
  ],
  providers: [ConfirmationService]
})
export class WishesComponent implements OnInit, OnDestroy {
  wishes: WishListItem[] = [];
  fieldAndLabelSortMap: Map<string, string> = new Map();
  categoryIdMap?: Map<number, Category>;
  sortState: SortState = {predicate: 'title', order: 'asc'};
  wishFilter: WishListFilter = { added: false };
  isLoading = false;

  private readonly wishService = inject(WishListItemService);
  private readonly categoryService = inject(CategoryService);
  private readonly confirmationService = inject(ConfirmationService);

  private readonly searchSubject = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.wishFilter = history.state["wishFilter"] ?? { added: false };
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.loadWishes());
    this.buildSortMap();
    this.loadCategories();
    this.loadWishes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadWishes(shouldShowLoading: boolean = true): void {
    this.isLoading = shouldShowLoading;
    this.wishService.getAll(this.sortState, this.wishFilter).then(items => {
      this.wishes = items;
      this.isLoading = false;
    });
  }

  protected sortWishes($event: SortState): void {
    this.sortState = $event;
    this.loadWishes();
  }

  protected filterWishesByCategory(categoryId?: number): void {
    this.wishFilter = { ...this.wishFilter, categoryId };
    this.loadWishes();
  }

  protected search(value: string): void {
    this.wishFilter = { ...this.wishFilter, searchTerm: value };
    this.searchSubject.next(value);
  }

  // 3-state toggle for `added`: undefined -> true -> false -> undefined
  protected filterByAdded(): void {
    if (this.wishFilter.added === undefined) {
      this.wishFilter.added = true;
    } else if (this.wishFilter.added) {
      this.wishFilter.added = false;
    } else {
      this.wishFilter.added = undefined;
    }
    this.loadWishes();
  }

  protected getAddedIcon(): string {
    if (this.wishFilter.added === undefined) return 'pi pi-minus-circle';
    return this.wishFilter.added ? 'pi pi-check-circle' : 'pi pi-times-circle';
  }

  protected deleteWish($event: { wish: WishListItem, event: Event }): void {
    const wish = $event.wish;
    const event = $event.event;
    const message = `Are you sure you want to delete "${wish.title}" from your wish list?`;
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      accept: () => {
        void this.wishService.deleteByEntity(wish);
        this.loadWishes();
      },
    });
  }

  private buildSortMap(): void {
    this.fieldAndLabelSortMap = new Map<string, string>([
      ['title', 'Title'],
      ['author', 'Author'],
    ]);
  }

  private loadCategories(): void {
    this.categoryService.getAll().then(categories => {
      this.categoryIdMap = new Map<number, Category>();
      for (const cat of categories) {
        this.categoryIdMap.set(cat.id!, cat);
      }
    });
  }
}
