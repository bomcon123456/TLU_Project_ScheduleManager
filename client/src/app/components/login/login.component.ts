import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { first } from 'rxjs/operators';
import { AuthenticationService } from './../_services/authentication.service';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  private loginUser: {
    username: string;
    password: string;
  }
  private isLoginFalse: boolean;


  public usernameFormControl = new FormControl('', [
    Validators.required,
  ]);
  public passwordFormControl = new FormControl('', [
    Validators.required,
  ]);
  public matcher = new MyErrorStateMatcher();


  constructor(private router: Router,
              private authService: AuthenticationService) {
    this.loginUser = {
      username: '',
      password: ''
    }
  }


  ngOnInit() {
    this.isLoginFalse = false;
  }

  login(): void {
    console.log(this.loginUser);


    this.authService.login(this.loginUser)
        .pipe(first()).subscribe( data => {
          this.isLoginFalse = false;
          this.router.navigate(['/home']);
        }, error => {
          console.log(error);

          this.isLoginFalse = true;
        })

  }

}
