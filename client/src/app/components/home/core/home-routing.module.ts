import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from '../home.component';
import { SubjectManagementComponent } from '../categories/subject-management/subject-management.component';
import { ClassroomManagementComponent } from '../categories/classroom-management/classroom-management.component';
import { SemesterManagementComponent } from '../categories/semester-management/semester-management.component';


const routes: Routes = [
  {
    path: 'subject-management',
    component: SubjectManagementComponent
  },
  {
    path: 'classroom-management',
    component: ClassroomManagementComponent
  },
  {
    path: 'semester-management',
    component: SemesterManagementComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
