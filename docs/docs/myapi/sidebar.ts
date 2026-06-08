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
  ],
};

export default sidebar.apisidebar;
