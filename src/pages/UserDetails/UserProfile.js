import React, { useEffect, useState } from "react";
import Header from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";
import { useNavigate } from "react-router-dom";
import { getResponseError } from "../../utils/getResponseError";
import { message, Card, Tag, Button, Input, Select, Spin, Alert } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  TrophyOutlined,
  ManOutlined,
  WomanOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  ProfileOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { BASE_URL } from "../../utils/baseURL";
import moment from "moment";
import "./UserProfile.css";

const { Option } = Select;

const UserProfile = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    birthDate: "",
    favouriteSport: "",
    gender: "Male",
    isVerified: false,
    createdAt: null,
  });

  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [userUpdateError, setUserUpdateError] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValues, setEditValues] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        setUserUpdateError(null);

        const response = await axios.get(
          `${BASE_URL}/api/v1/users/logged-user`,
          {
            headers: {
              Authorization: `Bearer ${
                JSON.parse(localStorage.getItem("user")).token
              }`,
            },
          }
        );

        setUserData((prev) => ({
          ...prev,
          ...response.data.user,
          gender: response.data.user.gender ?? prev.gender,
        }));

        setLoading(false);
      } catch (error) {
        setLoading(false);
        setUserUpdateError(getResponseError(error));
        message.error(
          "Something went wrong in fetching user details. Please try again."
        );
      }
    };

    fetchUserDetails();
  }, []);

  const handleEdit = (field, value) => {
    setEditingField(field);
    // If value is "Not Provided", start with empty string for better editing experience
    const editValue = (value && value !== "Not Provided") ? value : "";
    setEditValues({ [field]: editValue });
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValues({});
  };

  const handleSaveField = async (field) => {
    try {
      setUpdating(true);
      setUserUpdateError(null);

      // If the edited value is empty, set it to "Not Provided" for backend compatibility
      const fieldValue = editValues[field]?.trim() || "";
      const finalValue = fieldValue === "" ? "Not Provided" : fieldValue;

      const updatedData = {
        ...userData,
        [field]: finalValue,
      };

      await axios.post(
        `${BASE_URL}/api/v1/users/update-user-profile`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("user")).token
            }`,
          },
        }
      );

      // Update local state
      setUserData(updatedData);

      // Update localStorage if name changed
      if (field === "name") {
        const user = JSON.parse(localStorage.getItem("user"));
        user.name = updatedData.name;
        localStorage.setItem("user", JSON.stringify(user));
      }

      setEditingField(null);
      setEditValues({});
      setUpdating(false);
      message.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
    } catch (error) {
      setUpdating(false);
      setUserUpdateError(getResponseError(error));
      message.error("Failed to update profile. Please try again.");
    }
  };

  const handleInputChange = (field, value) => {
    setEditValues({ [field]: value });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="user-profile-wrapper">
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
            <Spin size="large" tip="Loading profile..." />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="user-profile-wrapper">
        <div className="user-profile-container">
          <Card className="user-profile-card">
            <div className="user-profile-header">
              <ProfileOutlined className="profile-header-icon" />
              <div className="profile-header-text">
                <h1 className="profile-header-title">User Profile</h1>
                <p className="profile-header-subtitle">Manage your account information</p>
              </div>
            </div>

            {userUpdateError && (
              <Alert
                message={userUpdateError}
                type="error"
                showIcon
                closable
                onClose={() => setUserUpdateError(null)}
                style={{ marginBottom: "24px" }}
              />
            )}

            <div className="user-profile-content">
              <div className="detail-section-horizontal">
                <div className="detail-row">
                  <div className="detail-item-horizontal">
                    <span className="detail-label">
                      <UserOutlined style={{ marginRight: 8, color: "#667eea" }} />
                      Full Name
                    </span>
                    {editingField === "name" ? (
                      <div className="field-edit-section">
                        <Input
                          value={editValues.name !== undefined ? editValues.name : (userData.name && userData.name !== "Not Provided" ? userData.name : "")}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Enter full name"
                          prefix={<UserOutlined style={{ color: "#667eea" }} />}
                          style={{ marginTop: "8px", marginBottom: "8px" }}
                          allowClear
                        />
                        <div className="field-edit-buttons">
                          <Button
                            type="primary"
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={() => handleSaveField("name")}
                            loading={updating}
                            style={{ marginRight: "8px" }}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={handleCancelEdit}
                            disabled={updating}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="field-display-section">
                        <span className="detail-value">{userData.name || "Not Provided"}</span>
                        <Button
                          type="link"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit("name", userData.name)}
                          style={{ marginLeft: "8px", padding: 0 }}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="detail-item-horizontal">
                    <span className="detail-label">
                      <MailOutlined style={{ marginRight: 8, color: "#667eea" }} />
                      Email Address
                    </span>
                    <div className="field-display-section">
                      <span className="detail-value">{userData.email}</span>
                      <Tag color="green" style={{ marginLeft: "8px" }}>
                        <CheckCircleOutlined style={{ marginRight: 4 }} />
                        Verified
                      </Tag>
                    </div>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-item-horizontal">
                    <span className="detail-label">
                      <PhoneOutlined style={{ marginRight: 8, color: "#667eea" }} />
                      Phone Number
                    </span>
                    {editingField === "phoneNumber" ? (
                      <div className="field-edit-section">
                        <Input
                          value={editValues.phoneNumber !== undefined ? editValues.phoneNumber : (userData.phoneNumber && userData.phoneNumber !== "Not Provided" ? userData.phoneNumber : "")}
                          onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                          placeholder="Enter phone number"
                          prefix={<PhoneOutlined style={{ color: "#667eea" }} />}
                          style={{ marginTop: "8px", marginBottom: "8px" }}
                          allowClear
                        />
                        <div className="field-edit-buttons">
                          <Button
                            type="primary"
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={() => handleSaveField("phoneNumber")}
                            loading={updating}
                            style={{ marginRight: "8px" }}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={handleCancelEdit}
                            disabled={updating}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="field-display-section">
                        <span className="detail-value">
                          {userData.phoneNumber && userData.phoneNumber !== "Not Provided" 
                            ? userData.phoneNumber 
                            : <Tag color="default">Not Provided</Tag>}
                        </span>
                        <Button
                          type="link"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit("phoneNumber", userData.phoneNumber)}
                          style={{ marginLeft: "8px", padding: 0 }}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="detail-item-horizontal">
                    <span className="detail-label">
                      <CalendarOutlined style={{ marginRight: 8, color: "#667eea" }} />
                      Birth Date
                    </span>
                    {editingField === "birthDate" ? (
                      <div className="field-edit-section">
                        <Input
                          type="date"
                          value={editValues.birthDate !== undefined ? editValues.birthDate : (userData.birthDate && userData.birthDate !== "Not Provided" ? userData.birthDate : "")}
                          onChange={(e) => handleInputChange("birthDate", e.target.value)}
                          style={{ marginTop: "8px", marginBottom: "8px" }}
                        />
                        <div className="field-edit-buttons">
                          <Button
                            type="primary"
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={() => handleSaveField("birthDate")}
                            loading={updating}
                            style={{ marginRight: "8px" }}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={handleCancelEdit}
                            disabled={updating}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="field-display-section">
                        <span className="detail-value">
                          {userData.birthDate && userData.birthDate !== "Not Provided"
                            ? moment(userData.birthDate).format("DD MMM YYYY")
                            : <Tag color="default">Not Provided</Tag>}
                        </span>
                        <Button
                          type="link"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit("birthDate", userData.birthDate)}
                          style={{ marginLeft: "8px", padding: 0 }}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-item-horizontal full-width">
                    <span className="detail-label">
                      <HomeOutlined style={{ marginRight: 8, color: "#667eea" }} />
                      Address
                    </span>
                    {editingField === "address" ? (
                      <div className="field-edit-section">
                        <Input
                          value={editValues.address !== undefined ? editValues.address : (userData.address && userData.address !== "Not Provided" ? userData.address : "")}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          placeholder="Enter address"
                          prefix={<HomeOutlined style={{ color: "#667eea" }} />}
                          style={{ marginTop: "8px", marginBottom: "8px" }}
                          allowClear
                        />
                        <div className="field-edit-buttons">
                          <Button
                            type="primary"
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={() => handleSaveField("address")}
                            loading={updating}
                            style={{ marginRight: "8px" }}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={handleCancelEdit}
                            disabled={updating}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="field-display-section">
                        <span className="detail-value">
                          {userData.address && userData.address !== "Not Provided"
                            ? userData.address
                            : <Tag color="default">Not Provided</Tag>}
                        </span>
                        <Button
                          type="link"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit("address", userData.address)}
                          style={{ marginLeft: "8px", padding: 0 }}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-item-horizontal">
                    <span className="detail-label">
                      <TrophyOutlined style={{ marginRight: 8, color: "#667eea" }} />
                      Favorite Sport
                    </span>
                    {editingField === "favouriteSport" ? (
                      <div className="field-edit-section">
                        <Input
                          value={editValues.favouriteSport !== undefined ? editValues.favouriteSport : (userData.favouriteSport && userData.favouriteSport !== "Not Provided" ? userData.favouriteSport : "")}
                          onChange={(e) => handleInputChange("favouriteSport", e.target.value)}
                          placeholder="Enter favorite sport"
                          prefix={<TrophyOutlined style={{ color: "#667eea" }} />}
                          style={{ marginTop: "8px", marginBottom: "8px" }}
                          allowClear
                        />
                        <div className="field-edit-buttons">
                          <Button
                            type="primary"
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={() => handleSaveField("favouriteSport")}
                            loading={updating}
                            style={{ marginRight: "8px" }}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={handleCancelEdit}
                            disabled={updating}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="field-display-section">
                        <span className="detail-value">
                          {userData.favouriteSport && userData.favouriteSport !== "Not Provided"
                            ? <Tag color="green">{userData.favouriteSport}</Tag>
                            : <Tag color="default">Not Provided</Tag>}
                        </span>
                        <Button
                          type="link"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit("favouriteSport", userData.favouriteSport)}
                          style={{ marginLeft: "8px", padding: 0 }}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="detail-item-horizontal">
                    <span className="detail-label">
                      {userData.gender === "Male" ? (
                        <ManOutlined style={{ marginRight: 8, color: "#667eea" }} />
                      ) : userData.gender === "Female" ? (
                        <WomanOutlined style={{ marginRight: 8, color: "#667eea" }} />
                      ) : (
                        <UserOutlined style={{ marginRight: 8, color: "#667eea" }} />
                      )}
                      Gender
                    </span>
                    {editingField === "gender" ? (
                      <div className="field-edit-section">
                        <Select
                          value={editValues.gender !== undefined ? editValues.gender : (userData.gender || "Male")}
                          onChange={(value) => handleInputChange("gender", value)}
                          style={{ width: "100%", marginTop: "8px", marginBottom: "8px" }}
                        >
                          <Option value="Male">Male</Option>
                          <Option value="Female">Female</Option>
                          <Option value="Prefer not to say">Prefer not to say</Option>
                        </Select>
                        <div className="field-edit-buttons">
                          <Button
                            type="primary"
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={() => handleSaveField("gender")}
                            loading={updating}
                            style={{ marginRight: "8px" }}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={handleCancelEdit}
                            disabled={updating}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="field-display-section">
                        <span className="detail-value">
                          <Tag color="purple">{userData.gender || "Not Provided"}</Tag>
                        </span>
                        <Button
                          type="link"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit("gender", userData.gender)}
                          style={{ marginLeft: "8px", padding: 0 }}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {userData.createdAt && (
                  <div className="detail-row">
                    <div className="detail-item-horizontal full-width">
                      <span className="detail-label">
                        <CalendarOutlined style={{ marginRight: 8, color: "#667eea" }} />
                        Account Created
                      </span>
                      <span className="detail-value">
                        {moment(userData.createdAt).format("DD MMM YYYY, HH:mm")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="user-profile-footer">
              <Button
                type="default"
                onClick={() => navigate("/user")}
                style={{ marginRight: "12px" }}
              >
                Back to Home
              </Button>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;
