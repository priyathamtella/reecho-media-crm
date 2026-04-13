-- ============================================================
-- Reecho Media CRM — Reset All Data (Keep Admin)
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Clear all CRM data tables (order matters for FK safety)
TRUNCATE TABLE
  board_accesses,
  doc_accesses,
  boards,
  documents,
  tasks,
  invoices,
  team_members,
  calendar_events,
  clients
RESTART IDENTITY CASCADE;

-- Remove all NON-admin users (clients/members created by the system)
DELETE FROM users WHERE role != 'admin';

-- Verify: show what remains
SELECT id, name, email, role FROM users;
