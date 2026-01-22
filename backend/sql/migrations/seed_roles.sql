DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_email_key') THEN
        ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_email_key UNIQUE (email);
    END IF;
EXCEPTION
    WHEN duplicate_table THEN 
        NULL;
END $$;
INSERT INTO public.user_roles (email, role, status)
VALUES 
    ('admin@slagsand.com', 'admin', 'active'),
    ('executive@slagsand.com', 'executive', 'active'),
    ('staff@slagsand.com', 'staff', 'active')
ON CONFLICT (email) DO UPDATE 
SET role = EXCLUDED.role, status = EXCLUDED.status;
