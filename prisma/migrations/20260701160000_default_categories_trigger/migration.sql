-- Extend handle_new_user() to also seed default categories for every new profile.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, "fullName", "updatedAt")
  VALUES (
    NEW.id::text,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_settings (id, "profileId", "updatedAt")
  VALUES (gen_random_uuid()::text, NEW.id::text, CURRENT_TIMESTAMP)
  ON CONFLICT ("profileId") DO NOTHING;

  INSERT INTO public.categories (id, "profileId", name, type, icon, color, "isDefault", "updatedAt")
  VALUES
    (gen_random_uuid()::text, NEW.id::text, 'Salário', 'INCOME', 'Banknote', '#22c55e', true, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, NEW.id::text, 'Freelance', 'INCOME', 'Laptop', '#0ea5e9', true, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, NEW.id::text, 'Investimentos', 'INCOME', 'TrendingUp', '#6366f1', true, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, NEW.id::text, 'Outras receitas', 'INCOME', 'PiggyBank', '#84cc16', true, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, NEW.id::text, 'Moradia', 'EXPENSE', 'Home', '#f97316', true, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, NEW.id::text, 'Alimentação', 'EXPENSE', 'UtensilsCrossed', '#ef4444', true, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, NEW.id::text, 'Transporte', 'EXPENSE', 'Car', '#eab308', true, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, NEW.id::text, 'Saúde', 'EXPENSE', 'HeartPulse', '#ec4899', true, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, NEW.id::text, 'Lazer', 'EXPENSE', 'Gamepad2', '#a855f7', true, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, NEW.id::text, 'Educação', 'EXPENSE', 'GraduationCap', '#14b8a6', true, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, NEW.id::text, 'Compras', 'EXPENSE', 'ShoppingBag', '#f43f5e', true, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, NEW.id::text, 'Outras despesas', 'EXPENSE', 'Receipt', '#64748b', true, CURRENT_TIMESTAMP)
  ON CONFLICT ("profileId", name, type) DO NOTHING;

  RETURN NEW;
END;
$$;
