import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  imports: [
    NgIf
  ],
  standalone: true
})
export class SelectComponent implements ControlValueAccessor {
  @Input() label: string = ''; // Input for the label of the select
  @Input() options: { value: any; label: string }[] = []; // Input for the options
  @Input() formControlName: string = ''; // Input for the form control name

  value: any; // The selected value
  onChange: any = () => {}; // Callback for when the value changes
  onTouched: any = () => {}; // Callback for when the select is touched

  // Write value from the form model into the view
  writeValue(value: any): void {
    this.value = value;
  }

  // Register a callback for when the value changes
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // Register a callback for when the select is touched
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Handle changes in the select element
  onSelectChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.value = value === 'true' ? true : value === 'false' ? false : value; // Handle boolean values
    this.onChange(this.value);
    this.onTouched();
  }
}
