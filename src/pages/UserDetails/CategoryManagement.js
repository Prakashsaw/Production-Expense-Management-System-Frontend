import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Tag,
  Space,
  Empty,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
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
  EditFilled,
  TagOutlined,
  BgColorsOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";
import Layout from "../../components/Layout/Layout";
import { useApiWithMessage } from "../../hooks/useApi";
import "./CategoryManagement.css";
import "../TransactionFormModal.css";

const { Option } = Select;

// Available icons for categories
const AVAILABLE_ICONS = [
  { name: "FolderOutlined", component: FolderOutlined },
  { name: "FolderAddOutlined", component: FolderAddOutlined },
  { name: "FolderOpenOutlined", component: FolderOpenOutlined },
  { name: "ShoppingOutlined", component: ShoppingOutlined },
  { name: "CarOutlined", component: CarOutlined },
  { name: "HomeOutlined", component: HomeOutlined },
  { name: "MedicineBoxOutlined", component: MedicineBoxOutlined },
  { name: "BookOutlined", component: BookOutlined },
  { name: "CoffeeOutlined", component: CoffeeOutlined },
  { name: "GiftOutlined", component: GiftOutlined },
  { name: "DollarOutlined", component: DollarOutlined },
  { name: "CreditCardOutlined", component: CreditCardOutlined },
  { name: "BankOutlined", component: BankOutlined },
  { name: "ShoppingCartOutlined", component: ShoppingCartOutlined },
  { name: "HeartOutlined", component: HeartOutlined },
  { name: "TrophyOutlined", component: TrophyOutlined },
  { name: "SettingOutlined", component: SettingOutlined },
  { name: "AppstoreOutlined", component: AppstoreOutlined },
];

// Predefined color options
const COLOR_OPTIONS = [
  "#667eea", // Purple
  "#764ba2", // Dark Purple
  "#f093fb", // Pink
  "#4facfe", // Blue
  "#00f2fe", // Cyan
  "#43e97b", // Green
  "#fa709a", // Rose
  "#fee140", // Yellow
  "#30cfd0", // Teal
  "#a8edea", // Light Teal
  "#ff6b6b", // Red
  "#ffa726", // Orange
  "#ab47bc", // Deep Purple
  "#26a69a", // Teal Green
  "#42a5f5", // Light Blue
  "#66bb6a", // Light Green
];

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const { request } = useApiWithMessage();

  // Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    const result = await request(
      {
        url: "/api/v1/categories/all",
        method: "GET",
        requiresAuth: true,
      },
      {
        showSuccess: false,
        showError: true,
      }
    );

    setLoading(false);

    if (result.data?.categories?.custom) {
      setCategories(result.data.categories.custom);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle create/update category
  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        // Update existing category
        const result = await request(
          {
            url: `/api/v1/categories/${editingCategory.categoryId}`,
            method: "PUT",
            data: values,
            requiresAuth: true,
          },
          {
            successMessage: "Category updated successfully",
            showError: true,
          }
        );

        if (!result.error) {
          setModalVisible(false);
          setEditingCategory(null);
          form.resetFields();
          fetchCategories();
        }
      } else {
        // Create new category
        const result = await request(
          {
            url: "/api/v1/categories/create",
            method: "POST",
            data: values,
            requiresAuth: true,
          },
          {
            successMessage: "Category created successfully",
            showError: true,
          }
        );

        if (!result.error) {
          setModalVisible(false);
          form.resetFields();
          fetchCategories();
        }
      }
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  // Handle delete category
  const handleDelete = async (categoryId) => {
    const result = await request(
      {
        url: `/api/v1/categories/${categoryId}`,
        method: "DELETE",
        requiresAuth: true,
      },
      {
        successMessage: "Category deleted successfully",
        showError: true,
      }
    );

    if (!result.error) {
      fetchCategories();
    }
  };

  // Open modal for editing
  const handleEdit = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
    });
    setModalVisible(true);
  };

  // Open modal for creating
  const handleCreate = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Get icon component by name
  const getIconComponent = (iconName) => {
    const iconObj = AVAILABLE_ICONS.find((icon) => icon.name === iconName);
    return iconObj ? iconObj.component : FolderOutlined;
  };

  return (
    <Layout>
      <div className="category-management-container">
        <Card className="category-management-card">
          <div className="category-header">
            <div>
              <h1 className="category-title">Manage Categories</h1>
              <p className="category-subtitle">
                Create and manage your custom transaction categories
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={handleCreate}
              className="add-category-btn"
            >
              Add Category
            </Button>
          </div>

          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : categories.length === 0 ? (
            <Empty
              description="No custom categories yet. Create your first category!"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                Create Category
              </Button>
            </Empty>
          ) : (
            <div className="categories-grid">
              {categories.map((category) => {
                const IconComponent = getIconComponent(category.icon);
                return (
                  <Card
                    key={category.categoryId}
                    className="category-card"
                    hoverable
                    style={{ borderLeft: `4px solid ${category.color}` }}
                  >
                    <div className="category-card-content">
                      <div className="category-icon-wrapper">
                        <IconComponent
                          style={{
                            fontSize: "32px",
                            color: category.color,
                          }}
                        />
                      </div>
                      <div className="category-info">
                        <h3 className="category-name">{category.name}</h3>
                        <div className="category-meta">
                          <Tag color={category.color}>{category.type}</Tag>
                        </div>
                      </div>
                      <div className="category-actions">
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(category)}
                          className="edit-btn"
                        >
                          Edit
                        </Button>
                        <Popconfirm
                          title="Delete Category"
                          description="Are you sure you want to delete this category? This action cannot be undone."
                          onConfirm={() => handleDelete(category.categoryId)}
                          okText="Yes, Delete"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            className="delete-btn"
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

        {/* Create/Edit Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {editingCategory ? (
                <EditFilled style={{ fontSize: '24px', color: '#ffffff' }} />
              ) : (
                <PlusOutlined style={{ fontSize: '24px', color: '#ffffff' }} />
              )}
              <span
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "#ffffff",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
                  letterSpacing: "0.3px",
                }}
              >
                {editingCategory ? "Edit Category" : "Add Category"}
              </span>
            </div>
          }
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingCategory(null);
            form.resetFields();
          }}
          destroyOnClose={true}
          footer={false}
          width={700}
          className="transaction-form-modal"
          style={{
            borderRadius: "var(--radius-xl)",
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="modern-transaction-form"
            initialValues={{
              icon: "FolderOutlined",
              color: "#667eea",
              type: "Both",
            }}
          >
            {/* Category Name */}
            <Form.Item
              label={
                <span className="form-label">
                  <TagOutlined style={{ marginRight: '8px', color: '#667eea' }} />
                  Category Name
                </span>
              }
              name="name"
              rules={[
                { required: true, message: "Please enter category name!" },
                { max: 50, message: "Category name cannot exceed 50 characters!" },
              ]}
              className="form-item-modern"
            >
              <Input
                placeholder="e.g., Groceries, Rent, Freelance"
                className="modern-input"
                style={{ height: '48px', fontSize: '16px' }}
              />
            </Form.Item>

            {/* Type and Icon Row */}
            <div className="form-row-group">
              <Form.Item
                label={
                  <span className="form-label">
                    <AppstoreAddOutlined style={{ marginRight: '8px', color: '#667eea' }} />
                    Type
                  </span>
                }
                name="type"
                rules={[{ required: true, message: "Please select type!" }]}
                className="form-item-modern"
              >
                <Select
                  placeholder="Select type"
                  className="modern-select"
                  style={{ height: '48px' }}
                  suffixIcon={<AppstoreAddOutlined />}
                >
                  <Option value="Income">Income</Option>
                  <Option value="Expense">Expense</Option>
                  <Option value="Both">Both</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={
                  <span className="form-label">
                    <FolderOutlined style={{ marginRight: '8px', color: '#667eea' }} />
                    Icon
                  </span>
                }
                name="icon"
                rules={[{ required: true, message: "Please select an icon!" }]}
                className="form-item-modern"
              >
                <Select
                  placeholder="Select icon"
                  className="modern-select"
                  style={{ height: '48px' }}
                  showSearch
                  suffixIcon={<FolderOutlined />}
                  filterOption={(input, option) =>
                    (option?.children?.props?.children?.[1] || '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {AVAILABLE_ICONS.map((icon) => {
                    const IconComponent = icon.component;
                    return (
                      <Option key={icon.name} value={icon.name}>
                        <Space>
                          <IconComponent style={{ fontSize: '16px' }} />
                          <span>{icon.name}</span>
                        </Space>
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </div>

            {/* Color */}
            <Form.Item
              label={
                <span className="form-label">
                  <BgColorsOutlined style={{ marginRight: '8px', color: '#667eea' }} />
                  Color
                </span>
              }
              name="color"
              rules={[{ required: true, message: "Please select a color!" }]}
              className="form-item-modern"
            >
              <Select
                placeholder="Select color"
                className="modern-select"
                style={{ height: '48px' }}
                suffixIcon={<BgColorsOutlined />}
              >
                {COLOR_OPTIONS.map((color) => (
                  <Option key={color} value={color}>
                    <Space>
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          backgroundColor: color,
                          borderRadius: "4px",
                          display: "inline-block",
                          border: "1px solid rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <span>{color}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Action Buttons */}
            <div className="form-actions">
              <Button
                type="default"
                size="large"
                onClick={() => {
                  setModalVisible(false);
                  setEditingCategory(null);
                  form.resetFields();
                }}
                className="cancel-btn-modern"
                style={{ minWidth: '120px', height: '48px', fontSize: '16px', fontWeight: '600' }}
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
                  minWidth: '120px',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
                  border: 'none',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                }}
              >
                {loading ? 'Saving...' : editingCategory ? 'Update Category' : 'Add Category'}
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};

export default CategoryManagement;
