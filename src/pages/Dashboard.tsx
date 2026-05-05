import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, BadgeCheck, Droplet, Calendar, Weight, Ruler, Phone,
  Pill, FlaskConical, Stethoscope, Plus, Upload, Loader2, X, MessageCircleHeart, LogOut, Crown, Sparkles,
  Download, Trash2, FileText, FileImage, AlertCircle
} from "lucide-react";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const formatBytes = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

type Profile = {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  phone: string | null;
  verified_patient: boolean;
  blood_type: string | null;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  allergies: string[];
  chronic_conditions: string[];
  subscription_plan: "none" | "essential" | "family";
  subscription_started_at: string | null;
};

type Prescription = { id: string; name: string; dosage: string | null; frequency: string | null; refill_date: string | null; notes: string | null; active: boolean; };
type LabResult = { id: string; title: string; result_date: string | null; file_path: string | null; notes: string | null; };
type Consultation = { id: string; doctor_name: string | null; specialty: string | null; consultation_date: string; summary: string | null; };

const PLAN_DETAILS: Record<"essential" | "family", { name: string; price: string; perks: string[] }> = {
  essential: {
    name: "BioLife Essential",
    price: "₦12,500/mo",
    perks: [
      "Monthly delivery of your prescriptions",
      "Free same-day delivery in Lagos",
      "2 telehealth consultations / month",
      "Priority refill reminders",
      "10% off all skincare & wellness",
    ],
  },
  family: {
    name: "BioLife Family",
    price: "₦24,900/mo",
    perks: [
      "Coverage for up to 4 family members",
      "Unlimited telehealth consultations",
      "Quarterly health check-ins",
      "Free annual lab screening",
      "20% off all skincare & wellness",
    ],
  },
};

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rx, setRx] = useState<Prescription[]>([]);
  const [labs, setLabs] = useState<LabResult[]>([]);
  const [consults, setConsults] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [rxOpen, setRxOpen] = useState(false);
  const [labOpen, setLabOpen] = useState(false);
  const [consultOpen, setConsultOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) return "Only PDF, JPG, PNG or WEBP files are allowed.";
    if (file.size > MAX_FILE_BYTES) return `File is too large (${formatBytes(file.size)}). Max 10 MB.`;
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileError(null);
    if (!file) { setSelectedFile(null); return; }
    const err = validateFile(file);
    if (err) { setFileError(err); setSelectedFile(null); if (fileRef.current) fileRef.current.value = ""; return; }
    setSelectedFile(file);
  };

  const resetLabForm = () => {
    setSelectedFile(null);
    setFileError(null);
    setUploadProgress(0);
    if (fileRef.current) fileRef.current.value = "";
  };

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const [p, r, l, c] = await Promise.all([
          supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
          supabase.from("prescriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("lab_results").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("consultations").select("*").eq("user_id", user.id).order("consultation_date", { ascending: false }),
        ]);

        let profileRow = p.data as Profile | null;
        if (p.error) console.error("[dashboard] profile fetch error:", p.error);

        // Auto-create profile if missing (e.g. user created before trigger existed)
        if (!profileRow && !p.error) {
          const fallbackUsername = user.email?.split("@")[0] ?? null;
          const { data: created, error: createErr } = await supabase
            .from("profiles")
            .insert({
              user_id: user.id,
              full_name: (user.user_metadata?.full_name as string) ?? "",
              username: (user.user_metadata?.username as string) ?? fallbackUsername,
            })
            .select()
            .single();
          if (createErr) {
            console.error("[dashboard] profile auto-create failed:", createErr);
            toast({ title: "Couldn't load your profile", description: createErr.message, variant: "destructive" });
          } else {
            profileRow = created as Profile;
          }
        }

        if (profileRow) setProfile(profileRow);
        if (r.data) setRx(r.data as Prescription[]);
        if (l.data) setLabs(l.data as LabResult[]);
        if (c.data) setConsults(c.data as Consultation[]);
      } catch (err) {
        console.error("[dashboard] unexpected load error:", err);
        toast({ title: "Failed to load dashboard", description: String(err), variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // ---------- Profile updates ----------
  const updateProfile = async (patch: Partial<Profile>) => {
    if (!profile || !user) return;
    const { data, error } = await supabase
      .from("profiles")
      .update(patch as never)
      .eq("user_id", user.id)
      .select()
      .single();
    if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
    setProfile(data as Profile);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const allergies = String(fd.get("allergies") || "").split(",").map(s => s.trim()).filter(Boolean);
    const conditions = String(fd.get("conditions") || "").split(",").map(s => s.trim()).filter(Boolean);
    await updateProfile({
      full_name: String(fd.get("full_name") || "") || null,
      username: String(fd.get("username") || "") || null,
      phone: String(fd.get("phone") || "") || null,
      blood_type: String(fd.get("blood_type") || "") || null,
      age: fd.get("age") ? Number(fd.get("age")) : null,
      weight_kg: fd.get("weight_kg") ? Number(fd.get("weight_kg")) : null,
      height_cm: fd.get("height_cm") ? Number(fd.get("height_cm")) : null,
      allergies,
      chronic_conditions: conditions,
    });
    toast({ title: "Profile updated" });
    setEditOpen(false);
  };

  // ---------- Subscription toggle ----------
  const toggleSubscription = async (subscribed: boolean) => {
    await updateProfile({
      subscription_plan: subscribed ? "essential" : "none",
      subscription_started_at: subscribed ? new Date().toISOString() : null,
    });
  };
  const switchPlan = async (plan: "essential" | "family") => {
    await updateProfile({ subscription_plan: plan, subscription_started_at: new Date().toISOString() });
    toast({ title: `Switched to ${PLAN_DETAILS[plan].name}` });
  };

  // ---------- Add records ----------
  const addRx = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    const { data, error } = await supabase.from("prescriptions").insert({
      user_id: user.id,
      name: String(fd.get("name") || ""),
      dosage: String(fd.get("dosage") || "") || null,
      frequency: String(fd.get("frequency") || "") || null,
      refill_date: String(fd.get("refill_date") || "") || null,
      notes: String(fd.get("notes") || "") || null,
    }).select().single();
    if (error) return toast({ title: "Failed to add", description: error.message, variant: "destructive" });
    setRx([data as Prescription, ...rx]);
    setRxOpen(false);
    toast({ title: "Prescription added" });
  };
  const deleteRx = async (id: string) => {
    await supabase.from("prescriptions").delete().eq("id", id);
    setRx(rx.filter(r => r.id !== id));
  };

  const addLab = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    const file = selectedFile;
    let file_path: string | null = null;
    setUploading(true);
    setUploadProgress(0);
    if (file) {
      const err = validateFile(file);
      if (err) { setUploading(false); setFileError(err); return; }
      // Simulated progress (Supabase JS SDK doesn't expose upload progress events)
      const progressTimer = setInterval(() => {
        setUploadProgress(p => (p < 90 ? p + 10 : p));
      }, 150);
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage
        .from("medical-files")
        .upload(path, file, { contentType: file.type, upsert: false });
      clearInterval(progressTimer);
      if (upErr) {
        setUploading(false);
        setUploadProgress(0);
        return toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
      }
      setUploadProgress(100);
      file_path = path;
    }
    const { data, error } = await supabase.from("lab_results").insert({
      user_id: user.id,
      title: String(fd.get("title") || ""),
      result_date: String(fd.get("result_date") || "") || null,
      file_path,
      notes: String(fd.get("notes") || "") || null,
    }).select().single();
    setUploading(false);
    if (error) return toast({ title: "Failed to add", description: error.message, variant: "destructive" });
    setLabs([data as LabResult, ...labs]);
    setLabOpen(false);
    resetLabForm();
    toast({ title: "Lab result saved" });
  };
  const deleteLab = async (id: string, file_path: string | null) => {
    if (file_path) await supabase.storage.from("medical-files").remove([file_path]);
    await supabase.from("lab_results").delete().eq("id", id);
    setLabs(labs.filter(l => l.id !== id));
    toast({ title: "Lab result deleted" });
  };
  const openLabFile = async (file_path: string) => {
    const { data, error } = await supabase.storage.from("medical-files").createSignedUrl(file_path, 60);
    if (error || !data?.signedUrl) return toast({ title: "Could not open file", variant: "destructive" });
    window.open(data.signedUrl, "_blank");
  };
  const downloadLabFile = async (file_path: string, title: string) => {
    const { data, error } = await supabase.storage.from("medical-files").download(file_path);
    if (error || !data) return toast({ title: "Download failed", description: error?.message, variant: "destructive" });
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    const ext = file_path.split(".").pop() || "";
    a.download = `${title}${ext ? "." + ext : ""}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const addConsult = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    const { data, error } = await supabase.from("consultations").insert({
      user_id: user.id,
      doctor_name: String(fd.get("doctor_name") || "") || null,
      specialty: String(fd.get("specialty") || "") || null,
      consultation_date: String(fd.get("consultation_date") || "") || new Date().toISOString(),
      summary: String(fd.get("summary") || "") || null,
    }).select().single();
    if (error) return toast({ title: "Failed to add", description: error.message, variant: "destructive" });
    setConsults([data as Consultation, ...consults]);
    setConsultOpen(false);
    toast({ title: "Consultation logged" });
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container-x py-24 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="container-x py-24 max-w-md mx-auto text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-terracotta mx-auto" />
          <h2 className="text-2xl text-teal">We couldn't load your profile</h2>
          <p className="text-teal/70">Please try refreshing the page. If the issue persists, sign out and back in.</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.reload()} className="rounded-full">Refresh</Button>
            <Button variant="outline" onClick={async () => { await signOut(); navigate("/auth"); }} className="rounded-full">Sign out</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const initials = (profile.full_name || profile.username || user?.email || "U")
    .split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();
  const subscribed = profile.subscription_plan !== "none";
  const currentPlan = subscribed ? PLAN_DETAILS[profile.subscription_plan as "essential" | "family"] : null;

  return (
    <Layout>
      <section className="container-x py-8 md:py-12 max-w-6xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <Button asChild variant="ghost" className="text-teal hover:bg-peach gap-2 -ml-3">
            <Link to="/"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link>
          </Button>
          <Button onClick={async () => { await signOut(); navigate("/"); }} variant="outline" className="rounded-full gap-2">
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>

        {/* Header card */}
        <div className="rounded-3xl bg-gradient-to-br from-teal to-teal-soft text-primary-foreground p-6 md:p-8 mb-6">
          <div className="flex items-start gap-5 flex-wrap">
            <Avatar className="h-20 w-20 bg-peach text-teal text-2xl">
              <AvatarFallback className="bg-peach text-teal font-display">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl md:text-3xl">{profile.full_name || profile.username || "Patient"}</h1>
                {profile.verified_patient && (
                  <Badge className="bg-peach text-teal hover:bg-peach gap-1 border-0">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified patient
                  </Badge>
                )}
              </div>
              <p className="text-primary-foreground/80 text-sm mt-1">@{profile.username || "username"} · {user?.email}</p>
              <div className="mt-4 flex gap-2 flex-wrap">
                <Button onClick={() => setEditOpen(true)} size="sm" className="rounded-full bg-terracotta hover:bg-terracotta/90 text-primary-foreground">
                  Edit profile
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-full bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <Link to="/services"><MessageCircleHeart className="h-4 w-4" /> Telehealth</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <StatCard icon={<Droplet className="h-5 w-5" />} label="Blood type" value={profile.blood_type || "—"} />
          <StatCard icon={<Calendar className="h-5 w-5" />} label="Age" value={profile.age ? `${profile.age} yrs` : "—"} />
          <StatCard icon={<Weight className="h-5 w-5" />} label="Weight" value={profile.weight_kg ? `${profile.weight_kg} kg` : "—"} />
          <StatCard icon={<Ruler className="h-5 w-5" />} label="Height" value={profile.height_cm ? `${profile.height_cm} cm` : "—"} />
        </div>

        {/* Subscription card */}
        <div className="rounded-3xl border border-border bg-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-peach text-terracotta flex items-center justify-center">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl text-teal">Subscription</h2>
                <p className="text-sm text-muted-foreground">Toggle to preview both states</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{subscribed ? "Subscribed" : "Not subscribed"}</span>
              <Switch checked={subscribed} onCheckedChange={toggleSubscription} />
            </div>
          </div>

          {subscribed && currentPlan ? (
            <div className="rounded-2xl bg-gradient-to-br from-peach/60 to-peach/30 p-5 border border-peach">
              <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-terracotta" />
                    <span className="text-xs uppercase tracking-wider font-semibold text-terracotta">Active plan</span>
                  </div>
                  <h3 className="font-display text-2xl text-teal mt-1">{currentPlan.name}</h3>
                  <p className="text-sm text-teal/70">{currentPlan.price}</p>
                </div>
                <div className="flex gap-2">
                  {(["essential", "family"] as const).map(p => (
                    <Button
                      key={p}
                      size="sm"
                      variant={profile.subscription_plan === p ? "default" : "outline"}
                      onClick={() => switchPlan(p)}
                      className={profile.subscription_plan === p ? "rounded-full bg-teal hover:bg-teal/90 text-primary-foreground" : "rounded-full"}
                    >
                      {PLAN_DETAILS[p].name.replace("BioLife ", "")}
                    </Button>
                  ))}
                </div>
              </div>
              <ul className="grid sm:grid-cols-2 gap-2">
                {currentPlan.perks.map(perk => (
                  <li key={perk} className="flex items-start gap-2 text-sm text-teal">
                    <span className="h-1.5 w-1.5 rounded-full bg-terracotta mt-2 shrink-0" />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-2xl bg-muted/40 border border-dashed border-border p-6 text-center">
              <p className="text-muted-foreground mb-4">You don't have an active plan yet. Subscribe to unlock free delivery, telehealth, and member discounts.</p>
              <div className="flex gap-2 justify-center flex-wrap">
                <Button onClick={() => switchPlan("essential")} className="rounded-full bg-terracotta hover:bg-terracotta/90 text-primary-foreground">
                  Start Essential
                </Button>
                <Button onClick={() => switchPlan("family")} variant="outline" className="rounded-full">
                  Start Family
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Health flags */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <FlagCard
            title="Allergies"
            items={profile.allergies}
            tone="red"
            empty="No allergies recorded"
          />
          <FlagCard
            title="Chronic conditions"
            items={profile.chronic_conditions}
            tone="blue"
            empty="No chronic conditions recorded"
          />
        </div>

        {/* Records tabs */}
        <div className="rounded-3xl border border-border bg-card p-4 md:p-6">
          <Tabs defaultValue="rx">
            <TabsList className="bg-peach">
              <TabsTrigger value="rx" className="gap-2"><Pill className="h-4 w-4" /> Prescriptions</TabsTrigger>
              <TabsTrigger value="labs" className="gap-2"><FlaskConical className="h-4 w-4" /> Lab results</TabsTrigger>
              <TabsTrigger value="consults" className="gap-2"><Stethoscope className="h-4 w-4" /> Consultations</TabsTrigger>
            </TabsList>

            <TabsContent value="rx" className="mt-4">
              <SectionHeader title="Active prescriptions" onAdd={() => setRxOpen(true)} addLabel="Add prescription" />
              {rx.length === 0 ? (
                <EmptyState icon={<Pill className="h-8 w-8" />} text="Your prescriptions will appear here once you add your first medication." />
              ) : (
                <ul className="space-y-3">
                  {rx.map(r => (
                    <li key={r.id} className="rounded-xl border border-border p-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-teal">{r.name}</p>
                        <p className="text-sm text-muted-foreground">{[r.dosage, r.frequency].filter(Boolean).join(" · ") || "—"}</p>
                        {r.refill_date && <p className="text-xs text-terracotta mt-1">Refill by {new Date(r.refill_date).toLocaleDateString()}</p>}
                        {r.notes && <p className="text-sm text-muted-foreground mt-1">{r.notes}</p>}
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => deleteRx(r.id)}><X className="h-4 w-4" /></Button>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="labs" className="mt-4">
              <SectionHeader title="Lab results" onAdd={() => setLabOpen(true)} addLabel="Upload lab" />
              {labs.length === 0 ? (
                <EmptyState icon={<FlaskConical className="h-8 w-8" />} text="Your lab results will appear here once you upload your first report." />
              ) : (
                <ul className="space-y-3">
                  {labs.map(l => {
                    const isPdf = l.file_path?.toLowerCase().endsWith(".pdf");
                    const FileIcon = isPdf ? FileText : FileImage;
                    return (
                      <li key={l.id} className="rounded-xl border border-border p-4 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex items-start gap-3 flex-1">
                          {l.file_path && (
                            <div className="h-10 w-10 rounded-lg bg-peach text-teal flex items-center justify-center shrink-0">
                              <FileIcon className="h-5 w-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-teal truncate">{l.title}</p>
                            {l.result_date && <p className="text-xs text-muted-foreground">{new Date(l.result_date).toLocaleDateString()}</p>}
                            {l.notes && <p className="text-sm text-muted-foreground mt-1">{l.notes}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {l.file_path && (
                            <>
                              <Button size="icon" variant="ghost" title="View" onClick={() => openLabFile(l.file_path!)}>
                                <Upload className="h-4 w-4 rotate-180" />
                              </Button>
                              <Button size="icon" variant="ghost" title="Download" onClick={() => downloadLabFile(l.file_path!, l.title)}>
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button size="icon" variant="ghost" title="Delete" onClick={() => deleteLab(l.id, l.file_path)}>
                            <Trash2 className="h-4 w-4 text-terracotta" />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="consults" className="mt-4">
              <SectionHeader title="Past consultations" onAdd={() => setConsultOpen(true)} addLabel="Log consultation" />
              {consults.length === 0 ? (
                <EmptyState
                  icon={<Stethoscope className="h-8 w-8" />}
                  text="Your medical history will appear here once you start your first chat with a BioLife professional."
                  cta={<Button asChild size="sm" className="rounded-full bg-terracotta hover:bg-terracotta/90 text-primary-foreground">
                    <Link to="/services">Start a consultation</Link>
                  </Button>}
                />
              ) : (
                <ul className="space-y-3">
                  {consults.map(c => (
                    <li key={c.id} className="rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-semibold text-teal">{c.doctor_name || "Unnamed clinician"} {c.specialty && <span className="font-normal text-muted-foreground">· {c.specialty}</span>}</p>
                        <span className="text-xs text-muted-foreground">{new Date(c.consultation_date).toLocaleDateString()}</span>
                      </div>
                      {c.summary && <p className="text-sm text-muted-foreground mt-1">{c.summary}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Edit profile dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit profile & health info</DialogTitle></DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-3">
            <Field label="Full name" name="full_name" defaultValue={profile.full_name || ""} />
            <Field label="Username" name="username" defaultValue={profile.username || ""} />
            <Field label="Phone" name="phone" defaultValue={profile.phone || ""} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Blood type" name="blood_type" defaultValue={profile.blood_type || ""} placeholder="e.g. O+" />
              <Field label="Age" name="age" type="number" defaultValue={profile.age?.toString() || ""} />
              <Field label="Weight (kg)" name="weight_kg" type="number" step="0.1" defaultValue={profile.weight_kg?.toString() || ""} />
              <Field label="Height (cm)" name="height_cm" type="number" step="0.1" defaultValue={profile.height_cm?.toString() || ""} />
            </div>
            <div className="space-y-1.5">
              <Label>Allergies (comma-separated)</Label>
              <Textarea name="allergies" defaultValue={profile.allergies.join(", ")} placeholder="Penicillin, peanuts" />
            </div>
            <div className="space-y-1.5">
              <Label>Chronic conditions (comma-separated)</Label>
              <Textarea name="conditions" defaultValue={profile.chronic_conditions.join(", ")} placeholder="Hypertension, asthma" />
            </div>
            <DialogFooter>
              <Button type="submit" className="rounded-full bg-terracotta hover:bg-terracotta/90 text-primary-foreground">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Rx */}
      <Dialog open={rxOpen} onOpenChange={setRxOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add prescription</DialogTitle></DialogHeader>
          <form onSubmit={addRx} className="space-y-3">
            <Field label="Medication name" name="name" required />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Dosage" name="dosage" placeholder="500 mg" />
              <Field label="Frequency" name="frequency" placeholder="Twice daily" />
            </div>
            <Field label="Refill date" name="refill_date" type="date" />
            <div className="space-y-1.5"><Label>Notes</Label><Textarea name="notes" /></div>
            <DialogFooter><Button type="submit" className="rounded-full bg-terracotta hover:bg-terracotta/90 text-primary-foreground">Add</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Lab */}
      <Dialog open={labOpen} onOpenChange={(o) => { setLabOpen(o); if (!o) resetLabForm(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload lab result</DialogTitle></DialogHeader>
          <form onSubmit={addLab} className="space-y-3">
            <Field label="Title" name="title" required placeholder="Full Blood Count" />
            <Field label="Result date" name="result_date" type="date" />
            <div className="space-y-1.5">
              <Label htmlFor="lab-file">Attachment (PDF, JPG, PNG, WEBP · max 10 MB)</Label>
              <Input id="lab-file" ref={fileRef} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={handleFileChange} />
              {selectedFile && !fileError && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground rounded-md bg-muted/40 px-3 py-2">
                  {selectedFile.type === "application/pdf" ? <FileText className="h-4 w-4 text-teal" /> : <FileImage className="h-4 w-4 text-teal" />}
                  <span className="truncate flex-1">{selectedFile.name}</span>
                  <span className="text-xs shrink-0">{formatBytes(selectedFile.size)}</span>
                </div>
              )}
              {fileError && (
                <div className="flex items-start gap-2 text-sm text-terracotta rounded-md bg-terracotta/10 px-3 py-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}
              {uploading && selectedFile && (
                <div className="space-y-1">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">{uploadProgress}%</p>
                </div>
              )}
            </div>
            <div className="space-y-1.5"><Label>Notes</Label><Textarea name="notes" /></div>
            <DialogFooter>
              <Button type="submit" disabled={uploading || !!fileError} className="rounded-full bg-terracotta hover:bg-terracotta/90 text-primary-foreground gap-2">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Consultation */}
      <Dialog open={consultOpen} onOpenChange={setConsultOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log consultation</DialogTitle></DialogHeader>
          <form onSubmit={addConsult} className="space-y-3">
            <Field label="Doctor" name="doctor_name" placeholder="Dr. Adebayo" />
            <Field label="Specialty" name="specialty" placeholder="Dermatology" />
            <Field label="Date" name="consultation_date" type="datetime-local" />
            <div className="space-y-1.5"><Label>Summary</Label><Textarea name="summary" /></div>
            <DialogFooter><Button type="submit" className="rounded-full bg-terracotta hover:bg-terracotta/90 text-primary-foreground">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-2xl bg-card border border-border p-4">
    <div className="flex items-center gap-2 text-teal mb-2">{icon}<span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span></div>
    <p className="font-display text-xl text-teal">{value}</p>
  </div>
);

const FlagCard = ({ title, items, tone, empty }: { title: string; items: string[]; tone: "red" | "blue"; empty: string }) => {
  const styles = tone === "red"
    ? "bg-terracotta/10 border-terracotta/30 text-terracotta"
    : "bg-teal/10 border-teal/30 text-teal";
  return (
    <div className={`rounded-2xl border p-5 ${styles}`}>
      <h3 className="font-display text-lg mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm opacity-70">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map(item => (
            <span key={item} className={`text-xs font-medium px-3 py-1.5 rounded-full ${tone === "red" ? "bg-terracotta text-primary-foreground" : "bg-teal text-primary-foreground"}`}>
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const SectionHeader = ({ title, onAdd, addLabel }: { title: string; onAdd: () => void; addLabel: string }) => (
  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
    <h3 className="font-display text-lg text-teal">{title}</h3>
    <Button size="sm" onClick={onAdd} className="rounded-full bg-teal hover:bg-teal/90 text-primary-foreground gap-1"><Plus className="h-4 w-4" /> {addLabel}</Button>
  </div>
);

const EmptyState = ({ icon, text, cta }: { icon: React.ReactNode; text: string; cta?: React.ReactNode }) => (
  <div className="rounded-2xl border border-dashed border-border p-8 text-center">
    <div className="mx-auto h-16 w-16 rounded-full bg-peach text-teal flex items-center justify-center mb-3">{icon}</div>
    <p className="text-muted-foreground mb-4 max-w-sm mx-auto">{text}</p>
    {cta}
  </div>
);

const Field = ({ label, name, type = "text", ...rest }: { label: string; name: string; type?: string; [k: string]: unknown }) => (
  <div className="space-y-1.5">
    <Label htmlFor={name}>{label}</Label>
    <Input id={name} name={name} type={type} {...rest} />
  </div>
);

export default Dashboard;
