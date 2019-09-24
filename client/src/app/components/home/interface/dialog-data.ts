export interface DialogData {
  animal: string;
  name: string;
}

export interface RoomElement {
  action?: string;
  _id?: string;
  name?: string;
  capacity?: number;
  location?: {
    building?: string;
    floor?: number;
  };
  roomType?: string;
}

export interface CourseElement {
  action?: string;
  _id?: string;
  name?: string;
  credits?: number;
  department?: {
    _id?: string;
    name?: string;
  };
  length?: {
    theory?: number;
    practice?: number;
  };
  coursePrerequisites?: string[];
  creditPrerequisites?: number;
}

export interface TeacherElement {
  action?: string;
  _id?: string;
  name?: string;
  department?: {
    _id?: string;
    name?: string;
  };
}

export interface SemesterElement {
  year?: string;
  semester?: string;
}

export interface DepartmentElement {
  action?: string;
  _id?: string;
  schoolId?: string;
  name?: string;
}
