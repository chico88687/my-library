import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {MenuItem} from 'primeng/api';
import {MenuModule} from 'primeng/menu';
import {Button} from 'primeng/button';
import {SortOrder, SortState} from './sort-state';

@Component({
  standalone: true,
  selector: 'sort-menu',
  templateUrl: './sort-menu.component.html',
  imports: [MenuModule, Button],
})
export class SortMenuComponent implements OnChanges {
  @Input() fieldAndLabelMap: Map<string, string> = new Map();
  @Input() sortState: SortState = {};
  @Output() sortStateEmitter = new EventEmitter<SortState>();

  sortMenu: MenuItem[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (Object.hasOwn(changes, 'fieldList')) {
      this.buildMenuItems();
    }

    if (Object.hasOwn(changes, 'sortState')) {
      this.buildMenuItems();
    }
  }

  buildMenuItems(): void {
    this.sortMenu = [...this.fieldAndLabelMap]
      .filter(([field]) => field !== this.sortState.predicate)
      .map(([field, label]: [string, string]) => ({
        label,
        command: () => this.emitNewPredicate(field),
      }));
  }

  emitNewPredicate(field: string): void {
    const newSortState = {
      predicate: field,
      order: 'asc',
    } as SortState;

    this.sortStateEmitter.emit(newSortState);
  }

  emitNewOrder(): void {
    const newSortState = {
      predicate: this.sortState.predicate,
      order: this.getCurrentOrder() === 'asc' ? 'desc' : 'asc',
    } as SortState;

    this.sortStateEmitter.emit(newSortState);
  }

  getButtonLabel(): string {
    return this.fieldAndLabelMap.get(this.sortState.predicate!)!;
  }

  getCurrentOrder(): SortOrder | undefined {
    return this.sortState.order;
  }

  getIcon(): string {
    let icon = 'pi-sort-alt';
    if (this.sortState.order != null) {
      icon = this.sortState.order === 'asc' ? 'pi-sort-amount-up-alt' : 'pi-sort-amount-down';
    }
    return `pi ${icon}`;
  }
}
