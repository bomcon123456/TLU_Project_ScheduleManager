import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularMaterialModule } from '../../core/angular-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { HomeRoutingModule } from './core/home-routing.module';
import { SidenavService } from 'src/app/services/sidenav.service';
import { StorageService } from '../home/categories/classroom-management/storage/storage.service'

import { HomeComponent } from './home.component';
import { LeftMenuComponent } from './frame/left-menu/left-menu.component';
import { HeaderComponent } from '../home/frame/header/header.component';
import { RoomManagementComponent } from './categories/room-management/room-management.component';
import { CourseManagementComponent } from './categories/course-management/course-management.component';
import { ScheduleComponent } from './categories/schedule/schedule.component';
import { RoomDialogComponent } from './categories/room-management/room-dialog/room-dialog.component';
import { CourseDialogComponent } from './categories/course-management/course-dialog/course-dialog.component';
import { TeacherManagementComponent } from './categories/teacher-management/teacher-management.component';
import { TeacherDialogComponent } from './categories/teacher-management/teacher-dialog/teacher-dialog.component';
import { DepartmentManagementComponent } from './categories/department-management/department-management.component';
import { DepartmentDialogComponent } from './categories/department-management/department-dialog/department-dialog.component';
import { ClassroomManagementComponent } from './categories/classroom-management/classroom-management.component';
import { ClassroomDialogComponent } from './categories/classroom-management/classroom-dialog/classroom-dialog.component';
import { ClassroomAddComponent } from './categories/classroom-management/classroom-add/classroom-add.component';


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
  ],
  declarations: [
    HomeComponent,
    HeaderComponent,
    LeftMenuComponent,
    RoomManagementComponent,
    CourseManagementComponent,
    ScheduleComponent,
    RoomDialogComponent,
    CourseDialogComponent,
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
    DepartmentDialogComponent,
    ClassroomDialogComponent,
    RoomManagementComponent,
    CourseManagementComponent,
    ScheduleComponent,
    TeacherManagementComponent,
    ClassroomManagementComponent,
    DepartmentManagementComponent
  ],
  providers: [
    SidenavService,
    StorageService
  ]
})
export class HomeModule { }
