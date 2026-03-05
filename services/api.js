// API Integration Guide for SmartCampus Frontend
// Save this as: /src/services/api.js

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
const apiRequest = async (endpoint, options = {}) => {
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
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login user
  login: async (email, password) => {
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
  updateProfile: async (profileData) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// ============================================
// Attendance API
// ============================================

export const attendanceAPI = {
  // Mark attendance (Staff only)
  markAttendance: async (subjectId, date, attendanceData) => {
    return apiRequest('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify({ subjectId, date, attendanceData }),
    });
  },

  // Get student attendance
  getStudentAttendance: async (studentId, subjectId = null) => {
    const query = subjectId ? `?subjectId=${subjectId}` : '';
    return apiRequest(`/attendance/student/${studentId}${query}`);
  },

  // Get attendance statistics
  getAttendanceStats: async (studentId) => {
    return apiRequest(`/attendance/stats/${studentId}`);
  },

  // Predict attendance
  predictAttendance: async (studentId, requiredPercentage = 75) => {
    return apiRequest(`/attendance/predict/${studentId}?requiredPercentage=${requiredPercentage}`);
  },

  // Get attendance history (Staff)
  getAttendanceHistory: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiRequest(`/attendance/history?${query}`);
  },

  // Get attendance by subject (Staff)
  getAttendanceBySubject: async (subjectId, date = null) => {
    const query = date ? `?date=${date}` : '';
    return apiRequest(`/attendance/subject/${subjectId}${query}`);
  },
};

// ============================================
// Complaint API
// ============================================

export const complaintAPI = {
  // Create complaint
  createComplaint: async (complaintData) => {
    return apiRequest('/complaints', {
      method: 'POST',
      body: JSON.stringify(complaintData),
    });
  },

  // Get all complaints (Staff/Admin)
  getAllComplaints: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiRequest(`/complaints?${query}`);
  },

  // Get my complaints
  getMyComplaints: async () => {
    return apiRequest('/complaints/my');
  },

  // Get single complaint
  getComplaint: async (complaintId) => {
    return apiRequest(`/complaints/${complaintId}`);
  },

  // Update complaint status (Staff/Admin)
  updateComplaintStatus: async (complaintId, status) => {
    return apiRequest(`/complaints/${complaintId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Assign complaint (Admin)
  assignComplaint: async (complaintId, assignedTo) => {
    return apiRequest(`/complaints/${complaintId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ assignedTo }),
    });
  },

  // Add comment
  addComment: async (complaintId, text) => {
    return apiRequest(`/complaints/${complaintId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  // Resolve complaint (Staff/Admin)
  resolveComplaint: async (complaintId, resolutionNote) => {
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
  addOrUpdateGrade: async (gradeData) => {
    return apiRequest('/grades', {
      method: 'POST',
      body: JSON.stringify(gradeData),
    });
  },

  // Get student grades
  getStudentGrades: async (studentId, filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiRequest(`/grades/student/${studentId}?${query}`);
  },

  // Get subject performance (Staff)
  getSubjectPerformance: async (subjectId) => {
    return apiRequest(`/grades/subject/${subjectId}`);
  },

  // Get academic summary
  getAcademicSummary: async (studentId) => {
    return apiRequest(`/grades/summary/${studentId}`);
  },

  // Get class rank
  getClassRank: async (studentId) => {
    return apiRequest(`/grades/rank/${studentId}`);
  },
};

// ============================================
// Parent API
// ============================================

export const parentAPI = {
  // Link child to parent account
  linkChild: async (childEmail) => {
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
  getChildOverview: async (childId) => {
    return apiRequest(`/parent/child/${childId}/overview`);
  },

  // Get child attendance
  getChildAttendance: async (childId) => {
    return apiRequest(`/parent/child/${childId}/attendance`);
  },

  // Get child performance
  getChildPerformance: async (childId) => {
    return apiRequest(`/parent/child/${childId}/performance`);
  },

  // Get child assignments
  getChildAssignments: async (childId) => {
    return apiRequest(`/parent/child/${childId}/assignments`);
  },

  // Get child feedback
  getChildFeedback: async (childId) => {
    return apiRequest(`/parent/child/${childId}/feedback`);
  },

  // Request parent-teacher meeting
  requestMeeting: async (meetingData) => {
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

// ============================================
// Usage Examples
// ============================================

/*

// Example 1: Login and store user data
import { authAPI } from './services/api';

const handleLogin = async (email, password) => {
  try {
    const response = await authAPI.login(email, password);
    
    if (response.success) {
      // Store user data with token
      localStorage.setItem('smartcampus_user', JSON.stringify(response.data));
      
      // Update auth context
      setUser(response.data);
      
      // Show success message
      toast.success('Login successful!');
      
      // Navigate to dashboard
      navigate('/dashboard');
    }
  } catch (error) {
    toast.error(error.message);
  }
};

// Example 2: Get student attendance
import { attendanceAPI } from './services/api';

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await attendanceAPI.getStudentAttendance(user._id);
        setAttendance(response.data);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
    };

    fetchAttendance();
  }, [user._id]);

  return (
    // Your component JSX
  );
};

// Example 3: Submit complaint
import { complaintAPI } from './services/api';

const handleSubmitComplaint = async (formData) => {
  try {
    const response = await complaintAPI.createComplaint({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority || 'medium',
      isAnonymous: formData.isAnonymous || false
    });

    if (response.success) {
      toast.success('Complaint submitted successfully!');
      // Reset form or navigate
    }
  } catch (error) {
    toast.error(error.message);
  }
};

// Example 4: Get child data for parent
import { parentAPI } from './services/api';

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childData, setChildData] = useState(null);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await parentAPI.getChildren();
        setChildren(response.data);
        
        if (response.data.length > 0) {
          setSelectedChild(response.data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching children:', error);
      }
    };

    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      const fetchChildData = async () => {
        try {
          const response = await parentAPI.getChildOverview(selectedChild);
          setChildData(response.data);
        } catch (error) {
          console.error('Error fetching child data:', error);
        }
      };

      fetchChildData();
    }
  }, [selectedChild]);

  return (
    // Your component JSX
  );
};

// Example 5: Mark attendance (Staff)
import { attendanceAPI } from './services/api';

const MarkAttendance = () => {
  const handleMarkAttendance = async (subjectId, students) => {
    try {
      const attendanceData = students.map(student => ({
        studentId: student._id,
        status: student.status, // 'present' or 'absent'
        period: currentPeriod,
        remarks: student.remarks || ''
      }));

      const response = await attendanceAPI.markAttendance(
        subjectId,
        new Date().toISOString(),
        attendanceData
      );

      if (response.success) {
        toast.success('Attendance marked successfully!');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    // Your component JSX
  );
};

*/

export default {
  authAPI,
  attendanceAPI,
  complaintAPI,
  gradeAPI,
  parentAPI,
};
