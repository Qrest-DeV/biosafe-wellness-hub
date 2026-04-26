import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(72);
const nameSchema = z.string().trim().min(1, "Name is required").max(100);

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [user, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");
    const ev = emailSchema.safeParse(email);
    const pv = passwordSchema.safeParse(password);
    if (!ev.success) return toast({ title: ev.error.issues[0].message, variant: "destructive" });
    if (!pv.success) return toast({ title: pv.error.issues[0].message, variant: "destructive" });

    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
    toast({ title: "Welcome back" });
    navigate("/dashboard");
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const fullName = String(fd.get("fullName") || "");
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");
    const nv = nameSchema.safeParse(fullName);
    const ev = emailSchema.safeParse(email);
    const pv = passwordSchema.safeParse(password);
    if (!nv.success) return toast({ title: nv.error.issues[0].message, variant: "destructive" });
    if (!ev.success) return toast({ title: ev.error.issues[0].message, variant: "destructive" });
    if (!pv.success) return toast({ title: pv.error.issues[0].message, variant: "destructive" });

    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: fullName },
      },
    });
    setBusy(false);
    if (error) return toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
    toast({ title: "Account created", description: "You're signed in." });
    navigate("/dashboard");
  };

  return (
    <Layout>
      <section className="container-x py-16 md:py-24 max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl md:text-4xl text-teal mb-2">Welcome to BioLife24</h1>
          <p className="text-muted-foreground">Sign in or create your patient account.</p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-peach">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-6">
            <form onSubmit={handleSignIn} className="space-y-4 bg-card border border-border rounded-2xl p-6">
              <div className="space-y-2">
                <Label htmlFor="si-email">Email</Label>
                <Input id="si-email" name="email" type="email" required autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="si-pw">Password</Label>
                <Input id="si-pw" name="password" type="password" required autoComplete="current-password" />
              </div>
              <Button type="submit" disabled={busy} className="w-full rounded-full bg-terracotta hover:bg-terracotta/90 text-primary-foreground">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-6">
            <form onSubmit={handleSignUp} className="space-y-4 bg-card border border-border rounded-2xl p-6">
              <div className="space-y-2">
                <Label htmlFor="su-name">Full name</Label>
                <Input id="su-name" name="fullName" required autoComplete="name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-email">Email</Label>
                <Input id="su-email" name="email" type="email" required autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-pw">Password</Label>
                <Input id="su-pw" name="password" type="password" required minLength={6} autoComplete="new-password" />
              </div>
              <Button type="submit" disabled={busy} className="w-full rounded-full bg-terracotta hover:bg-terracotta/90 text-primary-foreground">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Create account
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/" className="hover:text-teal underline-offset-4 hover:underline">← Back to home</Link>
        </p>
      </section>
    </Layout>
  );
};

export default Auth;
