INSERT INTO roles (id_rol, nombre)
VALUES
(1, 'Administrador'),
(2, 'Usuario');

-- Usuarios con roles distintos
INSERT INTO "usuarios" ("Id_Rol", "nombre", "email", "password_hash")
VALUES
((SELECT "id_rol" FROM "roles" WHERE "nombre" = 'Administrador'), 'Ana López', 'ana.lopez@example.com', 'hash_ana'),
((SELECT "id_rol" FROM "roles" WHERE "nombre" = 'Usuario'), 'Lucía Gómez', 'lucia.gomez@example.com', 'hash_lucia');