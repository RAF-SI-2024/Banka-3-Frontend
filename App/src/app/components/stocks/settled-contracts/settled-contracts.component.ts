import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyPipe, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/button/button.component';
import { AlertService } from '../../../services/alert.service';
import { ContractsService } from '../../../services/contracts.service';
import { SettledContractDto } from '../../../models/settled-contract-dto';
import { switchMap, throwError } from 'rxjs';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-settled-contracts',
  templateUrl: './settled-contracts.component.html',
  styleUrls: ['./settled-contracts.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    ButtonComponent,
    NgIf,
    CurrencyPipe,
    PaginationComponent,
  ],
})
export class SettledContractsComponent implements OnInit {
  contracts: SettledContractDto[] = [];
  loading = false;

  constructor(
    private contractsService: ContractsService,
    private alertService: AlertService,
    private router: Router
  ) {}

  currentPage = 1;
  pageSize = 10;
  pagedSettledContracts: SettledContractDto[] = [];

  updatePagedSettledContracts(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedSettledContracts = this.contracts.slice(startIndex, endIndex);
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    this.updatePagedSettledContracts();
  }

  ngOnInit(): void {
    this.loadContracts();
  }

  loadContracts(): void {
    this.loading = true;
    this.contractsService.getSettledContracts().subscribe({
      next: (data) => {
        this.contracts = data;
        this.loading = false;
        this.updatePagedSettledContracts();
      },
      error: (err) => {
        this.loading = false;
        this.alertService.showAlert(
          'error',
          'Failed to load settled contracts: ' + err.message
        );
      },
    });
  }

  onExercise(contract: SettledContractDto): void {
    if (contract.status !== 'VALID') {
      this.alertService.showAlert(
        'error',
        'This contract cannot be exercised.'
      );
      return;
    }

    this.alertService.showAlert('info', 'Processing contract exercise...');

    this.contractsService
      .exerciseContract(contract.id)
      .pipe(
        switchMap((response) => {
          if (!response?.id) {
            return throwError(
              () => new Error('Failed to start exercise process.')
            );
          }

          return this.contractsService.pollExerciseStatus(response.id);
        })
      )
      .subscribe({
        next: (msg) => {
          this.alertService.showAlert('success', msg);
          this.loadContracts();
        },
        error: (err) => {
          this.alertService.showAlert(
            'error',
            'Error exercising contract: ' + err.message
          );
        },
      });
  }
}
