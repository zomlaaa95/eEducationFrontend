import { Injectable } from '@angular/core';
import { HttpService, ErrorHandlerService, SessionService } from '../_core/index';
import { environment } from '../../environments/environment';
import { Teacher } from '../_model/index';
import 'rxjs/add/operator/map';

@Injectable()
export class TeacherService {

  constructor(private httpService: HttpService, private errorHandlerService: ErrorHandlerService,
    private sessionService: SessionService) {}

  apiUrl = environment.apiUrl;

  findAll() {
    return this.httpService.get(this.apiUrl + '/teachers')
    .map((res) => res.json())
    .catch(err => this.errorHandlerService.handleError(err));
  }

  findById(id: number) {
    return this.httpService.get(this.apiUrl + '/teachers/' + id)
    .map((res) => res.json())
    .catch(err => this.errorHandlerService.handleError(err));
  }

  create(teacher: Teacher) {
    return this.httpService.post(this.apiUrl + '/teachers/', teacher)
    .map((res) => res.json())
    .catch(err => this.errorHandlerService.handleError(err));
  }

  update(teacher: Teacher) {
    return this.httpService.put(this.apiUrl + '/teachers/' + teacher.id, teacher)
    .map((res) => res.json())
    .catch(err => this.errorHandlerService.handleError(err));
  }

  delete(id: number) {
    return this.httpService.delete(this.apiUrl + '/teachers/' + id)
    .map((res) => res.status)
    .catch(err => this.errorHandlerService.handleError(err));
  }

  getByCourse(courseId: number) {
    return this.httpService.get(this.apiUrl + '/teachers/course/' + courseId)
    .map((res) => res.json())
    .catch(err => this.errorHandlerService.handleError(err));
  }

  // returns token
  changeEmail(oldEmail: string, newEmail: string) {
    return this.httpService.put(this.apiUrl + '/teachers/' + this.sessionService.getUserId() + '/changeEmail',
      {oldEmail: oldEmail, newEmail: newEmail})
    .map((res) => res.status)
    .catch(err => this.errorHandlerService.handleError(err));
  }

  // returns token
  changePassword(oldPassword: string, newPassword: string, repeatPassword: string) {
    return this.httpService.put(this.apiUrl + '/teachers/' + this.sessionService.getUserId() + '/changePassword',
      {oldPassword: oldPassword, newPassword: newPassword, repeatPassword: repeatPassword})
    .map((res) => res.status)
    .catch(err => this.errorHandlerService.handleError(err));
  }

}
