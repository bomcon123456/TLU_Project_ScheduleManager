import { Component, OnInit, Input } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { animateText } from './../../../../animations/animations';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [animateText]
})
export class HeaderComponent implements OnInit {

  @Input() sidenav: MatSidenav;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}
