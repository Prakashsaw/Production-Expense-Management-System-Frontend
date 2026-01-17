import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Form,
  Input,
  message,
  Modal,
  Select,
  Table,
  DatePicker,
  Alert,
  Button,
  Tag,
} from "antd";
import {
  UnorderedListOutlined,
  AreaChartOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import Layout from "./../components/Layout/Layout";
import moment from "moment";
import Analytics from "../components/Analytics";
import { useApiWithMessage } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import ErrorAlert from "../components/common/ErrorAlert";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const { RangePicker } = DatePicker;
const { Search } = Input;

// Constants
const VIEW_TYPES = {
  TABLE: "table",
  ANALYTICS: "analytics",
};

const FREQUENCY_OPTIONS = [
  { value: "7", label: "LAST 1 Week" },
  { value: "30", label: "LAST 1 Month" },
  { value: "365", label: "LAST 1 Year" },
  { value: "custom", label: "Custom" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "ALL" },
  { value: "Income", label: "INCOME" },
  { value: "Expense", label: "EXPENSE" },
];

const TRANSACTION_CATEGORIES = [
  "Income in Salary",
  "Income in Part Time",
  "Income in Project",
  "Income in Freelancing",
  "Income in Tip",
  "Expense in Stationary",
  "Expense in Food",
  "Expense in Movie",
  "Expense in Bills",
  "Expense in Medical",
  "Expense in Fees",
  "Expense in TAX",
];

const HomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [allTransection, setAllTransection] = useState([]);
  const [frequency, setFrequency] = useState("365");
  const [selectedDate, setSelectedate] = useState([]);
  const [type, setType] = useState("all");
  const [viewData, setViewData] = useState(VIEW_TYPES.TABLE);
  const [editable, setEditable] = useState(null);
  const [transactionError, setTransactionError] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form] = Form.useForm();

  const { request, loading } = useApiWithMessage();

  // Get all transactions - must be defined first
  const getAllTransactions = useCallback(async () => {
    setTransactionError(null);
    const result = await request(
      {
        url: "/api/v1/transections/get-transection",
        method: "POST",
        data: {
          frequency,
          selectedDate,
          type,
        },
        requiresAuth: true,
      },
      {
        showSuccess: false,
        showError: false,
      }
    );

    if (result.error) {
      setTransactionError(result.error);
      return;
    }

    if (result.data?.transactions) {
      setAllTransection(result.data.transactions);
    }
  }, [frequency, selectedDate, type, request]);

  // Fetch transactions when filters change
  useEffect(() => {
    getAllTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frequency, selectedDate, type]);

  // Delete handler - must be defined before columns
  const deleteTransaction = useCallback(
    async (record) => {
      const result = await request(
        {
          url: `/api/v1/transections/delete-transection/${record.transactionId}`,
          method: "POST",
          data: {},
          requiresAuth: true,
        },
        {
          successMessage: "Transaction deleted successfully",
          errorMessage: "Unable to delete transaction",
        }
      );

      if (!result.error) {
        getAllTransactions();
      }
    },
    [request, getAllTransactions]
  );

  const handleDelete = useCallback(
    (record) => {
      setTransactionToDelete(record);
      setDeleteModalVisible(true);
    },
    []
  );

  const confirmDelete = useCallback(async () => {
    if (!transactionToDelete) return;
    
    setDeleting(true);
    await deleteTransaction(transactionToDelete);
    setDeleting(false);
    setDeleteModalVisible(false);
    setTransactionToDelete(null);
  }, [transactionToDelete, deleteTransaction]);

  const cancelDelete = useCallback(() => {
    setDeleteModalVisible(false);
    setTransactionToDelete(null);
  }, []);

  // Table columns
  const columns = useMemo(() => [
    // Serial number is added to the table
    {
      title: "S.No",
      dataIndex: "sno",
      key: "sno",
      render: (text, record, index) => index + 1,
    },
    {
      id: "1",
      title: "Date(yyyy-mm-dd)",
      dataIndex: "date",
      render: (text) => <span>{moment(text).format("YYYY-MM-DD")}</span>,
    },
    {
      id: "2",
      title: "Amount (₹)",
      dataIndex: "amount",
      render: (amount) => (
        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
          ₹{parseFloat(amount).toLocaleString()}
        </span>
      ),
    },
    {
      id: "3",
      title: "Type",
      dataIndex: "type",
      render: (type) => (
        <span
          style={{
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.875rem',
            fontWeight: '600',
            background: type === 'Income' 
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
              : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            display: 'inline-block',
          }}
        >
          {type}
        </span>
      ),
    },
    {
      id: "4",
      title: "Category",
      dataIndex: "category",
      render: (category) => (
        <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
          {category}
        </span>
      ),
    },
    {
      id: "5",
      title: "Refrence",
      dataIndex: "refrence",
    },
    {
      id: "6",
      title: "Actions",
      render: (text, record) => (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <EditOutlined
            style={{ 
              color: "var(--secondary-color)",
              fontSize: '18px',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              transition: 'all var(--transition-base)'
            }}
            className="action-icon"
            onClick={() => {
              setEditable(record);
              setShowModal(true);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          />
          <DeleteOutlined
            style={{ 
              color: "var(--danger-color)",
              fontSize: '18px',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              transition: 'all var(--transition-base)'
            }}
            className="action-icon"
            onClick={() => {
              handleDelete(record);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          />
        </div>
      ),
    },
  ], [handleDelete, setEditable, setShowModal]);

  // Update form values when editable changes
  useEffect(() => {
    if (showModal && editable) {
      // Format date for input field (YYYY-MM-DD)
      const formattedDate = editable.date 
        ? moment(editable.date).format('YYYY-MM-DD')
        : '';
      
      form.setFieldsValue({
        ...editable,
        date: formattedDate,
      });
    } else if (showModal && !editable) {
      form.resetFields();
    }
  }, [editable, showModal, form]);

  // Form handling
  const handleSubmit = useCallback(
    async (values) => {
      const isEdit = !!editable;
      const url = isEdit
        ? `/api/v1/transections/edit-transection/${editable.transactionId}`
        : "/api/v1/transections/add-transection";

      const result = await request(
        {
          url,
          method: "POST",
          data: values,
          requiresAuth: true,
        },
        {
          successMessage: `Transaction ${isEdit ? "updated" : "added"} successfully`,
          errorMessage: "Please fill all fields correctly",
        }
      );

      if (!result.error) {
        setShowModal(false);
        setEditable(null);
        form.resetFields();
        getAllTransactions();
      }
    },
    [editable, request, form, getAllTransactions]
  );

  // Search handler - Note: This should ideally work with backend, but keeping as is for now
  const onSearch = useCallback(
    (value) => {
      if (!value) {
        getAllTransactions();
        return;
      }

      const searchLower = value.toLowerCase();
      const filteredData = allTransection.filter((transaction) =>
        Object.values(transaction).some((field) =>
          field?.toString().toLowerCase().includes(searchLower)
        )
      );

      setAllTransection(filteredData);
    },
    [allTransection, getAllTransactions]
  );

  // Export to excel
  const exportToExcel = useCallback(() => {
    setTransactionError(null);
    if (allTransection.length === 0) {
      setTransactionError("No data available to export.");
      message.warning("No transactions to export");
      return;
    }

    try {
      const exportData = allTransection.map((transaction, index) => ({
        "S.No": index + 1,
        "Date (yyyy-mm-dd)": moment(transaction.date).format("YYYY-MM-DD"),
        "Amount (₹)": transaction.amount,
        Type: transaction.type,
        Category: transaction.category,
        Reference: transaction.refrence,
        Description: transaction.description || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const data = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });

      const currentDate = moment().format("DD-MM-YYYY");
      saveAs(data, `Transactions(${currentDate}).xlsx`);
      message.success("Excel file downloaded successfully");
    } catch (error) {
      setTransactionError("Failed to export data");
      message.error("Failed to export data");
    }
  }, [allTransection]);

  return (
    <>
      <Layout>
        <div className="transaction-page">
          <ErrorAlert error={transactionError} onClose={() => setTransactionError(null)} />
          <div className="filters">
            <div>
              <h6>Select Frequency</h6>
              <Select
                value={frequency}
                onChange={setFrequency}
                style={{ minWidth: 150 }}
              >
                {FREQUENCY_OPTIONS.map((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
              {frequency === "custom" && (
                <RangePicker
                  value={selectedDate}
                  onChange={(values) => setSelectedate(values)}
                />
              )}
            </div>
            <div className="filter-tab">
              <h6>Select Type</h6>
              <Select
                value={type}
                onChange={setType}
                style={{ minWidth: 150 }}
              >
                {TYPE_OPTIONS.map((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div className="switch-icons">
              <UnorderedListOutlined
                className={`mx-2 ${
                  viewData === VIEW_TYPES.TABLE ? "active-icon" : "inactive-icon"
                }`}
                onClick={() => setViewData(VIEW_TYPES.TABLE)}
              />
              <AreaChartOutlined
                className={`mx-2 ${
                  viewData === VIEW_TYPES.ANALYTICS ? "active-icon" : "inactive-icon"
                }`}
                onClick={() => setViewData(VIEW_TYPES.ANALYTICS)}
              />
            </div>
            <div className="search-bar">
              <Search
                placeholder="Search transactions"
                allowClear
                onSearch={onSearch}
                style={{
                  width: '100%',
                  minWidth: 150,
                }}
              />
            </div>
            <div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditable(null);
                  form.resetFields();
                  setShowModal(true);
                }}
              >
                Add New
              </button>
            </div>
            <div>
              <button
                className="btn btn-secondary trasctn-exprt-btn"
                onClick={exportToExcel}
              >
                Export to Excel <ExportOutlined />
              </button>
            </div>
          </div>
          <div className="content">
            {viewData === VIEW_TYPES.TABLE ? (
              <Table 
                columns={columns} 
                dataSource={allTransection}
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} transactions`,
                }}
                rowKey="transactionId"
                style={{
                  background: 'var(--bg-primary)',
                }}
                className="modern-table"
              />
            ) : (
              <Analytics allTransection={allTransection} />
            )}
          </div>
          <Modal
            title={
              <span
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  background:
                    "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {editable ? "Edit Transaction" : "Add Transaction"}
              </span>
            }
            open={showModal}
            onCancel={() => {
              setShowModal(false);
              setEditable(null);
              form.resetFields();
            }}
            destroyOnClose={true}
            footer={false}
            width={600}
            style={{
              borderRadius: "var(--radius-xl)",
            }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item 
                label={<span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Amount</span>} 
                name="amount"
                rules={[{ required: true, message: 'Please enter amount!' }]}
              >
                <Input 
                  type="number" 
                  placeholder="Enter amount"
                  style={{ borderRadius: 'var(--radius-md)', height: '40px' }}
                />
              </Form.Item>
              <Form.Item 
                label={<span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Type</span>} 
                name="type"
                rules={[{ required: true, message: 'Please select type!' }]}
              >
                <Select 
                  placeholder="Select type"
                  style={{ borderRadius: 'var(--radius-md)' }}
                >
                  <Select.Option value="Income">Income</Select.Option>
                  <Select.Option value="Expense">Expense</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                label={
                  <span
                    style={{
                      fontWeight: "600",
                      color: "var(--text-primary)",
                    }}
                  >
                    Category
                  </span>
                }
                name="category"
                rules={[{ required: true, message: "Please select category!" }]}
              >
                <Select
                  placeholder="Select category"
                  style={{ borderRadius: "var(--radius-md)" }}
                >
                  {TRANSACTION_CATEGORIES.map((category) => (
                    <Select.Option key={category} value={category}>
                      {category}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item 
                label={<span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Date</span>} 
                name="date"
                rules={[{ required: true, message: 'Please select date!' }]}
              >
                <Input 
                  type="date" 
                  style={{ borderRadius: 'var(--radius-md)', height: '40px' }}
                />
              </Form.Item>
              <Form.Item 
                label={<span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Reference</span>} 
                name="refrence"
                rules={[{ required: true, message: 'Please enter reference!' }]}
              >
                <Input 
                  type="text" 
                  placeholder="Enter reference"
                  style={{ borderRadius: 'var(--radius-md)', height: '40px' }}
                />
              </Form.Item>
              <Form.Item 
                label={<span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Description</span>} 
                name="description"
                rules={[{ required: true, message: 'Please enter description!' }]}
              >
                <Input.TextArea 
                  rows={3}
                  placeholder="Enter description"
                  style={{ borderRadius: 'var(--radius-md)' }}
                />
              </Form.Item>
              <div className="d-flex justify-content-end" style={{ gap: '0.5rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditable(null);
                  }}
                  style={{ minWidth: '100px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ minWidth: '100px' }}
                >
                  {loading ? 'Saving...' : 'SAVE'}
                </button>
              </div>
            </Form>
          </Modal>

          {/* Delete Transaction Confirmation Modal */}
          <Modal
            title={
              <span style={{ color: "#ff4d4f", display: "flex", alignItems: "center", gap: "8px" }}>
                <ExclamationCircleOutlined style={{ fontSize: "20px" }} />
                Delete Transaction
              </span>
            }
            open={deleteModalVisible}
            onCancel={cancelDelete}
            footer={[
              <Button
                key="cancel"
                onClick={cancelDelete}
                disabled={deleting}
                size="large"
              >
                Cancel
              </Button>,
              <Button
                key="delete"
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={confirmDelete}
                loading={deleting}
                size="large"
              >
                {deleting ? "Deleting..." : "Delete Transaction"}
              </Button>,
            ]}
            width={550}
            className="delete-transaction-modal"
            closable={!deleting}
            maskClosable={!deleting}
          >
            {transactionToDelete && (
              <div style={{ padding: "10px 0" }}>
                <div style={{ 
                  background: "#fff7e6", 
                  border: "2px solid #ffd591", 
                  borderRadius: "8px", 
                  padding: "16px", 
                  marginBottom: "20px" 
                }}>
                  <p style={{ 
                    margin: 0, 
                    color: "#d46b08", 
                    fontSize: "16px", 
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <ExclamationCircleOutlined style={{ fontSize: "18px" }} />
                    Warning: This action cannot be undone!
                  </p>
                  <p style={{ 
                    margin: "12px 0 0 0", 
                    color: "#d46b08", 
                    fontSize: "14px" 
                  }}>
                    You are about to permanently delete this transaction. Once deleted, it cannot be recovered.
                  </p>
                </div>

                <div style={{ 
                  background: "#f5f5f5", 
                  borderRadius: "8px", 
                  padding: "16px",
                  border: "1px solid #e0e0e0"
                }}>
                  <p style={{ 
                    fontSize: "15px", 
                    fontWeight: 600, 
                    marginBottom: "16px",
                    color: "#333"
                  }}>
                    Transaction Details:
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#666", fontWeight: 500 }}>Amount:</span>
                      <span style={{ 
                        fontSize: "18px", 
                        fontWeight: 700, 
                        color: transactionToDelete.type === "Income" ? "#10b981" : "#ef4444"
                      }}>
                        ₹{parseFloat(transactionToDelete.amount).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#666", fontWeight: 500 }}>Type:</span>
                      <Tag
                        color={transactionToDelete.type === "Income" ? "green" : "red"}
                        style={{ 
                          fontSize: "13px",
                          fontWeight: 600,
                          padding: "4px 12px"
                        }}
                      >
                        {transactionToDelete.type}
                      </Tag>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#666", fontWeight: 500 }}>Category:</span>
                      <span style={{ fontWeight: 600, color: "#333" }}>
                        {transactionToDelete.category}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#666", fontWeight: 500 }}>Date:</span>
                      <span style={{ fontWeight: 600, color: "#333" }}>
                        {moment(transactionToDelete.date).format("DD MMM YYYY")}
                      </span>
                    </div>
                    {transactionToDelete.refrence && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#666", fontWeight: 500 }}>Reference:</span>
                        <span style={{ fontWeight: 500, color: "#333" }}>
                          {transactionToDelete.refrence}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <p style={{ 
                  fontSize: "15px", 
                  marginTop: "20px", 
                  marginBottom: "0", 
                  fontWeight: 500,
                  color: "#333",
                  textAlign: "center"
                }}>
                  Are you sure you want to delete this transaction?
                </p>
              </div>
            )}
          </Modal>
        </div>
      </Layout>
    </>
  );
};

export default HomePage;
