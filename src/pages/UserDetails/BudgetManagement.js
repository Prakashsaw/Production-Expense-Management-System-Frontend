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
  Progress,
  Statistic,
  Row,
  Col,
  Alert,
  Switch,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  CalendarOutlined,
  FolderOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditFilled,
  FundOutlined,
  PieChartOutlined,
  ThunderboltOutlined,
  FolderAddOutlined,
  FolderOpenOutlined,
  ShoppingOutlined,
  CarOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  BookOutlined,
  CoffeeOutlined,
  GiftOutlined,
  CreditCardOutlined,
  BankOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  TrophyOutlined,
  SettingOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import Layout from "../../components/Layout/Layout";
import { useApiWithMessage } from "../../hooks/useApi";
import moment from "moment";
import "./BudgetManagement.css";
import "../TransactionFormModal.css";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

// Icon mapping for custom categories
const ICON_MAP = {
  FolderOutlined,
  FolderAddOutlined,
  FolderOpenOutlined,
  ShoppingOutlined,
  CarOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  BookOutlined,
  CoffeeOutlined,
  GiftOutlined,
  DollarOutlined,
  CreditCardOutlined,
  BankOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  TrophyOutlined,
  SettingOutlined,
  AppstoreOutlined,
};

// Helper function to get icon component by name
const getIconComponent = (iconName) => {
  return ICON_MAP[iconName] || FolderOutlined;
};

// Budget Templates
const BUDGET_TEMPLATES = [
  {
    name: "Student Budget",
    description: "Basic budget for students",
    budgets: [
      { category: "Expense in Food", amount: 5000, period: "Monthly" },
      { category: "Expense in Stationary", amount: 1000, period: "Monthly" },
      { category: "Expense in Fees", amount: 10000, period: "Monthly" },
    ],
  },
  {
    name: "Family Budget",
    description: "Comprehensive family budget",
    budgets: [
      { category: "Expense in Food", amount: 15000, period: "Monthly" },
      { category: "Expense in Bills", amount: 8000, period: "Monthly" },
      { category: "Expense in Medical", amount: 5000, period: "Monthly" },
      { category: "Expense in TAX", amount: 20000, period: "Yearly" },
    ],
  },
  {
    name: "Minimal Budget",
    description: "Essential expenses only",
    budgets: [
      { category: "Expense in Food", amount: 3000, period: "Monthly" },
      { category: "Expense in Bills", amount: 2000, period: "Monthly" },
    ],
  },
];

const BudgetManagement = () => {
  const [budgets, setBudgets] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletingBudgetId, setDeletingBudgetId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Monthly");
  const [allCategories, setAllCategories] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [form] = Form.useForm();
  const { request } = useApiWithMessage();

  // Fetch all budgets
  const fetchBudgets = async () => {
    setLoading(true);
    const result = await request(
      {
        url: "/api/v1/budgets/all",
        method: "GET",
        requiresAuth: true,
      },
      {
        showSuccess: false,
        showError: true,
      }
    );

    setLoading(false);

    if (result.data?.budgets) {
      setBudgets(result.data.budgets);
    }
  };

  // Fetch budget summary
  const fetchBudgetSummary = async () => {
    const result = await request(
      {
        url: `/api/v1/budgets/summary?period=${selectedPeriod}`,
        method: "GET",
        requiresAuth: true,
      },
      {
        showSuccess: false,
        showError: false,
      }
    );

    if (result.data?.summary) {
      setBudgetSummary(result.data.summary);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    const result = await request(
      {
        url: "/api/v1/categories/all",
        method: "GET",
        requiresAuth: true,
      },
      {
        showSuccess: false,
        showError: false,
      }
    );

    if (result.data?.categories) {
      const { default: defaultCats, custom: customCats, all: allCats } = result.data.categories;
      
      // Create a map of category names to their metadata
      const catMap = {};
      
      // Add default categories to map
      if (defaultCats && Array.isArray(defaultCats)) {
        defaultCats.forEach((cat) => {
          catMap[cat.name] = {
            name: cat.name,
            type: cat.type,
            isDefault: true,
            icon: "FolderOutlined",
            color: "#667eea",
          };
        });
      }
      
      // Add custom categories to map
      if (customCats && Array.isArray(customCats)) {
        customCats.forEach((cat) => {
          catMap[cat.name] = {
            name: cat.name,
            type: cat.type,
            isDefault: false,
            icon: cat.icon || "FolderOutlined",
            color: cat.color || "#667eea",
            categoryId: cat.categoryId,
          };
        });
      }
      
      setCategoryMap(catMap);
      
      // Use allCats if available, otherwise combine default and custom
      if (allCats && Array.isArray(allCats) && allCats.length > 0) {
        setAllCategories(allCats);
      } else {
        const combined = [
          ...(defaultCats || []),
          ...(customCats || [])
        ];
        setAllCategories(combined);
      }
    }
  };

  useEffect(() => {
    fetchBudgets();
    fetchBudgetSummary();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchBudgetSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  // Handle create/update budget
  const handleSubmit = async (values) => {
    try {
      // Get categoryId from categoryMap if it's a custom category
      const selectedCategory = values.category;
      const catInfo = categoryMap[selectedCategory];
      const categoryId = catInfo?.categoryId || null;

      const budgetData = {
        ...values,
        categoryId: categoryId, // Include categoryId for custom categories
        startDate: values.dateRange[0].format("YYYY-MM-DD"),
        endDate: values.dateRange[1].format("YYYY-MM-DD"),
      };
      delete budgetData.dateRange;

      if (editingBudget) {
        // Update existing budget
        const result = await request(
          {
            url: `/api/v1/budgets/${editingBudget.budgetId}`,
            method: "PUT",
            data: budgetData,
            requiresAuth: true,
          },
          {
            successMessage: "Budget updated successfully",
            showError: true,
          }
        );

        if (!result.error) {
          setModalVisible(false);
          setEditingBudget(null);
          form.resetFields();
          fetchBudgets();
          fetchBudgetSummary();
        }
      } else {
        // Create new budget
        const result = await request(
          {
            url: "/api/v1/budgets/create",
            method: "POST",
            data: budgetData,
            requiresAuth: true,
          },
          {
            successMessage: "Budget created successfully",
            showError: true,
          }
        );

        if (!result.error) {
          setModalVisible(false);
          form.resetFields();
          fetchBudgets();
          fetchBudgetSummary();
        }
      }
    } catch (error) {
      console.error("Error saving budget:", error);
    }
  };

  // Handle delete budget
  const handleDelete = async (budgetId) => {
    setDeletingBudgetId(budgetId);
    
    try {
      const result = await request(
        {
          url: `/api/v1/budgets/${budgetId}`,
          method: "DELETE",
          requiresAuth: true,
        },
        {
          successMessage: "Budget deleted successfully",
          showError: true,
        }
      );

      if (!result.error) {
        // Remove the budget from state immediately to update UI
        setBudgets((prevBudgets) => 
          prevBudgets.filter((budget) => budget.budgetId !== budgetId)
        );
        
        // Use requestAnimationFrame to ensure DOM updates happen after current frame
        requestAnimationFrame(() => {
          // Small delay to allow ResizeObserver to complete before refetching
          setTimeout(() => {
            fetchBudgets();
            fetchBudgetSummary();
            setDeletingBudgetId(null);
          }, 150);
        });
      } else {
        setDeletingBudgetId(null);
      }
    } catch (error) {
      console.error("Error deleting budget:", error);
      setDeletingBudgetId(null);
    }
  };

  // Open modal for editing
  const handleEdit = (budget) => {
    setEditingBudget(budget);
    form.setFieldsValue({
      category: budget.category,
      amount: budget.amount,
      period: budget.period,
      dateRange: [moment(budget.startDate), moment(budget.endDate)],
      rollover: budget.rollover,
      alertThreshold: budget.alertThreshold,
      template: budget.template,
      notes: budget.notes,
    });
    setModalVisible(true);
  };

  // Open modal for creating
  const handleCreate = () => {
    setEditingBudget(null);
    form.resetFields();
    // Set default dates based on selected period
    const defaultDates = getDefaultDates(selectedPeriod);
    form.setFieldsValue({
      period: selectedPeriod,
      dateRange: defaultDates,
      alertThreshold: 80,
      rollover: false,
    });
    setModalVisible(true);
  };

  // Get default dates based on period
  const getDefaultDates = (period) => {
    if (period === "Monthly") {
      return [moment().startOf("month"), moment().endOf("month")];
    } else if (period === "Yearly") {
      return [moment().startOf("year"), moment().endOf("year")];
    } else if (period === "Weekly") {
      return [moment().startOf("week"), moment().endOf("week")];
    }
    return [moment(), moment().add(1, "month")];
  };

  // Apply budget template
  const applyTemplate = async (template) => {
    setTemplateModalVisible(false);
    setLoading(true);

    try {
      const promises = template.budgets.map((budget) => {
        const dates = getDefaultDates(budget.period);
        return request(
          {
            url: "/api/v1/budgets/create",
            method: "POST",
            data: {
              category: budget.category,
              amount: budget.amount,
              period: budget.period,
              startDate: dates[0].format("YYYY-MM-DD"),
              endDate: dates[1].format("YYYY-MM-DD"),
              template: template.name,
            },
            requiresAuth: true,
          },
          {
            showSuccess: false,
            showError: false,
          }
        );
      });

      await Promise.all(promises);
      fetchBudgets();
      fetchBudgetSummary();
      setLoading(false);
    } catch (error) {
      console.error("Error applying template:", error);
      setLoading(false);
    }
  };

  // Get progress color based on percentage
  const getProgressColor = (percentage, isOverBudget) => {
    if (isOverBudget) return "#ff4d4f";
    if (percentage >= 90) return "#ff9800";
    if (percentage >= 80) return "#faad14";
    return "#52c41a";
  };

  // Get alert status
  const getAlertStatus = (budget) => {
    if (budget.isOverBudget) return "error";
    if (budget.percentageUsed >= budget.alertThreshold) return "warning";
    return "success";
  };

  return (
    <Layout>
      <div className="budget-management-container">
        <Card className="budget-management-card">
          <div className="budget-header">
            <div>
              <h1 className="budget-title">Budget Management</h1>
              <p className="budget-subtitle">
                Set and track your spending budgets by category
              </p>
            </div>
            <Space>
              <Button
                type="default"
                icon={<ThunderboltOutlined />}
                size="large"
                onClick={() => setTemplateModalVisible(true)}
                className="template-btn"
              >
                Templates
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={handleCreate}
                className="add-budget-btn"
              >
                Add Budget
              </Button>
            </Space>
          </div>

          {/* Budget Summary */}
          {budgetSummary && (
            <Card className="budget-summary-card" style={{ marginBottom: "2rem" }}>
              <div className="summary-header">
                <h2>Budget Summary - {selectedPeriod}</h2>
                <Select
                  value={selectedPeriod}
                  onChange={setSelectedPeriod}
                  style={{ width: 150 }}
                >
                  <Option value="Weekly">Weekly</Option>
                  <Option value="Monthly">Monthly</Option>
                  <Option value="Yearly">Yearly</Option>
                </Select>
              </div>
              <Row gutter={16} style={{ marginTop: "1.5rem" }}>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Total Budget"
                    value={budgetSummary.totalBudget}
                    prefix={<DollarOutlined />}
                    valueStyle={{ color: "#667eea" }}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Total Spent"
                    value={budgetSummary.totalSpent}
                    prefix={<DollarOutlined />}
                    valueStyle={{ color: "#ff4d4f" }}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Remaining"
                    value={budgetSummary.totalRemaining}
                    prefix={<DollarOutlined />}
                    valueStyle={{
                      color:
                        budgetSummary.totalRemaining >= 0 ? "#52c41a" : "#ff4d4f",
                    }}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Usage"
                    value={budgetSummary.overallPercentageUsed}
                    suffix="%"
                    valueStyle={{
                      color: getProgressColor(
                        budgetSummary.overallPercentageUsed,
                        budgetSummary.totalSpent > budgetSummary.totalBudget
                      ),
                    }}
                  />
                </Col>
              </Row>
              <Progress
                percent={Math.min(budgetSummary.overallPercentageUsed, 100)}
                strokeColor={getProgressColor(
                  budgetSummary.overallPercentageUsed,
                  budgetSummary.totalSpent > budgetSummary.totalBudget
                )}
                style={{ marginTop: "1.5rem" }}
              />
            </Card>
          )}

          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : budgets.length === 0 ? (
            <Empty
              description="No budgets yet. Create your first budget!"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                Create Budget
              </Button>
            </Empty>
          ) : (
            <div className="budgets-grid">
              {budgets
                .filter((budget) => budget.budgetId !== deletingBudgetId)
                .map((budget) => {
                  const alertStatus = getAlertStatus(budget);
                  return (
                    <Card
                      key={budget.budgetId}
                      className="budget-card"
                      hoverable
                      style={{
                        borderLeft: `4px solid ${getProgressColor(
                          budget.percentageUsed,
                          budget.isOverBudget
                        )}`,
                      }}
                    >
                    <div className="budget-card-content">
                      <div className="budget-card-header">
                        <div>
                          <h3 className="budget-category">{budget.category}</h3>
                          <div className="budget-meta">
                            <Tag color="blue">{budget.period}</Tag>
                            {budget.template && (
                              <Tag color="purple">{budget.template}</Tag>
                            )}
                          </div>
                        </div>
                        <Alert
                          message={
                            budget.isOverBudget
                              ? "Over Budget"
                              : budget.percentageUsed >= budget.alertThreshold
                              ? "Alert"
                              : "On Track"
                          }
                          type={alertStatus}
                          icon={
                            budget.isOverBudget ? (
                              <CloseCircleOutlined />
                            ) : budget.percentageUsed >= budget.alertThreshold ? (
                              <WarningOutlined />
                            ) : (
                              <CheckCircleOutlined />
                            )
                          }
                          showIcon
                          style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                        />
                      </div>

                      <div className="budget-amounts">
                        <div className="amount-row">
                          <span className="amount-label">Budget:</span>
                          <span className="amount-value">
                            ₹{parseFloat(budget.amount).toLocaleString()}
                          </span>
                        </div>
                        <div className="amount-row">
                          <span className="amount-label">Spent:</span>
                          <span
                            className="amount-value"
                            style={{
                              color: budget.isOverBudget ? "#ff4d4f" : "#52c41a",
                            }}
                          >
                            ₹{parseFloat(budget.spent || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="amount-row">
                          <span className="amount-label">Remaining:</span>
                          <span
                            className="amount-value"
                            style={{
                              color:
                                budget.remaining >= 0 ? "#52c41a" : "#ff4d4f",
                            }}
                          >
                            ₹{parseFloat(budget.remaining || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <Progress
                        percent={Math.min(budget.percentageUsed || 0, 100)}
                        strokeColor={getProgressColor(
                          budget.percentageUsed,
                          budget.isOverBudget
                        )}
                        status={budget.isOverBudget ? "exception" : "active"}
                        format={(percent) => `${percent?.toFixed(1)}%`}
                        style={{ marginTop: "1rem" }}
                      />

                      <div className="budget-actions">
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(budget)}
                          className="edit-btn"
                        >
                          Edit
                        </Button>
                        <Popconfirm
                          title="Delete Budget"
                          description="Are you sure you want to delete this budget?"
                          onConfirm={() => handleDelete(budget.budgetId)}
                          okText="Yes, Delete"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true }}
                          onCancel={() => setDeletingBudgetId(null)}
                        >
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            className="delete-btn"
                            loading={deletingBudgetId === budget.budgetId}
                            disabled={deletingBudgetId === budget.budgetId}
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

        {/* Create/Edit Budget Modal */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {editingBudget ? (
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
                {editingBudget ? "Edit Budget" : "Create New Budget"}
              </span>
            </div>
          }
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingBudget(null);
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
              period: "Monthly",
              alertThreshold: 80,
              rollover: false,
            }}
            className="modern-transaction-form"
          >
            <Form.Item
              label={
                <span className="form-label">
                  <FolderOutlined style={{ marginRight: "8px", color: "#667eea" }} />
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
                suffixIcon={<FolderOutlined />}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => {
                  // Get the category name from the option value
                  const categoryName = option?.value || '';
                  return categoryName.toLowerCase().includes(input.toLowerCase());
                }}
              >
                {allCategories
                  .filter((cat) => {
                    // Only show Expense categories or "Both" type categories for budgets
                    const catInfo = categoryMap[cat.name] || cat;
                    const categoryType = catInfo?.type || cat?.type;
                    return categoryType === "Expense" || categoryType === "Both";
                  })
                  .map((category) => {
                    const catInfo = categoryMap[category.name] || category;
                    const iconName = catInfo?.icon || category?.icon || "FolderOutlined";
                    const IconComponent = getIconComponent(iconName);
                    const isCustom = catInfo?.isDefault === false || category?.isDefault === false;
                    const categoryColor = catInfo?.color || category?.color || '#667eea';
                    
                    return (
                      <Option key={category.name} value={category.name}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <IconComponent 
                            style={{ 
                              color: categoryColor,
                              fontSize: '16px'
                            }} 
                          />
                          <span>{category.name}</span>
                          {isCustom && (
                            <Tag 
                              color={categoryColor}
                              style={{ 
                                marginLeft: 'auto',
                                fontSize: '10px',
                                padding: '0 4px',
                                height: '18px',
                                lineHeight: '18px'
                              }}
                            >
                              Custom
                            </Tag>
                          )}
                        </div>
                      </Option>
                    );
                  })}
              </Select>
            </Form.Item>

            <div className="form-row-group">
              <Form.Item
                label={
                  <span className="form-label">
                    <DollarOutlined
                      style={{ marginRight: "8px", color: "#667eea" }}
                    />
                    Budget Amount (₹)
                  </span>
                }
                name="amount"
                rules={[
                  { required: true, message: "Please enter budget amount!" },
                  { type: "number", min: 0, message: "Amount must be positive!" },
                ]}
                className="form-item-modern"
              >
                <InputNumber
                  placeholder="Enter budget amount"
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
                    Period
                  </span>
                }
                name="period"
                rules={[{ required: true, message: "Please select period!" }]}
                className="form-item-modern"
              >
                <Select
                  placeholder="Select period"
                  size="large"
                  className="modern-select"
                  style={{ height: "48px" }}
                  onChange={(value) => {
                    const dates = getDefaultDates(value);
                    form.setFieldsValue({ dateRange: dates });
                  }}
                >
                  <Option value="Weekly">Weekly</Option>
                  <Option value="Monthly">Monthly</Option>
                  <Option value="Yearly">Yearly</Option>
                  <Option value="Custom">Custom</Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              label={
                <span className="form-label">
                  <CalendarOutlined
                    style={{ marginRight: "8px", color: "#667eea" }}
                  />
                  Date Range
                </span>
              }
              name="dateRange"
              rules={[{ required: true, message: "Please select date range!" }]}
              className="form-item-modern"
            >
              <RangePicker
                format="YYYY-MM-DD"
                style={{ width: "100%", height: "48px" }}
                className="modern-datepicker"
              />
            </Form.Item>

            <div className="form-row-group">
              <Form.Item
                label={
                  <span className="form-label">
                    <WarningOutlined
                      style={{ marginRight: "8px", color: "#667eea" }}
                    />
                    Alert Threshold (%)
                  </span>
                }
                name="alertThreshold"
                rules={[
                  { required: true, message: "Please enter alert threshold!" },
                ]}
                className="form-item-modern"
              >
                <InputNumber
                  placeholder="Alert at %"
                  min={0}
                  max={100}
                  suffix="%"
                  style={{ width: "100%", height: "48px" }}
                  className="modern-input"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="form-label">
                    <FundOutlined
                      style={{ marginRight: "8px", color: "#667eea" }}
                    />
                    Rollover
                  </span>
                }
                name="rollover"
                valuePropName="checked"
                className="form-item-modern"
              >
                <Switch />
              </Form.Item>
            </div>

            <Form.Item
              label={
                <span className="form-label">
                  <PieChartOutlined
                    style={{ marginRight: "8px", color: "#667eea" }}
                  />
                  Template (Optional)
                </span>
              }
              name="template"
              className="form-item-modern"
            >
              <Input
                placeholder="e.g., Student Budget, Family Budget"
                size="large"
                className="modern-input"
                style={{ height: "48px", fontSize: "16px" }}
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="form-label">
                  <EditOutlined
                    style={{ marginRight: "8px", color: "#667eea" }}
                  />
                  Notes (Optional)
                </span>
              }
              name="notes"
              className="form-item-modern"
            >
              <TextArea
                rows={3}
                placeholder="Add any notes about this budget..."
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
                  setEditingBudget(null);
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
                  : editingBudget
                  ? "Update Budget"
                  : "Create Budget"}
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Budget Templates Modal */}
        <Modal
          title="Budget Templates"
          open={templateModalVisible}
          onCancel={() => setTemplateModalVisible(false)}
          footer={false}
          width={600}
        >
          <div className="templates-list">
            {BUDGET_TEMPLATES.map((template, index) => (
              <Card
                key={index}
                hoverable
                style={{ marginBottom: "1rem" }}
                onClick={() => applyTemplate(template)}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <h3>{template.name}</h3>
                    <p style={{ color: "#666", margin: 0 }}>
                      {template.description}
                    </p>
                    <div style={{ marginTop: "0.5rem" }}>
                      <Tag color="blue">
                        {template.budgets.length} Categories
                      </Tag>
                    </div>
                  </div>
                  <Button type="primary" icon={<ThunderboltOutlined />}>
                    Apply
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default BudgetManagement;
