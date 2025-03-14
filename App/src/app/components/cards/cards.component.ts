import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { CardService, Card } from '../../services/card.service'
import { AccountService } from '../../services/account.service'
import { NgClass, NgForOf } from '@angular/common'
import {ModalComponent} from '../shared/modal/modal.component';

interface Account {
  accountNumber: string
  accountOwner: string
  availableBalance: number
  reservedFunds: number
  balance: number
}

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  standalone: true,
  imports: [NgClass, NgForOf, RouterLink, ModalComponent],
  styleUrls: ['./cards.component.css']
})
export class CardsComponent implements OnInit {
  account: Account | null = null
  cards: Card[] = []
  accountNumber: string = ''
  isModalOpen: boolean = false

  constructor(private route: ActivatedRoute, private cardService: CardService, private accountService: AccountService) {}

  ngOnInit(): void {
    const paramAcc = this.route.snapshot.paramMap.get('accountNumber')
    if (paramAcc) {
      this.accountNumber = paramAcc
      this.accountService.getAccount(this.accountNumber).subscribe(data => {
        this.account = data
      })
      this.loadCards()
    }
  }

  loadCards(): void {
    this.cardService.getCardsByAccount(this.accountNumber).subscribe(data => {
      this.cards = data
    })
  }

  blockCard(cardNumber: string): void {
    this.cardService.blockCard(this.accountNumber, cardNumber).subscribe({
      next: () => {
        this.loadCards()
      },
      error: err => {
      }
    })
  }

  getCardStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'status-active'
      case 'BLOCKED':
        return 'status-blocked'
      case 'DEACTIVATED':
        return 'status-deactivated'
      default:
        return ''
    }
  }

  maskCardNumber(fullCardNumber: string): string {
    if (!fullCardNumber || fullCardNumber.length < 8) return fullCardNumber
    const first4 = fullCardNumber.slice(0, 4)
    const last4 = fullCardNumber.slice(-4)
    return `${first4}********${last4}`
  }

  makePayment(cardNumber: string): void {
  }

  openModal() {
    this.isModalOpen = true
  }

  closeModal() {
    this.isModalOpen = false
  }
}
