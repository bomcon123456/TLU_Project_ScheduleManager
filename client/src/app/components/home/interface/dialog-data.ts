export interface UserData {
  id?: string;
  username?: string;
  password?: string;
  firstname?: string;
  lastname?: string;
  token?: string;
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
    combined?: number;
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

export interface DepartmentElement {
  action?: string;
  _id?: string;
  schoolId?: string;
  name?: string;
}

export interface ClassroomElement {
  action?: string;
  _id?: string;
  name?: string;
  students?: number;
  courseId?: {
    _id?: string;
    name?: string;
  },
  roomId?: {
    _id?: string;
    name?: string;
  },
  teacherId?: {
    _id?: string;
    name?: string;
  },
  date?: {
    shift?: string;
    day?: string;
    group?: string;
    semesters?: string;
    year?: string;
  },
  verified?: boolean;
}

export interface CalendarElement {
  _id?: string;
  group?: string;
  semesters?: string;
  year?: string;
  startDate?: string;
  endDate?: string;
  openForOffering?: boolean;
}
