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

  recommendationGenerated: RecommendationOutput[] = [{
    "title": "It Ends with Us",
    "author": "Colleen Hoover",
    "why": "As a fan of Colleen Hoover, this book blends romance with deeper emotional themes, providing a compelling story that resonates with her style.",
    "blurb": "Lily Bloom is a determined woman who has always been able to find beauty in the struggle. When she meets Ryle Kincaid, a neurosurgeon, their instant connection is undeniable, but Ryle's aversion to relationships complicates things. As Lily navigates her past and her future, she learns that love can be both beautiful and heartbreaking."
  }, {
    "title": "People We Meet on Vacation",
    "author": "Emily Henry",
    "why": "Given your interest in Emily Henry's work, this book offers a charming and witty take on friendship and romance, which aligns with your library's themes.",
    "blurb": "Poppy and Alex have been inseparable for years, but a rift in their friendship leads them to take a trip together to rekindle their bond. As they navigate their feelings, they must confront the truth about their relationship and what they truly mean to each other."
  }, {
    "title": "The Seven Husbands of Evelyn Hugo",
    "author": "Taylor Jenkins Reid",
    "why": "This novel features a captivating narrative about love and fame that aligns with your interests in character-driven stories.",
    "blurb": "Aging Hollywood icon Evelyn Hugo is ready to tell her story. She selects an unknown journalist to write her biography, revealing the secrets of her glamorous life, her seven husbands, and the true love she pursued through it all."
  }, {
    "title": "The Song of Achilles",
    "author": "Madeline Miller",
    "why": "This book tells a profound love story against a backdrop of mythology, which may resonate with your taste for emotional depth in romance.",
    "blurb": "In this retelling of the Iliad, we follow the bond between Achilles and Patroclus, exploring themes of love, honor, and destiny as they navigate the trials of war and the complexities of their relationship."
  }, {
    "title": "Beach Read",
    "author": "Emily Henry",
    "why": "You already have this book in your library, so it might be a worthwhile read given your interest in the author's work.",
    "blurb": "Two writers, one a romance novelist and the other a literary fiction author, are stuck in neighboring beach houses for the summer. They challenge each other to swap genres, leading to unexpected revelations and a journey toward self-discovery."
  }];
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
