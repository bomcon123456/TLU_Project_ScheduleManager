import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private router: Router) { }

  public User = {
    username: '',
    password: ''
  }
  private isLoginFalse: boolean;

  ngOnInit() {
    this.isLoginFalse = false;
  }

  login(): void {
    if(this.User.username==='admin' && this.User.password==='admin') {
      this.isLoginFalse = false;
      this.router.navigate(['/home']);
    }
    else this.isLoginFalse = true;
  }

}
