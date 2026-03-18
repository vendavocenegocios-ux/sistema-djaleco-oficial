
CREATE POLICY "Anon can select cart_recovery_conversations"
ON public.cart_recovery_conversations
FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert cart_recovery_conversations"
ON public.cart_recovery_conversations
FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can update cart_recovery_conversations"
ON public.cart_recovery_conversations
FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Anon can delete cart_recovery_conversations"
ON public.cart_recovery_conversations
FOR DELETE TO anon USING (true);
