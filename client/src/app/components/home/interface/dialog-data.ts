export interface DialogData {
  animal: string;
  name: string;
}

export interface ClassroomElement {
  action?: string;
  id?: string;
  name?: string;
  capacity?: number;
  location?: {
    building?: string;
    floor?: string;
  };
  roomType?: string;
  multi?: boolean;
}

export interface CourseElement {
  action?: string;
  id?: string;
  name?: string;
  credits?: number;
  department?: string;
  length?: {
    theory?: number;
    practice?: number;
  };
  coursePrerequisites?: string[];
  creditPrerequisites?: number;
}

export interface TeacherElement {
  id?: string;
  name?: string;
  department?: string;
}

export interface SemesterElement {
  year?: string;
  semester?: string;
}
