-- EDIT THIS FILE with your real details, then reset the DB (see README)
INSERT INTO profile (full_name, nickname, student_group, email, university, city, bio) VALUES
('Daria Gladkykh', 'Hope', '1231EB', 'your.email@stud.fils.upb.ro',
 'FILS, National University of Science and Technology POLITEHNICA Bucharest', 'Bucharest',
 'Computer Science student who likes building things that sit between hardware and software: digital twins, wearables and signal processing. Active member of BEST Bucharest and private English tutor on the side.');

INSERT INTO skills (name, category, level) VALUES
('Python',                    'Languages',   5),
('Rust',                      'Languages',   3),
('JavaScript',                'Languages',   3),
('SQL / PostgreSQL',          'Data',        3),
('SQLite',                    'Data',        4),
('XGBoost / ML basics',       'Data',        3),
('Raspberry Pi Pico 2 W',     'Embedded',    4),
('Digital signal processing', 'Embedded',    3),
('Kivy / KivyMD',             'Apps',        4),
('HTML & CSS',                'Web',         4),
('Node.js / Express',         'Web',         3),
('Git',                       'Tools',       4),
('English (teaching)',        'Soft skills', 5),
('Teamwork & events (BEST)',  'Soft skills', 5);

INSERT INTO projects (name, description, tech) VALUES
('SmartStation', 'Bachelor thesis: Rust vs Python digital twin signal processing on a Pico 2 W.', ARRAY['Rust','Python','Raspberry Pi Pico 2 W','Digital signal processing']),
('SmartRho', 'Digital twin of a room at DTU Lyngby, built at the DTU Summer School 2026.', ARRAY['Python','Digital signal processing']),
('Emendatio', 'Android app for tracking personal growth.', ARRAY['Python','Kivy / KivyMD','SQLite']),
('Wearable health monitor', 'Bangle.js 2 wearable with an XGBoost model for early detection of heart sclerosis.', ARRAY['JavaScript','Python','XGBoost / ML basics']),
('This portfolio', 'Static frontend + REST API + PostgreSQL, deployed to the cloud.', ARRAY['HTML & CSS','JavaScript','Node.js / Express','SQL / PostgreSQL','Git']);
