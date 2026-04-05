import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../lib/errors";
import { toDateInputValue } from "../lib/formatters";
import { getMyEmployeeProfile, updateMyEmployeeProfile } from "../services/employeeService";
import { uploadUserAvatar } from "../services/uploadService";

function avatarSrc(url) {
  if (!url || typeof url !== "string") {
    return "";
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
}

function CameraIcon() {
  return (
    <svg className="avatar-camera-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v11z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

export function ProfilePage() {
  const { user, syncMe } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [hasEmployeeRecord, setHasEmployeeRecord] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    gender: "OTHER",
    dateOfBirth: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const payload = await getMyEmployeeProfile();
        const emp = payload?.data;
        if (!cancelled && emp) {
          setHasEmployeeRecord(true);
          setForm({
            fullName: emp.fullName || user?.fullName || "",
            email: emp.user?.email || user?.email || "",
            phone: emp.phone || "",
            address: emp.address || "",
            gender: emp.gender || "OTHER",
            dateOfBirth: toDateInputValue(emp.dateOfBirth),
          });
        }
      } catch (loadError) {
        if (!cancelled) {
          const status = loadError?.response?.status;
          if (status === 404) {
            setHasEmployeeRecord(false);
            setForm({
              fullName: user?.fullName || "",
              email: user?.email || "",
              phone: "",
              address: "",
              gender: "OTHER",
              dateOfBirth: "",
            });
          } else {
            setError(extractErrorMessage(loadError, "Unable to load your profile"));
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.fullName, user?.email]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    if (!hasEmployeeRecord) {
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await updateMyEmployeeProfile({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth || null,
      });
      setMessage("Profile updated.");
      await syncMe();
    } catch (submitError) {
      setError(extractErrorMessage(submitError, "Unable to update profile"));
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    setUploadingAvatar(true);
    setError("");
    setMessage("");
    try {
      await uploadUserAvatar(file);
      setMessage("Avatar updated.");
      await syncMe();
    } catch (uploadError) {
      setError(extractErrorMessage(uploadError, "Unable to upload avatar"));
    } finally {
      setUploadingAvatar(false);
    }
  }

  return (
    <section className="page-card">
      <PageHeader
        title="My profile"
        subtitle="Cập nhật thông tin cá nhân và ảnh đại diện. Ảnh và hồ sơ được lưu riêng trên server."
      />

      {loading ? <p className="status-note">Đang tải hồ sơ...</p> : null}
      {error ? <p className="status-note error">{error}</p> : null}
      {message ? <p className="status-note success">{message}</p> : null}

      {!loading ? (
        <>
          <div className="form-grid profile-avatar-section spacing-below-avatar">
            <div className="full-width">
              <p className="muted-label">Ảnh đại diện</p>
              <div className={`avatar-editor${uploadingAvatar ? " avatar-editor--busy" : ""}`}>
                <div className="avatar-editor-ring">
                  <img
                    className="avatar-preview"
                    src={avatarSrc(user?.avatarUrl)}
                    alt=""
                    width={112}
                    height={112}
                  />
                  <label
                    className="avatar-camera-trigger"
                    title="Đổi ảnh đại diện"
                    aria-label="Đổi ảnh đại diện"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="avatar-file-input"
                      disabled={uploadingAvatar}
                      onChange={handleAvatarChange}
                    />
                    <span className="avatar-camera-icon-wrap">
                      <CameraIcon />
                    </span>
                  </label>
                </div>
                {uploadingAvatar ? <p className="avatar-upload-hint">Đang tải ảnh lên...</p> : null}
              </div>
            </div>
          </div>

          {!hasEmployeeRecord ? (
            <p className="status-note full-width">
              No employee record is linked to this account. You can still change your photo here; contact HR to link an
              employee profile to edit name, email, and contact fields.
            </p>
          ) : null}

          <form className="form-grid" onSubmit={handleProfileSubmit}>
            <label>
              Full name
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                disabled={!hasEmployeeRecord}
              />
            </label>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={!hasEmployeeRecord}
              />
            </label>
            <label>
              Phone
              <input name="phone" value={form.phone} onChange={handleChange} disabled={!hasEmployeeRecord} />
            </label>
            <label>
              Gender
              <select name="gender" value={form.gender} onChange={handleChange} disabled={!hasEmployeeRecord}>
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </label>
            <label>
              Date of birth
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                disabled={!hasEmployeeRecord}
              />
            </label>
            <label className="full-width">
              Address
              <input name="address" value={form.address} onChange={handleChange} disabled={!hasEmployeeRecord} />
            </label>
            <div className="full-width actions-inline">
              <button type="submit" disabled={saving || !hasEmployeeRecord}>
                {saving ? "Đang lưu..." : "Lưu hồ sơ"}
              </button>
            </div>
          </form>
        </>
      ) : null}
    </section>
  );
}
