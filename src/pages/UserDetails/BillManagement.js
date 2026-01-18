import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Popconfirm,
  Tag,
  Space,
  Empty,
  Spin,
  Alert,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditFilled,
  BellOutlined,
  FileTextOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import Layout from "../../components/Layout/Layout";
import { useApiWithMessage } from "../../hooks/useApi";
import moment from "moment";
import "./BillManagement.css";
import "../TransactionFormModal.css";

const { Option } = Select;
const { TextArea } = Input;

const BILL_CATEGORIES = [
  "Utilities",
  "Insurance",
  "Rent/Mortgage",
  "Credit Card",
  "Loan",
  "Subscription",
  "Medical",
  "Education",
  "Other",
];

const FREQUENCY_OPTIONS = [
  "One-time",
  "Weekly",
  "Bi-weekly",
  "Monthly",
  "Quarterly",
  "Yearly",
];

const BillManagement = () => {
  const [bills, setBills] = useState([]);
  const [upcomingBills, setUpcomingBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingBillId, setDeletingBillId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [filter, setFilter] = useState("all"); // all, paid, unpaid, upcoming
  const [form] = Form.useForm();
  const { request } = useApiWithMessage();

  // Fetch all bills
  const fetchBills = async () => {
    setLoading(true);
    const result = await request(
      {
        url: "/api/v1/bills/all",
        method: "GET",
        requiresAuth: true,
      },
      {
        showSuccess: false,
        showError: true,
      }
    );

    setLoading(false);

    if (result.data?.billReminders) {
      setBills(result.data.billReminders);
    }
  };

  // Fetch upcoming bills
  const fetchUpcomingBills = async () => {
    const result = await request(
      {
        url: "/api/v1/bills/upcoming",
        method: "GET",
        requiresAuth: true,
      },
      {
        showSuccess: false,
        showError: false,
      }
    );

    if (result.data?.bills) {
      setUpcomingBills(result.data.bills);
    }
  };

  // Test send reminders (for testing email functionality)
  // Uncomment this function and the button in the UI for testing purposes
  // const handleTestSendReminders = async () => {
  //   const result = await request(
  //     {
  //       url: "/api/v1/bills/test-send-reminders",
  //       method: "POST",
  //       requiresAuth: true,
  //     },
  //     {
  //       successMessage: "Reminder check completed! Check your email if you have bills due soon.",
  //       showError: true,
  //     }
  //   );

  //   if (!result.error) {
  //     // Refresh bills to see updated reminder status
  //     fetchBills();
  //     fetchUpcomingBills();
  //   }
  // };

  useEffect(() => {
    fetchBills();
    fetchUpcomingBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle create/update bill
  const handleSubmit = async (values) => {
    try {
      const billData = {
        ...values,
        dueDate: values.dueDate.format("YYYY-MM-DD"),
      };

      if (editingBill) {
        // Update existing bill
        const result = await request(
          {
            url: `/api/v1/bills/${editingBill.reminderId}`,
            method: "PUT",
            data: billData,
            requiresAuth: true,
          },
          {
            successMessage: "Bill reminder updated successfully",
            showError: true,
          }
        );

        if (!result.error) {
          setModalVisible(false);
          setEditingBill(null);
          form.resetFields();
          fetchBills();
          fetchUpcomingBills();
        }
      } else {
        // Create new bill
        const result = await request(
          {
            url: "/api/v1/bills/create",
            method: "POST",
            data: billData,
            requiresAuth: true,
          },
          {
            successMessage: "Bill reminder created successfully",
            showError: true,
          }
        );

        if (!result.error) {
          setModalVisible(false);
          form.resetFields();
          fetchBills();
          fetchUpcomingBills();
        }
      }
    } catch (error) {
      console.error("Error saving bill:", error);
    }
  };

  // Handle delete bill
  const handleDelete = async (reminderId) => {
    setDeletingBillId(reminderId);
    
    try {
      const result = await request(
        {
          url: `/api/v1/bills/${reminderId}`,
          method: "DELETE",
          requiresAuth: true,
        },
        {
          successMessage: "Bill reminder deleted successfully",
          showError: true,
        }
      );

      if (!result.error) {
        // Remove the bill from state immediately to update UI
        setBills((prevBills) => 
          prevBills.filter((bill) => bill.reminderId !== reminderId)
        );
        setUpcomingBills((prevBills) => 
          prevBills.filter((bill) => bill.reminderId !== reminderId)
        );
        
        // Use requestAnimationFrame to ensure DOM updates happen after current frame
        requestAnimationFrame(() => {
          // Small delay to allow ResizeObserver to complete before refetching
          setTimeout(() => {
            fetchBills();
            fetchUpcomingBills();
            setDeletingBillId(null);
          }, 150);
        });
      } else {
        setDeletingBillId(null);
      }
    } catch (error) {
      console.error("Error deleting bill:", error);
      setDeletingBillId(null);
    }
  };

  // Mark bill as paid
  const handleMarkAsPaid = async (reminderId) => {
    const result = await request(
      {
        url: `/api/v1/bills/${reminderId}/mark-paid`,
        method: "PATCH",
        requiresAuth: true,
      },
      {
        successMessage: "Bill marked as paid successfully",
        showError: true,
      }
    );

    if (!result.error) {
      fetchBills();
      fetchUpcomingBills();
    }
  };

  // Mark bill as unpaid
  const handleMarkAsUnpaid = async (reminderId) => {
    const result = await request(
      {
        url: `/api/v1/bills/${reminderId}/mark-unpaid`,
        method: "PATCH",
        requiresAuth: true,
      },
      {
        successMessage: "Bill marked as unpaid successfully",
        showError: true,
      }
    );

    if (!result.error) {
      fetchBills();
      fetchUpcomingBills();
    }
  };

  // Open modal for editing
  const handleEdit = (bill) => {
    setEditingBill(bill);
    form.setFieldsValue({
      billName: bill.billName,
      amount: bill.amount,
      dueDate: moment(bill.dueDate),
      frequency: bill.frequency,
      category: bill.category,
      notes: bill.notes,
    });
    setModalVisible(true);
  };

  // Open modal for creating
  const handleCreate = () => {
    setEditingBill(null);
    form.resetFields();
    form.setFieldsValue({
      frequency: "One-time",
      category: "Other",
    });
    setModalVisible(true);
  };

  // Get filtered bills
  const getFilteredBills = () => {
    switch (filter) {
      case "paid":
        return bills.filter((bill) => bill.isPaid);
      case "unpaid":
        return bills.filter((bill) => !bill.isPaid);
      case "upcoming":
        return bills.filter(
          (bill) =>
            !bill.isPaid &&
            moment(bill.dueDate).isAfter(moment().subtract(1, "day"))
        );
      default:
        return bills;
    }
  };

  // Get days until due
  const getDaysUntilDue = (dueDate) => {
    const days = moment(dueDate).diff(moment(), "days");
    return days;
  };

  // Get urgency status
  const getUrgencyStatus = (bill) => {
    if (bill.isPaid) return "success";
    const days = getDaysUntilDue(bill.dueDate);
    if (days < 0) return "error";
    if (days === 0) return "error";
    if (days <= 1) return "warning";
    if (days <= 7) return "warning";
    return "success";
  };

  // Get urgency message
  const getUrgencyMessage = (bill) => {
    if (bill.isPaid) return "Paid";
    const days = getDaysUntilDue(bill.dueDate);
    if (days < 0) return `Overdue by ${Math.abs(days)} day(s)`;
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    if (days <= 7) return `Due in ${days} days`;
    return `Due in ${days} days`;
  };

  const filteredBills = getFilteredBills();
  const unpaidCount = bills.filter((bill) => !bill.isPaid).length;
  const upcomingCount = upcomingBills.length;

  return (
    <Layout>
      <div className="bill-management-container">
        <Card className="bill-management-card">
          <div className="bill-header">
            <div>
              <h1 className="bill-title">Bill Reminders & Notifications</h1>
              <p className="bill-subtitle">
                Track and manage your bills with automated reminders
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={handleCreate}
              className="add-bill-btn"
            >
              Add Bill
            </Button>
            {/* Test Reminders Button - Uncomment for testing purposes */}
            {/* <Button
              type="default"
              icon={<BellOutlined />}
              size="large"
              onClick={handleTestSendReminders}
              className="test-reminder-btn"
              title="Test email reminders (for testing purposes)"
            >
              Test Reminders
            </Button> */}
          </div>

          {/* Statistics */}
          <div className="bill-statistics">
            <Card className="stat-card">
              <div className="stat-content">
                <div className="stat-icon unpaid">
                  <FileTextOutlined />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{unpaidCount}</div>
                  <div className="stat-label">Unpaid Bills</div>
                </div>
              </div>
            </Card>
            <Card className="stat-card">
              <div className="stat-content">
                <div className="stat-icon upcoming">
                  <BellOutlined />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{upcomingCount}</div>
                  <div className="stat-label">Upcoming (7 days)</div>
                </div>
              </div>
            </Card>
            <Card className="stat-card">
              <div className="stat-content">
                <div className="stat-icon paid">
                  <CheckCircleOutlined />
                </div>
                <div className="stat-info">
                  <div className="stat-value">
                    {bills.filter((bill) => bill.isPaid).length}
                  </div>
                  <div className="stat-label">Paid Bills</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Upcoming Bills Alert */}
          {upcomingBills.length > 0 && (
            <Alert
              message={`You have ${upcomingBills.length} bill(s) due in the next 7 days`}
              type="warning"
              icon={<WarningOutlined />}
              showIcon
              style={{ marginBottom: "1.5rem" }}
              action={
                <Button
                  size="small"
                  onClick={() => setFilter("upcoming")}
                  type="link"
                >
                  View All
                </Button>
              }
            />
          )}

          {/* Filters */}
          <div className="bill-filters">
            <Space>
              <Button
                type={filter === "all" ? "primary" : "default"}
                onClick={() => setFilter("all")}
              >
                All Bills
              </Button>
              <Button
                type={filter === "unpaid" ? "primary" : "default"}
                onClick={() => setFilter("unpaid")}
              >
                Unpaid
              </Button>
              <Button
                type={filter === "paid" ? "primary" : "default"}
                onClick={() => setFilter("paid")}
              >
                Paid
              </Button>
              <Button
                type={filter === "upcoming" ? "primary" : "default"}
                onClick={() => setFilter("upcoming")}
              >
                Upcoming
              </Button>
            </Space>
          </div>

          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : filteredBills.length === 0 ? (
            <Empty
              description="No bills found. Create your first bill reminder!"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                Create Bill Reminder
              </Button>
            </Empty>
          ) : (
            <div className="bills-grid">
              {filteredBills
                .filter((bill) => bill.reminderId !== deletingBillId)
                .map((bill) => {
                  const urgencyStatus = getUrgencyStatus(bill);
                  const urgencyMessage = getUrgencyMessage(bill);

                return (
                  <Card
                    key={bill.reminderId}
                    className="bill-card"
                    hoverable
                    style={{
                      borderLeft: `4px solid ${
                        urgencyStatus === "error"
                          ? "#ff4d4f"
                          : urgencyStatus === "warning"
                          ? "#faad14"
                          : "#52c41a"
                      }`,
                    }}
                  >
                    <div className="bill-card-content">
                      <div className="bill-card-header">
                        <div>
                          <h3 className="bill-name">{bill.billName}</h3>
                          <div className="bill-meta">
                            <Tag color="blue">{bill.category}</Tag>
                            {bill.frequency !== "One-time" && (
                              <Tag color="purple">{bill.frequency}</Tag>
                            )}
                            {bill.isPaid && (
                              <Tag color="green" icon={<CheckCircleOutlined />}>
                                Paid
                              </Tag>
                            )}
                          </div>
                        </div>
                        <Alert
                          message={urgencyMessage}
                          type={urgencyStatus}
                          showIcon
                          style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                        />
                      </div>

                      <div className="bill-amounts">
                        <div className="amount-row">
                          <span className="amount-label">Amount:</span>
                          <span className="amount-value">
                            ₹{parseFloat(bill.amount).toLocaleString()}
                          </span>
                        </div>
                        <div className="amount-row">
                          <span className="amount-label">Due Date:</span>
                          <span className="amount-value">
                            {moment(bill.dueDate).format("MMM DD, YYYY")}
                          </span>
                        </div>
                        {bill.isPaid && bill.paidDate && (
                          <div className="amount-row">
                            <span className="amount-label">Paid Date:</span>
                            <span className="amount-value">
                              {moment(bill.paidDate).format("MMM DD, YYYY")}
                            </span>
                          </div>
                        )}
                      </div>

                      {bill.notes && (
                        <div className="bill-notes">
                          <p>{bill.notes}</p>
                        </div>
                      )}

                      <div className="bill-actions">
                        {!bill.isPaid ? (
                          <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleMarkAsPaid(bill.reminderId)}
                            className="mark-paid-btn"
                            style={{
                              minWidth: "140px",
                              whiteSpace: "nowrap",
                              padding: "8px 16px",
                            }}
                          >
                            Mark as Paid
                          </Button>
                        ) : (
                          <Button
                            type="default"
                            icon={<CloseCircleOutlined />}
                            onClick={() => handleMarkAsUnpaid(bill.reminderId)}
                            className="mark-unpaid-btn"
                            style={{
                              minWidth: "140px",
                              whiteSpace: "nowrap",
                              padding: "8px 16px",
                            }}
                          >
                            Mark as Unpaid
                          </Button>
                        )}
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(bill)}
                          className="edit-btn"
                        >
                          Edit
                        </Button>
                        <Popconfirm
                          title="Delete Bill Reminder"
                          description="Are you sure you want to delete this bill reminder?"
                          onConfirm={() => handleDelete(bill.reminderId)}
                          onCancel={() => setDeletingBillId(null)}
                          okText="Yes, Delete"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            className="delete-btn"
                            loading={deletingBillId === bill.reminderId}
                            disabled={deletingBillId === bill.reminderId}
                          >
                            Delete
                          </Button>
                        </Popconfirm>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>

        {/* Create/Edit Bill Modal */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {editingBill ? (
                <EditFilled style={{ fontSize: "24px", color: "#ffffff" }} />
              ) : (
                <PlusOutlined style={{ fontSize: "24px", color: "#ffffff" }} />
              )}
              <span
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "#ffffff",
                }}
              >
                {editingBill ? "Edit Bill Reminder" : "Create New Bill Reminder"}
              </span>
            </div>
          }
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingBill(null);
            form.resetFields();
          }}
          destroyOnClose={true}
          footer={false}
          width={700}
          className="transaction-form-modal"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              frequency: "One-time",
              category: "Other",
            }}
            className="modern-transaction-form"
          >
            <Form.Item
              label={
                <span className="form-label">
                  <FileTextOutlined
                    style={{ marginRight: "8px", color: "#667eea" }}
                  />
                  Bill Name
                </span>
              }
              name="billName"
              rules={[{ required: true, message: "Please enter bill name!" }]}
              className="form-item-modern"
            >
              <Input
                placeholder="e.g., Electricity Bill, Rent, Insurance"
                size="large"
                className="modern-input"
                style={{ height: "48px", fontSize: "16px" }}
              />
            </Form.Item>

            <div className="form-row-group">
              <Form.Item
                label={
                  <span className="form-label">
                    <DollarOutlined
                      style={{ marginRight: "8px", color: "#667eea" }}
                    />
                    Amount (₹)
                  </span>
                }
                name="amount"
                rules={[
                  { required: true, message: "Please enter bill amount!" },
                  { type: "number", min: 0, message: "Amount must be positive!" },
                ]}
                className="form-item-modern"
              >
                <InputNumber
                  placeholder="Enter amount"
                  prefix="₹"
                  style={{ width: "100%", height: "48px" }}
                  className="modern-input"
                  min={0}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="form-label">
                    <CalendarOutlined
                      style={{ marginRight: "8px", color: "#667eea" }}
                    />
                    Due Date
                  </span>
                }
                name="dueDate"
                rules={[{ required: true, message: "Please select due date!" }]}
                className="form-item-modern"
              >
                <DatePicker
                  format="YYYY-MM-DD"
                  className="modern-datepicker"
                  style={{ width: "100%", height: "48px" }}
                />
              </Form.Item>
            </div>

            <div className="form-row-group">
              <Form.Item
                label={
                  <span className="form-label">
                    <FileTextOutlined
                      style={{ marginRight: "8px", color: "#667eea" }}
                    />
                    Category
                  </span>
                }
                name="category"
                rules={[{ required: true, message: "Please select category!" }]}
                className="form-item-modern"
              >
                <Select
                  placeholder="Select category"
                  size="large"
                  className="modern-select"
                  style={{ height: "48px" }}
                >
                  {BILL_CATEGORIES.map((cat) => (
                    <Option key={cat} value={cat}>
                      {cat}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label={
                  <span className="form-label">
                    <CalendarOutlined
                      style={{ marginRight: "8px", color: "#667eea" }}
                    />
                    Frequency
                  </span>
                }
                name="frequency"
                rules={[{ required: true, message: "Please select frequency!" }]}
                className="form-item-modern"
              >
                <Select
                  placeholder="Select frequency"
                  size="large"
                  className="modern-select"
                  style={{ height: "48px" }}
                >
                  {FREQUENCY_OPTIONS.map((freq) => (
                    <Option key={freq} value={freq}>
                      {freq}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              label={
                <span className="form-label">
                  <EditOutlined style={{ marginRight: "8px", color: "#667eea" }} />
                  Notes (Optional)
                </span>
              }
              name="notes"
              className="form-item-modern"
            >
              <TextArea
                rows={3}
                placeholder="Add any notes about this bill..."
                className="modern-textarea"
                style={{ fontSize: "16px" }}
              />
            </Form.Item>

            <div className="form-actions">
              <Button
                type="default"
                size="large"
                onClick={() => {
                  setModalVisible(false);
                  setEditingBill(null);
                  form.resetFields();
                }}
                className="cancel-btn-modern"
                style={{
                  minWidth: "120px",
                  height: "48px",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                className="submit-btn-modern"
                style={{
                  minWidth: "120px",
                  height: "48px",
                  fontSize: "16px",
                  fontWeight: "600",
                  background:
                    "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)",
                  border: "none",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                }}
              >
                {loading
                  ? "Saving..."
                  : editingBill
                  ? "Update Bill"
                  : "Create Bill"}
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};

export default BillManagement;
