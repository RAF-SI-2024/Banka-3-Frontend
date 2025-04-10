// Modify file: src/app/components/shared/order-creation-modal/order-creation-modal.component.ts
import { Component, EventEmitter, Input, Output, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';``
import { ButtonComponent } from '../button/button.component';
import { AccountService } from '../../../services/account.service';
import { AccountResponse } from '../../../models/account-response.model';
import { AlertService } from '../../../services/alert.service';
import { OrderService } from '../../../services/order.service';
import { CreateOrderDto } from '../../../models/create-order.dto';
import {InputTextComponent} from '../input-text/input-text.component';

export enum OrderType {
  MARKET = 'Market',
  LIMIT = 'Limit',
  STOP = 'Stop',
  STOP_LIMIT = 'Stop-Limit'
}

enum ModalView {
  FORM = 'FORM',
  CONFIRMATION = 'CONFIRMATION'
}

@Component({
  selector: 'app-order-creation-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    ButtonComponent,
    InputTextComponent
  ],
  templateUrl: './order-creation-modal.component.html',
  styleUrl: './order-creation-modal.component.css'
})
export class OrderCreationModalComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() direction: 'BUY' | 'SELL' = 'BUY';
  @Input() securityTicker: string = '';
  @Input() securityPrice: number = 0;
  @Input() contractSize: number = 1;
  @Input() listingId: number | null = null;
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() createOrderEvent = new EventEmitter<any>();

  private accountService = inject(AccountService);
  private alertService = inject(AlertService);
  private orderService = inject(OrderService);

  OrderType = OrderType;

  quantity: number = 1;
  limitPrice: number | null = null;
  stopPrice: number | null = null;
  allOrNone: boolean = false;
  margin: boolean = false;
  selectedAccountId: string | null = null;

  accounts: { value: string, label: string }[] = [];
  isLoadingAccounts: boolean = false;
  private fetchedAccountsList: AccountResponse[] = [];

  determinedOrderType: OrderType = OrderType.MARKET;
  approximatePrice: number | null = null;
  fullOrderName: string = OrderType.MARKET + ' Order';

  currentView: ModalView = ModalView.FORM;
  ModalView = ModalView;
  isSubmitting: boolean = false;

  ngOnInit(): void {
    if (this.isOpen) {
      this.initializeModal();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    let needsUpdate = false;
    let directionChanged = false;

    if (changes['isOpen']) {
      if (this.isOpen) {
        this.initializeModal();
        needsUpdate = true;
      } else {
        this.resetForm();
      }
    }
    if (changes['direction'] && this.isOpen) {
       this.currentView = ModalView.FORM;
       needsUpdate = true;
       directionChanged = true;
    }

    if ((changes['securityPrice'] || changes['contractSize'] || changes['listingId']) && this.isOpen) {
        needsUpdate = true;
    }


    if (this.isOpen && (directionChanged || changes['isOpen']?.currentValue === true)) {
        this.loadUserAccounts();
    }

    if (needsUpdate) {
        this.updateOrderDetails();
    }
  }

  initializeModal(): void {
      this.currentView = ModalView.FORM;
      this.isSubmitting = false;
  }

  loadUserAccounts(): void {
    this.isLoadingAccounts = true;
    this.accounts = [];
    this.fetchedAccountsList = [];
    this.selectedAccountId = null;

    this.accountService.getMyAccountsRegular().subscribe({
      next: (response: any) => {
         this.fetchedAccountsList = Array.isArray(response) ? response : response?.content || [];
         this.accounts = this.fetchedAccountsList.map((acc: AccountResponse) => ({
          value: acc.accountNumber,
          label: `${acc.name || acc.accountCategory} (...${acc.accountNumber.slice(-4)}) - ${acc.availableBalance} ${acc.currencyCode}`
        }));
        this.isLoadingAccounts = false;
        this.updateOrderDetails();
      },
      error: (err) => {
        console.error('Error fetching user accounts:', err);
        this.alertService.showAlert('error', 'Failed to load your accounts. Please try again.');
        this.isLoadingAccounts = false;
      }
    });
  }

  updateOrderDetails(): void {
    if (this.limitPrice !== null && this.limitPrice > 0 && this.stopPrice !== null && this.stopPrice > 0) {
      this.determinedOrderType = OrderType.STOP_LIMIT;
    } else if (this.limitPrice !== null && this.limitPrice > 0) {
      this.determinedOrderType = OrderType.LIMIT;
    } else if (this.stopPrice !== null && this.stopPrice > 0) {
      this.determinedOrderType = OrderType.STOP;
    } else {
      this.determinedOrderType = OrderType.MARKET;
    }

    let pricePerUnit: number | null = null;
    switch (this.determinedOrderType) {
      case OrderType.MARKET:
      case OrderType.STOP:
        pricePerUnit = this.securityPrice;
        break;
      case OrderType.LIMIT:
      case OrderType.STOP_LIMIT:
        pricePerUnit = this.limitPrice;
        break;
    }

    if (pricePerUnit !== null && pricePerUnit > 0 && this.quantity > 0 && this.contractSize > 0) {
      this.approximatePrice = this.contractSize * pricePerUnit * this.quantity;
    } else {
      this.approximatePrice = null;
       if ((this.determinedOrderType === OrderType.MARKET || this.determinedOrderType === OrderType.STOP) && this.securityPrice <= 0) {
           this.approximatePrice = null;
       }
       if ((this.determinedOrderType === OrderType.LIMIT || this.determinedOrderType === OrderType.STOP_LIMIT) && (this.limitPrice === null || this.limitPrice <= 0)) {
           this.approximatePrice = null;
       }
    }

     let nameParts: string[] = [];
     if (this.allOrNone) nameParts.push("AON");
     if (this.margin) nameParts.push("Margin");
     nameParts.push(this.determinedOrderType);
     this.fullOrderName = nameParts.join(" ") + " Order";
  }

  onInputChange(): void {
    this.updateOrderDetails();
  }

  proceedToConfirmation(): void {
    this.updateOrderDetails();

    if (!this.listingId) {
         this.alertService.showAlert('error', "Security identifier is missing. Cannot create order.");
         return;
     }
    if (this.quantity <= 0) {
      this.alertService.showAlert('error', "Quantity must be positive.");
      return;
    }
    if (!this.selectedAccountId && this.direction === 'BUY') {
       this.alertService.showAlert('error', "Please select a source account for the purchase.");
       return;
    }
    if (this.fetchedAccountsList.length === 0 && this.direction === 'SELL') {
        this.alertService.showAlert('error', "Cannot determine account for selling. Please ensure you have accounts.");
        return;
    }
     if ((this.determinedOrderType === OrderType.LIMIT || this.determinedOrderType === OrderType.STOP_LIMIT) && (this.limitPrice === null || this.limitPrice <= 0)) {
        this.alertService.showAlert('error', "Limit Price must be positive for Limit or Stop-Limit orders.");
        return;
     }
     if ((this.determinedOrderType === OrderType.STOP || this.determinedOrderType === OrderType.STOP_LIMIT) && (this.stopPrice === null || this.stopPrice <= 0)) {
        this.alertService.showAlert('error', "Stop Price must be positive for Stop or Stop-Limit orders.");
        return;
     }
     if ((this.determinedOrderType === OrderType.MARKET || this.determinedOrderType === OrderType.STOP) && this.securityPrice <= 0) {
         this.alertService.showAlert('warning', "Current market price is unavailable, order might fail or use last known price.");
     }

    this.currentView = ModalView.CONFIRMATION;
  }

  goBackToForm(): void {
    this.currentView = ModalView.FORM;
  }

  confirmOrder(): void {
    if (!this.listingId) {
        this.alertService.showAlert('error', 'Cannot confirm order: Security ID is missing.');
        return;
    }
    if (this.isSubmitting) {
        return;
    }

    let accountNumberToSend: string | null = null;
    if (this.direction === 'BUY') {
        accountNumberToSend = this.selectedAccountId;
    } else {
        accountNumberToSend = this.fetchedAccountsList.length > 0 ? this.fetchedAccountsList[0].accountNumber : null;
    }

    if (!accountNumberToSend) {
        this.alertService.showAlert('error', `Cannot confirm order: Required account number is missing for ${this.direction} operation.`);
        return;
    }

    this.isSubmitting = true;

    const orderDto: CreateOrderDto = {
      listingId: this.listingId,
      orderType: this.determinedOrderType.toUpperCase().replace('-', '_'),
      quantity: this.quantity,
      limitValue: this.limitPrice,
      stopValue: this.stopPrice,
      allOrNone: this.allOrNone,
      margin: this.margin,
      orderDirection: this.direction,
      contractSize: this.contractSize,
      accountNumber: accountNumberToSend,
    };

    this.orderService.createOrder(orderDto).subscribe({
      next: (response) => {
        this.createOrderEvent.emit({ success: true, data: response });
        this.alertService.showAlert('success', 'Order placed successfully!');
        this.closeModal();
      },
      error: (error) => {
        console.error("Error creating order:", error);
        const errorMessage = error?.error?.message || error?.message || 'Failed to place order. Please try again.';
        this.alertService.showAlert('error', errorMessage);
        this.isSubmitting = false;
      }
    });
  }


  get modalTitle(): string {
    if (this.currentView === ModalView.CONFIRMATION) {
        return `${this.direction === 'BUY' ? 'Purchase' : 'Sale'} Overview`;
    }
    return `${this.direction === 'BUY' ? 'Buy' : 'Sell'} Security: ${this.securityTicker}`;
  }

  get selectedAccountLabel(): string {
      if (this.direction === 'BUY' && this.selectedAccountId) {
          const account = this.accounts.find(acc => acc.value === this.selectedAccountId);
          return account ? account.label : 'N/A';
      }
      return 'N/A (Selling from Portfolio)';
  }

  closeModal(): void {
    this.closeModalEvent.emit();
  }

  resetForm(): void {
    this.quantity = 1;
    this.limitPrice = null;
    this.stopPrice = null;
    this.allOrNone = false;
    this.margin = false;
    this.selectedAccountId = null;
    this.accounts = [];
    this.fetchedAccountsList = [];
    this.isLoadingAccounts = false;
    this.determinedOrderType = OrderType.MARKET;
    this.approximatePrice = null;
    this.fullOrderName = OrderType.MARKET + ' Order';
    this.currentView = ModalView.FORM;
    this.isSubmitting = false;
  }
}
