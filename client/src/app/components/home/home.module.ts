import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularMaterialModule } from '../../core/angular-material.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { HomeRoutingModule } from './core/home-routing.module';
import { HomeComponent } from './home.component';
import { LeftMenuComponent } from './frame/left-menu/left-menu.component';
import { HeaderComponent } from '../home/frame/header/header.component';
import { RoomManagementComponent } from './categories/room-management/room-management.component';
import { CourseManagementComponent } from './categories/course-management/course-management.component';
import { SemesterManagementComponent } from './categories/semester-management/semester-management.component';
import { SidenavService } from 'src/app/services/sidenav.service';
import { MatButtonModule } from '@angular/material/button';
import { RoomDialogComponent } from './categories/room-management/room-dialog/room-dialog.component';
import { CourseDialogComponent } from './categories/course-management/course-dialog/course-dialog.component';
import { SemesterDialogComponent } from './categories/semester-management/semester-dialog/semester-dialog.component';
import { TeacherManagementComponent } from './categories/teacher-management/teacher-management.component';
import { TeacherDialogComponent } from './categories/teacher-management/teacher-dialog/teacher-dialog.component';
import { DepartmentManagementComponent } from './categories/department-management/department-management.component';
import { DepartmentDialogComponent } from './categories/department-management/department-dialog/department-dialog.component';


@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule,
    AngularMaterialModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule
    // MatButtonModule
  ],
  declarations: [
    HomeComponent,
    HeaderComponent,
    LeftMenuComponent,
    RoomManagementComponent,
    CourseManagementComponent,
    SemesterManagementComponent,
    RoomDialogComponent,
    CourseDialogComponent,
    SemesterDialogComponent,
    TeacherManagementComponent,
    TeacherDialogComponent,
    DepartmentManagementComponent,
    DepartmentDialogComponent
  ],
  entryComponents: [
    RoomDialogComponent,
    CourseDialogComponent,
    TeacherDialogComponent,
    SemesterDialogComponent,
    DepartmentDialogComponent,
    RoomManagementComponent,
    CourseManagementComponent,
    SemesterManagementComponent,
    TeacherManagementComponent,
    DepartmentManagementComponent
  ],
  providers: [SidenavService]
})
export class HomeModule { }
