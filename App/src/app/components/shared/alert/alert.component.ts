import {Component, Input, OnInit} from '@angular/core';
import {NgClass, NgIf} from '@angular/common';
import {AlertService} from '../../../services/alert.service';

@Component({
  selector: 'app-alert',
  imports: [
    NgClass,
    NgIf
  ],
  templateUrl: './alert.component.html',
  standalone: true,
  styleUrl: './alert.component.css'
})
export class AlertComponent implements OnInit {
  alert: { type: string, message: string | null } | null = null;

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.alertService.alert$.subscribe(alert => {
      this.alert = alert;
    });
  }

  closeAlert() {
    this.alertService.clearAlert();
  }
}
