import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "myapi/servox-api",
    },
    {
      type: "category",
      label: "DiningType",
      items: [
        {
          type: "doc",
          id: "myapi/root-list",
          label: "List Dining Types",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "myapi/root-retrieve",
          label: "Retrieve Dining Type",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
