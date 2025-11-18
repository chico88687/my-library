import {inject, Injectable} from '@angular/core';
import {OpenAI} from 'openai';
import {UserSettingsService} from '../database/user-settings.service';
import {AlertService} from '../alert/alert.service';
import {RecommendationOutput} from '../../dtos/recommendation-output';
import {RecommendationInput} from '../../dtos/recommendation-input';
import {PromptService} from '../prompt/prompt-service';

@Injectable({ providedIn: 'root' })
export class OpenAIService {
  private openAI?: OpenAI;

  private readonly userSettingsService: UserSettingsService = inject(UserSettingsService);
  private readonly alertService = inject(AlertService);
  private readonly promptService = inject(PromptService);

  async requestBookRecommendations(recommendationInput: RecommendationInput): Promise<RecommendationOutput[]> {
    const recommendationPrompt = await this.promptService.buildPrompt(recommendationInput);
    const client = await this.getOpenAI();

    if (!client) {
      return [];
    }

    try {
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: recommendationPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      // The model should return only a JSON array
      const text = completion.choices?.[0]?.message?.content ?? '';
      const parsed: RecommendationOutput[] = JSON.parse(text);

      // Optional: validate that the array contains exactly 5 objects
      if (!Array.isArray(parsed) || parsed.length !== 5) {
        this.alertService.addAlert('warning', 'OpenAI response did not contain exactly 5 recommendations.');
      }

      return parsed;
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
      this.alertService.addAlert('error', `Failed to get recommendations: ${error.message ?? error}`);
      return [];
    }
  }

  async getOpenAI(): Promise<OpenAI | undefined> {
    if (this.openAI) {
      return this.openAI;
    }

    const user = await this.userSettingsService.getUser();
    const apiKey = user?.apiKey;

    if (!apiKey) {
      this.alertService.addAlert('error', 'No API key found. Please set your API key in the settings.');
      return undefined;
    }

    this.openAI = new OpenAI({ apiKey , dangerouslyAllowBrowser: true});
    return this.openAI;
  }
}

