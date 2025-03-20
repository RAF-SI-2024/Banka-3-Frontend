import {Component, inject, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {AlertService} from '../../services/alert.service';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {PortfolioService} from '../../services/portfolio.service';
import {Securities} from '../../models/securities';
import {ButtonComponent} from '../shared/button/button.component';

@Component({
  selector: 'app-my-portfolio',
  imports: [
    FormsModule,
    NgIf,
    NgForOf,
    NgClass,
    ButtonComponent
  ],
  templateUrl: './my-portfolio.component.html',
  styleUrl: './my-portfolio.component.css'
})
export class MyPortfolioComponent implements OnInit {

  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private router = inject(Router);
  private portfolioService = inject(PortfolioService);

  securities: Securities[] = [];
  isProfitModalOpen = false;
  isTaxModalOpen = false;

  ngOnInit(): void {
    this.securities = this.portfolioService.getMySecurities();
  }

  getTotalProfit(): number {
    return this.securities.reduce((sum, security) => sum + security.profit, 0);
  }

  getTotalTax(): number {
    // Pretpostavka: Porez je 15% od profita
    return this.getTotalProfit() * 0.15;
  }

  openProfitModal(): void {
    this.isProfitModalOpen = true;
  }

  openTaxModal(): void {
    this.isTaxModalOpen = true;
  }

  closeModals(): void {
    this.isProfitModalOpen = false;
    this.isTaxModalOpen = false;
  }

  publishSecurity(security: Securities): void {
    security.publicCounter += 1;
  }

}
