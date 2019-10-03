import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularMaterialModule } from '../../core/angular-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { ClassroomManagementComponent } from './categories/classroom-management/classroom-management.component';
import { ClassroomDialogComponent } from './categories/classroom-management/classroom-dialog/classroom-dialog.component';
import { ClassroomAddComponent } from './categories/classroom-management/classroom-add/classroom-add.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';


@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule,
    AngularMaterialModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
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
    DepartmentDialogComponent,
    ClassroomManagementComponent,
    ClassroomDialogComponent,
    ClassroomAddComponent
  ],
  entryComponents: [
    RoomDialogComponent,
    CourseDialogComponent,
    TeacherDialogComponent,
    SemesterDialogComponent,
    DepartmentDialogComponent,
    ClassroomDialogComponent,
    RoomManagementComponent,
    CourseManagementComponent,
    SemesterManagementComponent,
    TeacherManagementComponent,
    ClassroomManagementComponent,
    DepartmentManagementComponent
  ],
  providers: [SidenavService]
})
export class HomeModule { }
