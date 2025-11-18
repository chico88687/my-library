import {Injectable} from '@angular/core';
import {RecommendationInput} from '../../dtos/recommendation-input';
import {FormControl, FormGroup, Validators} from '@angular/forms';

export type RecommendationInputFormGroupInput = RecommendationInput;

export type RecommendationInputFormDefaults = {
  categories: string[];
  bookWith: string;
  bookWithout: string;
};

// --- Form content ---
export type RecommendationInputFormGroupContent = {
  categories: FormControl<RecommendationInputFormDefaults['categories']>;
  bookWith: FormControl<RecommendationInputFormDefaults['bookWith'] | null>;
  bookWithout: FormControl<RecommendationInputFormDefaults['bookWithout'] | null>;
};

export type RecommendationInputFormGroup = FormGroup<RecommendationInputFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class RecommendationInputFormService {
  createRecommendationInputFormGroup(
    input: RecommendationInputFormGroupInput = {}
  ): RecommendationInputFormGroup {
    const rawValue = { ...this.getFormDefaults(), ...input };

    return new FormGroup<RecommendationInputFormGroupContent>({
      categories: new FormControl(rawValue.categories ?? [], { nonNullable: true, validators: [Validators.required] }),
      bookWith: new FormControl(rawValue.bookWith),
      bookWithout: new FormControl(rawValue.bookWithout),
    });
  }

  getRecommendationInput(form: RecommendationInputFormGroup): RecommendationInput {
    const raw = form.getRawValue();
    return {
      categories: raw.categories.length ? raw.categories : undefined,
      bookWith: raw.bookWith || undefined,
      bookWithout: raw.bookWithout || undefined,
    };
  }

  resetForm(
    form: RecommendationInputFormGroup,
    input: RecommendationInputFormGroupInput = {}
  ): void {
    const rawValue = { ...this.getFormDefaults(), ...input };
    form.reset({
      categories: rawValue.categories,
      bookWith: rawValue.bookWith,
      bookWithout: rawValue.bookWithout,
    } as any);
  }

  private getFormDefaults(): RecommendationInputFormDefaults {
    return {
      categories: [],
      bookWith: '',
      bookWithout: '',
    };
  }
}
