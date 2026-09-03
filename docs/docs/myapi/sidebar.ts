import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "myapi/servox-api",
    },
    {
      type: "category",
      label: "AllergyTag",
      items: [
        {
          type: "doc",
          id: "myapi/allergytag-list",
          label: "List Allergy Types",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "myapi/allergytag-retrieve",
          label: "Retrieve Allergy Type",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "GuestProfile",
      items: [
        {
          type: "doc",
          id: "myapi/guestprofile-list",
          label: "List Guest Profile",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "myapi/guestprofile-create",
          label: "Create Guest Profile",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "myapi/guestprofile-retrieve",
          label: "Retrieve Guest Profile",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "myapi/guestprofile-update",
          label: "Update Guest Profile",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "myapi/guestprofile-partial-update",
          label: "Partially Update Guest Profile",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "myapi/guestprofile-destroy",
          label: "Delete Guest Profile",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "Scenario",
      items: [
        {
          type: "doc",
          id: "myapi/scenario-list",
          label: "List User Scenarios",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "myapi/scenario-create",
          label: "Create User Scenario",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "myapi/scenario-retrieve",
          label: "Retrieve User Scenario",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "myapi/scenario-update",
          label: "Update User Scenario",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "myapi/scenario-partial-update",
          label: "Partially Update User Scenario",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "myapi/scenario-destroy",
          label: "Delete User Scenario",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "Session",
      items: [
        {
          type: "doc",
          id: "myapi/session-list",
          label: "List User Training Session",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "myapi/session-create",
          label: "Create User Training Session",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "myapi/session-retrieve",
          label: "Retrieve User Training Session",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "myapi/session-update",
          label: "Update User Training Session",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "myapi/session-partial-update",
          label: "Partially Update User Training Session",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "myapi/session-destroy",
          label: "Delete User Training Session",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "myapi/session-stream-retrieve",
          label: "Send Message",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Conversation",
      items: [
        {
          type: "doc",
          id: "myapi/session-messages-list",
          label: "Conversation History",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "myapi/session-messages-create",
          label: "Send Message",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Token",
      items: [
        {
          type: "doc",
          id: "myapi/token-create",
          label: "Login and get JWT tokens",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "myapi/token-refresh-create",
          label: "Refresh access token",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "myapi/token-verify-create",
          label: "Verify token",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
