import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { logAudit } from "@/lib/auditLog";

type Settings = Record<string, any>;

const SettingField = ({ section, settings, setSettings, k, label, type = "text", placeholder }: { section: string; settings: Settings; setSettings: (s: Settings) => void; k: string; label: string; type?: string; placeholder?: string }) => {
  const path = `${section}.${k}`;
  const value = settings[section]?.[k] ?? "";
  return (
    <div>
      <Label>{label}</Label>
      {type === "textarea"
        ? <Textarea rows={3} value={value} onChange={(e) => setSettings({ ...settings, [section]: { ...(settings[section] ?? {}), [k]: e.target.value } })} placeholder={placeholder} />
        : <Input type={type} value={value} onChange={(e) => setSettings({ ...settings, [section]: { ...(settings[section] ?? {}), [k]: e.target.value } })} placeholder={placeholder} />}
    </div>
  );
};

const AdminSettings = () => {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("store_settings").select("*");
      const map: Settings = {};
      (data ?? []).forEach((row: any) => { map[row.key] = row.value; });
      setSettings(map);
      setLoading(false);
    })();
  }, []);

  const saveSection = async (section: string) => {
    const value = settings[section] ?? {};
    const { error } = await supabase.from("store_settings").upsert({ key: section, value });
    if (error) return toast.error(error.message);
    await logAudit("update", "store_settings", section, null, value);
    toast.success("Saved");
  };

  if (loading) return <AdminLayout><div className="text-center py-12 text-muted-foreground">Loading…</div></AdminLayout>;

  return (
    <AdminLayout>
      <h1 className="text-3xl text-teal mb-2">Settings</h1>
      <p className="text-teal/70 mb-6">Configure how the store works.</p>

      <Tabs defaultValue="store">
        <TabsList className="mb-6">
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="shipping">Shipping & Tax</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <div className="card-soft p-6 space-y-4 max-w-xl">
            <SettingField section="store" k="name" label="Store name" settings={settings} setSettings={setSettings} placeholder="BioLife24" />
            <SettingField section="store" k="email" label="Contact email" settings={settings} setSettings={setSettings} type="email" />
            <SettingField section="store" k="phone" label="Contact phone" settings={settings} setSettings={setSettings} />
            <SettingField section="store" k="address" label="Address" settings={settings} setSettings={setSettings} type="textarea" />
            <Button onClick={() => saveSection("store")} className="bg-terracotta hover:bg-terracotta-deep">Save store info</Button>
          </div>
        </TabsContent>

        <TabsContent value="shipping">
          <div className="card-soft p-6 space-y-4 max-w-xl">
            <SettingField section="shipping" k="flat_rate" label="Flat shipping rate (₦)" settings={settings} setSettings={setSettings} type="number" />
            <SettingField section="shipping" k="free_threshold" label="Free shipping above (₦)" settings={settings} setSettings={setSettings} type="number" />
            <SettingField section="shipping" k="tax_rate" label="Tax rate (%)" settings={settings} setSettings={setSettings} type="number" />
            <Button onClick={() => saveSection("shipping")} className="bg-terracotta hover:bg-terracotta-deep">Save</Button>
          </div>
        </TabsContent>

        <TabsContent value="email">
          <div className="card-soft p-6 space-y-4 max-w-xl">
            <SettingField section="email" k="from_name" label="From name" settings={settings} setSettings={setSettings} />
            <SettingField section="email" k="from_email" label="From email" settings={settings} setSettings={setSettings} type="email" />
            <SettingField section="email" k="order_confirmation_template" label="Order confirmation template" settings={settings} setSettings={setSettings} type="textarea" />
            <Button onClick={() => saveSection("email")} className="bg-terracotta hover:bg-terracotta-deep">Save</Button>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="card-soft p-6 space-y-4 max-w-xl">
            <p className="text-sm text-teal/70">Payment processing isn't wired up yet. Use Lovable's Stripe connector to enable real payments.</p>
            <SettingField section="payments" k="cash_on_delivery" label="Allow cash on delivery (yes/no)" settings={settings} setSettings={setSettings} />
            <Button onClick={() => saveSection("payments")} className="bg-terracotta hover:bg-terracotta-deep">Save</Button>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminSettings;
