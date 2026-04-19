
INSERT INTO storage.buckets (id, name, public) VALUES ('health-records', 'health-records', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can view their own health record files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'health-records' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own health record files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'health-records' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own health record files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'health-records' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own health record files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'health-records' AND auth.uid()::text = (storage.foldername(name))[1]);
