import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularMaterialModule } from '../../core/angular-material.module';
import { FormsModule } from '@angular/forms';

import { HomeRoutingModule } from './core/home-routing.module';
import { HomeComponent } from './home.component';
import { LeftMenuComponent } from './frame/left-menu/left-menu.component';
import { HeaderComponent } from '../home/frame/header/header.component';
import { ClassroomManagementComponent } from './categories/classroom-management/classroom-management.component';
import { SubjectManagementComponent } from './categories/subject-management/subject-management.component';
import { SemesterManagementComponent } from './categories/semester-management/semester-management.component';
import { SidenavService } from 'src/app/services/sidenav.service';
import { MatButtonModule } from '@angular/material/button';
import { ClassroomDialogComponent } from './home-components/classroom-dialog/classroom-dialog.component';
import { DeleteDialogComponent } from './home-components/delete-dialog/delete-dialog.component';
import { SubjectDialogComponent } from './home-components/subject-dialog/subject-dialog.component';
import { SemesterDialogComponent } from './home-components/semester-dialog/semester-dialog.component';


@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule,
    AngularMaterialModule,
    FlexLayoutModule,
    FormsModule
    // MatButtonModule
  ],
  declarations: [
    HomeComponent,
    HeaderComponent,
    LeftMenuComponent,
    ClassroomManagementComponent,
    SubjectManagementComponent,
    SemesterManagementComponent,
    ClassroomDialogComponent,
    DeleteDialogComponent,
    SubjectDialogComponent,
    SemesterDialogComponent
  ],
  entryComponents: [ClassroomDialogComponent, ClassroomManagementComponent],
  providers: [SidenavService]
})
export class HomeModule { }
