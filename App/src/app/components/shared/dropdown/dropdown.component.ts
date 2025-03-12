import { Component, ElementRef, HostListener, ContentChild } from '@angular/core';
import {NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css'],
  imports: [
    NgClass,
    NgIf
  ],
  standalone: true
})
export class DropdownComponent {
  isOpen = false;

  @ContentChild('dropdownHeader', { static: false }) dropdownHeader: ElementRef | null = null;

  constructor(private eRef: ElementRef) {}

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  get hasHeader(): boolean {
    return !!this.dropdownHeader?.nativeElement?.innerHTML.trim();
  }
}
