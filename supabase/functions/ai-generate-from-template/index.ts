import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { templateId, count, customVariables } = await req.json();

    if (!templateId || !count) {
      return new Response(
        JSON.stringify({ error: 'Missing templateId or count' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch template
    const { data: template, error: fetchError } = await supabase
      .from('question_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (fetchError || !template) {
      return new Response(
        JSON.stringify({ error: 'Template not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const questions = [];

    for (let i = 0; i < count; i++) {
      // Generate random values for variables
      const variables: Record<string, number> = {};
      for (const [varName, config] of Object.entries(template.variables as any)) {
        if (customVariables && customVariables[varName] !== undefined) {
          variables[varName] = customVariables[varName];
        } else {
          const min = config.min || 1;
          const max = config.max || 10;
          variables[varName] = Math.floor(Math.random() * (max - min + 1)) + min;
        }
      }

      // Replace variables in question text
      let questionText = template.template_text;
      for (const [varName, value] of Object.entries(variables)) {
        questionText = questionText.replace(new RegExp(`{${varName}}`, 'g'), value.toString());
      }

      // Calculate correct answer using formula
      const correctAnswer = evaluateFormula(template.answer_formula, variables);

      // Generate choices using formulas
      const choices = [];
      if (template.choices_formula) {
        for (const formula of Object.values(template.choices_formula as any)) {
          const value = evaluateFormula(formula, variables);
          choices.push(value.toString());
        }
      } else {
        // Default: generate choices around correct answer
        choices.push(correctAnswer.toString());
        choices.push((correctAnswer + 1).toString());
        choices.push((correctAnswer - 1).toString());
        choices.push((correctAnswer * 2).toString());
      }

      // Shuffle choices
      for (let j = choices.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [choices[j], choices[k]] = [choices[k], choices[j]];
      }

      questions.push({
        question_text: questionText,
        choices,
        correct_answer: correctAnswer.toString(),
        explanation: `คำตอบคือ ${correctAnswer}`,
        skill_name: template.topic || 'คณิตศาสตร์',
        grade: template.grade,
        difficulty: template.difficulty,
        is_template: true,
        template_variables: variables,
      });
    }

    // Update template usage count
    await supabase
      .from('question_templates')
      .update({ times_used: (template.times_used || 0) + count })
      .eq('id', templateId);

    return new Response(
      JSON.stringify({ questions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Simple formula evaluator (supports +, -, *, /)
function evaluateFormula(formula: string, variables: Record<string, number>): number {
  let expression = formula;
  
  // Replace variables
  for (const [varName, value] of Object.entries(variables)) {
    expression = expression.replace(new RegExp(varName, 'g'), value.toString());
  }
  
  // Evaluate (simple eval - in production use a proper math parser)
  try {
    // eslint-disable-next-line no-eval
    return eval(expression);
  } catch (e) {
    console.error('Formula evaluation error:', e);
    return 0;
  }
}