INSERT IGNORE INTO labors (id, position, daily_cost, hourly_cost) VALUES 
(1, 'Pekerja', 95000, 11875), 
(2, 'Mandor', 120000, 15000), 
(3, 'Tukang', 110000, 13750);

INSERT IGNORE INTO equipments (id, code, name, unit_id, hourly_cost) VALUES 
(1, 'EQ-01', 'Cangkul', 3, 5000),
(2, 'EQ-02', 'Excavator', 3, 120000);

INSERT IGNORE INTO ahsps (id, code, name, unit_id, total_cost) VALUES 
(1, '1.1', 'Pekerjaan Galian Tanah Biasa', 1, 85000),
(2, '2.1', 'Pekerjaan Pasangan Bata Merah', 6, 125000);

INSERT IGNORE INTO ahsp_materials (ahsp_id, material_id, coefficient, subtotal) VALUES 
(1, 1, 0.012, 1500);

INSERT IGNORE INTO ahsp_labors (ahsp_id, labor_id, coefficient, subtotal) VALUES 
(1, 1, 0.75, 71250),
(1, 2, 0.025, 3000);

INSERT IGNORE INTO ahsp_equipments (ahsp_id, equipment_id, coefficient, subtotal) VALUES 
(1, 1, 0.5, 2500);

INSERT IGNORE INTO ahsp_materials (ahsp_id, material_id, coefficient, subtotal) VALUES 
(2, 4, 70, 70000),
(2, 2, 0.04, 12000);

INSERT IGNORE INTO ahsp_labors (ahsp_id, labor_id, coefficient, subtotal) VALUES 
(2, 1, 0.3, 28500),
(2, 3, 0.1, 11000),
(2, 2, 0.015, 1800);
