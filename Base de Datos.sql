-- ======================================================
-- CREACIÓN DE LA BASE DE DATOS
-- ======================================================
CREATE DATABASE BibliotecaDB;
GO
USE BibliotecaDB;
GO

-- Tabla Autor
CREATE TABLE Autor (
    IdAutor INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(150) NOT NULL,
    Nacionalidad NVARCHAR(100) NOT NULL
);
GO

-- Tabla Libro
CREATE TABLE Libro (
    IdLibro INT IDENTITY(1,1) PRIMARY KEY,
    Titulo NVARCHAR(200) NOT NULL,
    AnioPublicacion INT NOT NULL CHECK (AnioPublicacion > 0),
    Genero NVARCHAR(100) NOT NULL,
    Stock INT NOT NULL DEFAULT 0 CHECK (Stock >= 0),
    IdAutor INT NOT NULL,
    CONSTRAINT FK_Libro_Autor FOREIGN KEY (IdAutor) REFERENCES Autor(IdAutor)
);
GO

-- Tabla Usuario
CREATE TABLE Usuario (
    IdUsuario INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(150) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    Telefono NVARCHAR(30) NOT NULL
);
GO

-- Tabla Prestamo
CREATE TABLE Prestamo (
    IdPrestamo INT IDENTITY(1,1) PRIMARY KEY,
    FechaPrestamo DATE NOT NULL,
    FechaDevolucion DATE NULL, -- NULL indica que aún no se ha devuelto
    IdLibro INT NOT NULL,
    IdUsuario INT NOT NULL,
    Latitud DECIMAL(10,7) NULL,
    Longitud DECIMAL(10,7) NULL,
    CONSTRAINT FK_Prestamo_Libro FOREIGN KEY (IdLibro) REFERENCES Libro(IdLibro),
    CONSTRAINT FK_Prestamo_Usuario FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario),
    CONSTRAINT CHK_Fechas CHECK (FechaDevolucion IS NULL OR FechaDevolucion >= FechaPrestamo)
);
GO

-- ======================================================
-- PROCEDIMIENTOS ALMACENADOS BÁSICOS
-- ======================================================

-- Autor: Listar todos
CREATE OR ALTER PROC sp_Autor_Listar
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Autor ORDER BY IdAutor DESC;
END
GO

-- Autor: Detalle por ID
CREATE OR ALTER PROC sp_Autor_Detalle
    @IdAutor INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Autor WHERE IdAutor = @IdAutor;
END
GO

-- Libro: Listar con nombre del autor e inventario
CREATE OR ALTER PROC sp_Libro_Listar
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        l.IdLibro,
        l.Titulo,
        l.AnioPublicacion,
        l.Genero,
        l.Stock,
        a.Nombre AS Autor,
        a.Nacionalidad
    FROM Libro l
    INNER JOIN Autor a ON a.IdAutor = l.IdAutor
    ORDER BY l.IdLibro DESC;
END
GO

-- Libro: Detalle por ID
CREATE OR ALTER PROC sp_Libro_Detalle
    @IdLibro INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        l.IdLibro,
        l.Titulo,
        l.AnioPublicacion,
        l.Genero,
        l.Stock,
        l.IdAutor,
        a.Nombre AS Autor,
        a.Nacionalidad
    FROM Libro l
    INNER JOIN Autor a ON a.IdAutor = l.IdAutor
    WHERE l.IdLibro = @IdLibro;
END
GO

-- Usuario: Listar todos
CREATE OR ALTER PROC sp_Usuario_Listar
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Usuario ORDER BY IdUsuario DESC;
END
GO

-- Usuario: Detalle por ID
CREATE OR ALTER PROC sp_Usuario_Detalle
    @IdUsuario INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Usuario WHERE IdUsuario = @IdUsuario;
END
GO

-- Préstamo: Listar con información completa
CREATE OR ALTER PROC sp_Prestamo_Listar
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        p.IdPrestamo,
        p.FechaPrestamo,
        p.FechaDevolucion,
        p.Latitud,
        p.Longitud,
        l.Titulo AS Libro,
        u.Nombre AS Usuario,
        u.Email
    FROM Prestamo p
    INNER JOIN Libro l ON l.IdLibro = p.IdLibro
    INNER JOIN Usuario u ON u.IdUsuario = p.IdUsuario
    ORDER BY p.IdPrestamo DESC;
END
GO

-- Préstamo: Detalle por ID
CREATE OR ALTER PROC sp_Prestamo_Detalle
    @IdPrestamo INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        p.IdPrestamo,
        p.FechaPrestamo,
        p.FechaDevolucion,
        p.Latitud,
        p.Longitud,
        l.IdLibro,
        l.Titulo AS Libro,
        l.AnioPublicacion,
        l.Genero,
        l.Stock,
        a.Nombre AS Autor,
        u.IdUsuario,
        u.Nombre AS Usuario,
        u.Email,
        u.Telefono
    FROM Prestamo p
    INNER JOIN Libro l ON l.IdLibro = p.IdLibro
    INNER JOIN Autor a ON a.IdAutor = l.IdAutor
    INNER JOIN Usuario u ON u.IdUsuario = p.IdUsuario
    WHERE p.IdPrestamo = @IdPrestamo;
END
GO

-- ======================================================
-- INSERTAR DATOS DE PRUEBA (2 REGISTROS POR TABLA)
-- ======================================================

-- Autores
INSERT INTO Autor (Nombre, Nacionalidad)
VALUES
    ('Gabriel García Márquez', 'Colombiana'),
    ('Isabel Allende', 'Chilena');
GO

-- Libros (asociados a los autores anteriores)
INSERT INTO Libro (Titulo, AnioPublicacion, Genero, Stock, IdAutor)
VALUES
    ('Cien años de soledad', 1967, 'Realismo mágico', 10, 1),
    ('La casa de los espíritus', 1982, 'Novela', 5, 2);
GO

-- Usuarios
INSERT INTO Usuario (Nombre, Email, Telefono)
VALUES
    ('Pedro Rodríguez', 'pedro.rodriguez@email.com', '3251-0079'),
    ('María López', 'maria.lopez@email.com', '9854-1490');
GO

-- Préstamos (uno por libro, a diferentes usuarios)
INSERT INTO Prestamo (FechaPrestamo, FechaDevolucion, IdLibro, IdUsuario, Latitud, Longitud)
VALUES
    (GETDATE(), NULL, 1, 1, 14.0722750, -87.1921360),  -- Prestado hoy, aún no devuelto
    (DATEADD(day, -5, GETDATE()), DATEADD(day, -2, GETDATE()), 2, 2, NULL, NULL); -- Devuelto hace 2 días
GO

-- ======================================================
-- VERIFICACIÓN PARA VER SI LAS TABLAS TIENEN LA INFORMACION CORRECTA
-- ======================================================
SELECT 'Autor' AS Tabla, * FROM Autor;
SELECT 'Libro' AS Tabla, * FROM Libro;
SELECT 'Usuario' AS Tabla, * FROM Usuario;
SELECT 'Prestamo' AS Tabla, * FROM Prestamo;
GO
