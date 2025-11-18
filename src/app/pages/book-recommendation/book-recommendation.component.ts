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
import {JsonPipe} from '@angular/common';

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
    JsonPipe
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

  private readonly openAIService = inject(OpenAIService);
  private readonly categoryService = inject(CategoryService);
  private readonly recommendationInputFormService: RecommendationInputFormService = inject(RecommendationInputFormService);
  private readonly alertService = inject(AlertService);

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
}
