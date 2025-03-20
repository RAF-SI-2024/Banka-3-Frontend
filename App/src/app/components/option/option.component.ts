import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  Option,
  OptionChain,
  OptionPair,
  OptionType,
} from '../../models/option.model';
import { OptionService } from '../../services/option.service';

@Component({
  selector: 'app-options-display',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './option.component.html',
  styleUrls: ['./option.component.scss'],
})
export class OptionsDisplayComponent implements OnInit, OnChanges {
  @Input() stockId: number = 0;

  optionChains: OptionChain[] = [];
  currentChain: OptionChain | null = null;

  availableDates: Date[] = [];
  selectedDateIndex: number = 0;
  selectedDate: Date = new Date();
  minDate: Date = new Date();
  maxDate: Date = new Date(
    new Date().setFullYear(new Date().getFullYear() + 1)
  );

  maxVisibleStrikes: number = 5;
  isLoading: boolean = false;
  errorMessage: string = '';

  OptionType = OptionType;
  Math: any = Math;

  constructor(
    private optionService: OptionService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['stockId']) {
        this.stockId = +params['stockId'];
        this.initializeDates();
        this.loadOptions();
      } else if (this.stockId) {
        this.initializeDates();
        this.loadOptions();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stockId'] && !changes['stockId'].firstChange) {
      this.initializeDates();
      this.loadOptions();
    }
  }

  // Initialize default available dates
  initializeDates(): void {
    const today = new Date();

    this.availableDates = [
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7), // 1 week
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30), // 1 month
      new Date(today.getFullYear(), today.getMonth() + 3, today.getDate()), // 3 months
      new Date(today.getFullYear(), today.getMonth() + 6, today.getDate()), // 6 months
      new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()), // 1 year
    ];

    if (this.availableDates.length > 0) {
      this.selectedDateIndex = 0;
      this.selectedDate = this.availableDates[0];
    }
  }

  // Handle date selection from the date picker
  onDateSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.selectedDate = new Date(input.value);

      const index = this.availableDates.findIndex((date) =>
        this.isSameDay(date, this.selectedDate)
      );

      if (index >= 0) {
        this.selectedDateIndex = index;
      } else {
        this.availableDates.push(this.selectedDate);
        this.availableDates.sort((a, b) => a.getTime() - b.getTime());
        this.selectedDateIndex = this.availableDates.findIndex((date) =>
          this.isSameDay(date, this.selectedDate)
        );
      }

      this.loadOptionsForDate();
    }
  }

  //  Handle selection from the date dropdown
  onDateIndexSelected(): void {
    if (
      this.selectedDateIndex >= 0 &&
      this.selectedDateIndex < this.availableDates.length
    ) {
      this.selectedDate = this.availableDates[this.selectedDateIndex];
      this.loadOptionsForDate();
    }
  }

  //Check if two dates are the same day (ignoring time)
  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  // Load options for all available dates

  loadOptions(): void {
    if (!this.stockId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.loadOptionsForDate();
  }

  // Load options for the currently selected date
  loadOptionsForDate(): void {
    if (!this.stockId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.optionService
      .getStockOptionsByDate(this.stockId, this.selectedDate)
      .subscribe({
        next: (options) => {
          if (!options || options.length === 0) {
            this.currentChain = null;
            this.errorMessage = `No options available for ${this.selectedDate.toLocaleDateString()}`;
          } else {
            this.currentChain = this.createOptionChain(
              options,
              this.selectedDate
            );

            const existingIndex = this.optionChains.findIndex((chain) =>
              this.isSameDay(chain.expirationDate, this.selectedDate)
            );

            if (existingIndex >= 0) {
              this.optionChains[existingIndex] = this.currentChain;
            } else {
              this.optionChains.push(this.currentChain);
              this.optionChains.sort((a, b) => a.daysToExpiry - b.daysToExpiry);
            }
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading options:', error);
          this.errorMessage = 'Failed to load options data. Please try again.';
          this.isLoading = false;
        },
      });
  }

  //  Creates an option chain from a list of options
  private createOptionChain(
    options: Option[],
    expirationDate: Date
  ): OptionChain {
    if (!options || options.length === 0) {
      return {
        expirationDate,
        daysToExpiry: this.calculateDaysToExpiry(expirationDate),
        stockPrice: 0,
        optionPairs: [],
      };
    }

    const stockPrice = options[0]?.underlyingStock?.price || 0;

    const optionsByStrike = options.reduce((strikes, option) => {
      const strikeKey = option.strikePrice.toString();
      if (!strikes[strikeKey]) {
        strikes[strikeKey] = {
          call: null,
          put: null,
          strikePrice: option.strikePrice,
        };
      }
      if (option.optionType === OptionType.CALL) {
        strikes[strikeKey].call = option;
      } else {
        strikes[strikeKey].put = option;
      }
      return strikes;
    }, {} as Record<string, OptionPair>);

    // Convert to array and sort by strike price
    const optionPairs = Object.values(optionsByStrike).sort(
      (a, b) => a.strikePrice - b.strikePrice
    );

    return {
      expirationDate,
      daysToExpiry: this.calculateDaysToExpiry(expirationDate),
      stockPrice,
      optionPairs,
    };
  }

  // Calculate days to expiry from today to the given date
  calculateDaysToExpiry(expirationDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset hours to get accurate day count
    const diffTime = expirationDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Get option pairs for the current view
  getVisiblePairs(): OptionPair[] {
    if (!this.currentChain) return [];

    const pairs = [...this.currentChain.optionPairs];

    pairs.sort(
      (a, b) =>
        Math.abs(a.strikePrice - this.currentChain!.stockPrice) -
        Math.abs(b.strikePrice - this.currentChain!.stockPrice)
    );

    return pairs.slice(0, this.maxVisibleStrikes);
  }

  // Check if an option is in the money

  isInTheMoney(optionType: OptionType, strikePrice: number): boolean {
    if (!this.currentChain) return false;

    const stockPrice = this.currentChain.stockPrice;

    if (optionType === OptionType.CALL) {
      return stockPrice > strikePrice;
    } else {
      return stockPrice < strikePrice;
    }
  }

  // Check if a strike price is very close to the current stock price
  isSharedPrice(strikePrice: number): boolean {
    if (!this.currentChain) return false;

    const stockPrice = this.currentChain.stockPrice;
    return Math.abs(stockPrice - strikePrice) < 0.01;
  }

  // Calculate theta (time decay) for an option
  calculateTheta(option: any): string {
    if (!option || !this.currentChain) return 'N/A';

    const daysToExpiry = this.currentChain.daysToExpiry;
    if (daysToExpiry <= 0) return 'N/A';

    const timeValue =
      option.price -
      Math.max(
        0,
        option.optionType === OptionType.CALL
          ? option.underlyingStock.price - option.strikePrice
          : option.strikePrice - option.underlyingStock.price
      );

    return (-(timeValue / daysToExpiry)).toFixed(2);
  }
}
