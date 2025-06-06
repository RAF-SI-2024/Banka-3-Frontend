import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActiveOfferDto } from '../../../models/active-offer.dto';
import { ActiveOffersService } from '../../../services/active-offers.service';
import { ButtonComponent } from '../../shared/button/button.component';
import { OtcOfferModalComponent } from '../../shared/otc-offer-modal/otc-offer-modal.component';
import { AlertService } from '../../../services/alert.service';


@Component({
  standalone: true,
  selector: 'app-active-offers',
  templateUrl: './active-offers.component.html',
  styleUrls: ['./active-offer.component.css'],
  imports: [CommonModule, FormsModule, ButtonComponent, OtcOfferModalComponent],
})
export class ActiveOffersComponent implements OnInit {
  private activeOffersService = inject(ActiveOffersService);
  private alertService = inject(AlertService);

  activeOffers: ActiveOfferDto[] = [];
  selectedOffer: ActiveOfferDto | null = null;
  counterPrice?: number;
  counterSettlementDate?: string;
  counterPremium?: number;
  errorMessage = '';
  loading = false;

  isCounterModalOpen = false;
  isSubmittingCounter = false;


  ngOnInit(): void {
    this.fetchActiveOffers();
  }

  fetchActiveOffers(): void {
    this.loading = true;
    this.activeOffersService.getActiveOffers().subscribe({
      next: (offers) => {
        console.log(offers);
        this.activeOffers = offers;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load active offers.';
        this.alertService.showAlert('error', 'Failed to load active offer.');
      },
    });
  }

  acceptOffer(offer: ActiveOfferDto): void {
    this.activeOffersService.acceptOffer(offer.id).subscribe({
      next: () => {
        this.activeOffers = this.activeOffers.filter((o) => o.id !== offer.id);
        this.alertService.showAlert('success', 'Offer successfully accepted.');
      },
      error: () => {
        this.errorMessage = 'Failed to accept offer.';
        this.alertService.showAlert('error', 'Failed to accept offer.');
      },
    });
  }

  declineOffer(offer: ActiveOfferDto): void {
    this.activeOffersService.declineOffer(offer.id).subscribe({
      next: () => {
        this.activeOffers = this.activeOffers.filter((o) => o.id !== offer.id);
        this.alertService.showAlert('success', 'Offer successfully declined.');
      },
      error: () => {
        this.alertService.showAlert('error', 'Failed to decline offer.');
        this.errorMessage = 'Failed to decline offer.';
      },
    });
  }

  cancelOffer(offer: ActiveOfferDto): void {
    this.activeOffersService.cancelOffer(offer.id).subscribe({
      next: () => {
        this.activeOffers = this.activeOffers.filter((o) => o.id !== offer.id);
        this.alertService.showAlert('success', 'Offer successfully canceled.');
      },
      error: () => {
        this.alertService.showAlert('error', 'Failed to cancel offer.');
        this.errorMessage = 'Failed to decline offer.';
      },
    });
  }

  openCounterOfferForm(offer: ActiveOfferDto): void {
    this.selectedOffer = offer;
    this.isCounterModalOpen = true;
    // this.counterPrice = offer.pricePerStock;
    // this.counterSettlementDate = offer.settlementDate;
    // this.counterPremium = offer.premium;
  }

  closeCounterModal(): void {
    if (this.isSubmittingCounter) return;
    this.isCounterModalOpen = false;
    this.selectedOffer = null;
  }

  sendCounterOffer(): void {
    if (!this.selectedOffer) return;
    const payload = {
      pricePerStock: this.counterPrice,
      settlementDate: this.counterSettlementDate,
      premium: this.counterPremium,
    };
    this.activeOffersService
      .sendCounterOffer(this.selectedOffer.id, payload)
      .subscribe({
        next: () => {
          this.selectedOffer = null;
          this.alertService.showAlert(
            'success',
            'Counter offer sent successfully.'
          );
        },
        error: () => {
          this.errorMessage = 'Failed to send counter offer.';
          this.alertService.showAlert('error', 'Failed to send counter offer.');
        },
      });
  }

  //nov poz
  async handleCounterOffer(offerDetails: any): Promise<void> {
    if (!this.selectedOffer) {
      this.alertService.showAlert('error', 'No offer selected');
      return;
    }

    this.isSubmittingCounter = true;

    try {
      const payload = {
        portfolioEntryId: this.selectedOffer.id,
        pricePerStock: offerDetails.price,
        settlementDate: offerDetails.settlementDate,
        premium: offerDetails.premium,
        amount: offerDetails.volume,
      };

      await this.activeOffersService
        .sendCounterOffer(this.selectedOffer.id, payload)
        .toPromise();

      this.alertService.showAlert(
        'success',
        'Counter offer sent successfully!'
      );
      this.closeCounterModal();
      this.fetchActiveOffers();
    } catch (error) {
      this.alertService.showAlert('error', 'Failed to send counter offer');
    } finally {
      this.isSubmittingCounter = false;
    }
  }

  getColorClass(offer: ActiveOfferDto): string {
    const referencePrice = 150; // Example reference
    const difference =
      ((offer.pricePerStock - referencePrice) / referencePrice) * 100;
    if (Math.abs(difference) <= 5) return 'offer-green';
    if (Math.abs(difference) <= 20) return 'offer-yellow';
    return 'offer-red';
  }
}
