import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/button/button.component';
import {
  OtcOfferModalComponent,
  OtcOfferDetails,
} from '../../shared/otc-offer-modal/otc-offer-modal.component';
import { OtcService } from '../../../services/otc.service';
import { PublicStockDto } from '../../../models/public-stock.dto';
import { AlertService } from '../../../services/alert.service';
import { CreateOtcOfferDto } from '../../../models/create-otc-offer.dto';

@Component({
  selector: 'app-otc-offers-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    OtcOfferModalComponent,
  ],
  templateUrl: './otc-offers-list.component.html',
  styleUrl: './otc-offers-list.component.css',
})
export class OtcOffersListComponent implements OnInit {
  private otcService = inject(OtcService);
  private alertService = inject(AlertService);

  publicStocks: PublicStockDto[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;

  isOfferModalOpen = false;
  selectedStock: PublicStockDto | null = null;
  isSubmittingOffer: boolean = false;


  ngOnInit(): void {
    this.loadPublicStocks();
  }

  loadPublicStocks(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.publicStocks = [];

    this.otcService.getPublicStocks().subscribe({
      next: (data) => {
        this.publicStocks = data;
        this.isLoading = false;
        if (data.length === 0) {
        }
      },
      error: (err) => {
        this.errorMessage =
          'Failed to load public stocks. Please try again later.';
        console.error('Error loading public stocks:', err);
        this.isLoading = false;
        this.alertService.showAlert('error', this.errorMessage);
      },
    });
  }

  openOfferModal(stock: PublicStockDto): void {
    if (this.isSubmittingOffer) return;
    this.selectedStock = stock;
    this.isOfferModalOpen = true;
  }

  closeOfferModal(): void {
    if (this.isSubmittingOffer) return;
    this.isOfferModalOpen = false;
    this.selectedStock = null;
  }

  handleMakeOffer(offerDetails: OtcOfferDetails): void {
    if (
      !this.selectedStock ||
      offerDetails.volume === null ||
      offerDetails.price === null ||
      !offerDetails.settlementDate ||
      offerDetails.premium === null
    ) {
      console.error(
        'Cannot make offer: Missing selected stock or required offer details.'
      );
      this.alertService.showAlert(
        'error',
        'Cannot make offer: Missing required information.'
      );
      return;
    }

    if (
      this.selectedStock.portfolioEntryId === undefined ||
      this.selectedStock.portfolioEntryId === null
    ) {
      console.error(
        'Cannot make offer: The selected public stock is missing the required portfolioEntryId.'
      );
      this.alertService.showAlert(
        'error',
        'Cannot submit offer: Missing required identifier from stock data.'
      );
      return;
    }

    if (this.isSubmittingOffer) {
      return;
    }
    this.isSubmittingOffer = true;

    const createDto: CreateOtcOfferDto = {
      portfolioEntryId: this.selectedStock.portfolioEntryId,
      amount: offerDetails.volume,
      pricePerStock: offerDetails.price,
      settlementDate: offerDetails.settlementDate,
      premium: offerDetails.premium,
    };

    this.otcService.createOtcOffer(createDto).subscribe({
      next: () => {
        this.isSubmittingOffer = false;
        this.alertService.showAlert(
          'success',
          `Offer for ${this.selectedStock?.ticker} submitted successfully!`
        );
      },
      error: (err) => {
        this.isSubmittingOffer = false;
        console.error('Error creating OTC offer:', err);
        const errorMsg =
          err.message || 'Failed to submit offer. Please try again.';
        this.alertService.showAlert('error', errorMsg);
      },
    });
  }
}
