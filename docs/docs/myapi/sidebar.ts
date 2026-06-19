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
      label: "DiningType",
      items: [
        {
          type: "doc",
          id: "myapi/diningtype-list",
          label: "List Dining Types",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "myapi/diningtype-retrieve",
          label: "Retrieve Dining Type",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Product",
      items: [
        {
          type: "doc",
          id: "myapi/product-list",
          label: "List Products",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "myapi/product-retrieve",
          label: "Retrieve Product",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "ScenarioTag",
      items: [
        {
          type: "doc",
          id: "myapi/scenariotag-list",
          label: "List Scenario Types",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "myapi/scenariotag-retrieve",
          label: "Retrieve Scenario Type",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Scenario",
      items: [
        {
          type: "doc",
          id: "myapi/sessionscenario-list",
          label: "List User Scenarios",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "myapi/sessionscenario-create",
          label: "Create User Scenario",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "myapi/sessionscenario-retrieve",
          label: "Retrieve User Scenario",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "myapi/sessionscenario-update",
          label: "Update User Scenario",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "myapi/sessionscenario-partial-update",
          label: "Partially Update User Scenario",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "myapi/sessionscenario-destroy",
          label: "Delete User Scenario",
          className: "api-method delete",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
