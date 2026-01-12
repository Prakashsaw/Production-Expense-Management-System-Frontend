import React, { useState, useMemo } from "react";
import { Table, Modal, Card, Statistic, Tag, Button, Space, message } from "antd";
import {
  UserOutlined,
  DollarOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  HomeOutlined,
  TrophyOutlined,
  ManOutlined,
  WomanOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import "./AdminDashboard.css";

// Dummy data - will be replaced with API data later
const generateDummyUsers = () => {
  const users = [];
  const names = [
    "John Doe",
    "Jane Smith",
    "Michael Johnson",
    "Emily Davis",
    "David Wilson",
    "Sarah Brown",
    "Robert Taylor",
    "Jessica Martinez",
    "William Anderson",
    "Ashley Thomas",
  ];
  const sports = ["Cricket", "Football", "Basketball", "Tennis", "Swimming"];
  const genders = ["Male", "Female", "Other"];
  const addresses = [
    "123 Main St, Bangalore, Karnataka 560001",
    "456 Park Ave, Mumbai, Maharashtra 400001",
    "789 MG Road, Delhi, Delhi 110001",
    "321 Church St, Bangalore, Karnataka 560001",
    "654 Market St, Pune, Maharashtra 411001",
  ];

  for (let i = 1; i <= 10; i++) {
    const createdDate = moment()
      .subtract(Math.floor(Math.random() * 365), "days")
      .subtract(Math.floor(Math.random() * 24), "hours")
      .subtract(Math.floor(Math.random() * 60), "minutes");

    const income = Math.floor(Math.random() * 500000) + 100000;
    const expense = Math.floor(Math.random() * 300000) + 50000;
    const totalTurnover = income + expense;

    users.push({
      userId: `USER${String(i).padStart(6, "0")}`,
      email: `user${i}@example.com`,
      phone: i % 3 === 0 ? null : `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      createdDate: createdDate.toISOString(),
      totalTurnover: totalTurnover,
      totalIncome: income,
      totalExpense: expense,
      // Detailed user information
      name: names[i - 1],
      address: addresses[Math.floor(Math.random() * addresses.length)],
      favoriteSport: sports[Math.floor(Math.random() * sports.length)],
      gender: genders[Math.floor(Math.random() * genders.length)],
    });
  }
  return users;
};

const AdminDashboard = () => {
  const [users, setUsers] = useState(generateDummyUsers());
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalUsers = users.length;
    const totalTurnover = users.reduce((sum, user) => sum + user.totalTurnover, 0);
    return {
      totalUsers,
      totalTurnover,
    };
  }, [users]);

  // Handle row click to show user details
  const handleRowClick = (record) => {
    setSelectedUser(record);
    setIsModalVisible(true);
  };

  // Handle admin logout
  const handleLogout = () => {
    // Remove admin session from localStorage
    localStorage.removeItem("admin");
    message.success("Logged out from Admin Dashboard successfully");
    // Navigate to home page
    navigate("/");
  };

  // Table columns
  const columns = [
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
      render: (text) => (
        <span>
          <MailOutlined style={{ marginRight: 8, color: "#667eea" }} />
          {text}
        </span>
      ),
    },
    {
      title: "Phone Number",
      dataIndex: "phone",
      key: "phone",
      width: 150,
      render: (text) =>
        text ? (
          <span>
            <PhoneOutlined style={{ marginRight: 8, color: "#667eea" }} />
            {text}
          </span>
        ) : (
          <Tag color="default">Not Provided</Tag>
        ),
    },
    {
      title: "Created Date & Time",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 200,
      render: (text) => (
        <span>
          <CalendarOutlined style={{ marginRight: 8, color: "#667eea" }} />
          {moment(text).format("DD MMM YYYY, HH:mm")}
        </span>
      ),
      sorter: (a, b) => moment(a.createdDate).unix() - moment(b.createdDate).unix(),
    },
    {
      title: "Total Turnover",
      dataIndex: "totalTurnover",
      key: "totalTurnover",
      width: 150,
      render: (text) => (
        <span style={{ fontWeight: 600, color: "#667eea" }}>
          ₹{text.toLocaleString("en-IN")}
        </span>
      ),
      sorter: (a, b) => a.totalTurnover - b.totalTurnover,
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(record);
          }}
          size="small"
          className="view-details-button"
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="admin-dashboard-wrapper">
      {/* Admin Dashboard Header */}
      <div className="admin-dashboard-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <DashboardOutlined className="admin-header-icon" />
            <div className="admin-header-text">
              <h1 className="admin-header-title">Admin Dashboard</h1>
              <p className="admin-header-subtitle">for Expense Management System</p>
            </div>
          </div>
          <Button
            type="primary"
            icon={<LogoutOutlined />}
            size="large"
            className="admin-header-button"
            onClick={handleLogout}
            title="Logout from Dashboard and Go to Expense Management System"
          >
            Logout From Dashboard
          </Button>
        </div>
      </div>

      <div className="admin-dashboard-content">
        <div className="admin-dashboard-container">

          {/* Summary Cards */}
          <div className="admin-summary-cards">
            <Card className="summary-card">
              <Statistic
                title="Total Registered Users"
                value={summaryStats.totalUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#667eea" }}
              />
            </Card>
            <Card className="summary-card">
              <Statistic
                title="Total Turnover (All Users)"
                value={summaryStats.totalTurnover}
                prefix={<DollarOutlined />}
                valueStyle={{ color: "#667eea" }}
                formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
              />
            </Card>
          </div>

          {/* Users Table */}
          <Card className="users-table-card">
            <h2 className="table-title">Registered Users</h2>
            <Table
              columns={columns}
              dataSource={users}
              rowKey="userId"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} users`,
              }}
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
                style: { cursor: "pointer" },
              })}
              className="admin-users-table"
            />
          </Card>

          {/* User Details Modal */}
          <Modal
            title={
              <span>
                <UserOutlined style={{ marginRight: 8 }} />
                User Details
              </span>
            }
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={[
              <Button key="close" onClick={() => setIsModalVisible(false)}>
                Close
              </Button>,
            ]}
            width={800}
            className="user-details-modal"
          >
            {selectedUser && (
              <div className="user-details-content">
                {/* Basic Information Section - Horizontal Layout */}
                <div className="detail-section-horizontal">
                  <div className="detail-row">
                    <div className="detail-item-horizontal">
                      <span className="detail-label">
                        <Tag color="blue" style={{ marginRight: 8 }}>
                          User ID
                        </Tag>
                      </span>
                      <span className="detail-value">{selectedUser.userId}</span>
                    </div>

                    <div className="detail-item-horizontal">
                      <span className="detail-label">
                        <MailOutlined style={{ marginRight: 8, color: "#667eea" }} />
                        Email
                      </span>
                      <span className="detail-value">{selectedUser.email}</span>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-item-horizontal">
                      <span className="detail-label">
                        <PhoneOutlined style={{ marginRight: 8, color: "#667eea" }} />
                        Phone Number
                      </span>
                      <span className="detail-value">
                        {selectedUser.phone || (
                          <Tag color="default">Not Provided</Tag>
                        )}
                      </span>
                    </div>

                    <div className="detail-item-horizontal">
                      <span className="detail-label">
                        <CalendarOutlined style={{ marginRight: 8, color: "#667eea" }} />
                        Registered Date
                      </span>
                      <span className="detail-value">
                        {moment(selectedUser.createdDate).format("DD MMM YYYY")}
                      </span>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-item-horizontal">
                      <span className="detail-label">
                        {selectedUser.gender === "Male" ? (
                          <ManOutlined style={{ marginRight: 8, color: "#667eea" }} />
                        ) : selectedUser.gender === "Female" ? (
                          <WomanOutlined style={{ marginRight: 8, color: "#667eea" }} />
                        ) : (
                          <UserOutlined style={{ marginRight: 8, color: "#667eea" }} />
                        )}
                        Gender
                      </span>
                      <span className="detail-value">
                        <Tag color="purple">{selectedUser.gender}</Tag>
                      </span>
                    </div>

                    <div className="detail-item-horizontal">
                      <span className="detail-label">
                        <TrophyOutlined style={{ marginRight: 8, color: "#667eea" }} />
                        Favorite Sport
                      </span>
                      <span className="detail-value">
                        <Tag color="green">{selectedUser.favoriteSport}</Tag>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address Section - Full Width Vertical */}
                <div className="detail-section-vertical">
                  <div className="detail-item-vertical">
                    <span className="detail-label">
                      <HomeOutlined style={{ marginRight: 8, color: "#667eea" }} />
                      Address
                    </span>
                    <span className="detail-value">{selectedUser.address}</span>
                  </div>
                </div>

                {/* Financial Information Section - Horizontal Layout */}
                <div className="detail-section-horizontal financial-section">
                  <div className="detail-row">
                    <div className="detail-item-horizontal financial-item">
                      <span className="detail-label">
                        <DollarOutlined style={{ marginRight: 8, color: "#667eea" }} />
                        Total Turnover
                      </span>
                      <span className="detail-value financial-value">
                        <strong style={{ color: "#667eea" }}>
                          ₹{selectedUser.totalTurnover.toLocaleString("en-IN")}
                        </strong>
                      </span>
                    </div>

                    <div className="detail-item-horizontal financial-item">
                      <span className="detail-label">Total Income</span>
                      <span className="detail-value financial-value" style={{ color: "#52c41a" }}>
                        ₹{selectedUser.totalIncome.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-item-horizontal financial-item full-width">
                      <span className="detail-label">Total Expense</span>
                      <span className="detail-value financial-value" style={{ color: "#ff4d4f" }}>
                        ₹{selectedUser.totalExpense.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
