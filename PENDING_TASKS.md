# Tareas Pendientes

## Dependencias a Instalar

Debido a que el entorno de ejecución actual tiene restringida la ejecución de scripts (`npm`), por favor ejecuta los siguientes comandos manualmente en la raíz del proyecto para instalar las dependencias necesarias para el efecto de celebración (confetti):

```bash
npm install canvas-confetti
npm install -D @types/canvas-confetti
```

## Variables de Entorno

Para el módulo de administración de usuarios, necesitas configurar la clave de servicio de Supabase (`service_role_key`). Esta clave permite bypass de RLS para crear/eliminar usuarios desde el servidor.

1. Ve a tu panel de Supabase -> Project Settings -> API.
2. Copia la `service_role` secret.
3. Agrégala a tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

