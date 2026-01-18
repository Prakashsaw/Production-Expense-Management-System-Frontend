import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  InputNumber,
  Space,
  Tag,
  Divider,
  message,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  SaveOutlined,
  HistoryOutlined,
  DeleteOutlined,
  DollarOutlined,
  CalendarOutlined,
  FolderOutlined,
  SwapOutlined,
  FileTextOutlined,
  EditOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "./AdvancedSearchModal.css";

const { RangePicker } = DatePicker;
const { Option } = Select;

const QUICK_FILTERS = [
  {
    name: "This Month's Food Expenses",
    filters: {
      category: "Food",
      startDate: moment().startOf("month").format("YYYY-MM-DD"),
      endDate: moment().endOf("month").format("YYYY-MM-DD"),
      type: "Expense",
    },
  },
  {
    name: "Last 30 Days Income",
    filters: {
      startDate: moment().subtract(30, "days").format("YYYY-MM-DD"),
      endDate: moment().format("YYYY-MM-DD"),
      type: "Income",
    },
  },
  {
    name: "High Value Transactions (>₹10,000)",
    filters: {
      minAmount: 10000,
      type: "all",
    },
  },
  {
    name: "This Week's Expenses",
    filters: {
      startDate: moment().startOf("week").format("YYYY-MM-DD"),
      endDate: moment().endOf("week").format("YYYY-MM-DD"),
      type: "Expense",
    },
  },
  {
    name: "Last Week's Transactions",
    filters: {
      startDate: moment().subtract(1, "week").startOf("week").format("YYYY-MM-DD"),
      endDate: moment().subtract(1, "week").endOf("week").format("YYYY-MM-DD"),
      type: "all",
    },
  },
  {
    name: "Last 30 Days Expenses",
    filters: {
      startDate: moment().subtract(30, "days").format("YYYY-MM-DD"),
      endDate: moment().format("YYYY-MM-DD"),
      type: "Expense",
    },
  },
];

const AdvancedSearchModal = ({
  visible,
  onCancel,
  onSearch,
  allCategories = [],
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [savedSearches, setSavedSearches] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedQuickFilter, setSelectedQuickFilter] = useState(null);

  // Load saved searches and history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedSearches");
    const history = localStorage.getItem("searchHistory");
    
    if (saved) {
      try {
        setSavedSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading saved searches:", e);
      }
    }
    
    if (history) {
      try {
        const parsedHistory = JSON.parse(history);
        // Keep only last 10 searches
        setSearchHistory(parsedHistory.slice(0, 10));
      } catch (e) {
        console.error("Error loading search history:", e);
      }
    }
  }, []);

  // Handle form submission
  const handleSearch = async (values) => {
    const searchParams = {
      ...values,
      startDate: values.dateRange?.[0]?.format("YYYY-MM-DD"),
      endDate: values.dateRange?.[1]?.format("YYYY-MM-DD"),
    };
    
    // Remove dateRange from searchParams
    delete searchParams.dateRange;

    // Add to search history
    const historyItem = {
      ...searchParams,
      timestamp: new Date().toISOString(),
      name: `Search ${moment().format("MMM DD, YYYY HH:mm")}`,
    };
    
    const updatedHistory = [historyItem, ...searchHistory].slice(0, 10);
    setSearchHistory(updatedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));

    // Call parent search handler
    onSearch(searchParams);
  };

  // Save current search as a saved filter
  const handleSaveSearch = () => {
    const values = form.getFieldsValue();
    const searchName = prompt("Enter a name for this search filter:");
    
    if (!searchName || !searchName.trim()) {
      message.warning("Please enter a name for the saved search");
      return;
    }

    const searchToSave = {
      name: searchName.trim(),
      filters: {
        ...values,
        startDate: values.dateRange?.[0]?.format("YYYY-MM-DD"),
        endDate: values.dateRange?.[1]?.format("YYYY-MM-DD"),
      },
      createdAt: new Date().toISOString(),
    };
    
    delete searchToSave.filters.dateRange;

    const updatedSaved = [...savedSearches, searchToSave];
    setSavedSearches(updatedSaved);
    localStorage.setItem("savedSearches", JSON.stringify(updatedSaved));
    message.success("Search filter saved successfully!");
  };

  // Load a saved search
  const loadSavedSearch = (savedSearch) => {
    // Clear selected quick filter when loading saved search
    setSelectedQuickFilter(null);
    
    const filters = { ...savedSearch.filters };
    
    // Convert date strings back to moment objects for RangePicker
    if (filters.startDate || filters.endDate) {
      filters.dateRange = [
        filters.startDate ? moment(filters.startDate) : null,
        filters.endDate ? moment(filters.endDate) : null,
      ];
      delete filters.startDate;
      delete filters.endDate;
    }
    
    form.setFieldsValue(filters);
    setShowSavedSearches(false);
    message.success(`Loaded "${savedSearch.name}"`);
  };

  // Load from history
  const loadFromHistory = (historyItem) => {
    // Clear selected quick filter when loading from history
    setSelectedQuickFilter(null);
    
    const filters = { ...historyItem };
    delete filters.timestamp;
    delete filters.name;
    
    // Convert date strings back to moment objects for RangePicker
    if (filters.startDate || filters.endDate) {
      filters.dateRange = [
        filters.startDate ? moment(filters.startDate) : null,
        filters.endDate ? moment(filters.endDate) : null,
      ];
      delete filters.startDate;
      delete filters.endDate;
    }
    
    form.setFieldsValue(filters);
    setShowHistory(false);
    message.success("Search criteria loaded from history");
  };

  // Delete saved search
  const deleteSavedSearch = (index, e) => {
    e.stopPropagation();
    const updated = savedSearches.filter((_, i) => i !== index);
    setSavedSearches(updated);
    localStorage.setItem("savedSearches", JSON.stringify(updated));
    message.success("Saved search deleted");
  };

  // Apply quick filter
  const applyQuickFilter = (quickFilter, index) => {
    // If clicking the same filter, deselect it
    if (selectedQuickFilter === index) {
      setSelectedQuickFilter(null);
      form.resetFields();
      message.info("Quick filter deselected");
      return;
    }

    // Select the new filter
    setSelectedQuickFilter(index);
    const filters = { ...quickFilter.filters };
    
    // Convert date strings to moment objects
    if (filters.startDate || filters.endDate) {
      filters.dateRange = [
        filters.startDate ? moment(filters.startDate) : null,
        filters.endDate ? moment(filters.endDate) : null,
      ];
      delete filters.startDate;
      delete filters.endDate;
    }
    
    form.setFieldsValue(filters);
    message.success(`Applied: ${quickFilter.name}`);
  };

  // Reset selected quick filter when form is cleared
  const handleClear = () => {
    form.resetFields();
    setSelectedQuickFilter(null);
  };


  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SearchOutlined style={{ fontSize: '24px', color: '#667eea' }} />
          <span style={{ fontSize: "1.5rem", fontWeight: "700", color: "#ffffff" }}>
            Advanced Search
          </span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={false}
      width={800}
      className="advanced-search-modal"
      destroyOnClose={true}
    >
      <div className="advanced-search-content">
        {/* Quick Filters */}
        <div className="quick-filters-section">
          <div className="section-header">
            <ThunderboltOutlined style={{ marginRight: '8px', color: '#667eea' }} />
            <span className="section-title">Quick Filters</span>
          </div>
          <div className="quick-filters-list">
            {QUICK_FILTERS.map((filter, index) => (
              <Tag
                key={index}
                color={selectedQuickFilter === index ? "processing" : "default"}
                className={`quick-filter-tag ${selectedQuickFilter === index ? 'selected' : ''}`}
                onClick={() => applyQuickFilter(filter, index)}
                style={{ 
                  cursor: 'pointer', 
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all var(--transition-base)',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '16px',
                    height: '16px',
                    borderRadius: '3px',
                    border: `2px solid ${selectedQuickFilter === index ? '#667eea' : '#d9d9d9'}`,
                    backgroundColor: selectedQuickFilter === index ? '#667eea' : 'transparent',
                    position: 'relative',
                    flexShrink: 0,
                  }}
                >
                  {selectedQuickFilter === index && (
                    <span
                      style={{
                        position: 'absolute',
                        color: '#ffffff',
                        fontSize: '12px',
                        lineHeight: '1',
                        fontWeight: 'bold',
                      }}
                    >
                      ✓
                    </span>
                  )}
                </span>
                <span>{filter.name}</span>
              </Tag>
            ))}
          </div>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        {/* Saved Searches & History */}
        <div className="search-actions-row">
          <Space>
            <Tooltip title="Saved Searches">
              <Button
                icon={<SaveOutlined />}
                onClick={() => {
                  setShowSavedSearches(!showSavedSearches);
                  setShowHistory(false);
                }}
                type={showSavedSearches ? "primary" : "default"}
              >
                Saved ({savedSearches.length})
              </Button>
            </Tooltip>
            <Tooltip title="Search History">
              <Button
                icon={<HistoryOutlined />}
                onClick={() => {
                  setShowHistory(!showHistory);
                  setShowSavedSearches(false);
                }}
                type={showHistory ? "primary" : "default"}
              >
                History ({searchHistory.length})
              </Button>
            </Tooltip>
          </Space>
        </div>

        {/* Saved Searches Dropdown */}
        {showSavedSearches && savedSearches.length > 0 && (
          <div className="saved-searches-list">
            {savedSearches.map((search, index) => (
              <div
                key={index}
                className="saved-search-item"
                onClick={() => loadSavedSearch(search)}
              >
                <span>{search.name}</span>
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={(e) => deleteSavedSearch(index, e)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Search History Dropdown */}
        {showHistory && searchHistory.length > 0 && (
          <div className="search-history-list">
            {searchHistory.map((item, index) => (
              <div
                key={index}
                className="history-item"
                onClick={() => loadFromHistory(item)}
              >
                <span>{item.name || `Search ${index + 1}`}</span>
                <span className="history-time">
                  {moment(item.timestamp).format("MMM DD, HH:mm")}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Search Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
          className="advanced-search-form"
        >
          {/* Amount Range */}
          <div className="form-row-group">
            <Form.Item
              label={
                <span className="form-label">
                  <DollarOutlined style={{ marginRight: '8px', color: '#667eea' }} />
                  Min Amount (₹)
                </span>
              }
              name="minAmount"
              className="form-item-modern"
            >
              <InputNumber
                placeholder="Minimum amount"
                prefix="₹"
                style={{ width: '100%' }}
                min={0}
                className="modern-input"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="form-label">
                  <DollarOutlined style={{ marginRight: '8px', color: '#667eea' }} />
                  Max Amount (₹)
                </span>
              }
              name="maxAmount"
              className="form-item-modern"
            >
              <InputNumber
                placeholder="Maximum amount"
                prefix="₹"
                style={{ width: '100%' }}
                min={0}
                className="modern-input"
              />
            </Form.Item>
          </div>

          {/* Date Range */}
          <Form.Item
            label={
              <span className="form-label">
                <CalendarOutlined style={{ marginRight: '8px', color: '#667eea' }} />
                Date Range
              </span>
            }
            name="dateRange"
            className="form-item-modern"
          >
            <RangePicker
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
              className="modern-datepicker"
            />
          </Form.Item>

          {/* Type and Category */}
          <div className="form-row-group">
            <Form.Item
              label={
                <span className="form-label">
                  <SwapOutlined style={{ marginRight: '8px', color: '#667eea' }} />
                  Type
                </span>
              }
              name="type"
              className="form-item-modern"
            >
              <Select placeholder="All Types" className="modern-select">
                <Option value="all">All Types</Option>
                <Option value="Income">Income</Option>
                <Option value="Expense">Expense</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label={
                <span className="form-label">
                  <FolderOutlined style={{ marginRight: '8px', color: '#667eea' }} />
                  Category
                </span>
              }
              name="category"
              className="form-item-modern"
            >
              <Select
                placeholder="All Categories"
                showSearch
                filterOption={(input, option) =>
                  (option?.children || '').toLowerCase().includes(input.toLowerCase())
                }
                className="modern-select"
              >
                <Option value="">All Categories</Option>
                {allCategories.map((cat) => (
                  <Option key={cat.name} value={cat.name}>
                    {cat.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          {/* Description and Reference */}
          <Form.Item
            label={
              <span className="form-label">
                <EditOutlined style={{ marginRight: '8px', color: '#667eea' }} />
                Description Keywords
              </span>
            }
            name="description"
            className="form-item-modern"
          >
            <Input
              placeholder="Search in descriptions..."
              className="modern-input"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="form-label">
                <FileTextOutlined style={{ marginRight: '8px', color: '#667eea' }} />
                Reference
              </span>
            }
            name="refrence"
            className="form-item-modern"
          >
            <Input
              placeholder="Search in references..."
              className="modern-input"
            />
          </Form.Item>

          {/* Action Buttons */}
          <div className="form-actions">
            <Button
              type="default"
              onClick={handleClear}
              className="cancel-btn-modern"
            >
              Clear
            </Button>
            <Button
              type="default"
              icon={<SaveOutlined />}
              onClick={handleSaveSearch}
              className="save-btn-modern"
            >
              Save Filter
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
              loading={loading}
              className="submit-btn-modern"
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default AdvancedSearchModal;
