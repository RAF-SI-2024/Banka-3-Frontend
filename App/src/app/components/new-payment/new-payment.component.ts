import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { Payment } from '../../models/payment.model'
import { PaymentService } from '../../services/payment.service'


@Component({
  selector: 'app-new-payment',
  templateUrl: './new-payment.component.html',
  styleUrls: ['./new-payment.component.css']
})
export class NewPaymentComponent {
  payment: Payment = {
    saRacuna: '',
    iznos: 0,
    naRacun: ''
  }

  constructor(
    private paymentService: PaymentService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.paymentService.createPayment(this.payment).subscribe({
      next: () => {
        alert('Plaćanje je kreirano')
        this.router.navigate(['/transaction-overview'])
      },
      error: () => {
        alert('Došlo je do greške')
      }
    })
  }
}
