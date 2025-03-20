import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { CardService, CreateCardDto } from '../../services/card.service'
import { AuthService } from '../../services/auth.service';
import {ButtonComponent} from '../shared/button/button.component';
import {InputTextComponent} from '../shared/input-text/input-text.component';
import {SelectComponent} from '../shared/select/select.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-card',
  templateUrl: './create-card.component.html',
  styleUrls: ['./create-card.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, InputTextComponent, SelectComponent]
})
export class CreateCardComponent implements OnInit {
  accountNumber: string = ''
  newCard: CreateCardDto = {
    accountNumber: '',
    type: 'DEBIT',
    name: '',
    cardLimit: 0
  }

  constructor(
    private route: ActivatedRoute,
    private cardService: CardService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const acc = this.route.snapshot.paramMap.get('accountNumber')
    if (acc) {
      this.accountNumber = acc
      this.newCard.accountNumber = acc
    }
  }

  onSubmit() {
    if (this.authService.isClient()) {
      this.cardService.requestCard(this.newCard).subscribe({
        next: () => {
          this.router.navigate(['/success'], {
            state: {
              title: 'Card Request Successful!',
              message: 'Your card request has been submitted successfully.',
              buttonName: 'Go Back to Cards',
              continuePath: `/account/${this.accountNumber}`
            }
          });
        },
        error: (err) => {
          console.error('Failed to request card:', err);
        }
      });
    } else {
      this.cardService.createCard(this.newCard).subscribe({
        next: () => {
          this.router.navigate(['/success'], {
            state: {
              title: 'Card Created Successfully!',
              message: 'The card has been created successfully.',
              buttonName: 'Go Back to Cards',
              continuePath: `/account/${this.accountNumber}`
            }
          });
        },
        error: (err) => {
          console.error('Failed to create card:', err);
        }
      });
    }
  }
}
