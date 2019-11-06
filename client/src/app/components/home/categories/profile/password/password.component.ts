import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '../../../../_services/authentication.service';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements OnInit {

  public passwordForm: FormGroup;
  public currentPasswordControl = new FormControl('', [
    Validators.required,
  ]);
  public newPasswordControl = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(20)
  ]);
  public confirmPasswordControl = new FormControl('', [
    Validators.required
  ]);

  constructor(private toastr: ToastrService,
              private auth: AuthenticationService) { }

  ngOnInit() {
    this.passwordForm = new FormGroup({
      // _id: this.idFormControl,
      current: this.currentPasswordControl,
      new: this.newPasswordControl,
      confirm: this.confirmPasswordControl,
    });
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.passwordForm.controls[controlName].hasError(errorName);
  }

  changePassword() {
    let currentP = this.passwordForm.get('current').value;
    let newP = this.passwordForm.get('new').value;
    let confirmP = this.passwordForm.get('confirm').value;
    let check = this.checkPassword(currentP, newP, confirmP);

    console.log(check);

    if ( check ) {
      this.auth.changePassword(currentP, newP).subscribe( result => {
        this.toastr.success(result.message)
      });
    }
  }

  checkPassword(currentP, newP, confirmP) {
    if ( newP != confirmP ) {
      this.toastr.error('Xác nhận mật khẩu mới chưa chính xác.');
      return false;
    }
    if ( currentP == newP ) {
      this.toastr.error('Mật khẩu mới không được giống mật khẩu hiện tại.');
      return false;
    }
    return true;
  }

}
