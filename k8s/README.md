# Ecommerce Microservices - Kubernetes (Minikube) Deployment Guide

This directory contains complete Kubernetes manifests for deploying the entire Spring Boot Microservices and React Frontend architecture to a local Kubernetes cluster (Minikube).

---

## 🏗 Architecture Overview

```
                      Browser
                         │
                         ▼
                    Frontend (Port 80 / NodePort 30000)
                         │ (Proxy /api)
                         ▼
                 API Gateway (Port 8080 / NodePort 30080)
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
     User Service   Product Service   Order Service
     (Port 8081)    (Port 8082)       (Port 8083)
          │              │              │
          └──────────────┼──────────────┘
                         │
                ┌────────┴────────┐
                ▼                 ▼
        Inventory Service    Payment Service
        (Port 8084)          (Port 8085)
                │
                ▼
        Notification Service
        (Port 8086)

─────────────────────────────────────────────────────────────
Infrastructure:
  • Eureka Server (Port 8761): Service Discovery
  • Kafka Broker (KRaft mode, Port 29092): Event-Driven Messaging
  • Kafka UI (Port 8080 / NodePort 30090): Cluster Management
  • PostgreSQL 16 (Port 5432): Relational Databases (userdb, productdb, orderdb, inventorydb, paymentdb, notificationdb)
  • Redis 7 (Port 6379): In-Memory Product Caching
```

---

## 📋 1. Prerequisites

- **Minikube** installed and running
- **kubectl** installed and configured
- **Docker** installed
- **Java 21** & **Maven 3.9+**

Verify cluster status:
```bash
minikube status
kubectl get nodes
```

---

## 🚀 2. Quick Start Deployment

### Step 2.1: Build Docker Images inside Minikube Environment

Configure PowerShell to point to Minikube's Docker daemon and build all images:

```powershell
# Point Docker CLI to Minikube
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Build all microservice images
docker build -t ecommerce-eureka-server:latest ./eureka-server
docker build -t ecommerce-api-gateway:latest ./api-gateway
docker build -t ecommerce-user-service:latest ./user-service
docker build -t ecommerce-product-service:latest ./product-service
docker build -t ecommerce-inventory-service:latest ./inventory-service
docker build -t ecommerce-order-service:latest ./order-service
docker build -t ecommerce-payment-service:latest ./payment-service
docker build -t ecommerce-notification-service:latest ./notification-service
docker build -t ecommerce-frontend:latest ./frontend
```

### Step 2.2: Deploy Kubernetes Manifests

Apply the manifests in ordered sequence:

```powershell
# 1. Namespace, Secrets & ConfigMaps
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-secrets.yaml
kubectl apply -f k8s/02-configmap.yaml

# 2. Storage & Databases
kubectl apply -f k8s/03-postgres.yaml
kubectl apply -f k8s/04-redis.yaml

# 3. Message Broker & UI
kubectl apply -f k8s/05-kafka.yaml
kubectl apply -f k8s/06-kafka-ui.yaml

# 4. Service Discovery
kubectl apply -f k8s/07-eureka-server.yaml

# 5. Core Microservices
kubectl apply -f k8s/08-user-service.yaml
kubectl apply -f k8s/09-product-service.yaml
kubectl apply -f k8s/10-inventory-service.yaml
kubectl apply -f k8s/11-payment-service.yaml
kubectl apply -f k8s/12-order-service.yaml
kubectl apply -f k8s/13-notification-service.yaml

# 6. API Gateway & Frontend
kubectl apply -f k8s/14-api-gateway.yaml
kubectl apply -f k8s/15-frontend.yaml

# (Optional) 7. Ingress
kubectl apply -f k8s/16-ingress.yaml
```

Or deploy all manifests at once:
```powershell
kubectl apply -f k8s/
```

---

## 🔍 3. Monitoring & Verification

### Check Pod Status
```powershell
kubectl get pods -n ecommerce -o wide
```

### Check Services & NodePorts
```powershell
kubectl get svc -n ecommerce
```

### Check Deployments & Persistent Volumes
```powershell
kubectl get deployments -n ecommerce
kubectl get pvc -n ecommerce
```

### View Live Logs
```powershell
# Example: User Service Logs
kubectl logs -f -l app=user-service -n ecommerce

# Example: API Gateway Logs
kubectl logs -f -l app=api-gateway -n ecommerce

# Example: Kafka Logs
kubectl logs -f -l app=kafka-broker -n ecommerce
```

---

## 🌐 4. Accessing Services on Minikube

You can access services directly using Minikube service URLs or NodePorts:

### Option A: Using `minikube service` (Opens automatically in browser)
```powershell
# Open Frontend
minikube service frontend -n ecommerce

# Open API Gateway
minikube service api-gateway -n ecommerce

# Open Kafka UI
minikube service kafka-ui -n ecommerce
```

### Option B: Using Minikube IP & NodePort
Get Minikube IP:
```powershell
minikube ip
```
Then access:
- **Frontend**: `http://<MINIKUBE_IP>:30000`
- **API Gateway**: `http://<MINIKUBE_IP>:30080`
- **Kafka UI**: `http://<MINIKUBE_IP>:30090`

### Option C: Using `kubectl port-forward`
```powershell
# Frontend
kubectl port-forward svc/frontend 3000:80 -n ecommerce

# API Gateway
kubectl port-forward svc/api-gateway 8080:8080 -n ecommerce

# Eureka Server
kubectl port-forward svc/eureka-server 8761:8761 -n ecommerce

# Kafka UI
kubectl port-forward svc/kafka-ui 8090:8080 -n ecommerce
```

---

## 🔄 5. Development & Redeployment Workflow

When modifying code in a microservice (e.g. `user-service`):

1. **Rebuild the JAR**:
   ```powershell
   mvn clean package -DskipTests -f user-service/pom.xml
   ```
2. **Rebuild the Docker Image in Minikube**:
   ```powershell
   & minikube -p minikube docker-env --shell powershell | Invoke-Expression
   docker build -t ecommerce-user-service:latest ./user-service
   ```
3. **Restart the Kubernetes Deployment**:
   ```powershell
   kubectl rollout restart deployment/user-service -n ecommerce
   ```
4. **Track Rollout Status**:
   ```powershell
   kubectl rollout status deployment/user-service -n ecommerce
   ```

---

## 🧹 6. Teardown & Clean Up

To remove all resources from Kubernetes:
```powershell
kubectl delete namespace ecommerce
```
