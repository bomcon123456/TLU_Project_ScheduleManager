import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit {

  public settingForm: FormGroup;
  public nameControl = new FormControl('', [
    Validators.required,
  ]);
  public birthdayControl = new FormControl('', []);
  public genderControl = new FormControl('', []);
  public emailControl = new FormControl('', [
    Validators.required,
    Validators.email
  ]);
  public descriptionControl = new FormControl('', []);

  constructor() { }

  ngOnInit() {
    this.settingForm = new FormGroup({
      // _id: this.idFormControl,
      name: this.nameControl,
      birthday: this.birthdayControl,
      gender: this.genderControl,
      email: this.emailControl,
      description: this.descriptionControl
    });
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.settingForm.controls[controlName].hasError(errorName);
  }

  updateProfile() {
    console.log(this.settingForm.get('email').value);

  }

}
