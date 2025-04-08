import { Component, OnInit } from '@angular/core';
import { ActuaryService } from '../../../services/actuary.service';
import {FormsModule} from '@angular/forms';
import {JsonPipe, NgForOf, NgIf} from '@angular/common';


@Component({
  selector: 'app-actuary-management',
  templateUrl: './actuary-management.component.html',
  standalone: true,
  imports: [
    FormsModule,
    JsonPipe,
    NgForOf,
    NgIf
  ],
  styleUrls: ['./actuary-management.component.css']
})
export class ActuaryManagementComponent implements OnInit {
  agents: any[] = [];
  searchEmail = '';
  searchFirstName = '';
  searchLastName = '';
  searchPosition = '';

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  loading = false;

  showDetails = false;
  selectedAgentId: number | null = null;
  agentLimitDetails: any = null;

  constructor(private actuaryService: ActuaryService) {}

  ngOnInit(): void {
    this.loadAgents();
  }

  loadAgents(page: number = 0, size: number = 10): void {
    this.loading = true;
    this.actuaryService.getAgents(
      this.searchEmail.trim(),
      this.searchFirstName.trim(),
      this.searchLastName.trim(),
      this.searchPosition.trim(),
      page,
      size
    ).subscribe({
      next: (res) => {
        console.log("prosao zahtev")
        this.loading = false;
        this.agents = res.content || [];
        this.totalElements = res.totalElements || 0;
        this.currentPage = page;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error retrieving agents', err);
      }
    });
  }

  applyFilter(): void {
    this.loadAgents(0, this.pageSize);
  }

  goToPage(pageIndex: number): void {
    if (pageIndex < 0 || pageIndex * this.pageSize >= this.totalElements) return;
    this.loadAgents(pageIndex, this.pageSize);
  }

  changeLimit(agentId: number, limitValue: string): void {
    const newLimit = Number(limitValue);
    if (isNaN(newLimit)) {
      alert('Invalid limit');
      return;
    }
    this.actuaryService.updateAgentLimit(agentId, newLimit).subscribe({
      next: () => {
        this.loadAgents(this.currentPage, this.pageSize);
      },
      error: (err) => {
        console.error('Error updating limit', err);
        alert('Error updating limit');
      }
    });
  }

  resetUsedLimit(agentId: number): void {
    this.actuaryService.resetUsedLimit(agentId).subscribe({
      next: () => {
        this.loadAgents(this.currentPage, this.pageSize);
      },
      error: (err) => {
        console.error('Error resetting limit', err);
        alert('Error resetting limit');
      }
    });
  }

  setApproval(agentId: number, approvalValue: boolean): void {
    this.actuaryService.setApprovalValue(agentId, approvalValue).subscribe({
      next: () => {
        this.loadAgents(this.currentPage, this.pageSize);
      },
      error: (err) => {
        console.error('Error setting approval', err);
        alert('Error setting approval');
      }
    });
  }

  showAgentDetails(agentId: number): void {
    this.selectedAgentId = agentId;
    this.showDetails = true;
    this.actuaryService.getAgentLimit(agentId).subscribe({
      next: (data) => {
        this.agentLimitDetails = data;
      },
      error: (err) => {
        console.error('Error fetching agent limit info', err);
        alert('Error fetching details');
      }
    });
  }

  closeDetails(): void {
    this.selectedAgentId = null;
    this.agentLimitDetails = null;
    this.showDetails = false;
  }
}
