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
  Table,
  Tag,
  Space,
  Empty,
  Spin,
  Row,
  Col,
  Statistic,
  Divider,
  Popconfirm,
  Alert,
  Tabs,
  List,
  Avatar,
  Tooltip,
  message,
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  DollarOutlined,
  CalculatorOutlined,
  DashboardOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  HomeOutlined,
  CarOutlined,
  GlobalOutlined,
  UserOutlined,
  WalletOutlined,
  FileTextOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import Layout from "../../components/Layout/Layout";
import { useApiWithMessage } from "../../hooks/useApi";
import moment from "moment";
import "./GroupManagement.css";

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [settlementModalVisible, setSettlementModalVisible] = useState(false);
  const [viewGroupModalVisible, setViewGroupModalVisible] = useState(false);
  const [groupForm] = Form.useForm();
  const [expenseForm] = Form.useForm();
  const [settlementForm] = Form.useForm();
  const [addMembersForm] = Form.useForm();
  const [settingsForm] = Form.useForm();
  const [splitMethod, setSplitMethod] = useState("Equal");
  const [expenseSplits, setExpenseSplits] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [balances, setBalances] = useState([]);
  const [settlementSubmitting, setSettlementSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("groups");
  const [removeMemberError, setRemoveMemberError] = useState(null);

  const { request } = useApiWithMessage();

  // Fetch all groups
  const fetchGroups = async () => {
    setLoading(true);
    const result = await request(
      {
        url: "/api/v1/groups/all",
        method: "GET",
        requiresAuth: true,
      },
      {
        showSuccess: false,
        showError: true,
      }
    );

    setLoading(false);

    if (result.data?.groups) {
      setGroups(result.data.groups);
    }
  };

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle create group
  const handleCreateGroup = async (values) => {
    const memberEmails = values.memberEmails
      ? values.memberEmails.split(",").map((email) => email.trim()).filter((email) => email)
      : [];

    const result = await request(
      {
        url: "/api/v1/groups/create",
        method: "POST",
        data: {
          groupName: values.groupName,
          description: values.description,
          groupType: values.groupType,
          currency: values.currency || "INR",
          defaultSplitMethod: values.defaultSplitMethod || "Equal",
          settings: {
            allowMemberAddExpense: values.allowMemberAddExpense !== false,
            requireApprovalForExpense: values.requireApprovalForExpense === true,
          },
          memberEmails,
        },
        requiresAuth: true,
      },
      {
        successMessage: "Group created successfully!",
        showError: true,
      }
    );

    if (!result.error) {
      // If some member emails were not registered, show a warning
      if (result.data?.notFoundMembers?.length) {
        message.warning(
          `Group created, but these emails are not registered users and were not added: ${result.data.notFoundMembers.join(
            ", "
          )}`
        );
      }
      setGroupModalVisible(false);
      groupForm.resetFields();
      fetchGroups();
    }
  };

  // Handle view group
  const handleViewGroup = async (groupId) => {
    setLoading(true);
    const result = await request(
      {
        url: `/api/v1/groups/${groupId}`,
        method: "GET",
        requiresAuth: true,
      },
      {
        showSuccess: false,
        showError: true,
      }
    );

    setLoading(false);

    if (result.data?.group) {
      setSelectedGroup(result.data.group);
      setViewGroupModalVisible(true);
      setRemoveMemberError(null);
    }
  };

  // Handle add expense
  const handleAddExpense = async (values) => {
    if (!selectedGroup) return;

    const splits = splitMethod === "Equal" ? [] : expenseSplits;

    const result = await request(
      {
        url: `/api/v1/groups/${selectedGroup.groupId}/expenses`,
        method: "POST",
        data: {
          expenseName: values.expenseName,
          description: values.description,
          amount: values.amount,
          category: values.category,
          date: values.date ? values.date.format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
          splitMethod,
          splits,
          paidBy: {
            expenseAppUserId: values.paidBy,
            name: selectedGroup.members.find((m) => m.expenseAppUserId === values.paidBy)?.name || "",
            email: selectedGroup.members.find((m) => m.expenseAppUserId === values.paidBy)?.email || "",
          },
        },
        requiresAuth: true,
      },
      {
        successMessage: "Expense added successfully!",
        showError: true,
      }
    );

    if (!result.error) {
      setExpenseModalVisible(false);
      expenseForm.resetFields();
      setExpenseSplits([]);
      setSplitMethod("Equal");
      handleViewGroup(selectedGroup.groupId);
    }
  };

  // Handle calculate settlements
  const handleCalculateSettlements = async (groupId) => {
    setLoading(true);
    const result = await request(
      {
        url: `/api/v1/groups/${groupId}/settlements/calculate`,
        method: "GET",
        requiresAuth: true,
      },
      {
        showSuccess: false,
        showError: true,
      }
    );

    setLoading(false);

    if (result.data) {
      setBalances(result.data.balances || []);
      setSettlements(result.data.suggestedSettlements || []);
      setSettlementModalVisible(true);
    }
  };

  // Handle create settlement
  const handleCreateSettlement = async (values) => {
    if (!selectedGroup) return;
    setSettlementSubmitting(true);

    const result = await request(
      {
        url: `/api/v1/groups/${selectedGroup.groupId}/settlements`,
        method: "POST",
        data: {
          groupId: selectedGroup.groupId,
          fromUserId: values.fromUserId,
          toUserId: values.toUserId,
          amount: Number(values.amount),
          paymentMethod: values.paymentMethod || undefined,
          notes: values.notes || undefined,
        },
        requiresAuth: true,
      },
      {
        successMessage: "Settlement created successfully!",
        showError: true,
      }
    );

    setSettlementSubmitting(false);
    if (!result.error) {
      setSettlementModalVisible(false);
      settlementForm.resetFields();
      setSettlements([]);
      setBalances([]);
      handleViewGroup(selectedGroup.groupId);
    }
  };

  // Handle update settlement status (e.g. Mark as Completed)
  const handleUpdateSettlementStatus = async (settlementId, status) => {
    const result = await request(
      {
        url: `/api/v1/groups/settlements/${settlementId}`,
        method: "PUT",
        data: { status },
        requiresAuth: true,
      },
      {
        successMessage: status === "Completed" ? "Settlement marked as Completed!" : "Settlement status updated.",
        showError: true,
      }
    );
    if (!result.error && selectedGroup) {
      handleViewGroup(selectedGroup.groupId);
    }
  };

  // Handle update group settings (permissions)
  const handleUpdateGroupSettings = async (values) => {
    if (!selectedGroup) return;
    const result = await request(
      {
        url: `/api/v1/groups/${selectedGroup.groupId}`,
        method: "PUT",
        data: {
          settings: {
            ...(selectedGroup.settings || {}),
            allowMemberAddExpense: values.allowMemberAddExpense !== false,
            requireApprovalForExpense: values.requireApprovalForExpense === true,
          },
        },
        requiresAuth: true,
      },
      {
        successMessage: "Group settings updated",
        showError: true,
      }
    );
    if (!result.error && selectedGroup) {
      handleViewGroup(selectedGroup.groupId);
    }
  };

  // Handle mark expense as settled (when payment received from debtors)
  const handleMarkExpenseSettled = async (expenseId) => {
    const result = await request(
      {
        url: `/api/v1/groups/expenses/${expenseId}`,
        method: "PUT",
        data: { isSettled: true },
        requiresAuth: true,
      },
      {
        successMessage: "Expense marked as settled",
        showError: true,
      }
    );
    if (!result.error && selectedGroup) {
      handleViewGroup(selectedGroup.groupId);
    }
  };

  // Handle remove member from group
  const handleRemoveMember = async (memberId) => {
    if (!selectedGroup) return;
    const result = await request(
      {
        url: `/api/v1/groups/${selectedGroup.groupId}/members/${memberId}`,
        method: "DELETE",
        requiresAuth: true,
      },
      {
        successMessage: "Member removed from group",
        showError: false, // We show error below so message is always visible
      }
    );
    if (result.error) {
      setRemoveMemberError(result.error || "You don't have permission to remove members");
      return;
    }
    setRemoveMemberError(null);
    if (selectedGroup) {
      handleViewGroup(selectedGroup.groupId);
    }
  };

  // Handle delete group
  const handleDeleteGroup = async (groupId) => {
    const result = await request(
      {
        url: `/api/v1/groups/${groupId}`,
        method: "DELETE",
        requiresAuth: true,
      },
      {
        successMessage: "Group deleted successfully!",
        showError: true,
      }
    );

    if (!result.error) {
      fetchGroups();
    }
  };

  // Get group type icon
  const getGroupTypeIcon = (type) => {
    switch (type) {
      case "Family":
        return <HomeOutlined />;
      case "Roommates":
        return <UserOutlined />;
      case "Travel":
        return <CarOutlined />;
      default:
        return <TeamOutlined />;
    }
  };

  // Get group type color
  const getGroupTypeColor = (type) => {
    switch (type) {
      case "Family":
        return "purple";
      case "Roommates":
        return "blue";
      case "Travel":
        return "green";
      default:
        return "default";
    }
  };

  // Expense columns
  const expenseColumns = [
    {
      title: "Expense Name",
      dataIndex: "expenseName",
      key: "expenseName",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount, record) => (
        <span style={{ fontWeight: 600, color: "#667eea" }}>
          ₹{amount.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      title: "Paid By",
      dataIndex: "paidBy",
      key: "paidBy",
      render: (paidBy) => paidBy?.name || "N/A",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => moment(date).format("DD MMM YYYY"),
    },
    {
      title: "Status",
      dataIndex: "isSettled",
      key: "isSettled",
      render: (isSettled) => (
        <Tag color={isSettled ? "green" : "orange"}>
          {isSettled ? "Settled" : "Pending"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) =>
        !record.isSettled ? (
          <Popconfirm
            title="Mark as settled?"
            description="Confirm that you have received payment for this expense."
            onConfirm={() => handleMarkExpenseSettled(record.expenseId)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" size="small">
              Mark as settled
            </Button>
          </Popconfirm>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <Layout>
      <div className="group-management-wrapper">
        <Card className="group-management-card">
          <div className="group-management-header">
            <div className="header-content">
              <TeamOutlined className="header-icon" />
              <div className="header-text">
                <h1 className="header-title">Group Expense Management</h1>
                <p className="header-subtitle">Manage shared expenses with family, friends, and groups</p>
              </div>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => {
                setGroupModalVisible(true);
                groupForm.resetFields();
              }}
            >
              Create Group
            </Button>
          </div>

          <Tabs activeKey={activeTab} onChange={setActiveTab} className="group-tabs">
            <TabPane tab={<span><DashboardOutlined /> Groups</span>} key="groups">
              {loading ? (
                <div style={{ textAlign: "center", padding: "50px" }}>
                  <Spin size="large" />
                </div>
              ) : groups.length === 0 ? (
                <Empty
                  description="No groups found. Create your first group to start sharing expenses!"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setGroupModalVisible(true)}
                  >
                    Create Group
                  </Button>
                </Empty>
              ) : (
                <Row gutter={[16, 16]}>
                  {groups.map((group) => (
                    <Col xs={24} sm={12} lg={8} key={group.groupId}>
                      <Card
                        className="group-card"
                        hoverable
                        actions={[
                          <Tooltip title="View Details">
                            <EyeOutlined
                              onClick={() => handleViewGroup(group.groupId)}
                            />
                          </Tooltip>,
                          <Tooltip title="Calculate Settlements">
                            <CalculatorOutlined
                              onClick={() => {
                                setSelectedGroup(group);
                                handleCalculateSettlements(group.groupId);
                              }}
                            />
                          </Tooltip>,
                          <Popconfirm
                            title="Are you sure you want to delete this group?"
                            onConfirm={() => handleDeleteGroup(group.groupId)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Tooltip title="Delete Group">
                              <DeleteOutlined />
                            </Tooltip>
                          </Popconfirm>,
                        ]}
                      >
                        <div className="group-card-content">
                          <div className="group-card-header">
                            <Tag
                              icon={getGroupTypeIcon(group.groupType)}
                              color={getGroupTypeColor(group.groupType)}
                              style={{ fontSize: "14px", padding: "4px 12px" }}
                            >
                              {group.groupType}
                            </Tag>
                            <Tag color={group.isActive ? "green" : "red"}>
                              {group.isActive ? "Active" : "Inactive"}
                            </Tag>
                          </div>
                          <h3 className="group-card-title">{group.groupName}</h3>
                          {group.description && (
                            <p className="group-card-description">{group.description}</p>
                          )}
                          <Divider style={{ margin: "12px 0" }} />
                          <Row gutter={16}>
                            <Col span={12}>
                              <Statistic
                                title="Members"
                                value={group.members?.filter((m) => m.isActive).length || 0}
                                prefix={<UserOutlined />}
                                valueStyle={{ fontSize: "18px" }}
                              />
                            </Col>
                            <Col span={12}>
                              <Statistic
                                title="Total Expenses"
                                value={group.stats?.totalExpenses || 0}
                                prefix={<DollarOutlined />}
                                precision={0}
                                valueStyle={{ fontSize: "18px", color: "#667eea" }}
                                formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
                              />
                            </Col>
                          </Row>
                          {group.stats?.unsettledExpenses > 0 && (
                            <Alert
                              message={`${group.stats.unsettledExpenses} unsettled expenses`}
                              type="warning"
                              showIcon
                              style={{ marginTop: "12px" }}
                            />
                          )}
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </TabPane>
          </Tabs>
        </Card>

        {/* Create Group Modal */}
        <Modal
          title={
            <span>
              <PlusOutlined style={{ marginRight: 8 }} />
              Create New Group
            </span>
          }
          open={groupModalVisible}
          onCancel={() => {
            setGroupModalVisible(false);
            groupForm.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={groupForm}
            layout="vertical"
            onFinish={handleCreateGroup}
          >
            <Form.Item
              name="groupName"
              label="Group Name"
              rules={[{ required: true, message: "Please enter group name" }]}
            >
              <Input placeholder="e.g., Family Expenses, Trip to Goa" />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <TextArea
                rows={3}
                placeholder="Optional description about the group"
              />
            </Form.Item>

            <Form.Item
              name="groupType"
              label="Group Type"
              rules={[{ required: true, message: "Please select group type" }]}
            >
              <Select placeholder="Select group type">
                <Option value="Family">Family</Option>
                <Option value="Roommates">Roommates</Option>
                <Option value="Travel">Travel</Option>
                <Option value="Friends">Friends</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>

            <Form.Item name="currency" label="Currency" initialValue="INR">
              <Select>
                <Option value="INR">INR (₹)</Option>
                <Option value="USD">USD ($)</Option>
                <Option value="EUR">EUR (€)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="defaultSplitMethod"
              label="Default Split Method"
              initialValue="Equal"
            >
              <Select>
                <Option value="Equal">Equal Split</Option>
                <Option value="Custom">Custom Split</Option>
                <Option value="Percentage">Percentage Split</Option>
                <Option value="Exact">Exact Amount</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="allowMemberAddExpense"
              label="Allow members to add expenses"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
            <Form.Item
              name="requireApprovalForExpense"
              label="Require approval for new expenses"
              valuePropName="checked"
              initialValue={false}
              help="If enabled, expenses added by non-admin members need owner/admin approval"
            >
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>

            <Form.Item
              name="memberEmails"
              label="Add Members (Email addresses, comma-separated)"
              help="Enter email addresses of users to add to the group"
            >
              <TextArea
                rows={2}
                placeholder="user1@example.com, user2@example.com"
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Create Group
                </Button>
                <Button onClick={() => {
                  setGroupModalVisible(false);
                  groupForm.resetFields();
                }}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* View Group Modal */}
        <Modal
          title={
            <span>
              <TeamOutlined style={{ marginRight: 8 }} />
              {selectedGroup?.groupName}
            </span>
          }
          open={viewGroupModalVisible}
          onCancel={() => {
            setViewGroupModalVisible(false);
            setSelectedGroup(null);
            setRemoveMemberError(null);
          }}
          footer={null}
          width={900}
          className="view-group-modal"
        >
          {selectedGroup && (
            <Tabs defaultActiveKey="dashboard">
              <TabPane tab={<span><DashboardOutlined /> Dashboard</span>} key="dashboard">
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={12} sm={8}>
                    <Statistic
                      title="Total Expenses"
                      value={selectedGroup.stats?.totalExpenses ?? 0}
                      prefix="₹"
                      valueStyle={{ fontSize: 18 }}
                    />
                  </Col>
                  <Col xs={12} sm={8}>
                    <Statistic
                      title="Unsettled Expenses"
                      value={selectedGroup.stats?.unsettledExpenses ?? 0}
                      suffix="items"
                      valueStyle={{ fontSize: 18 }}
                    />
                  </Col>
                  <Col xs={12} sm={8}>
                    <Statistic
                      title="Pending Settlements"
                      value={selectedGroup.stats?.pendingSettlements ?? 0}
                      valueStyle={{ fontSize: 18 }}
                    />
                  </Col>
                  <Col span={24}>
                    <Statistic
                      title="Your Balance"
                      value={selectedGroup.userBalance?.balance ?? 0}
                      prefix="₹"
                      valueStyle={{
                        fontSize: 20,
                        color: (selectedGroup.userBalance?.balance ?? 0) > 0 ? "#cf1322" : (selectedGroup.userBalance?.balance ?? 0) < 0 ? "#3f8600" : undefined,
                      }}
                    />
                    <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                      {(selectedGroup.userBalance?.balance ?? 0) > 0
                        ? "You owe this amount"
                        : (selectedGroup.userBalance?.balance ?? 0) < 0
                        ? "You are owed this amount"
                        : "Settled"}
                    </div>
                  </Col>
                </Row>
                <Divider>Recent Expenses</Divider>
                {selectedGroup.expenses?.length > 0 ? (
                  <Table
                    size="small"
                    dataSource={(selectedGroup.expenses || []).slice(0, 5)}
                    rowKey="expenseId"
                    pagination={false}
                    columns={[
                      { title: "Name", dataIndex: "expenseName", key: "expenseName" },
                      { title: "Amount", dataIndex: "amount", key: "amount", render: (a) => `₹${Number(a).toLocaleString("en-IN")}` },
                      { title: "Paid by", dataIndex: ["paidBy", "name"], key: "paidBy" },
                    ]}
                  />
                ) : (
                  <Empty description="No expenses yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
                <Divider>Recent Settlements</Divider>
                {selectedGroup.settlements?.length > 0 ? (
                  <Table
                    size="small"
                    dataSource={(selectedGroup.settlements || []).slice(0, 5)}
                    rowKey="settlementId"
                    pagination={false}
                    columns={[
                      { title: "From", dataIndex: ["fromUser", "name"], key: "fromUser" },
                      { title: "To", dataIndex: ["toUser", "name"], key: "toUser" },
                      { title: "Amount", dataIndex: "amount", key: "amount", render: (a) => `₹${Number(a).toLocaleString("en-IN")}` },
                      { title: "Status", dataIndex: "status", key: "status", render: (s) => <Tag color={s === "Completed" ? "green" : "orange"}>{s}</Tag> },
                    ]}
                  />
                ) : (
                  <Empty description="No settlements yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </TabPane>
              <TabPane tab={<span><FileTextOutlined /> Expenses</span>} key="expenses">
                <div style={{ marginBottom: 16 }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setExpenseModalVisible(true);
                      expenseForm.resetFields();
                      setExpenseSplits([]);
                      setSplitMethod(selectedGroup.defaultSplitMethod || "Equal");
                    }}
                  >
                    Add Expense
                  </Button>
                </div>
                <Table
                  columns={expenseColumns}
                  dataSource={selectedGroup.expenses || []}
                  rowKey="expenseId"
                  pagination={{ pageSize: 10 }}
                />
              </TabPane>

              <TabPane tab={<span><WalletOutlined /> Settlements</span>} key="settlements">
                <div style={{ marginBottom: 16 }}>
                  <Button
                    type="primary"
                    icon={<CalculatorOutlined />}
                    onClick={() => handleCalculateSettlements(selectedGroup.groupId)}
                  >
                    Calculate Settlements
                  </Button>
                </div>
                <Table
                  columns={[
                    {
                      title: "From",
                      dataIndex: ["fromUser", "name"],
                      key: "fromUser",
                    },
                    {
                      title: "To",
                      dataIndex: ["toUser", "name"],
                      key: "toUser",
                    },
                    {
                      title: "Amount",
                      dataIndex: "amount",
                      key: "amount",
                      render: (amount) => `₹${amount.toLocaleString("en-IN")}`,
                    },
                    {
                      title: "Status",
                      dataIndex: "status",
                      key: "status",
                      render: (status) => (
                        <Tag color={status === "Completed" ? "green" : status === "Pending" ? "orange" : "red"}>
                          {status}
                        </Tag>
                      ),
                    },
                    {
                      title: "Actions",
                      key: "actions",
                      render: (_, record) =>
                        record.status === "Pending" ? (
                          <Space>
                            <Popconfirm
                              title="Mark as Completed?"
                              description="Confirm that this payment has been received."
                              onConfirm={() => handleUpdateSettlementStatus(record.settlementId, "Completed")}
                              okText="Yes"
                              cancelText="No"
                            >
                              <Button type="primary" size="small">
                                Mark as Completed
                              </Button>
                            </Popconfirm>
                            <Popconfirm
                              title="Cancel this settlement?"
                              onConfirm={() => handleUpdateSettlementStatus(record.settlementId, "Cancelled")}
                              okText="Yes"
                              cancelText="No"
                            >
                              <Button danger size="small">
                                Cancel
                              </Button>
                            </Popconfirm>
                          </Space>
                        ) : (
                          "—"
                        ),
                    },
                  ]}
                  dataSource={selectedGroup.settlements || []}
                  rowKey="settlementId"
                  pagination={{ pageSize: 10 }}
                />
              </TabPane>

              <TabPane tab={<span><SettingOutlined /> Settings</span>} key="settings">
                <Divider orientation="left">Group permissions</Divider>
                <Form
                  form={settingsForm}
                  layout="vertical"
                  onFinish={handleUpdateGroupSettings}
                  initialValues={{
                    allowMemberAddExpense: selectedGroup?.settings?.allowMemberAddExpense !== false,
                    requireApprovalForExpense: selectedGroup?.settings?.requireApprovalForExpense === true,
                  }}
                  key={selectedGroup?.groupId}
                >
                  <Form.Item
                    name="allowMemberAddExpense"
                    label="Allow members to add expenses"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="Yes" unCheckedChildren="No" />
                  </Form.Item>
                  <Form.Item
                    name="requireApprovalForExpense"
                    label="Require approval for new expenses"
                    valuePropName="checked"
                    help="If enabled, expenses added by non-admin members need owner/admin approval"
                  >
                    <Switch checkedChildren="Yes" unCheckedChildren="No" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Update settings
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>

              <TabPane tab={<span><UserOutlined /> Members</span>} key="members">
                {removeMemberError && (
                  <Alert
                    type="error"
                    message={removeMemberError}
                    closable
                    onClose={() => setRemoveMemberError(null)}
                    style={{ marginBottom: 16 }}
                    showIcon
                  />
                )}
                {/* Add Members */}
                <div style={{ marginBottom: 16 }}>
                  <Form
                    form={addMembersForm}
                    layout="inline"
                    onFinish={async (values) => {
                      if (!selectedGroup) return;
                      const emails = values.memberEmails
                        ? values.memberEmails
                            .split(",")
                            .map((e) => e.trim())
                            .filter((e) => e)
                        : [];
                      if (!emails.length) {
                        message.warning("Please enter at least one email address.");
                        return;
                      }

                      const result = await request(
                        {
                          url: `/api/v1/groups/${selectedGroup.groupId}/members`,
                          method: "POST",
                          data: { memberEmails: emails },
                          requiresAuth: true,
                        },
                        {
                          successMessage: "Members added successfully!",
                          showError: true,
                        }
                      );

                      if (!result.error) {
                        if (result.data?.notFound?.length) {
                          message.warning(
                            `Some emails are not registered users and were not added: ${result.data.notFound.join(
                              ", "
                            )}`
                          );
                        }
                        addMembersForm.resetFields();
                        // Refresh group details
                        handleViewGroup(selectedGroup.groupId);
                      }
                    }}
                  >
                    <Form.Item
                      name="memberEmails"
                      label="Add Members (emails)"
                      style={{ flex: 1 }}
                    >
                      <TextArea
                        rows={1}
                        placeholder="user1@example.com, user2@example.com"
                      />
                    </Form.Item>
                    <Form.Item>
                      <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        htmlType="submit"
                      >
                        Add Members
                      </Button>
                    </Form.Item>
                  </Form>
                </div>

                <List
                  dataSource={selectedGroup.members?.filter((m) => m.isActive) || []}
                  renderItem={(member) => (
                    <List.Item
                      actions={
                        member.role !== "Owner"
                          ? [
                              <Popconfirm
                                key="remove"
                                title="Remove this member from the group?"
                                onConfirm={() => handleRemoveMember(member.expenseAppUserId)}
                                okText="Yes"
                                cancelText="No"
                              >
                                <Button type="link" danger size="small" icon={<UserDeleteOutlined />}>
                                  Remove
                                </Button>
                              </Popconfirm>,
                            ]
                          : undefined
                      }
                    >
                      <Space style={{ width: "100%", justifyContent: "space-between" }}>
                        <Space>
                          <Avatar icon={<UserOutlined />} />
                          <div>
                            <div style={{ fontWeight: 500 }}>{member.name}</div>
                            <div style={{ fontSize: 12, color: "#888" }}>{member.email}</div>
                          </div>
                        </Space>
                        <Tag
                          color={
                            member.role === "Owner"
                              ? "gold"
                              : member.role === "Admin"
                              ? "blue"
                              : "default"
                          }
                        >
                          {member.role}
                        </Tag>
                      </Space>
                    </List.Item>
                  )}
                />
              </TabPane>
            </Tabs>
          )}
        </Modal>

        {/* Add Expense Modal */}
        <Modal
          title={
            <span>
              <PlusOutlined style={{ marginRight: 8 }} />
              Add Expense
            </span>
          }
          open={expenseModalVisible}
          onCancel={() => {
            setExpenseModalVisible(false);
            expenseForm.resetFields();
            setExpenseSplits([]);
          }}
          footer={null}
          width={700}
        >
          <Form
            form={expenseForm}
            layout="vertical"
            onFinish={handleAddExpense}
          >
            <Form.Item
              name="expenseName"
              label="Expense Name"
              rules={[{ required: true, message: "Please enter expense name" }]}
            >
              <Input placeholder="e.g., Groceries, Dinner, Gas" />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <TextArea rows={2} placeholder="Optional description" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="amount"
                  label="Amount"
                  rules={[{ required: true, message: "Please enter amount" }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0.01}
                    step={0.01}
                    prefix="₹"
                    placeholder="0.00"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[{ required: true, message: "Please select category" }]}
                >
                  <Input placeholder="e.g., Food, Travel, Utilities" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="date"
                  label="Date"
                  initialValue={moment()}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="paidBy"
                  label="Paid By"
                  rules={[{ required: true, message: "Please select who paid" }]}
                >
                  <Select placeholder="Select member">
                    {selectedGroup?.members
                      ?.filter((m) => m.isActive)
                      .map((member) => (
                        <Option key={member.expenseAppUserId} value={member.expenseAppUserId}>
                          {member.name}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="splitMethod"
              label="Split Method"
              initialValue={selectedGroup?.defaultSplitMethod || "Equal"}
            >
              <Select
                onChange={(value) => {
                  setSplitMethod(value);
                  if (value === "Equal") {
                    setExpenseSplits([]);
                  }
                }}
              >
                <Option value="Equal">Equal Split</Option>
                <Option value="Custom">Custom Split</Option>
                <Option value="Percentage">Percentage Split</Option>
                <Option value="Exact">Exact Amount</Option>
              </Select>
            </Form.Item>

            {splitMethod !== "Equal" && selectedGroup && (
              <Form.Item label="Split Details">
                <List
                  dataSource={selectedGroup.members?.filter((m) => m.isActive) || []}
                  renderItem={(member) => (
                    <List.Item>
                      <Space style={{ width: "100%", justifyContent: "space-between" }}>
                        <span>{member.name}</span>
                        {splitMethod === "Percentage" ? (
                          <InputNumber
                            min={0}
                            max={100}
                            placeholder="%"
                            value={expenseSplits.find((s) => s.expenseAppUserId === member.expenseAppUserId)?.percentage}
                            onChange={(value) => {
                              const existing = expenseSplits.findIndex(
                                (s) => s.expenseAppUserId === member.expenseAppUserId
                              );
                              const newSplit = {
                                expenseAppUserId: member.expenseAppUserId,
                                name: member.name,
                                email: member.email,
                                percentage: value || 0,
                                amount: 0,
                              };
                              if (existing >= 0) {
                                const updated = [...expenseSplits];
                                updated[existing] = newSplit;
                                setExpenseSplits(updated);
                              } else {
                                setExpenseSplits([...expenseSplits, newSplit]);
                              }
                            }}
                          />
                        ) : (
                          <InputNumber
                            min={0}
                            prefix="₹"
                            placeholder="Amount"
                            value={expenseSplits.find((s) => s.expenseAppUserId === member.expenseAppUserId)?.amount}
                            onChange={(value) => {
                              const existing = expenseSplits.findIndex(
                                (s) => s.expenseAppUserId === member.expenseAppUserId
                              );
                              const newSplit = {
                                expenseAppUserId: member.expenseAppUserId,
                                name: member.name,
                                email: member.email,
                                amount: value || 0,
                                percentage: 0,
                              };
                              if (existing >= 0) {
                                const updated = [...expenseSplits];
                                updated[existing] = newSplit;
                                setExpenseSplits(updated);
                              } else {
                                setExpenseSplits([...expenseSplits, newSplit]);
                              }
                            }}
                          />
                        )}
                      </Space>
                    </List.Item>
                  )}
                />
              </Form.Item>
            )}

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Add Expense
                </Button>
                <Button onClick={() => {
                  setExpenseModalVisible(false);
                  expenseForm.resetFields();
                  setExpenseSplits([]);
                }}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Settlement Modal */}
        <Modal
          title={
            <span>
              <CalculatorOutlined style={{ marginRight: 8 }} />
              Settle Up
            </span>
          }
          open={settlementModalVisible}
          onCancel={() => {
            setSettlementModalVisible(false);
            settlementForm.resetFields();
            setSettlements([]);
            setBalances([]);
          }}
          footer={null}
          width={800}
        >
          {balances.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3>Member Balances</h3>
              <List
                dataSource={balances}
                renderItem={(balance) => (
                  <List.Item>
                    <List.Item.Meta
                      title={balance.name}
                      description={balance.email}
                    />
                    <Tag color={balance.balance > 0 ? "red" : balance.balance < 0 ? "green" : "default"}>
                      {balance.balance > 0
                        ? `Owes ₹${Math.abs(balance.balance).toLocaleString("en-IN")}`
                        : balance.balance < 0
                        ? `Owed ₹${Math.abs(balance.balance).toLocaleString("en-IN")}`
                        : "Settled"}
                    </Tag>
                  </List.Item>
                )}
              />
            </div>
          )}

          {settlements.length > 0 && (
            <div>
              <h3>Suggested Settlements</h3>
              <List
                dataSource={settlements}
                renderItem={(settlement, index) => (
                  <List.Item
                    actions={[
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => {
                          settlementForm.setFieldsValue({
                            fromUserId: settlement.fromUser.expenseAppUserId,
                            toUserId: settlement.toUser.expenseAppUserId,
                            amount: settlement.amount,
                          });
                          message.success("Settlement details filled. Complete the form below to create it.");
                        }}
                      >
                        Use This
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={`${settlement.fromUser.name} → ${settlement.toUser.name}`}
                      description={`₹${settlement.amount.toLocaleString("en-IN")}`}
                    />
                  </List.Item>
                )}
              />
            </div>
          )}

          <Divider>Or Create Custom Settlement</Divider>

          <Form
            form={settlementForm}
            layout="vertical"
            onFinish={handleCreateSettlement}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="fromUserId"
                  label="From"
                  rules={[{ required: true, message: "Please select payer" }]}
                >
                  <Select placeholder="Select member">
                    {selectedGroup?.members
                      ?.filter((m) => m.isActive)
                      .map((member) => (
                        <Option key={member.expenseAppUserId} value={member.expenseAppUserId}>
                          {member.name}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="toUserId"
                  label="To"
                  rules={[{ required: true, message: "Please select payee" }]}
                >
                  <Select placeholder="Select member">
                    {selectedGroup?.members
                      ?.filter((m) => m.isActive)
                      .map((member) => (
                        <Option key={member.expenseAppUserId} value={member.expenseAppUserId}>
                          {member.name}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="amount"
                  label="Amount"
                  rules={[{ required: true, message: "Please enter amount" }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0.01}
                    step={0.01}
                    prefix="₹"
                    placeholder="0.00"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="paymentMethod"
                  label="Payment Method"
                  rules={[{ required: true, message: "Please select payment method" }]}
                >
                  <Select placeholder="Select method">
                    <Option value="Cash">Cash</Option>
                    <Option value="Bank Transfer">Bank Transfer</Option>
                    <Option value="UPI">UPI</Option>
                    <Option value="Credit Card">Credit Card</Option>
                    <Option value="Debit Card">Debit Card</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="notes" label="Notes">
              <TextArea rows={2} placeholder="Optional notes" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={settlementSubmitting}>
                  Create Settlement
                </Button>
                <Button onClick={() => {
                  setSettlementModalVisible(false);
                  settlementForm.resetFields();
                }}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};

export default GroupManagement;
