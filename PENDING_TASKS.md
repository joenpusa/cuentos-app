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

## Base de Datos (SQL a Ejecutar)

Para que el panel de supervisión de padres funcione, necesitas vincular a los padres con los estudiantes. Ejecuta el siguiente script en el **SQL Editor** de Supabase:

```sql
-- Añadir la columna parent_id para enlazar a un estudiante con su padre/madre
ALTER TABLE public.profiles
ADD COLUMN parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- (Opcional) Índice para optimizar consultas de padres buscando a sus hijos
CREATE INDEX IF NOT EXISTS idx_profiles_parent_id ON public.profiles(parent_id);
```

## Validaciones Manuales a Realizar

1. **Vincular Cuentas:** Ve al "Table Editor" en Supabase, abre la tabla `profiles`. Busca el registro de un estudiante y pega en su columna `parent_id` el UUID de un perfil con rol `padre`.
2. **Dashboard Padre:** Inicia sesión con la cuenta del padre, ve a `/padre/reportes` y verifica que aparezca la lista de sus hijos y puedas ver sus medallas.
3. **Seguridad:** Intenta acceder a los reportes de un niño con una cuenta de otro estudiante o un padre que no le corresponde; debe mostrar error o no dejarte acceder.

