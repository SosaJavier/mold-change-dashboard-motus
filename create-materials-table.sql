IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'configuracion_materiales')
BEGIN
    CREATE TABLE configuracion_materiales (
        id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        molde_id NVARCHAR(50) NULL,
        tiempo_ciclo NVARCHAR(50) NULL,
        descripcion NVARCHAR(MAX) NULL,
        updated_at DATETIME DEFAULT GETDATE()
    );
    INSERT INTO configuracion_materiales (id, molde_id, tiempo_ciclo, descripcion)
    VALUES (1, '', '', '');
    PRINT 'Table configuracion_materiales created successfully.';
END
ELSE
BEGIN
    PRINT 'Table configuracion_materiales already exists.';
END
