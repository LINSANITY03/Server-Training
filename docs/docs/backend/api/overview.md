# API Overview

Welcome to the internal API documentation. This section covers the global configuration, endpoints, and standards utilized by the backend service.

## Base URL
All API requests must be routed through the following base URL:

> **Local Development:** `http://localhost:8000/api/`

## Format
* **Content-Type:** `application/json`
* **Accept:** `application/json`

All data sent to or received from the API is structured as standard JSON.

## Pagination
Endpoints that return lists of objects (such as `List Dining Types`) use **Limit-Offset Pagination** to manage large datasets. 

* **Default Page Size:** 100 items per request.
* **Query Parameters:**
  * `limit`: Controls the maximum number of items to return.
  * `offset`: Specifies the starting position of the query within the complete dataset.

**Example Request:**
`GET /api/dining-types/?limit=10&offset=20`

## Global Error Responses
While individual endpoint definitions show expected outputs, our Django backend utilizes regular DRF exception handles to return standard error response shapes:

* **200 OK:** Request completed successfully.
* **404 Not Found:** The requested resource ID does not exist in the database.
* **500 Internal Server Error:** An unhandled error occurred on the server.