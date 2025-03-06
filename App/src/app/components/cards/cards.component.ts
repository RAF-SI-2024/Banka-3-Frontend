import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import { CardService } from '../../services/card.service';
import { AccountService } from '../../services/account.service';
import { NgClass, NgForOf } from '@angular/common';
import {ModalComponent} from '../modal/modal.component';

interface Card {
  cardNumber: string;
  status: string;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Account {
  accountNumber: string;
  accountOwner: string;
  availableBalance: number;
  reservedFunds: number;
  balance: number;
}

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  standalone: true,
  imports: [
    NgClass,
    NgForOf,
    ModalComponent,
    RouterLink
  ],
  styleUrls: ['./cards.component.css']
})
export class CardsComponent implements OnInit {
  account: Account | null = null;
  cards: Card[] = [];

  constructor(private route: ActivatedRoute, private cardService: CardService, private accountService: AccountService) {}

  ngOnInit(): void {
    const accountNumber = this.route.snapshot.paramMap.get('accountNumber');

    if (accountNumber) {
      // Fetch account details
      this.accountService.getAccount(accountNumber).subscribe(data => {
        this.account = data;
      });

      // Fetch associated cards
      this.cardService.getCardsByAccount(accountNumber).subscribe(data => {
        this.cards = data;
      });
    }
  }

  // Apply dynamic class for card status
  getCardStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'status-active';
      case 'BLOCKED':
        return 'status-blocked';
      case 'DEACTIVATED':
        return 'status-deactivated';
      default:
        return '';
    }
  }

  // Placeholder for payment function
  makePayment(cardNumber: string): void {
    console.log(`Initiating payment for card: ${cardNumber}`);
    // Implement your payment logic here
  }

  isModalOpen: boolean = false;

  // Function to open the modal
  openModal() {
    this.isModalOpen = true;
  }

  // Function to close the modal
  closeModal() {
    this.isModalOpen = false;
  }

}
