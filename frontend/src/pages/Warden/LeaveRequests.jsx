// src/pages/Warden/LeaveRequests.jsx
import React, { useState, useEffect } from "react";
import "./LeaveRequests.css";

const API = import.meta.env.VITE_API_URL;

const LeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("wardenToken");
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      const response = await fetch("${API}/api/wardens/leaves", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLeaveRequests(Array.isArray(data.data) ? data.data : []);
      } else {
        setError("Failed to fetch leave requests");
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (leaveId, action, rejectionReason = "") => {
    try {
      const token = localStorage.getItem("wardenToken");
      const response = await fetch(
        `${API}/api/wardens/leaves/${leaveId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action, rejectionReason }),
        }
      );

      if (response.ok) {
        await fetchLeaveRequests();
        alert(`Leave request ${action}d successfully`);
      } else {
        const errorData = await response.json();
        alert(errorData.message || `Failed to ${action} leave request`);
      }
    } catch (error) {
      console.error("Error updating leave request:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleTutorApproval = async (
    leaveId,
    approved,
    rejectionReason = ""
  ) => {
    try {
      const token = localStorage.getItem("wardenToken");
      const response = await fetch(
        `${API}/api/wardens/leaves/${leaveId}/tutor-approval`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ approved, rejectionReason }),
        }
      );

      if (response.ok) {
        await fetchLeaveRequests();
        alert(
          `Tutor approval ${approved ? "granted" : "rejected"} successfully`
        );
      } else {
        const errorData = await response.json();
        alert(errorData.message || `Failed to update tutor approval`);
      }
    } catch (error) {
      console.error("Error updating tutor approval:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleParentApproval = async (
    leaveId,
    approved,
    rejectionReason = ""
  ) => {
    try {
      const token = localStorage.getItem("wardenToken");
      const response = await fetch(
        `${API}/api/wardens/leaves/${leaveId}/parent-approval`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ approved, rejectionReason }),
        }
      );

      if (response.ok) {
        await fetchLeaveRequests();
        alert(
          `Parent approval ${approved ? "granted" : "rejected"} successfully`
        );
      } else {
        const errorData = await response.json();
        alert(errorData.message || `Failed to update parent approval`);
      }
    } catch (error) {
      console.error("Error updating parent approval:", error);
      alert("Network error. Please try again.");
    }
  };

  const filteredRequests = leaveRequests.filter((request) => {
    let matchesStatus = filter === "all" || request.status === filter;
    let matchesType =
      leaveTypeFilter === "all" || request.leaveType === leaveTypeFilter;
    return matchesStatus && matchesType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#27ae60";
      case "pending":
        return "#f39c12";
      case "rejected":
        return "#e74c3c";
      case "parent_approved":
        return "#3498db";
      case "tutor_approved":
        return "#9b59b6";
      case "warden_approved":
        return "#27ae60";
      case "exited":
        return "#f39c12";
      case "returned":
        return "#3498db";
      default:
        return "#95a5a6";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getStatusDisplay = (request) => {
    const s = request.status;
    switch (s) {
      case "approved":
        return "APPROVED";
      case "rejected":
        return "REJECTED";
      case "parent_approved":
        return "PARENT APPROVED";
      case "tutor_approved":
        return "TUTOR APPROVED";
      case "warden_approved":
        return "WARDEN APPROVED";
      case "exited":
        return "EXITED";
      case "returned":
        return "RETURNED";
      case "pending": {
        const approvals = [];
        if (request.tutorApproval?.approved)
          approvals.push("TUTOR");
        if (request.parentApproval?.approved)
          approvals.push("PARENT");
        if (approvals.length > 0)
          return `${approvals.join(" & ")} APPROVED`;
        return "PENDING";
      }
      default:
        return (s || "PENDING").toUpperCase();
    }
  };

  const renderApprovalSection = (approvalData, onApprove, onReject) => {
    if (approvalData?.approved === true) {
      return <span className="approval-status approved">APPROVED</span>;
    } else {
      return (
        <div className="approval-buttons">
          <button
            className="approve-btn-small"
            onClick={() => onApprove(true)}
            title="Approve"
          >
            ✓
          </button>
          <button
            className="reject-btn-small"
            onClick={() => {
              const reason = prompt("Enter rejection reason:");
              if (reason !== null) onReject(false, reason);
            }}
            title="Reject"
          >
            ✗
          </button>
        </div>
      );
    }
  };

  const handleWardenApproveClick = (request) => {
    const isEmergency = request.leaveType === "emergency";
    const parentApproved = request.parentApproval?.approved === true;
    const tutorApproved = request.tutorApproval?.approved === true;

    if (isEmergency) {
      if (!parentApproved || !tutorApproved) {
        alert("Tutor/Parent not accepted");
        return;
      }
    } else {
      if (!parentApproved) {
        alert("Parent not approved");
        return;
      }
    }

    handleLeaveAction(request._id, "approve");
  };

  const renderActions = (request) => {
    if (request.status === "approved") {
      return <span className="status-text approved">APPROVED</span>;
    }
    if (request.status === "exited") {
      return <span className="status-text">EXITED</span>;
    }
    if (request.status === "returned") {
      return <span className="status-text returned">RETURNED</span>;
    }
    if (request.status === "rejected") {
      return <span className="status-text rejected">REJECTED</span>;
    }

    // Always show approve/reject buttons for pending requests
    return (
      <div className="action-buttons">
        <button
          className="approve-btn"
          onClick={() => handleWardenApproveClick(request)}
          title="Approve Leave"
        >
          ✓ Approve
        </button>

        <button
          className="reject-btn"
          onClick={() => {
            const reason = prompt("Enter rejection reason:");
            if (reason !== null)
              handleLeaveAction(request._id, "reject", reason);
          }}
          title="Reject Leave"
        >
          ✗ Reject
        </button>
      </div>
    );
  };

  if (loading)
    return (
      <div className="leave-requests">
        <p>Loading leave requests...</p>
      </div>
    );

  if (error)
    return (
      <div className="leave-requests">
        <p className="error">{error}</p>
      </div>
    );

  return (
    <div className="leave-requests">
      <div className="header-section">
        <h2>Leave Requests Management</h2>
        <div className="filter-section">
          <div className="filter-group">
            <label>Filter by Status:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="exited">Exited</option>
              <option value="returned">Returned</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Filter by Type:</label>
            <select
              value={leaveTypeFilter}
              onChange={(e) => setLeaveTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="holiday">Normal Leave</option>
              <option value="emergency">Emergency Leave</option>
            </select>
          </div>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="empty-state">
          <p>No leave requests found</p>
        </div>
      ) : (
        <div className="requests-table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Register Number</th>
                <th>Department</th>
                <th>Parent Name</th>
                <th>Parent Phone</th>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Emergency Contact</th>
                <th>Destination</th>
                <th>Tutor Approval</th>
                <th>Parent Approval</th>
                <th>Status</th>
                <th>Approved/Rejected</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request._id}>
                  <td>{request.studentName}</td>
                  <td>{request.registerNumber}</td>
                  <td>{request.department}</td>
                  <td>{request.parentName || "-"}</td>
                  <td>{request.parentPhone || "-"}</td>
                  <td>
                    {request.leaveType
                      ? request.leaveType.charAt(0).toUpperCase() +
                        request.leaveType.slice(1)
                      : "Unknown"}{" "}
                    Leave
                  </td>
                  <td>
                    {formatDate(request.startDate)} to{" "}
                    {formatDate(request.endDate)}
                  </td>
                  <td>{request.reason}</td>
                  <td>{request.emergencyContact || "-"}</td>
                  <td>{request.destination || "-"}</td>

                  <td>
                    {request.leaveType === "emergency" ? (
                      renderApprovalSection(
                        request.tutorApproval,
                        (approved) =>
                          handleTutorApproval(request._id, approved),
                        (approved, reason) =>
                          handleTutorApproval(request._id, approved, reason)
                      )
                    ) : (
                      <span className="approval-status not-required">
                        Not Required
                      </span>
                    )}
                  </td>

                  <td>
                    {renderApprovalSection(
                      request.parentApproval,
                      (approved) =>
                        handleParentApproval(request._id, approved),
                      (approved, reason) =>
                        handleParentApproval(request._id, approved, reason)
                    )}
                  </td>

                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: getStatusColor(request.status),
                      }}
                    >
                      {getStatusDisplay(request)}
                    </span>
                    {request.rejectionReason && (
                      <div className="rejection-reason">
                        {request.rejectionReason}
                      </div>
                    )}
                  </td>

                  <td>
                    {renderApprovalSection(
                      request.wardenApproval,
                      (approved) => handleLeaveAction(request._id, 'approve'),
                      (approved, reason) => handleLeaveAction(request._id, 'reject', reason)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
