"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/ToastProvider";

export default function SettingsClient() {
  const { data: session, update } = useSession();
  const [generationEnabled, setGenerationEnabled] = useState(true);
  const [maxOrders, setMaxOrders] = useState(1000);
  const [saving, setSaving] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [notificationPrefs, setNotificationPrefs] = useState({
    orderAlerts: true,
    chatAlerts: true,
    emailSummaries: false,
  });
  const [defaultLanding, setDefaultLanding] = useState("overview");
  const { showToast } = useToast();

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/orders/config");
        const data = await res.json();
        setGenerationEnabled(Boolean(data.generationEnabled));
        setMaxOrders(data.maxOrders ?? 1000);
      } catch (error) {
        console.error("Failed to load orders config", error);
      }
    }
    loadConfig();
  }, []);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) return;
        const data = await res.json();
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setEmail(data.email || session?.user?.email || "");
        setAvatarPreview(data.avatarDataUrl || session?.user?.image || null);
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    }
    loadProfile();
  }, [session]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("dashboard_notification_prefs");
      if (raw) {
        const parsed = JSON.parse(raw);
        setNotificationPrefs((prev) => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error("Failed to load notification prefs", error);
    }

    try {
      const landing = window.localStorage.getItem("dashboard_default_landing");
      if (landing) {
        setDefaultLanding(landing);
      }
    } catch (error) {
      console.error("Failed to load default landing", error);
    }
  }, []);

  async function saveOrdersConfig(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/orders/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationEnabled,
          maxOrders: Number(maxOrders),
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to save config");
      }
      showToast({
        title: "Live data settings updated",
        description: "Generation toggle and max-orders limit were saved.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to save orders config", error);
      showToast({
        title: "Could not save settings",
        description: "Please try again. If it keeps failing, check the API.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    setProfileSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          avatarDataUrl: avatarPreview,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save profile");
      }

      const data = await res.json();

      if (update) {
        await update({
          user: {
            ...session?.user,
            name: data.displayName,
            image: data.avatarDataUrl || session?.user?.image || null,
          },
        });
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("profile-updated"));
      }

      showToast({
        title: "Profile updated",
        description: "Your name and picture were updated.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to save profile", error);
      showToast({
        title: "Could not update profile",
        description: "Please try again in a moment.",
        variant: "error",
      });
    } finally {
      setProfileSaving(false);
    }
  }

  function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function updateNotificationPref(key, value) {
    setNotificationPrefs((prev) => {
      const next = { ...prev, [key]: value };
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(
            "dashboard_notification_prefs",
            JSON.stringify(next)
          );
        } catch (error) {
          console.error("Failed to save notification prefs", error);
        }
      }
      return next;
    });
  }

  function handleDefaultLandingChange(event) {
    const value = event.target.value;
    setDefaultLanding(value);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("dashboard_default_landing", value);
      } catch (error) {
        console.error("Failed to save default landing", error);
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/60">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-50 md:text-lg">
              Settings
            </h1>
            <p className="text-xs text-slate-400 md:text-sm">
              Profile and workspace configuration. All fields are frontend-only
              for now.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <form
          onSubmit={saveProfile}
          className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/60 lg:col-span-3"
        >
          <h2 className="text-sm font-semibold text-slate-50">Profile</h2>
          <Field label="Profile picture">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-linear-to-tr from-sky-500 to-indigo-500 text-[11px] font-semibold text-white">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (firstName || lastName || "User")
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase()
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="block w-full text-[11px] text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-100 hover:file:bg-slate-700 sm:text-xs"
              />
            </div>
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="First name">
              <input
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 sm:text-sm"
              />
            </Field>
            <Field label="Last name">
              <input
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 sm:text-sm"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={email}
                readOnly
                className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 sm:text-sm"
              />
            </Field>
            <Field label="Role">
              <select className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 sm:text-sm">
                <option>Admin</option>
                <option>Operator</option>
                <option>Viewer</option>
              </select>
            </Field>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-lg bg-sky-500 px-4 py-2 text-xs font-medium text-white shadow-md shadow-sky-500/40 hover:bg-sky-400 sm:text-sm disabled:opacity-60"
              disabled={profileSaving}
            >
              {profileSaving ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>

        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/60 lg:col-span-5">
          <h2 className="text-sm font-semibold text-slate-50">
            Notifications & dashboard preferences
          </h2>
          <div className="space-y-3 text-xs text-slate-300">
            <ToggleField
              label="Order alerts"
              description="Show alerts when orders are close to SLA or at risk."
              checked={notificationPrefs.orderAlerts}
              onChange={(checked) =>
                updateNotificationPref("orderAlerts", checked)
              }
            />
            <ToggleField
              label="Chat alerts"
              description="Highlight and notify when new customer chats arrive."
              checked={notificationPrefs.chatAlerts}
              onChange={(checked) =>
                updateNotificationPref("chatAlerts", checked)
              }
            />
            <ToggleField
              label="Email summaries"
              description="Receive a daily summary email of key metrics."
              checked={notificationPrefs.emailSummaries}
              onChange={(checked) =>
                updateNotificationPref("emailSummaries", checked)
              }
            />

            <div className="space-y-1 text-xs text-slate-300">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-slate-200">
                  Default dashboard page
                </span>
                <select
                  value={defaultLanding}
                  onChange={handleDefaultLandingChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 sm:text-sm"
                >
                  <option value="overview">Overview</option>
                  <option value="orders">Orders</option>
                  <option value="live-orders">Live Orders</option>
                </select>
              </label>
              <p className="text-[11px] text-slate-400">
                We remember this on this browser and send you there after
                login.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={saveOrdersConfig}
          className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/60 lg:col-span-2"
        >
          <h2 className="text-sm font-semibold text-slate-50">
            Live data controls
          </h2>
          <div className="space-y-3 text-xs text-slate-300">
            <ToggleField
              label="Generate demo orders automatically"
              description="When enabled, the dashboard periodically calls the generator API so graphs keep moving."
              checked={generationEnabled}
              onChange={setGenerationEnabled}
            />
            <div className="space-y-1 text-xs text-slate-300">
              <label className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-medium text-slate-200">
                  Max orders to keep in database
                </span>
                <input
                  type="number"
                  min={100}
                  max={5000}
                  step={100}
                  value={maxOrders}
                  onChange={(event) => setMaxOrders(event.target.value)}
                  className="w-24 rounded-lg border border-slate-800 bg-slate-900/70 px-2 py-1 text-right text-xs text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </label>
              <p className="text-[11px] text-slate-400">
                Older orders above this limit will be softly trimmed when new
                demo orders are generated.
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-lg bg-sky-500 px-4 py-2 text-xs font-medium text-white shadow-md shadow-sky-500/40 hover:bg-sky-400 sm:text-sm disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save live data settings"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="space-y-1 text-xs text-slate-300 sm:text-sm">
      <span className="block text-[11px] font-medium text-slate-300 sm:text-xs">
        {label}
      </span>
      {children}
    </label>
  );
}

function ToggleField({ label, description, checked, onChange, defaultChecked }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-medium text-slate-100 sm:text-sm">
          {label}
        </p>
        <p className="text-[11px] text-slate-400 sm:text-xs">
          {description}
        </p>
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          defaultChecked={defaultChecked}
          checked={checked}
          onChange={(event) => onChange?.(event.target.checked)}
          className="peer sr-only"
        />
        <span className="h-4 w-7 rounded-full bg-slate-700 transition peer-checked:bg-sky-500 sm:h-5 sm:w-9" />
        <span className="absolute left-0.5 h-3 w-3 rounded-full bg-slate-300 transition peer-checked:translate-x-3 peer-checked:bg-white sm:h-4 sm:w-4 sm:peer-checked:translate-x-4" />
      </label>
    </div>
  );
}
