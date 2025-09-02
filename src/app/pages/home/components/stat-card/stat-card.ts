import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  imports: [],
  templateUrl: './stat-card.html',
})
export class StatCard {
  @Input() title!: string;
  @Input() value: string | number = 0;
  @Input() description?: string;
  @Input() format?: 'number' | 'percentage' | 'text' = 'text';
  @Input() customClasses?: string = '';

  get formattedValue(): string {
    if (this.format === 'percentage' && typeof this.value === 'number') {
      return `${this.value.toFixed(0)}%`;
    }

    if (this.format === 'number' && typeof this.value === 'number') {
      return this.value.toLocaleString();
    }

    return String(this.value || 0);
  }
}
