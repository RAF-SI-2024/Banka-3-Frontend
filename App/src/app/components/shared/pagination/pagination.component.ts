import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  standalone: true,
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Output() pageChanged = new EventEmitter<number>();

  currentPage: number = 1;
  totalPages: number = 1;

  ngOnChanges() {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);

    this.currentPage = Math.max(1, this.currentPage);

    if (this.totalPages === 0) {
      this.totalPages = 1; // da nema 0 str
    }

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.pageChanged.emit(this.currentPage);
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.pageChanged.emit(this.currentPage);
    }
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageChanged.emit(this.currentPage);
    }
  }
}
