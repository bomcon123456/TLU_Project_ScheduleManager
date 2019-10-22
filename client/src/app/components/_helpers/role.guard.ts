import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthenticationService } from '../_services/authentication.service';
import * as jwt_decode from 'jwt-decode';

@Injectable()
export class RoleGuard implements CanActivate {

  constructor(public authService: AuthenticationService, public router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {

    const expectedRole = route.data.expectedRole;
    const token = JSON.parse(localStorage.getItem('currentUser'));
    const tokenPayload = jwt_decode(token.token);
    const currentUser = this.authService.currentUserValue;

    if (!tokenPayload) {
      console.log('Invalid token');
      return false;
    }
    console.log(tokenPayload);

    if (!currentUser || !expectedRole.includes(tokenPayload.role) ) {
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }
}
