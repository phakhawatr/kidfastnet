-- Create class_assignments table for Assignment Manager
CREATE TABLE public.class_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.user_registrations(id),
    title TEXT NOT NULL,
    description TEXT,
    assignment_type TEXT NOT NULL DEFAULT 'homework',
    due_date TIMESTAMP WITH TIME ZONE,
    max_score INTEGER DEFAULT 100,
    exam_link_id UUID REFERENCES public.exam_links(id),
    skill_name TEXT,
    grade INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_submissions table for tracking student work
CREATE TABLE public.student_submissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID NOT NULL REFERENCES public.class_assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.user_registrations(id),
    status TEXT NOT NULL DEFAULT 'pending',
    score INTEGER,
    submitted_at TIMESTAMP WITH TIME ZONE,
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by UUID REFERENCES public.user_registrations(id),
    feedback TEXT,
    exam_session_id UUID REFERENCES public.exam_sessions(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(assignment_id, student_id)
);

-- Enable RLS
ALTER TABLE public.class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for class_assignments
CREATE POLICY "Teachers can view their class assignments" 
ON public.class_assignments 
FOR SELECT 
USING (true);

CREATE POLICY "Teachers can create assignments" 
ON public.class_assignments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Teachers can update their assignments" 
ON public.class_assignments 
FOR UPDATE 
USING (true);

CREATE POLICY "Teachers can delete their assignments" 
ON public.class_assignments 
FOR DELETE 
USING (true);

-- RLS Policies for student_submissions
CREATE POLICY "Users can view submissions" 
ON public.student_submissions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create submissions" 
ON public.student_submissions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update submissions" 
ON public.student_submissions 
FOR UPDATE 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_class_assignments_class_id ON public.class_assignments(class_id);
CREATE INDEX idx_class_assignments_teacher_id ON public.class_assignments(teacher_id);
CREATE INDEX idx_student_submissions_assignment_id ON public.student_submissions(assignment_id);
CREATE INDEX idx_student_submissions_student_id ON public.student_submissions(student_id);

-- Create trigger for updated_at
CREATE TRIGGER update_class_assignments_updated_at
BEFORE UPDATE ON public.class_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_school_updated_at();

CREATE TRIGGER update_student_submissions_updated_at
BEFORE UPDATE ON public.student_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_school_updated_at();