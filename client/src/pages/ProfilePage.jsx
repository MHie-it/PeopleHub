import { useRef, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../lib/errors";
import apiClient from "../lib/apiClient";
import { uploadUserAvatar } from "../services/uploadService";

function Avatar({ src, name, size = 96 }) {
  const [broken, setBroken] = useState(false);
  const initials = (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (src && !broken) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block" }}
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Fraunces, Georgia, serif",
        fontWeight: 600,
        fontSize: size * 0.35,
        letterSpacing: "-0.02em",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

export function ProfilePage() {
  const { user, syncMe } = useAuth();
  const fileInputRef = useRef(null);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setAvatarError("");
    setAvatarUploading(true);

    try {
      await uploadUserAvatar(file);
      await syncMe();
    } catch (err) {
      setAvatarError(extractErrorMessage(err, "Không thể upload avatar."));
      setAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function startEdit() {
    setProfileForm({ fullName: user?.fullName || "", email: user?.email || "" });
    setProfileError("");
    setProfileSuccess("");
    setEditMode(true);
  }

  function cancelEdit() {
    setEditMode(false);
    setProfileError("");
    setProfileSuccess("");
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);
    try {
      await apiClient.patch("/auth/me", {
        fullName: profileForm.fullName,
        email: profileForm.email,
      });
      await syncMe();
      setProfileSuccess("Cập nhật thông tin thành công!");
      setEditMode(false);
    } catch (err) {
      setProfileError(extractErrorMessage(err, "Không thể cập nhật thông tin."));
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwError("Mật khẩu mới không khớp.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPwError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    setPwLoading(true);
    try {
      await apiClient.post("/auth/change-password", {
        email: user?.email,
        password: passwordForm.newPassword,
      });
      setPwSuccess("Đổi mật khẩu thành công!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwError(extractErrorMessage(err, "Không thể đổi mật khẩu."));
    } finally {
      setPwLoading(false);
    }
  }

  const displayAvatar = avatarPreview || user?.avatarUrl;
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("vi-VN", {
      year: "numeric", month: "long", day: "numeric",
    })
    : null;

  return (
    <section className="page-card">
      <PageHeader title="My Profile" subtitle="Xem và cập nhật thông tin cá nhân của bạn." />

      { }
      <div className="profile-hero">
        { }
        <div className="profile-avatar-wrap">
          <div className={`avatar-ring${avatarUploading ? " avatar-ring--busy" : ""}`}>
            <Avatar src={displayAvatar} name={user?.fullName || user?.username} size={100} />

            { }
            <label
              className="avatar-cam-btn"
              title="Thay đổi ảnh đại diện"
              aria-label="Thay đổi ảnh đại diện"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="avatar-cam-icon">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="avatar-file-input"
                onChange={handleAvatarChange}
                disabled={avatarUploading}
              />
            </label>
          </div>

          {avatarUploading && <p className="avatar-hint">Đang tải lên...</p>}
          {!avatarUploading && <p className="avatar-hint">Nhấn vào ảnh để thay đổi</p>}
          {avatarError && <p className="status-note error" style={{ marginTop: 8 }}>{avatarError}</p>}
        </div>

        { }
        <div className="profile-hero-info">
          <h2 className="profile-display-name">{user?.fullName || user?.username || "—"}</h2>
          <p className="profile-display-role">{user?.role?.name || "No role"}</p>
          {user?.email && <p className="profile-display-email">{user.email}</p>}
          {joinedDate && <p className="profile-display-joined">Thành viên từ {joinedDate}</p>}

          <button type="button" className="ghost-button profile-edit-btn" onClick={startEdit}>
            ✎ Chỉnh sửa thông tin
          </button>
        </div>
      </div>

      { }
      {profileSuccess && <p className="status-note success">{profileSuccess}</p>}

      { }
      {editMode && (
        <div className="profile-edit-panel">
          <h3 className="section-heading" style={{ marginBottom: 14 }}>Chỉnh sửa thông tin</h3>
          {profileError && <p className="status-note error">{profileError}</p>}
          <form className="form-stack profile-pw-form" onSubmit={handleProfileSubmit}>
            <label>
              Họ và tên
              <input
                type="text"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
                placeholder="Nguyễn Văn A"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="example@email.com"
                required
              />
            </label>
            <div className="profile-form-actions">
              <button type="submit" disabled={profileLoading}>
                {profileLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <button type="button" className="ghost-button" onClick={cancelEdit} disabled={profileLoading}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      { }
      {!editMode && (
        <div className="profile-info-grid">
          <article className="metric-card profile-field">
            <p>Họ và tên</p>
            <h3>{user?.fullName || "—"}</h3>
          </article>
          <article className="metric-card profile-field">
            <p>Tên đăng nhập</p>
            <h3>{user?.username || "—"}</h3>
          </article>
          <article className="metric-card profile-field">
            <p>Email</p>
            <h3>{user?.email || "—"}</h3>
          </article>
          <article className="metric-card profile-field">
            <p>Vai trò</p>
            <h3>{user?.role?.name || "—"}</h3>
          </article>
          {user?.department?.name && (
            <article className="metric-card profile-field">
              <p>Phòng ban</p>
              <h3>{user.department.name}</h3>
            </article>
          )}
          {joinedDate && (
            <article className="metric-card profile-field">
              <p>Thành viên từ</p>
              <h3>{joinedDate}</h3>
            </article>
          )}
        </div>
      )}

      { }
      <div className="section-divider" />
      <h2 className="section-heading">Đổi mật khẩu</h2>

      {pwError && <p className="status-note error">{pwError}</p>}
      {pwSuccess && <p className="status-note success">{pwSuccess}</p>}

      <form className="form-stack profile-pw-form" onSubmit={handlePasswordSubmit}>
        <label>
          Mật khẩu mới
          <input
            type="password"
            name="newPassword"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
            required
            autoComplete="new-password"
          />
        </label>
        <label>
          Xác nhận mật khẩu mới
          <input
            type="password"
            name="confirmPassword"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
            required
            autoComplete="new-password"
          />
        </label>
        <button type="submit" disabled={pwLoading} style={{ alignSelf: "flex-start" }}>
          {pwLoading ? "Đang lưu..." : "Cập nhật mật khẩu"}
        </button>
      </form>
    </section>
  );
}
