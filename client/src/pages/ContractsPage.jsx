import { useEffect, useMemo, useState } from "react";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../lib/errors";
import { formatDate } from "../lib/formatters";
import { APP_ROLES, hasRole } from "../lib/roles";
import { getAllContracts, getMyContracts } from "../services/contractService";

// Roles that can see ALL contracts (must match backend roles array)
const PRIVILEGED_ROLES = [
  APP_ROLES.ADMIN,
  APP_ROLES.ADMIN_UPPER,
  APP_ROLES.HR,
  APP_ROLES.MANAGER,
  APP_ROLES.BOSS,
  APP_ROLES.DIRECTOR,
];

function canViewAll(user) {
  return hasRole(user, PRIVILEGED_ROLES);
}

function formatMoney(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(Number(value));
}

const TYPE_LABELS = {
  FIXED_TERM: "Có thời hạn",
  PERMANENT: "Không thời hạn",
  INDEFINITE: "Không thời hạn",
  PROBATION: "Thử việc",
  PART_TIME: "Bán thời gian",
  FULL_TIME: "Toàn thời gian"
};

function formatContractType(type) {
  if (!type) return "—";
  return TYPE_LABELS[type] || type.replace(/_/g, " ");
}

function statusClassName(status) {
  const s = (status || "").toUpperCase();
  if (s === "ACTIVE") return "contract-status contract-status--active";
  if (s === "EXPIRED" || s === "TERMINATED" || s === "ENDED") return "contract-status contract-status--ended";
  if (s === "DRAFT" || s === "PENDING") return "contract-status contract-status--pending";
  return "contract-status contract-status--neutral";
}

function ContractDocumentIcon() {
  return (
    <svg className="contracts-page-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ContractsPage() {
  const { user } = useAuth();
  const isPrivileged = canViewAll(user);

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const countLabel = useMemo(() => {
    const n = contracts.length;
    if (n === 0) return "";
    return `${n} hợp đồng`;
  }, [contracts.length]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const payload = isPrivileged ? await getAllContracts() : await getMyContracts();
        if (!cancelled) {
          setContracts(payload?.data || []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(extractErrorMessage(loadError, "Không thể tải danh sách hợp đồng"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [isPrivileged]);

  return (
    <section className="page-card contracts-page">
      <div className="contracts-page-intro">
        <div className="contracts-page-intro-visual" aria-hidden>
          <ContractDocumentIcon />
        </div>
        <div className="contracts-page-intro-text">
          <PageHeader
            title={isPrivileged ? "Tất cả hợp đồng" : "Hợp đồng của tôi"}
            subtitle={
              isPrivileged
                ? "Toàn bộ hợp đồng lao động trong hệ thống."
                : "Danh sách hợp đồng lao động gắn với hồ sơ nhân viên hiện tại."
            }
          />
          {countLabel ? <p className="contracts-count-pill">{countLabel}</p> : null}
        </div>
      </div>

      <DataState
        loading={loading}
        error={error}
        empty={!loading && !error && contracts.length === 0}
        emptyMessage={
          isPrivileged
            ? "Chưa có hợp đồng nào trong hệ thống."
            : "Chưa có hợp đồng nào cho tài khoản của bạn."
        }>

        <div className="contract-cards">
          {contracts.map((contract) =>
            <article className="contract-card" key={contract._id}>
              <header className="contract-card__head">
                <div className="contract-card__titles">
                  {/* Hiển thị tên nhân viên nếu là admin/manager xem tất cả */}
                  {isPrivileged && contract.employee && (
                    <p className="contract-card__employee-name">
                      👤 {contract.employee.fullName || contract.employee.employeeCode || "—"}
                    </p>
                  )}
                  <p className="contract-card__label">Số hợp đồng</p>
                  <h3 className="contract-card__no">{contract.contractNo || "—"}</h3>
                  <p className="contract-card__type">{formatContractType(contract.contractType)}</p>
                </div>
                <span className={statusClassName(contract.status)}>{contract.status || "—"}</span>
              </header>

              <div className="contract-card__body">
                <div className="contract-card__stat">
                  <span className="contract-card__dt">Bắt đầu</span>
                  <span className="contract-card__dd">{formatDate(contract.startDate)}</span>
                </div>
                <div className="contract-card__stat">
                  <span className="contract-card__dt">Kết thúc</span>
                  <span className="contract-card__dd">{formatDate(contract.endDate)}</span>
                </div>
                <div className="contract-card__stat">
                  <span className="contract-card__dt">Ngày ký</span>
                  <span className="contract-card__dd">{formatDate(contract.signedDate)}</span>
                </div>
                <div className="contract-card__stat contract-card__stat--salary">
                  <span className="contract-card__dt">Lương cơ bản</span>
                  <span className="contract-card__dd contract-card__salary">{formatMoney(contract.baseSalary)}</span>
                </div>
              </div>

              {contract.notes ?
                <footer className="contract-card__notes">
                  <span className="contract-card__notes-label">Ghi chú</span>
                  <p>{contract.notes}</p>
                </footer> :
                null}
            </article>
          )}
        </div>
      </DataState>
    </section>
  );
}