CREATE POLICY "Users can delete their own roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);