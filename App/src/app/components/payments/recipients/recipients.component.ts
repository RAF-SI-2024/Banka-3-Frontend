import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert.service';
import { PayeeService } from '../../../services/payee.service';
import { Payee } from '../../../models/payee.model';
import { AuthService } from '../../../services/auth.service';
import { ButtonComponent } from '../../shared/button/button.component';
import { InputTextComponent } from '../../shared/input-text/input-text.component';

@Component({
  selector: 'app-recipients',
  standalone: true,
  imports: [NgForOf, NgIf, ButtonComponent, InputTextComponent, ReactiveFormsModule],
  templateUrl: './recipients.component.html',
  styleUrls: ['./recipients.component.css']
})
export class RecipientsComponent implements OnInit {
  private payeeService = inject(PayeeService);
  private router = inject(Router);
  private alertService = inject(AlertService);
  private authService = inject(AuthService);

  recipients: Payee[] = [];

  addRecipientForm!: FormGroup;
  editRecipientForm!: FormGroup | null;

  isAdding: boolean = false;
  editingRecipient: Payee | null = null;

  showDeleteModal: boolean = false;
  selectedRecipientId: number | null = null;

  constructor(private cdr: ChangeDetectorRef, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadRecipients();
    this.initAddRecipientForm();
  }

  private initAddRecipientForm(): void {
    this.addRecipientForm = this.fb.group({
      name: ['', Validators.required],
      accountNumber: ['', [Validators.required, Validators.pattern(/^\d+$/), Validators.minLength(5)]]
    });
  }

  private initEditRecipientForm(recipient: Payee): void {
    this.editRecipientForm = this.fb.group({
      id: [recipient.id],
      name: [recipient.name, Validators.required],
      accountNumber: [recipient.accountNumber, [Validators.required, Validators.pattern(/^\d+$/), Validators.minLength(5)]]
    });
  }

  loadRecipients(): void {
    const timestamp = new Date().getTime();
    this.payeeService.getPayeesByClientId(timestamp).subscribe({
      next: (response) => {
        this.recipients = [...response];
      },
      error: (err) => {
        console.error('Error loading:', err);
        this.alertService.showAlert('error', 'Failed to load recipients.');
      }
    });
  }

  toggleAddRecipient(): void {
    this.isAdding = !this.isAdding;
    if (this.isAdding) {
      this.addRecipientForm.reset();
    }
  }

  startEditing(recipient: Payee): void {
    this.editingRecipient = { ...recipient };
    this.initEditRecipientForm(recipient);
  }

  cancelEditing(): void {
    this.editingRecipient = null;
    this.editRecipientForm = null;
  }

  addRecipient(): void {
    if (this.addRecipientForm.invalid) {
      this.addRecipientForm.markAllAsTouched();
      return;
    }
    const newRecipient: Payee = this.addRecipientForm.getRawValue();
    newRecipient.id = 0;
    this.payeeService.createPayee(newRecipient).subscribe({
      next: () => {
        this.alertService.showAlert('success', 'Recipient added successfully!');
        this.loadRecipients();
        this.toggleAddRecipient();
      },
      error: (err) => {
        console.error('Error adding recipient:', err);
        this.alertService.showAlert('error', 'Failed to add recipient.');
      }
    });
  }

  saveEdit(): void {
    if (!this.editRecipientForm || this.editRecipientForm.invalid) {
      this.editRecipientForm?.markAllAsTouched();
      return;
    }
    const updatedRecipient: Payee = this.editRecipientForm.getRawValue();
    this.payeeService.updatePayee(updatedRecipient.id, updatedRecipient).subscribe({
      next: () => {
        this.alertService.showAlert('success', 'Recipient updated successfully!');
        this.loadRecipients();
        this.cancelEditing();
      },
      error: (err) => {
        console.error('Error updating recipient:', err);
        this.alertService.showAlert('error', 'Failed to update recipient.');
      }
    });
  }

  openDeleteModal(id: number): void {
    this.selectedRecipientId = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.selectedRecipientId = null;
  }

  confirmDelete(): void {
    if (this.selectedRecipientId) {
      this.deleteRecipient(this.selectedRecipientId);
    }
    this.showDeleteModal = false;
  }

  deleteRecipient(id: number): void {
    this.payeeService.deletePayee(id).subscribe({
      next: () => {
        this.alertService.showAlert('success', 'Recipient deleted successfully!');
        this.loadRecipients();
      },
      error: () => {
        this.alertService.showAlert('error', 'Failed to delete recipient.');
      }
    });
  }
}
