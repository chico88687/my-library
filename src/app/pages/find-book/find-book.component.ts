import {Component, inject} from '@angular/core';
import {OpenAIService} from '../../service/open-ai/open-ai.service';
import {JsonPipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Textarea} from 'primeng/textarea';
import {Button, ButtonDirective} from 'primeng/button';

@Component({
  standalone: true,
  selector: 'app-find-book',
  templateUrl: './find-book.component.html',
  imports: [
    JsonPipe,
    FormsModule,
    Textarea,
    ButtonDirective,
    Button
  ]
})
export class FindBookComponent {
  prompt = 'Hello from my Android app';
  result: any = null;
  error = '';
  loading = false;

  private readonly openAIService: OpenAIService = inject(OpenAIService);

  async send() {
    this.loading = true;
    this.error = '';
    try {
      this.result = await this.openAIService.createChatCompletion(this.prompt);
    } catch (e: any) {
      this.error = e.message || String(e);
    } finally {
      this.loading = false;
    }
  }
}
