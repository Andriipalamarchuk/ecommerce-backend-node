# E-commerce Backend Node.js

This repository contains the backend code for an e-commerce platform built with Node.js. The application is designed to handle a variety of e-commerce functionalities, such as user management, product catalog using a scalable architecture.
In the project there are still some TODOs for implementation of Order process and payment management

## Technologies Used

- **Node.js**: Server-side JavaScript runtime.
- **NestJS**: A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
- **PostgreSQL**: Relational database for storing application data.
- **Redis**: Caching layer to improve performance.
- **AWS (ECR, ECS, RDS, S3, and others)**: For cloud infrastructure and deployment.
- **Docker**: Containerization for deployment.
- **Jest**: For unit and integration testing.
- **AWS CDK**: Infrastructure as Code for provisioning AWS resources.
- **GitHub Actions**: Continuous integration and deployment (CI/CD).

## Features

- **User Authentication**: Secure login and registration system.
- **Product Management**: Create, update, and delete product listings.
- **Order Processing**: **TODO**.
- **Payment Integration**: **TODO**.
- **Search and Filtering**: **TODO**.
- **Admin Dashboard**: **TODO**.
- **Scalable Architecture**: Utilizes AWS for auto-scaling, load balancing, and disaster recovery.

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v22.11.0 or later)
- [Docker](https://www.docker.com/products/docker-desktop) (for containerization)
- [AWS CLI](https://aws.amazon.com/cli/) (for AWS interaction)
- [AWS Account](https://aws.amazon.com/)

### Install Dependencies

1. Clone the repository:

    ```bash
    git clone https://github.com/Andriipalamarchuk/ecommerce-backend-node.git
    cd ecommerce-backend-node
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```
   
As alternative you can use docker without installing Node.js
1. Clone the repository:

    ```bash
    git clone https://github.com/Andriipalamarchuk/ecommerce-backend-node.git
    cd ecommerce-backend-node
    ```

2. Start application with Docker:

    ```bash
    docker compose up -d
    ```

### Environment Variables

Create a `.env` file in the root of the project and populate it with the following environment variables:

```bash
# General Configuration
NODE_ENV=development
PORT=3000

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Redis Configuration (for caching)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secret (for authentication)
JWT_SECRET=your_jwt_secret
