import { Component, OnInit } from '@angular/core';
import { AccountDto } from '../../models/account-dto.model';
import { CardDto } from '../../models/card-dto.model';
import { AccountManagementService } from '../../services/account-management.service';


@Component({
  selector: 'app-account-management',
  templateUrl: './account-management.component.html',
  styleUrls: ['./account-management.component.css']
})
export class AccountManagementComponent implements OnInit {

  searchOwner: string = '';
  searchAccountNumber: string = '';

  accounts: AccountDto[] = [];
  selectedAccountNumber: string | null = null;
  cards: CardDto[] = [];

  showCardSection = false;

  constructor(private accountService: AccountManagementService) { }

  ngOnInit(): void {
    this.fetchAccounts();
  }

  fetchAccounts(): void {
    this.accountService.getAccounts(this.searchAccountNumber, this.searchOwner)
      .subscribe({
        next: (accountPage) => {
          this.accounts = accountPage.content; 

          this.accounts.sort((a, b) => (b.availableBalance ?? 0) - (a.availableBalance ?? 0));
        },
        error: (err) => {
          console.error('Error fetching accounts:', err);
        }
      });
  }

  onFilterClick(): void {
    this.fetchAccounts();
  }

  viewCards(accountNumber: string): void {
    this.selectedAccountNumber = accountNumber;
    this.accountService.getCards(accountNumber).subscribe({
      next: (cardsList) => {
        this.cards = cardsList;
        this.showCardSection = true;
      },
      error: (err) => {
        console.error('Error fetching cards:', err);
      }
    });
  }

  changeCardStatus(cardNumber: string, action: 'block' | 'unblock' | 'deactivate'): void {
    if (!this.selectedAccountNumber) return;
    this.accountService.postCardAction(this.selectedAccountNumber, cardNumber, action).subscribe({
      next: () => {
        // Refresh cards
        this.viewCards(this.selectedAccountNumber!);
      },
      error: (err) => {
        console.error(`Error ${action} card:`, err);
      }
    });
  }
}
