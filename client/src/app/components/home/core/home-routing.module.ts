import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from '../home.component';
import { CourseManagementComponent } from '../categories/course-management/course-management.component';
import { RoomManagementComponent } from '../categories/room-management/room-management.component';
import { ScheduleComponent } from '../categories/schedule/schedule.component';
import { TeacherManagementComponent } from './../categories/teacher-management/teacher-management.component';
import { DepartmentManagementComponent } from './../categories/department-management/department-management.component';
import { CalendarManagementComponent } from '../categories/calendar-management/calendar-management.component';
import { ClassroomManagementComponent } from './../categories/classroom-management/classroom-management.component';
import { ClassroomAddComponent } from '../categories/classroom-management/classroom-add/classroom-add.component';
import { ScheduleManagementComponent } from './../categories/schedule-management/schedule-management.component';
import { ClassroomVerifiedComponent } from './../categories/schedule-management/classroom-verified/classroom-verified.component';
import { ClassroomNotVerifiedComponent } from './../categories/schedule-management/classroom-not-verified/classroom-not-verified.component';


const routes: Routes = [
  {
    path: 'schedule',
    component: ScheduleComponent
  },
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
    path: 'department-management',
    component: DepartmentManagementComponent
  },
  {
    path: 'calendar-management',
    component: CalendarManagementComponent
  },
  {
    path: 'classroom-management',
    component: ClassroomManagementComponent
  },
  {
    path: 'classroom-management/classroom-add',
    component: ClassroomAddComponent
  },
  {
    path: 'schedule-management',
    component: ScheduleManagementComponent
  },
  {
    path: 'schedule-management/verified',
    component: ClassroomVerifiedComponent
  },
  {
    path: 'schedule-management/not-verified',
    component: ClassroomNotVerifiedComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
