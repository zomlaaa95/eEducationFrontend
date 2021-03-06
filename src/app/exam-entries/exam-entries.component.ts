import {
  Component,
  OnInit
} from '@angular/core';
import {
  roles,
  strings
} from './../_core/constants';
import {
  SessionService
} from '../_core/index';
import {
  Router
} from '@angular/router';
import {
  ExamTerm,
  StudentExamEntry,
  ExamPeriod,
  Payment
} from '../_model/index';
import {
  StudentExamEntryService,
  StudentService,
  PaymentService,
  ExamPeriodService,
  ExamTermService,
  GradeService
} from '../_services/index';
import {
  ToasterService
} from 'angular2-toaster';
import {
  GradingModalComponent
} from '../grading-modal/grading-modal.component';
import {
  DialogService
} from 'ng2-bootstrap-modal';
import { payment } from './../_core/constants';

@Component({
  selector: 'app-exam-entries',
  templateUrl: './exam-entries.component.html',
  styleUrls: ['./exam-entries.component.css']
})
export class ExamEntriesComponent implements OnInit {

  constructor(private router: Router, private sessionService: SessionService, private examEntryService: StudentExamEntryService,
    private toasterService: ToasterService, private studentService: StudentService, private paymentService: PaymentService,
    private examPeriodService: ExamPeriodService, private examTermService: ExamTermService, private dialogService: DialogService,
    private gradeService: GradeService) {}

  today = new Date();

  deadlineDate: Date;

  role: string;

  teacher = roles.teacher;
  student = roles.student;

  balance = 0;

  examPeriods: Array < ExamPeriod > ;

  idSymbol = strings.id;

  ngOnInit() {
    // add 3 days to today
    this.deadlineDate = new Date(this.today.getTime() + 259200000);

    this.role = this.sessionService.getUserRole(this.router.url);

    this.refreshPage();
  }

  refreshPage() {

    this.examPeriodService.findAll().subscribe(data => {
      this.examPeriods = data;
      this.examPeriods.forEach(examPeriod => {
        this.examTermService.getByExamPeriod(examPeriod.id).subscribe(examTerms => {
          examPeriod['examTerms'] = examTerms;
          examPeriod['examTerms'].forEach(examTerm => {
            examTerm.examDate = new Date(examTerm.examDate);
            if (this.role == this.teacher) {

              this.examEntryService.findByExamTermAndTeacher(examTerm.id).subscribe(examEntries => {
                examTerm['examEntries'] = examEntries;
              }, error => {
                this.toasterService.pop({
                  type: 'error',
                  title: 'Get Exam Entries For Teacher (By Term)',
                  body: error.status + ' ' + error.statusText
                });
              });

            } else if (this.role == this.student) {

              console.log('exam term id is ', examTerm.id);

              this.examEntryService.findByExamTermAndStudent(examTerm.id).subscribe(examEntries => {
                examPeriod['examEntries'] = examEntries;
              }, error => {
                this.toasterService.pop({
                  type: 'error',
                  title: 'Get Exam Entries For Student (By Term)',
                  body: error.status + ' ' + error.statusText
                });
              });

              // student
              this.paymentService.getByStudent().subscribe(data => {
                data.forEach(payment => {
                  this.balance = (payment.owes == true) ? this.balance += payment.amount : this.balance -= payment.amount;
                });
              }, error => {
                this.toasterService.pop({
                  type: 'error',
                  title: 'Get Payments For Student',
                  body: error.status + ' ' + error.statusText
                });
              });
            }

          });
        }, error => {
          this.toasterService.pop({
            type: 'error',
            title: 'Get Exam Terms For Exam Period',
            body: error.status + ' ' + error.statusText
          });
        });
      });
    }, error => {
      this.toasterService.pop({
        type: 'error',
        title: 'Get All Exam Periods',
        body: error.status + ' ' + error.statusText
      });
    });

  }

  addExamEntry(examTerm: ExamTerm) {
    const studentId = this.sessionService.getUserId();

    this.studentService.findById(Number(studentId)).subscribe(student => {
      const newExamEntry = new StudentExamEntry();
      newExamEntry.examTerm = examTerm;
      newExamEntry.student = student;

      this.examEntryService.create(newExamEntry).subscribe(addedEntry => {
        // build payment
        const newPayment = new Payment();
        newPayment.amount = payment.examTerm;
        newPayment.owes = false;
        newPayment.paymentDate = new Date();
        newPayment.cause = payment.examTermCause;
        newPayment.student = student;
        
        this.paymentService.create(newPayment).subscribe(created => {
          this.toasterService.pop({
            type: 'success',
            title: 'Created New Payment And Exam Entry',
            body: ''
          });
          this.refreshPage();
        }, error => {
          this.toasterService.pop({
            type: 'error',
            title: 'Delete Exam Entry',
            body: error.status + ' ' + error.statusText
          });
        });
      }, error => {
        this.toasterService.pop({
          type: 'error',
          title: 'Create Exam Entry',
          body: error.status + ' ' + error.statusText
        });
      });

    }, error => {
      this.toasterService.pop({
        type: 'error',
        title: 'Find Student By Id',
        body: error.status + ' ' + error.statusText
      });
    });
  }

  deleteExamEntry(examEntryId: number) {
    this.examEntryService.delete(examEntryId).subscribe(deleted => {
      this.toasterService.pop({
        type: 'success',
        title: 'Deleted Exam Entry',
        body: ''
      });
      this.refreshPage();
    }, error => {
      this.toasterService.pop({
        type: 'error',
        title: 'Delete Exam Entry',
        body: error.status + ' ' + error.statusText
      });
    });
  }

  grade(examEntry: StudentExamEntry) {
    let disposable = this.dialogService.addDialog(GradingModalComponent, {
        examEntry: examEntry
      })
      .subscribe((grade) => {
        //We get dialog result
        if (grade != null) {
          this.gradeService.create(grade).subscribe(added => {
            examEntry.grade = added;
            this.examEntryService.update(examEntry).subscribe(updated => {
              this.toasterService.pop({
                type: 'success',
                title: 'Updated Exam Entry',
                body: ''
              });
              this.refreshPage();
            }, error => {
              this.toasterService.pop({
                type: 'error',
                title: 'Update Exam Entry',
                body: error.status + ' ' + error.statusText
              });
            });
          }, error => {
            this.toasterService.pop({
              type: 'error',
              title: 'Create New Grade',
              body: error.status + ' ' + error.statusText
            });
          });
        } else {
          // do nothing, dialog closed
        }
      });
  }

}
