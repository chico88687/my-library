import {Component, inject, OnInit} from '@angular/core';
import {
  RecommendationInputFormGroup,
  RecommendationInputFormService
} from '../../service/form/recommendation-input.form.service';
import {OpenAIService} from '../../service/open-ai/open-ai.service';
import {CategoryService} from '../../service/database/category.service';
import {Step, StepList, StepPanel, StepPanels, Stepper} from 'primeng/stepper';
import {Button, ButtonSeverity} from 'primeng/button';
import {ProgressSpinner} from 'primeng/progressspinner';
import {RecommendationOutput} from '../../dtos/recommendation-output';
import {PageHeaderComponent} from '../../shared/page-header/page-header.component';
import {AutoComplete, AutoCompleteCompleteEvent} from 'primeng/autocomplete';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Textarea} from 'primeng/textarea';
import {AlertService} from '../../service/alert/alert.service';
import {InputText} from 'primeng/inputtext';
import {WishListItemService} from '../../service/database/wish-list-item.service';

@Component({
  standalone: true,
  selector: 'app-find-book',
  imports: [
    Stepper,
    StepList,
    Step,
    StepPanels,
    StepPanel,
    Button,
    ProgressSpinner,
    PageHeaderComponent,
    AutoComplete,
    FormsModule,
    ReactiveFormsModule,
    Textarea,
    InputText
  ],
  templateUrl: './book-recommendation.component.html'
})
export class BookRecommendationComponent implements OnInit {
  form!: RecommendationInputFormGroup;

  activeStep = 1;

  allCategories: string[] = [];
  filteredCategories: string[] = [];

  isLoading = false;

  recommendationGenerated: RecommendationOutput[] = [];
  currentIndex = 0;

  get currentRecommendation(): RecommendationOutput | undefined {
    return this.recommendationGenerated[this.currentIndex];
  }

  private readonly openAIService = inject(OpenAIService);
  private readonly categoryService = inject(CategoryService);
  private readonly recommendationInputFormService: RecommendationInputFormService = inject(RecommendationInputFormService);
  private readonly alertService = inject(AlertService);
  private readonly wishListItemService = inject(WishListItemService);

  ngOnInit(): void {
    this.form = this.recommendationInputFormService.createRecommendationInputFormGroup();
    this.loadCategories();
  }

  private loadCategories() {
    this.categoryService.getAll().then(categories => {
      this.allCategories = categories.map(category => category.name);
    })
  }

  protected getSeverity(step: number): ButtonSeverity {
    return step > this.activeStep ? 'secondary' : 'primary';
  }

  protected async askRecommendation(): Promise<void> {
    this.currentIndex = 0;
    this.isLoading = true;
    const recommendationInput = this.recommendationInputFormService.getRecommendationInput(this.form);
    this.openAIService.requestBookRecommendations(recommendationInput).then((recommendations: RecommendationOutput[]) => {
      this.recommendationGenerated = recommendations;
    })
      .catch((error) => {
        this.alertService.addAlert('error', 'Failed to fetch recommendations. Please try again later.');
        console.error('Failed to fetch recommendations:', error);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  protected filterCategories(event: AutoCompleteCompleteEvent): void {
    const query = event.query?.toLowerCase() ?? '';
    if (query.length === 0) {
      this.filteredCategories = this.allCategories.filter(c => !this.form.value.categories?.includes(c));
      return;
    }
    this.filteredCategories = this.allCategories.filter(c =>
      c.toLowerCase().startsWith(query)
    );
  }

  protected backInput(): void {
    this.activeStep = this.activeStep - 1;
  }

  protected forwardInput(): void {
    this.activeStep = this.activeStep + 1;
  }

  protected prevRecommendation(): void {
    if (this.recommendationGenerated.length === 0) return;
    this.currentIndex = Math.max(0, this.currentIndex - 1);
  }

  protected nextRecommendation(): void {
    if (this.recommendationGenerated.length === 0) return;
    this.currentIndex = Math.min(this.recommendationGenerated.length - 1, this.currentIndex + 1);
  }

  protected resetRecommendations(): void {
    this.recommendationGenerated = [];
    this.currentIndex = 0;
    this.activeStep = 1;
    this.form.reset();
    this.filteredCategories = [];
  }

  protected async saveCurrentRecommendation(): Promise<void> {
    const rec = this.currentRecommendation;
    if (!rec) {
      this.alertService.addAlert('warn', 'No recommendation to save');
      return;
    }

    try {
      await this.wishListItemService.add({
        title: rec.title,
        author: rec.author,
        description: rec.blurb,
        why: rec.why,
        notes: undefined,
        added: false,
        categoryId: undefined,
        bookId: undefined
      });
    } catch (e) {
      console.error(e);
      this.alertService.addAlert('error', 'Failed to save wish list item');
    }
  }
}
