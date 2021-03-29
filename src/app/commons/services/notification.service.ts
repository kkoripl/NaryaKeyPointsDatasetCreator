import {ToastrService} from 'ngx-toastr';
import {Injectable} from '@angular/core';

@Injectable()
export class NotificationService {

  private notificationTimeoutMillis = 7500;

  constructor(private toastr: ToastrService) {}

  showInfo(title: string, message: string): void {
    this.toastr.info(message, title, this.getConfig());
  }

  showError(title: string, message: string): void {
    this.toastr.error(message, title, this.getConfig());
  }

  private getConfig() {
    return {onActivateTick: true, timeOut: this.notificationTimeoutMillis};
  }
}
