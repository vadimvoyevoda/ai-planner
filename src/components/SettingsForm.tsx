import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { createClientSupabase } from "@/lib/supabase";
import { toast } from "sonner";

interface SettingsFormProps {
  userId: string;
}

export default function SettingsForm({ userId }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    name: "",
    defaultMeetingDuration: 30,
    workStartTime: "09:00",
    workEndTime: "17:00",
  });

  const supabase = createClientSupabase();

  useEffect(() => {
    async function loadSettings() {
      const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", userId).single();

      if (error) {
        toast.error("Failed to load settings");
        return;
      }

      if (data) {
        setSettings({
          name: data.name || "",
          defaultMeetingDuration: data.default_meeting_duration || 30,
          workStartTime: data.work_start_time || "09:00",
          workEndTime: data.work_end_time || "17:00",
        });
      }
    }

    loadSettings();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("user_settings").upsert({
        user_id: userId,
        name: settings.name,
        default_meeting_duration: settings.defaultMeetingDuration,
        work_start_time: settings.workStartTime,
        work_end_time: settings.workEndTime,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={settings.name}
          onChange={(e) => setSettings({ ...settings, name: e.target.value })}
          placeholder="Your name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="defaultDuration">Default Meeting Duration (minutes)</Label>
        <Input
          id="defaultDuration"
          type="number"
          min="15"
          max="180"
          step="15"
          value={settings.defaultMeetingDuration}
          onChange={(e) =>
            setSettings({
              ...settings,
              defaultMeetingDuration: parseInt(e.target.value),
            })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="workStartTime">Work Start Time</Label>
          <Input
            id="workStartTime"
            type="time"
            value={settings.workStartTime}
            onChange={(e) => setSettings({ ...settings, workStartTime: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workEndTime">Work End Time</Label>
          <Input
            id="workEndTime"
            type="time"
            value={settings.workEndTime}
            onChange={(e) => setSettings({ ...settings, workEndTime: e.target.value })}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
