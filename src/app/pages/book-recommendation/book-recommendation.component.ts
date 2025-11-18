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
    Textarea
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

  protected askRecommendation(): void {

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
