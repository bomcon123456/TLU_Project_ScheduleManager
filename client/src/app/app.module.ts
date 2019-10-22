import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { AngularMaterialModule } from './core/angular-material.module';
import { AppRoutingModule } from './core/app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HomeModule } from './components/home/home.module';
import { JwtInterceptor } from './components/_helpers/jwt.interceptor';
import { ErrorInterceptor } from './components/_helpers/error.interceptor';
import { AuthGuard } from './components/_helpers/auth.guard';
import { RoleGuard } from './components/_helpers/role.guard';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    FlexLayoutModule,
    HomeModule,
    NgxMatSelectSearchModule,
    ToastrModule.forRoot()
  ],
  providers: [
    AuthGuard,
    RoleGuard,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
