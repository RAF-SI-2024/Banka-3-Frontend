import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecurityService } from '../../services/security.service';
import { Security } from '../../models/security.model';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-securities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './securities.component.html',
  styleUrl: './securities.component.css'
})
export class SecuritiesComponent implements OnInit, OnDestroy {
  private securityService = inject(SecurityService);
  private authService = inject(AuthService);
  private allSecurities: Security[] = [];
  securities: Security[] = [];
  filteredSecurities: Security[] = [];
  searchTerm: string = '';
  selectedSecurityType: 'All' | 'Stock' | 'Future' | 'Forex' = 'All';
  sortOrder: 'asc' | 'desc' | null = null;
  sortBy: 'price' | 'volume' | 'maintenanceMargin' | null = null;

  priceRange: { min: number | null, max: number | null } = { min: null, max: null };
  volumeRange: { min: number | null, max: number | null } = { min: null, max: null };
  marginRange: { min: number | null, max: number | null } = { min: null, max: null };
  exchangePrefix: string = '';
  settlementDateFilter: string = '';
  private refreshIntervalSubscription?: Subscription;


  ngOnInit(): void {
    this.loadSecurities();
    this.setupDataRefreshInterval();
  }

  ngOnDestroy(): void {
    this.clearDataRefreshInterval();
  }

  refreshSecurity(securityToRefresh: Security): void {
    this.securityService.getSecurityById(securityToRefresh.id).subscribe(updatedSecurity => {
      this.allSecurities = this.allSecurities.map(sec => {
        if (updatedSecurity && sec.id === updatedSecurity.id) {
          return updatedSecurity;
        }
        return sec;
      }).filter((sec): sec is Security => sec !== undefined);
      this.filterSecurities();
    });
  }

  private loadSecurities(): void {
    this.securityService.getSecurities().subscribe(securities => {
      this.allSecurities = securities;
      this.filterSecurities();
    });
  }

  onSearch(): void {
    this.filterSecurities();
  }

  onSelectSecurityType(type: 'All' | 'Stock' | 'Future' | 'Forex'): void {
    this.selectedSecurityType = type;
    this.filterSecurities();
  }

  onSort(): void {
    if (this.sortBy === 'price') {
      if (this.sortOrder === 'asc') {
        this.sortOrder = 'desc';
      } else {
        this.sortBy = 'volume';
        this.sortOrder = 'asc';
      }
    } else if (this.sortBy === 'volume') {
      if (this.sortOrder === 'asc') {
        this.sortOrder = 'desc';
      } else {
        this.sortBy = 'maintenanceMargin';
        this.sortOrder = 'asc';
      }
    } else if (this.sortBy === 'maintenanceMargin') {
      if (this.sortOrder === 'asc') {
        this.sortOrder = 'desc';
      } else {
        this.sortBy = null;
        this.sortOrder = null;
      }
    }
    else {
      this.sortBy = 'price';
      this.sortOrder = 'asc';
    }
    this.sortSecurities();
  }

  onRangeFilterChange(): void {
    this.filterSecurities();
  }

  onFilterChange(): void {
    this.filterSecurities();
  }

  private sortSecurities(): void {
    if (this.sortBy && this.sortOrder) {
      this.filteredSecurities.sort((a, b) => {
        let valueA, valueB;

        if (this.sortBy === 'price') {
          valueA = a.price;
          valueB = b.price;
        } else if (this.sortBy === 'volume') {
          valueA = a.volume;
          valueB = b.volume;
        } else if (this.sortBy === 'maintenanceMargin') {
          valueA = a.maintenanceMargin;
          valueB = b.maintenanceMargin;
        } else {
          return 0;
        }

        if (this.sortOrder === 'asc') {
          return valueA - valueB;
        } else {
          return valueB - valueA;
        }
      });
      this.securities = [...this.filteredSecurities];
    } else {
      this.filterSecurities();
    }
  }

  private filterSecurities(): void {
    let tempFilteredSecurities = [...this.allSecurities];

    if (this.authService.isClient()) {
      tempFilteredSecurities = tempFilteredSecurities.filter(security => security.type === 'Stock');
    } else {
      if (this.selectedSecurityType !== 'All') {
        tempFilteredSecurities = tempFilteredSecurities.filter(security => security.type === this.selectedSecurityType);
      }
    }


    const term = this.searchTerm.toLowerCase();
    if (term) {
      tempFilteredSecurities = tempFilteredSecurities.filter(security =>
        security.ticker.toLowerCase().includes(term)
      );
    }

    tempFilteredSecurities = tempFilteredSecurities.filter(security =>
      this.checkRange(security.price, this.priceRange) &&
      this.checkRange(security.volume, this.volumeRange) &&
      this.checkRange(security.maintenanceMargin, this.marginRange)
    );

    if (this.exchangePrefix) {
      tempFilteredSecurities = tempFilteredSecurities.filter(security =>
        security.ticker.toLowerCase().startsWith(this.exchangePrefix.toLowerCase())
      );
    }

    if (this.settlementDateFilter && (this.selectedSecurityType === 'Future' || this.selectedSecurityType === 'All')) {
      tempFilteredSecurities = tempFilteredSecurities.filter(security => {
        if (security.type === 'Future') {
          return security.settlementDate === this.settlementDateFilter;
        } else {
          return false;
        }
      });
    }

    this.filteredSecurities = tempFilteredSecurities;
    this.securities = [...this.filteredSecurities];

    if (this.sortBy) {
      this.sortSecurities();
    }
  }

  private checkRange(value: number, range: { min: number | null, max: number | null }): boolean {
    const min = range.min;
    const max = range.max;
    if (min != null && value < min) return false;
    if (max != null && value > max) return false;
    return true;
  }

  private setupDataRefreshInterval(): void {
    this.refreshIntervalSubscription = interval(30000).subscribe(() => {
      this.loadSecurities();
    });
  }

  private clearDataRefreshInterval(): void {
    if (this.refreshIntervalSubscription) {
      this.refreshIntervalSubscription.unsubscribe();
    }
  }
}