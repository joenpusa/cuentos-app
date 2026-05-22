export type UserRole = 'admin' | 'estudiante' | 'padre' | 'director' | 'profesor';

export interface Profile {
  id: string;
  role: UserRole;
  // Añadir otras propiedades que puedan estar en la base de datos
  created_at?: string;
  updated_at?: string;
}
