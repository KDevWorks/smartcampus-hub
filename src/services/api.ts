// API Integration Guide for SmartCampus Frontend
// @ts-ignore
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  const userStr = localStorage.getItem('smartcampus_user');
  if (userStr) {
    const user = JSON.parse(userStr);
    return user.token;
  }
  return null;
};

// Helper function for API requests
const apiRequest = async (endpoint: string, options: any = {}) => {
  const token = getAuthToken();

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ============================================
// Authentication API
// ============================================

export const authAPI = {
  // Register new user
  register: async (userData: any) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login user
  login: async (email: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Get current user
  getMe: async () => {
    return apiRequest('/auth/me');
  },

  // Update profile
  updateProfile: async (profileData: any) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// ============================================
// Admin API
// ============================================

export const adminAPI = {
  getOverview: async () => {
    return apiRequest('/admin/overview');
  },
  getAllUsers: async () => {
    return apiRequest('/admin/users');
  },
  getAttendanceAnalytics: async () => {
    return apiRequest('/admin/attendance-analytics');
  }
};

// ============================================
// Attendance API
// ============================================

export const attendanceAPI = {
  // Mark attendance (Staff only)
  markAttendance: async (subjectId: string, date: string, attendanceData: any) => {
    return apiRequest('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify({ subjectId, date, attendanceData }),
    });
  },

  // Update attendance (Correction for today)
  updateAttendance: async (subjectId: string, date: string, attendanceData: any) => {
    return apiRequest('/attendance/update', {
      method: 'PUT',
      body: JSON.stringify({ subjectId, date, attendanceData }),
    });
  },

  // Get student attendance
  getStudentAttendance: async (studentId: string, subjectId: string | null = null) => {
    const query = subjectId ? `?subjectId=${subjectId}` : '';
    return apiRequest(`/attendance/student/${studentId}${query}`);
  },

  // Get attendance statistics
  getAttendanceStats: async (studentId: string) => {
    return apiRequest(`/attendance/stats/${studentId}`);
  },

  // Predict attendance
  predictAttendance: async (studentId: string, requiredPercentage = 75) => {
    return apiRequest(`/attendance/predict/${studentId}?requiredPercentage=${requiredPercentage}`);
  },

  // Get attendance history (Staff)
  getAttendanceHistory: async (filters: any = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiRequest(`/attendance/history?${query}`);
  },

  // Get attendance by subject (Staff)
  getAttendanceBySubject: async (subjectId: string, date: string | null = null) => {
    const query = date ? `?date=${date}` : '';
    return apiRequest(`/attendance/subject/${subjectId}${query}`);
  },
};

// ============================================
// Subjects API (Added for Staff)
// ============================================

export const subjectsAPI = {
  // Get all subjects (public-ish)
  getAllSubjects: async () => {
    return apiRequest('/subjects');
  },

  // Get staff subjects
  getMySubjects: async () => {
    return apiRequest('/subjects/my-subjects');
  },

  // Get students enrolled in a subject
  getSubjectStudents: async (subjectId: string) => {
    return apiRequest(`/subjects/${subjectId}/students`);
  }
};

// ============================================
// Complaint API
// ============================================

export const complaintAPI = {
  // Create complaint
  createComplaint: async (complaintData: any) => {
    return apiRequest('/complaints', {
      method: 'POST',
      body: JSON.stringify(complaintData),
    });
  },

  // Get all complaints (Staff/Admin)
  getAllComplaints: async (filters: any = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiRequest(`/complaints?${query}`);
  },

  // Get my complaints
  getMyComplaints: async () => {
    return apiRequest('/complaints/my');
  },

  // Get single complaint
  getComplaint: async (complaintId: string) => {
    return apiRequest(`/complaints/${complaintId}`);
  },

  // Update complaint status (Staff/Admin)
  updateComplaintStatus: async (complaintId: string, status: string) => {
    return apiRequest(`/complaints/${complaintId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Assign complaint (Admin)
  assignComplaint: async (complaintId: string, assignedTo: string) => {
    return apiRequest(`/complaints/${complaintId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ assignedTo }),
    });
  },

  // Add comment
  addComment: async (complaintId: string, text: string) => {
    return apiRequest(`/complaints/${complaintId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  // Resolve complaint (Staff/Admin)
  resolveComplaint: async (complaintId: string, resolutionNote: string) => {
    return apiRequest(`/complaints/${complaintId}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ resolutionNote }),
    });
  },
};

// ============================================
// Grade API
// ============================================

export const gradeAPI = {
  // Add or update grade (Staff)
  addOrUpdateGrade: async (gradeData: any) => {
    return apiRequest('/grades', {
      method: 'POST',
      body: JSON.stringify(gradeData),
    });
  },

  // Get student grades
  getStudentGrades: async (studentId: string, filters: any = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiRequest(`/grades/student/${studentId}?${query}`);
  },

  // Get subject performance (Staff)
  getSubjectPerformance: async (subjectId: string) => {
    return apiRequest(`/grades/subject/${subjectId}`);
  },

  // Get academic summary
  getAcademicSummary: async (studentId: string) => {
    return apiRequest(`/grades/summary/${studentId}`);
  },

  // Get class rank
  getClassRank: async (studentId: string) => {
    return apiRequest(`/grades/rank/${studentId}`);
  },
};

// ============================================
// Parent API
// ============================================

export const parentAPI = {
  // Link child to parent account
  linkChild: async (childEmail: string) => {
    return apiRequest('/parent/link-child', {
      method: 'POST',
      body: JSON.stringify({ childEmail }),
    });
  },

  // Get children list
  getChildren: async () => {
    return apiRequest('/parent/children');
  },

  // Get child overview
  getChildOverview: async (childId: string) => {
    return apiRequest(`/parent/child/${childId}/overview`);
  },

  // Get child attendance
  getChildAttendance: async (childId: string) => {
    return apiRequest(`/parent/child/${childId}/attendance`);
  },

  // Get child performance
  getChildPerformance: async (childId: string) => {
    return apiRequest(`/parent/child/${childId}/performance`);
  },

  // Get child assignments
  getChildAssignments: async (childId: string) => {
    return apiRequest(`/parent/child/${childId}/assignments`);
  },

  // Get child feedback
  getChildFeedback: async (childId: string) => {
    return apiRequest(`/parent/child/${childId}/feedback`);
  },

  // Get child notifications
  getChildNotifications: async (childId: string) => {
    return apiRequest(`/parent/child/${childId}/notifications`);
  },

  // Request parent-teacher meeting
  requestMeeting: async (meetingData: any) => {
    return apiRequest('/parent/request-meeting', {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
  },

  // Get parent meetings
  getParentMeetings: async () => {
    return apiRequest('/parent/meetings');
  },
};

export default {
  authAPI,
  attendanceAPI,
  complaintAPI,
  gradeAPI,
  parentAPI,
  subjectsAPI,
  adminAPI
};
