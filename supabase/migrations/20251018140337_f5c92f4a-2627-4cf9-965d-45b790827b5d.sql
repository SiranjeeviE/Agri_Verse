-- Add grain category to crop_category enum
ALTER TYPE crop_category ADD VALUE IF NOT EXISTS 'grain';