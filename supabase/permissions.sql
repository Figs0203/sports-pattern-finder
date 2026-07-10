-- Conceder permisos de uso del esquema público
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Dar permiso de lectura (SELECT) a todos los usuarios para la interfaz web
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Dar todos los permisos (INSERT, UPDATE, DELETE) al rol de servicio para la sincronización
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
