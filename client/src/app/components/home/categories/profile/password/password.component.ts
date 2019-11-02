import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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

  constructor() { }

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
    console.log(this.passwordForm.get('current').value);

  }

}
