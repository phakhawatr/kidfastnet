import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Users, GraduationCap, MapPin, ChevronRight } from 'lucide-react';

interface SchoolCard {
  id: string;
  name: string;
  code: string;
  province: string | null;
  district: string | null;
  logo_url: string | null;
  teacher_count: number;
  student_count: number;
}

const SchoolNetworkSection = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState<SchoolCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const { data: schoolsData, error } = await supabase
          .from('schools')
          .select('id, name, code, province, district, logo_url')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;

        const schoolsWithStats: SchoolCard[] = await Promise.all(
          (schoolsData || []).map(async (school) => {
            const { count: teacherCount } = await supabase
              .from('school_memberships')
              .select('*', { count: 'exact', head: true })
              .eq('school_id', school.id)
              .in('role', ['teacher', 'school_admin'])
              .eq('is_active', true);

            const { count: studentCount } = await supabase
              .from('school_memberships')
              .select('*', { count: 'exact', head: true })
              .eq('school_id', school.id)
              .eq('role', 'student')
              .eq('is_active', true);

            return {
              ...school,
              teacher_count: teacherCount || 0,
              student_count: studentCount || 0,
            };
          })
        );

        setSchools(schoolsWithStats);
      } catch (error) {
        console.error('Error fetching schools:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchools();
  }, []);

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="card-glass p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (schools.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="card-glass p-8 md:p-10">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-4 shadow-lg">
            <Building2 className="w-4 h-4" />
            <span>SCHOOL NETWORK</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[hsl(var(--text-primary))] mb-3">
            🏫 โรงเรียนในเครือข่าย
          </h2>
          <p className="text-[hsl(var(--text-secondary))] text-lg max-w-2xl mx-auto">
            โรงเรียนที่ใช้งานระบบ KidFastAI ในการจัดการการเรียนรู้คณิตศาสตร์
          </p>
        </div>

        {/* School Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {schools.map((school, index) => (
            <div
              key={school.id}
              onClick={() => navigate(`/school-login/${school.id}`)}
              className="group relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient Border */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-[2px]">
                <div className="absolute inset-[2px] bg-white dark:bg-slate-900 rounded-[14px]" />
              </div>

              {/* Card Content */}
              <div className="relative p-6 flex flex-col items-center text-center">
                {/* School Logo */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500 overflow-hidden border-2 border-white dark:border-slate-700">
                  {school.logo_url ? (
                    <img
                      src={school.logo_url}
                      alt={school.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-10 h-10 text-indigo-500" />
                  )}
                </div>

                {/* School Name */}
                <h3 className="font-bold text-base text-[hsl(var(--text-primary))] mb-1 line-clamp-2 min-h-[2.5rem]">
                  {school.name}
                </h3>

                {/* Location */}
                {(school.district || school.province) && (
                  <div className="flex items-center gap-1 text-xs text-[hsl(var(--text-secondary))] mb-4">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {[school.district, school.province].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs mb-4">
                  <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span className="font-semibold">{school.teacher_count} ครู</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-semibold">{school.student_count} นักเรียน</span>
                  </div>
                </div>

                {/* Enter Button */}
                <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all duration-300">
                  <span>เข้าสู่ระบบโรงเรียน</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SchoolNetworkSection;
