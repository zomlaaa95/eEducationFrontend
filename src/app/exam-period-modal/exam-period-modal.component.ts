import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
import { ExamPeriod } from '../_model/index';

export interface ExamPeriodModel {
  action: string;
  examPeriod: ExamPeriod;
}
@Component({
  selector: 'app-exam-period-modal',
  templateUrl: './exam-period-modal.component.html',
  styleUrls: ['./exam-period-modal.component.css']
})
export class ExamPeriodModalComponent extends DialogComponent<ExamPeriodModel, ExamPeriod> implements ExamPeriodModel, OnInit {

  constructor(dialogService: DialogService) {
    super(dialogService);
  }

  ngOnInit() {
    this.examPeriod.startDate = new Date(this.examPeriod.startDate);
    this.examPeriod.endDate = new Date(this.examPeriod.endDate);
  }

  action: string;
  examPeriod: ExamPeriod;

  ok() {
    this.result = this.examPeriod;
    this.close();
  }

  cancel() {
    this.result = null;
    this.close();
  }

}
