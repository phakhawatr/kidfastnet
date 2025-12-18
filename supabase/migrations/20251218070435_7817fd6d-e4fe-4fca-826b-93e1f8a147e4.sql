-- =====================================================
-- SCHOOL VERSION - PHASE 1: FOUNDATION DATABASE SCHEMA
-- =====================================================

-- 1. Create enum for school membership roles
CREATE TYPE public.school_role AS ENUM ('school_admin', 'teacher', 'student');

-- 2. Create schools table
CREATE TABLE public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL, -- รหัสโรงเรียน เช่น "BKK001"
    logo_url TEXT,
    address TEXT,
    district TEXT,
    province TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}', -- สำหรับ config เพิ่มเติม
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. Create classes table
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, -- ชื่อห้อง เช่น "ป.3/1"
    grade INTEGER NOT NULL, -- ระดับชั้น 1-6
    academic_year INTEGER NOT NULL, -- ปีการศึกษา เช่น 2567
    semester INTEGER DEFAULT 1, -- เทอม 1 หรือ 2
    teacher_id UUID REFERENCES public.user_registrations(id), -- ครูประจำชั้น
    max_students INTEGER DEFAULT 40,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(school_id, name, academic_year, semester)
);

-- 4. Create school_memberships table (connects users to schools with roles)
CREATE TABLE public.school_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.user_registrations(id) ON DELETE CASCADE NOT NULL,
    role school_role NOT NULL,
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(school_id, user_id, role)
);

-- 5. Create class_students table (connects students to classes)
CREATE TABLE public.class_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.user_registrations(id) ON DELETE CASCADE NOT NULL,
    student_number INTEGER, -- เลขที่นักเรียน
    is_active BOOLEAN DEFAULT true,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(class_id, student_id)
);

-- 6. Enable RLS on all tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;

-- 7. Create indexes for performance
CREATE INDEX idx_schools_code ON public.schools(code);
CREATE INDEX idx_schools_is_active ON public.schools(is_active);
CREATE INDEX idx_classes_school_id ON public.classes(school_id);
CREATE INDEX idx_classes_teacher_id ON public.classes(teacher_id);
CREATE INDEX idx_classes_grade ON public.classes(grade);
CREATE INDEX idx_school_memberships_school_id ON public.school_memberships(school_id);
CREATE INDEX idx_school_memberships_user_id ON public.school_memberships(user_id);
CREATE INDEX idx_school_memberships_role ON public.school_memberships(role);
CREATE INDEX idx_class_students_class_id ON public.class_students(class_id);
CREATE INDEX idx_class_students_student_id ON public.class_students(student_id);

-- =====================================================
-- SECURITY DEFINER FUNCTIONS (ป้องกัน RLS recursion)
-- =====================================================

-- 8. Function to check if user has school role
CREATE OR REPLACE FUNCTION public.has_school_role(_user_id UUID, _school_id UUID, _role school_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.school_memberships
        WHERE user_id = _user_id
          AND school_id = _school_id
          AND role = _role
          AND is_active = true
    )
$$;

-- 9. Function to check if user is school admin
CREATE OR REPLACE FUNCTION public.is_school_admin(_user_id UUID, _school_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.school_memberships
        WHERE user_id = _user_id
          AND school_id = _school_id
          AND role = 'school_admin'
          AND is_active = true
    )
$$;

-- 10. Function to check if user is teacher in school
CREATE OR REPLACE FUNCTION public.is_school_teacher(_user_id UUID, _school_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.school_memberships
        WHERE user_id = _user_id
          AND school_id = _school_id
          AND role IN ('school_admin', 'teacher')
          AND is_active = true
    )
$$;

-- 11. Function to check if user belongs to school (any role)
CREATE OR REPLACE FUNCTION public.is_school_member(_user_id UUID, _school_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.school_memberships
        WHERE user_id = _user_id
          AND school_id = _school_id
          AND is_active = true
    )
$$;

-- 12. Function to get user's schools
CREATE OR REPLACE FUNCTION public.get_user_schools(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT school_id
    FROM public.school_memberships
    WHERE user_id = _user_id
      AND is_active = true
$$;

-- =====================================================
-- RLS POLICIES FOR SCHOOLS TABLE
-- =====================================================

-- Platform admins can do everything
CREATE POLICY "Platform admins can manage all schools"
ON public.schools
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- School members can view their school
CREATE POLICY "School members can view their school"
ON public.schools
FOR SELECT
USING (
    id IN (SELECT public.get_user_schools(auth.uid()))
    OR is_active = true -- Public schools visible for joining
);

-- School admins can update their school
CREATE POLICY "School admins can update their school"
ON public.schools
FOR UPDATE
USING (public.is_school_admin(auth.uid(), id))
WITH CHECK (public.is_school_admin(auth.uid(), id));

-- =====================================================
-- RLS POLICIES FOR CLASSES TABLE
-- =====================================================

-- Platform admins can manage all classes
CREATE POLICY "Platform admins can manage all classes"
ON public.classes
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- School admins can manage classes in their school
CREATE POLICY "School admins can manage classes"
ON public.classes
FOR ALL
USING (public.is_school_admin(auth.uid(), school_id))
WITH CHECK (public.is_school_admin(auth.uid(), school_id));

-- Teachers can view classes in their school
CREATE POLICY "Teachers can view school classes"
ON public.classes
FOR SELECT
USING (public.is_school_teacher(auth.uid(), school_id));

-- Teachers can update their own classes
CREATE POLICY "Teachers can update their classes"
ON public.classes
FOR UPDATE
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

-- Students can view their enrolled classes
CREATE POLICY "Students can view enrolled classes"
ON public.classes
FOR SELECT
USING (
    id IN (
        SELECT class_id FROM public.class_students
        WHERE student_id = auth.uid() AND is_active = true
    )
);

-- =====================================================
-- RLS POLICIES FOR SCHOOL_MEMBERSHIPS TABLE
-- =====================================================

-- Platform admins can manage all memberships
CREATE POLICY "Platform admins can manage all memberships"
ON public.school_memberships
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- School admins can manage memberships in their school
CREATE POLICY "School admins can manage memberships"
ON public.school_memberships
FOR ALL
USING (public.is_school_admin(auth.uid(), school_id))
WITH CHECK (public.is_school_admin(auth.uid(), school_id));

-- Users can view their own memberships
CREATE POLICY "Users can view own memberships"
ON public.school_memberships
FOR SELECT
USING (user_id = auth.uid());

-- Teachers can view memberships in their school
CREATE POLICY "Teachers can view school memberships"
ON public.school_memberships
FOR SELECT
USING (public.is_school_teacher(auth.uid(), school_id));

-- =====================================================
-- RLS POLICIES FOR CLASS_STUDENTS TABLE
-- =====================================================

-- Platform admins can manage all class students
CREATE POLICY "Platform admins can manage all class students"
ON public.class_students
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- School admins can manage class students
CREATE POLICY "School admins can manage class students"
ON public.class_students
FOR ALL
USING (
    class_id IN (
        SELECT c.id FROM public.classes c
        WHERE public.is_school_admin(auth.uid(), c.school_id)
    )
)
WITH CHECK (
    class_id IN (
        SELECT c.id FROM public.classes c
        WHERE public.is_school_admin(auth.uid(), c.school_id)
    )
);

-- Teachers can manage students in their classes
CREATE POLICY "Teachers can manage their class students"
ON public.class_students
FOR ALL
USING (
    class_id IN (
        SELECT id FROM public.classes WHERE teacher_id = auth.uid()
    )
)
WITH CHECK (
    class_id IN (
        SELECT id FROM public.classes WHERE teacher_id = auth.uid()
    )
);

-- Students can view their own enrollment
CREATE POLICY "Students can view own enrollment"
ON public.class_students
FOR SELECT
USING (student_id = auth.uid());

-- =====================================================
-- TRIGGER FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_school_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_schools_updated_at
    BEFORE UPDATE ON public.schools
    FOR EACH ROW
    EXECUTE FUNCTION public.update_school_updated_at();

CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON public.classes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_school_updated_at();

CREATE TRIGGER update_school_memberships_updated_at
    BEFORE UPDATE ON public.school_memberships
    FOR EACH ROW
    EXECUTE FUNCTION public.update_school_updated_at();