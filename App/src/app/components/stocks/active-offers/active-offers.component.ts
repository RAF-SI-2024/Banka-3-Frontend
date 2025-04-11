import { Component, OnInit } from '@angular/core';
import { OffersService } from '../../../services/offer.service';
import { ActiveOfferDto } from '../../../models/active-offer.dto';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-active-offers',
  templateUrl: './active-offers.component.html',
  styleUrls: ['./active-offers.component.css']
})
export class ActiveOffersComponent implements OnInit {
  activeOffers: ActiveOfferDto[] = [];
  loading = false;
  // Koristimo ovu varijablu da pratimo trenutno obrađivanu ponudu (sprečava višestruke klikove)
  processingOfferId: number | null = null;

  constructor(
    private offersService: OffersService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadActiveOffers();
  }

  loadActiveOffers(): void {
    this.loading = true;
    this.offersService.getActiveOffers().subscribe({
      next: (offers) => {
        this.activeOffers = offers;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.alertService.showAlert('error', `Failed to load active offers: ${err.message}`);
      }
    });
  }

  onAccept(offer: ActiveOfferDto): void {
    if (!confirm(`Are you sure you want to accept offer #${offer.id}?`)) {
      return;
    }
    this.processingOfferId = offer.id;
    this.offersService.acceptOffer(offer.id).subscribe({
      next: () => {
        this.alertService.showAlert('success', `Offer #${offer.id} accepted successfully!`);
        this.processingOfferId = null;
        this.loadActiveOffers();
      },
      error: (err) => {
        this.alertService.showAlert('error', `Error accepting offer #${offer.id}: ${err.message}`);
        this.processingOfferId = null;
      }
    });
  }



  onDecline(offer: ActiveOfferDto): void {
    if (!confirm(`Are you sure you want to decline offer #${offer.id}?`)) {
      return;
    }
    this.processingOfferId = offer.id;
    this.offersService.declineOffer(offer.id).subscribe({
      next: () => {
        this.alertService.showAlert('success', `Offer #${offer.id} declined successfully.`);
        this.processingOfferId = null;
        this.loadActiveOffers();
      },
      error: (err) => {
        this.alertService.showAlert('error', `Error declining offer #${offer.id}: ${err.message}`);
        this.processingOfferId = null;
      }
    });
  }
}
