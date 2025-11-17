import {inject, Injectable} from '@angular/core';
import {UserSettingsService} from '../database/user-settings.service';
import {CapacitorHttp} from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class OpenAIService {

  private readonly OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

  protected readonly userSettingsService = inject(UserSettingsService);

  private async getAuthHeader():Promise<Record<string, string>> {
    const userSettings = await this.userSettingsService.getUser();
    if (!userSettings) {
      throw new Error('No user settings found. Ask the user to set up their account.');
    }
    const key = userSettings.apiKey;
    if (!key) {
      throw new Error('No API key found. Ask the user to enter one.');
    }
    return { Authorization: `Bearer ${key}` };
  }

  /**
   * Call OpenAI Chat Completions
   * prompt: the text you want the model to respond to
   */
  async createChatCompletion(prompt: string, model = 'gpt-4o-mini') {
    const headers = await this.getAuthHeader();
    // Required content-type
    headers['Content-Type'] = 'application/json';

    const body = {
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.7
    };

    // Using Capacitor HTTP plugin
    const options = {
      method: 'POST',
      url: this.OPENAI_URL,
      headers,
      data: body,
      // timeouts are optional
      connectTimeout: 60_000,
      readTimeout: 60_000
    };

    try {
      const response = await CapacitorHttp.request(options);
      // response.data is the parsed JSON
      return response.data;
    } catch (err: any) {
      // Normalize error for caller
      throw new Error(err?.message || JSON.stringify(err));
    }
  }
}
