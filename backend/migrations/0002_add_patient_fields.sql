-- Migration: Add extra demographic fields to patients table
ALTER TABLE patients ADD COLUMN dni TEXT;
ALTER TABLE patients ADD COLUMN address TEXT;
ALTER TABLE patients ADD COLUMN locality TEXT;
ALTER TABLE patients ADD COLUMN occupation TEXT;
ALTER TABLE patients ADD COLUMN civil_status TEXT;
