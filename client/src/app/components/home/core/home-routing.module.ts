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
import { RoleGuard } from '../../_helpers/role.guard'


const routes: Routes = [
  {
    path: 'schedule',
    component: ScheduleComponent
  },
  {
    path: 'course-management',
    component: CourseManagementComponent,
    canActivate: [RoleGuard],
    data: {
      expectedRole: [2, 99]
    }
  },
  {
    path: 'room-management',
    component: RoomManagementComponent,
    canActivate: [RoleGuard],
    data: {
      expectedRole: [2, 99]
    }
  },
  {
    path: 'teacher-management',
    component: TeacherManagementComponent,
    canActivate: [RoleGuard],
    data: {
      expectedRole: [2, 99]
    }
  },
  {
    path: 'department-management',
    component: DepartmentManagementComponent,
    canActivate: [RoleGuard],
    data: {
      expectedRole: [2, 99]
    }
  },
  {
    path: 'calendar-management',
    component: CalendarManagementComponent,
    canActivate: [RoleGuard],
    data: {
      expectedRole: [2, 99]
    }
  },
  {
    path: 'classroom-management',
    component: ClassroomManagementComponent,
    canActivate: [RoleGuard],
    data: {
      expectedRole: [1, 99]
    }
  },
  {
    path: 'classroom-management/classroom-add',
    component: ClassroomAddComponent,
    canActivate: [RoleGuard],
    data: {
      expectedRole: [1, 99]
    }
  },
  {
    path: 'schedule-management',
    component: ScheduleManagementComponent,
    canActivate: [RoleGuard],
    data: {
      expectedRole: [2, 99]
    }
  },
  {
    path: 'schedule-management/verified',
    component: ClassroomVerifiedComponent,
    canActivate: [RoleGuard],
    data: {
      expectedRole: [2, 99]
    }
  },
  {
    path: 'schedule-management/not-verified',
    component: ClassroomNotVerifiedComponent,
    canActivate: [RoleGuard],
    data: {
      expectedRole: [2, 99]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
