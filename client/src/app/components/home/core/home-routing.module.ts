import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from '../home.component';
import { CourseManagementComponent } from '../categories/course-management/course-management.component';
import { RoomManagementComponent } from '../categories/room-management/room-management.component';
import { SemesterManagementComponent } from '../categories/semester-management/semester-management.component';
import { TeacherManagementComponent } from './../categories/teacher-management/teacher-management.component';
import { DepartmentManagementComponent } from './../categories/department-management/department-management.component';


const routes: Routes = [
  {
    path: 'course-management',
    component: CourseManagementComponent
  },
  {
    path: 'room-management',
    component: RoomManagementComponent
  },
  {
    path: 'teacher-management',
    component: TeacherManagementComponent
  },
  {
    path: 'semester-management',
    component: SemesterManagementComponent
  },
  {
    path: 'department-management',
    component: DepartmentManagementComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
