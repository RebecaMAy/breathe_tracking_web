-- Eliminación previa de tablas (para desarrollo)
DROP TABLE IF EXISTS incidencias CASCADE;
DROP TABLE IF EXISTS tipos_incidencias CASCADE;
DROP TABLE IF EXISTS medidas CASCADE;
DROP TABLE IF EXISTS sensores CASCADE;
DROP TABLE IF EXISTS nodos CASCADE;
DROP TABLE IF EXISTS lugares CASCADE;
DROP TABLE IF EXISTS usuario_lugar CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS estados CASCADE;
-- Tabla: roles
CREATE TABLE "roles"(
    "id_rol" BIGINT NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    PRIMARY KEY("id_rol")
);

-- Tabla: estados
CREATE TABLE "estados"(
    "id_estado" INTEGER NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    PRIMARY KEY("id_estado")
);

-- Tabla: tipos_incidencias
CREATE TABLE "tipos_incidencias"(
    "id" INTEGER NOT NULL,
    "descripcion" TEXT NULL,
    PRIMARY KEY("id")
);

-- Tabla: usuarios
CREATE TABLE "usuarios"(
    "id_usuario" SERIAL PRIMARY KEY,
    "Id_Rol" BIGINT NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL UNIQUE,
    "password_hash" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: lugares
CREATE TABLE "lugares"(
    "id_lugar" INTEGER NOT NULL PRIMARY KEY,
    "nombre" VARCHAR(100) NOT NULL,
    "direccion" TEXT NULL,
    "id_usuario" INTEGER NULL
);

-- Tabla: usuario_lugar
CREATE TABLE "usuario_lugar"(
    "id_usuario" INTEGER NOT NULL,
    "id_lugar" INTEGER NOT NULL,
    PRIMARY KEY("id_usuario", "id_lugar")
);

-- Tabla: nodos
CREATE TABLE "nodos"(
    "id_nodo" INTEGER NOT NULL PRIMARY KEY,
    "nombre" VARCHAR(100) NULL,
    "descripcion" TEXT NULL,
    "id_lugar" INTEGER NULL,
    "ubicacion_geografica" VARCHAR(255) NULL,
    "fecha_instalacion" TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "id_estado" INTEGER NULL DEFAULT 1
);

-- Tabla: sensores
CREATE TABLE "sensores"(
    "id_sensor" INTEGER NOT NULL PRIMARY KEY,
    "nombre" VARCHAR(100) NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "unidad" VARCHAR(20) NULL,
    "id_nodo" INTEGER NULL,
    "activo" BOOLEAN NULL DEFAULT TRUE,
    "id_estado" INTEGER NULL DEFAULT 1
);

-- Tabla: medidas
CREATE TABLE "medidas"(
    "id_medida" INTEGER NOT NULL PRIMARY KEY,
    "id_sensor" INTEGER NULL,
    "valor" NUMERIC(10, 3) NOT NULL,
    "fecha_registro" TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "medidas_id_sensor_fecha_registro_index" ON
    "medidas"("id_sensor", "fecha_registro");

-- Tabla: incidencias
CREATE TABLE "incidencias"(
    "id_incidencia" INTEGER NOT NULL PRIMARY KEY,
    "id_tipo" INTEGER NULL,
    "id_nodo" INTEGER NULL,
    "id_sensor" INTEGER NULL,
    "fecha_inicio" TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_cierre" TIMESTAMP WITHOUT TIME ZONE NULL,
    "descripcion" TEXT NULL,
    "estado" VARCHAR(50) NULL DEFAULT 'Abierta'
);

-- Añadir Claves Foráneas

ALTER TABLE
    "usuarios" ADD CONSTRAINT "usuarios_id_rol_foreign" FOREIGN KEY("Id_Rol") REFERENCES "roles"("id_rol");
ALTER TABLE
    "lugares" ADD CONSTRAINT "lugares_id_usuario_foreign" FOREIGN KEY("id_usuario") REFERENCES "usuarios"("id_usuario");

ALTER TABLE
    "nodos" ADD CONSTRAINT "nodos_id_lugar_foreign" FOREIGN KEY("id_lugar") REFERENCES "lugares"("id_lugar");
ALTER TABLE
    "nodos" ADD CONSTRAINT "nodos_id_estado_foreign" FOREIGN KEY("id_estado") REFERENCES "estados"("id_estado");

ALTER TABLE
    "sensores" ADD CONSTRAINT "sensores_id_nodo_foreign" FOREIGN KEY("id_nodo") REFERENCES "nodos"("id_nodo");
ALTER TABLE
    "sensores" ADD CONSTRAINT "sensores_id_estado_foreign" FOREIGN KEY("id_estado") REFERENCES "estados"("id_estado");

ALTER TABLE
    "medidas" ADD CONSTRAINT "medidas_id_sensor_foreign" FOREIGN KEY("id_sensor") REFERENCES "sensores"("id_sensor");

ALTER TABLE
    "incidencias" ADD CONSTRAINT "incidencias_id_tipo_foreign" FOREIGN KEY("id_tipo") REFERENCES "tipos_incidencias"("id");
ALTER TABLE
    "incidencias" ADD CONSTRAINT "incidencias_id_nodo_foreign" FOREIGN KEY("id_nodo") REFERENCES "nodos"("id_nodo");
ALTER TABLE
    "incidencias" ADD CONSTRAINT "incidencias_id_sensor_foreign" FOREIGN KEY("id_sensor") REFERENCES "sensores"("id_sensor");