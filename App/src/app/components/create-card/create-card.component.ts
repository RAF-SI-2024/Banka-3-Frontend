import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { CardService, CreateCardDto } from '../../services/card.service'

@Component({
  selector: 'app-create-card',
  templateUrl: './create-card.component.html',
  styleUrls: ['./create-card.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CreateCardComponent implements OnInit {
  accountNumber: string = ''
  newCard: CreateCardDto = {
    accountNumber: '',
    type: 'DEBIT',
    name: '',
    cardLimit: 0
  }

  constructor(private route: ActivatedRoute, private cardService: CardService) {}

  ngOnInit(): void {
    const acc = this.route.snapshot.paramMap.get('accountNumber')
    if (acc) {
      this.accountNumber = acc
      this.newCard.accountNumber = acc
    }
  }

  onSubmit() {
    this.cardService.createCard(this.newCard).subscribe({
      next: res => {
      },
      error: err => {
      }
    })
  }
}
