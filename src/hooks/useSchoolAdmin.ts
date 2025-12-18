import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type School = Database['public']['Tables']['schools']['Row'];
type Class = Database['public']['Tables']['classes']['Row'];
type SchoolMembership = Database['public']['Tables']['school_memberships']['Row'];
type ClassStudent = Database['public']['Tables']['class_students']['Row'];
type SchoolRole = Database['public']['Enums']['school_role'];

interface SchoolWithStats extends School {
  teacher_count?: number;
  student_count?: number;
  class_count?: number;
}

interface ClassWithDetails extends Class {
  teacher_name?: string;
  student_count?: number;
}

interface MemberWithDetails extends SchoolMembership {
  user_nickname?: string;
  user_email?: string;
  user_avatar?: string;
}

export const useSchoolAdmin = (userId: string | null) => {
  const [isSchoolAdmin, setIsSchoolAdmin] = useState(false);
  const [userSchools, setUserSchools] = useState<SchoolWithStats[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<SchoolWithStats | null>(null);
  const [classes, setClasses] = useState<ClassWithDetails[]>([]);
  const [members, setMembers] = useState<MemberWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is a school admin
  useEffect(() => {
    const checkSchoolAdminRole = async () => {
      if (!userId) {
        setIsSchoolAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('school_memberships')
          .select('*')
          .eq('user_id', userId)
          .eq('role', 'school_admin')
          .eq('is_active', true);

        if (error) throw error;
        
        setIsSchoolAdmin(data && data.length > 0);
      } catch (error) {
        console.error('Error checking school admin role:', error);
        setIsSchoolAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSchoolAdminRole();
  }, [userId]);

  // Fetch schools for the user
  const fetchUserSchools = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      
      // Get schools where user is a member
      const { data: memberships, error: membershipError } = await supabase
        .from('school_memberships')
        .select('school_id')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (membershipError) throw membershipError;

      if (!memberships || memberships.length === 0) {
        setUserSchools([]);
        return;
      }

      const schoolIds = memberships.map(m => m.school_id);

      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('*')
        .in('id', schoolIds)
        .eq('is_active', true);

      if (schoolsError) throw schoolsError;

      // Get stats for each school
      const schoolsWithStats: SchoolWithStats[] = await Promise.all(
        (schools || []).map(async (school) => {
          // Count teachers
          const { count: teacherCount } = await supabase
            .from('school_memberships')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', school.id)
            .eq('role', 'teacher')
            .eq('is_active', true);

          // Count students
          const { count: studentCount } = await supabase
            .from('school_memberships')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', school.id)
            .eq('role', 'student')
            .eq('is_active', true);

          // Count classes
          const { count: classCount } = await supabase
            .from('classes')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', school.id)
            .eq('is_active', true);

          return {
            ...school,
            teacher_count: teacherCount || 0,
            student_count: studentCount || 0,
            class_count: classCount || 0,
          };
        })
      );

      setUserSchools(schoolsWithStats);
      
      // Auto-select first school if none selected
      if (!selectedSchool && schoolsWithStats.length > 0) {
        setSelectedSchool(schoolsWithStats[0]);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, selectedSchool]);

  // Fetch classes for selected school
  const fetchClasses = useCallback(async () => {
    if (!selectedSchool) {
      setClasses([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', selectedSchool.id)
        .eq('is_active', true)
        .order('grade', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      // Get teacher names and student counts
      const classesWithDetails: ClassWithDetails[] = await Promise.all(
        (data || []).map(async (cls) => {
          let teacherName = '';
          
          if (cls.teacher_id) {
            const { data: teacher } = await supabase
              .from('user_registrations')
              .select('nickname')
              .eq('id', cls.teacher_id)
              .single();
            teacherName = teacher?.nickname || '';
          }

          const { count: studentCount } = await supabase
            .from('class_students')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.id)
            .eq('is_active', true);

          return {
            ...cls,
            teacher_name: teacherName,
            student_count: studentCount || 0,
          };
        })
      );

      setClasses(classesWithDetails);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  }, [selectedSchool]);

  // Fetch members for selected school
  const fetchMembers = useCallback(async () => {
    if (!selectedSchool) {
      setMembers([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('school_memberships')
        .select('*')
        .eq('school_id', selectedSchool.id)
        .eq('is_active', true)
        .order('role', { ascending: true });

      if (error) throw error;

      // Get user details
      const membersWithDetails: MemberWithDetails[] = await Promise.all(
        (data || []).map(async (member) => {
          const { data: user } = await supabase
            .from('user_registrations')
            .select('nickname, parent_email, avatar')
            .eq('id', member.user_id)
            .single();

          return {
            ...member,
            user_nickname: user?.nickname || '',
            user_email: user?.parent_email || '',
            user_avatar: user?.avatar || '',
          };
        })
      );

      setMembers(membersWithDetails);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  }, [selectedSchool]);

  // Create a new school
  const createSchool = async (schoolData: {
    name: string;
    code: string;
    address?: string;
    district?: string;
    province?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo_url?: string;
  }) => {
    if (!userId) throw new Error('User not authenticated');

    try {
      // Create school
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .insert([{
          name: schoolData.name,
          code: schoolData.code,
          address: schoolData.address,
          district: schoolData.district,
          province: schoolData.province,
          phone: schoolData.phone,
          email: schoolData.email,
          website: schoolData.website,
          logo_url: schoolData.logo_url,
          is_active: true,
        }])
        .select()
        .single();

      if (schoolError) throw schoolError;

      // Add current user as school admin
      const { error: membershipError } = await supabase
        .from('school_memberships')
        .insert([{
          school_id: school.id,
          user_id: userId,
          role: 'school_admin' as SchoolRole,
          is_active: true,
        }]);

      if (membershipError) throw membershipError;

      await fetchUserSchools();
      return school;
    } catch (error) {
      console.error('Error creating school:', error);
      throw error;
    }
  };

  // Update school
  const updateSchool = async (schoolId: string, updates: Partial<School>) => {
    try {
      const { error } = await supabase
        .from('schools')
        .update(updates)
        .eq('id', schoolId);

      if (error) throw error;

      await fetchUserSchools();
    } catch (error) {
      console.error('Error updating school:', error);
      throw error;
    }
  };

  // Create a new class
  const createClass = async (classData: {
    name: string;
    grade: number;
    academic_year: number;
    semester?: number;
    teacher_id?: string;
    max_students?: number;
  }) => {
    if (!selectedSchool) throw new Error('No school selected');

    try {
      const { data, error } = await supabase
        .from('classes')
        .insert([{
          school_id: selectedSchool.id,
          name: classData.name,
          grade: classData.grade,
          academic_year: classData.academic_year,
          semester: classData.semester || 1,
          teacher_id: classData.teacher_id,
          max_students: classData.max_students || 40,
          is_active: true,
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchClasses();
      return data;
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  };

  // Update class
  const updateClass = async (classId: string, updates: Partial<Class>) => {
    try {
      const { error } = await supabase
        .from('classes')
        .update(updates)
        .eq('id', classId);

      if (error) throw error;

      await fetchClasses();
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  };

  // Delete class (soft delete)
  const deleteClass = async (classId: string) => {
    try {
      const { error } = await supabase
        .from('classes')
        .update({ is_active: false })
        .eq('id', classId);

      if (error) throw error;

      await fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  };

  // Add member to school
  const addMember = async (userEmail: string, role: SchoolRole) => {
    if (!selectedSchool) throw new Error('No school selected');

    try {
      // Find user by email
      const { data: user, error: userError } = await supabase
        .from('user_registrations')
        .select('id')
        .eq('parent_email', userEmail)
        .single();

      if (userError || !user) {
        throw new Error('ไม่พบผู้ใช้งานด้วยอีเมลนี้');
      }

      // Check if already a member
      const { data: existing } = await supabase
        .from('school_memberships')
        .select('id')
        .eq('school_id', selectedSchool.id)
        .eq('user_id', user.id)
        .eq('role', role)
        .maybeSingle();

      if (existing) {
        throw new Error('ผู้ใช้งานเป็นสมาชิกของโรงเรียนนี้อยู่แล้ว');
      }

      const { error } = await supabase
        .from('school_memberships')
        .insert([{
          school_id: selectedSchool.id,
          user_id: user.id,
          role: role,
          is_active: true,
        }]);

      if (error) throw error;

      await fetchMembers();
      await fetchUserSchools();
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  };

  // Remove member from school
  const removeMember = async (membershipId: string) => {
    try {
      const { error } = await supabase
        .from('school_memberships')
        .update({ is_active: false })
        .eq('id', membershipId);

      if (error) throw error;

      await fetchMembers();
      await fetchUserSchools();
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  };

  // Add student to class
  const addStudentToClass = async (classId: string, studentId: string, studentNumber?: number) => {
    try {
      const { error } = await supabase
        .from('class_students')
        .insert([{
          class_id: classId,
          student_id: studentId,
          student_number: studentNumber,
          is_active: true,
        }]);

      if (error) throw error;

      await fetchClasses();
    } catch (error) {
      console.error('Error adding student to class:', error);
      throw error;
    }
  };

  // Remove student from class
  const removeStudentFromClass = async (classStudentId: string) => {
    try {
      const { error } = await supabase
        .from('class_students')
        .update({ is_active: false })
        .eq('id', classStudentId);

      if (error) throw error;

      await fetchClasses();
    } catch (error) {
      console.error('Error removing student from class:', error);
      throw error;
    }
  };

  // Effects
  useEffect(() => {
    fetchUserSchools();
  }, [fetchUserSchools]);

  useEffect(() => {
    fetchClasses();
    fetchMembers();
  }, [selectedSchool, fetchClasses, fetchMembers]);

  return {
    isSchoolAdmin,
    isLoading,
    userSchools,
    selectedSchool,
    setSelectedSchool,
    classes,
    members,
    fetchUserSchools,
    fetchClasses,
    fetchMembers,
    createSchool,
    updateSchool,
    createClass,
    updateClass,
    deleteClass,
    addMember,
    removeMember,
    addStudentToClass,
    removeStudentFromClass,
  };
};
