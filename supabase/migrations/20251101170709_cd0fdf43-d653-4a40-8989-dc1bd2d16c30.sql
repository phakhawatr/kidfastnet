-- Update subscription plans pricing
UPDATE subscription_plans
SET 
  price_monthly = 399.00,
  price_6_months = 399.00
WHERE plan_name = 'basic';

UPDATE subscription_plans
SET 
  price_monthly = 599.00,
  price_6_months = 599.00
WHERE plan_name = 'premium';