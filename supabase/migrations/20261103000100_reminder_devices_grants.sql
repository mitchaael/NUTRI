-- Este proyecto no otorga privilegios por defecto a tablas nuevas.
-- Solo la Edge Function send-reminders (service_role) lee y actualiza reminder_devices;
-- anon/authenticated pasan únicamente por las funciones security definer.
grant select, update, delete on public.reminder_devices to service_role;
