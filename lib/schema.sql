CREATE TABLE IF NOT EXISTS cambios_moldes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    linea VARCHAR(20) NOT NULL,
    molde_anterior VARCHAR(50) NOT NULL,
    molde_nuevo VARCHAR(50) NOT NULL,
    supervisor VARCHAR(100) NOT NULL,
    turno VARCHAR(50) NOT NULL,
    motivo VARCHAR(100) NOT NULL,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP,
    tiempo_muerto INT DEFAULT 0,
    estado ENUM('completado', 'en_proceso', 'pendiente') NOT NULL,
    retraso_motivo VARCHAR(255),
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
