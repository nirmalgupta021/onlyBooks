import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrls: ['./pagination.css']
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage = 0;
  @Input() totalPages = 0;
  @Input() maxVisiblePages = 5;
  @Output() pageChange = new EventEmitter<number>();

  visiblePages: number[] = [];
  showFirstPage = false;
  showLastPage = false;
  showFirstEllipsis = false;
  showLastEllipsis = false;

  ngOnChanges() {
    this.calculateVisiblePages();
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  private calculateVisiblePages() {
    const startPage = Math.max(0, this.currentPage - Math.floor(this.maxVisiblePages / 2));
    const endPage = Math.min(this.totalPages - 1, startPage + this.maxVisiblePages - 1);

    this.visiblePages = [];
    for (let i = startPage; i <= endPage; i++) {
      this.visiblePages.push(i);
    }

    this.showFirstPage = startPage > 0;
    this.showLastPage = endPage < this.totalPages - 1;
    this.showFirstEllipsis = startPage > 1;
    this.showLastEllipsis = endPage < this.totalPages - 2;
  }
}
