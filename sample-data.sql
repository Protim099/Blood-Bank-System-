-- Sample data. Dates are relative to "today", so the demo always looks fresh.
-- (Admin user is NOT here: the server creates admin / admin123 on first start.)

INSERT INTO donors (id, name, blood_group, age, gender, phone, address, last_donation_date) VALUES
 (1,  'Rahim Uddin',    'O+',  28, 'Male',   '01711000001', 'Mirpur, Dhaka',       date('now','-10 days')),
 (2,  'Karim Hossain',  'A+',  35, 'Male',   '01711000002', 'Uttara, Dhaka',       date('now','-20 days')),
 (3,  'Nusrat Jahan',   'B+',  26, 'Female', '01711000003', 'Dhanmondi, Dhaka',    date('now','-30 days')),
 (4,  'Sabbir Ahmed',   'AB+', 31, 'Male',   '01711000004', 'Gulshan, Dhaka',      date('now','-100 days')),
 (5,  'Farhana Akter',  'O-',  29, 'Female', '01711000005', 'Mohammadpur, Dhaka', date('now','-5 days')),
 (6,  'Tanvir Islam',   'A-',  40, 'Male',   '01711000006', 'Banani, Dhaka',       date('now','-3 days')),
 (7,  'Mitu Rani',      'B-',  24, 'Female', '01711000007', 'Motijheel, Dhaka',    date('now','-120 days')),
 (8,  'Jahid Hasan',    'AB-', 33, 'Male',   '01711000008', 'Rampura, Dhaka',      date('now','-2 days')),
 (9,  'Sumaiya Khan',   'O+',  27, 'Female', '01711000009', 'Badda, Dhaka',        date('now','-60 days')),
 (10, 'Arif Chowdhury', 'A+',  45, 'Male',   '01711000010', 'Tejgaon, Dhaka',      NULL);

INSERT INTO blood_units (donor_id, blood_group, units_collected, units, collected_on, expires_on) VALUES
 (1, 'O+',  2, 2, date('now','-10 days'),  date('now','+25 days')),
 (2, 'A+',  1, 1, date('now','-20 days'),  date('now','+15 days')),
 (3, 'B+',  1, 1, date('now','-30 days'),  date('now','+5 days')),
 (5, 'O-',  2, 2, date('now','-5 days'),   date('now','+30 days')),
 (6, 'A-',  1, 1, date('now','-3 days'),   date('now','+32 days')),
 (8, 'AB-', 1, 1, date('now','-2 days'),   date('now','+33 days')),
 (9, 'O+',  1, 1, date('now','-60 days'),  date('now','-25 days')),   -- expired
 (4, 'AB+', 1, 0, date('now','-100 days'), date('now','-65 days'));   -- used / expired

INSERT INTO requests (patient_name, hospital, blood_group, units, contact, status, created_at, resolved_at) VALUES
 ('Md. Abdul Karim',  'Dhaka Medical College Hospital', 'O+', 2, '01811000001', 'pending',  datetime('now','-1 hours'), NULL),
 ('Shirin Sultana',   'Square Hospital',                'B+', 1, '01811000002', 'pending',  datetime('now','-3 hours'), NULL),
 ('Rafiqul Islam',    'United Hospital',                'A+', 1, '01811000003', 'approved', datetime('now','-2 days'),  datetime('now','-2 days')),
 ('Nasrin Akter',     'BSMMU',                          'AB+',3, '01811000004', 'rejected', datetime('now','-4 days'),  datetime('now','-4 days'));
