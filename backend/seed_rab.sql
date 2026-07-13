INSERT IGNORE INTO rabs (id, project_id, version, grand_total, is_active) VALUES 
(1, 1, 1, 0, TRUE);

INSERT IGNORE INTO rab_groups (id, rab_id, name, sort_order) VALUES 
(1, 1, 'PEKERJAAN PERSIAPAN', 1),
(2, 1, 'PEKERJAAN TANAH & PONDASI', 2),
(3, 1, 'PEKERJAAN STRUKTUR', 3);

INSERT IGNORE INTO rab_items (id, group_id, description, volume, unit_id, unit_price, subtotal, margin_percentage, total, sort_order) VALUES 
(1, 1, 'Pembersihan Lahan', 4500, 4, 15000, 67500000, 10.00, 74250000, 1),
(2, 1, 'Pagar Sementara', 200, 2, 250000, 50000000, 10.00, 55000000, 2),
(3, 2, 'Galian Tanah Pondasi', 850, 1, 85000, 72250000, 10.00, 79475000, 1),
(4, 2, 'Pondasi Batu Kali', 350, 1, 750000, 262500000, 12.00, 294000000, 2),
(5, 3, 'Pekerjaan Beton Bertulang', 1200, 1, 4500000, 5400000000, 15.00, 6210000000, 1),
(6, 3, 'Pekerjaan Baja Profil', 85000, 8, 22000, 1870000000, 15.00, 2150500000, 2);

-- Update RAB grand total
UPDATE rabs SET grand_total = (SELECT SUM(rab_items.total) FROM rab_items JOIN rab_groups ON rab_items.group_id = rab_groups.id WHERE rab_groups.rab_id = 1) WHERE id = 1;
